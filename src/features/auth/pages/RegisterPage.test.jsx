import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../api/authApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import RegisterPage from "./RegisterPage";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper");

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/login" element={<p>Halaman Login</p>} />
    </Routes>,
    { route: "/auth/register" }
  );
}

async function fillForm(user, { name = "Rouli", email = "a@b.co", password = "123456", confirm = "123456" } = {}) {
  await user.type(screen.getByLabelText("Nama"), name);
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Kata sandi"), password);
  await user.type(screen.getByLabelText("Konfirmasi kata sandi"), confirm);
}

describe("RegisterPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan semua error validasi pada form kosong", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi minimal 6 karakter")).toBeInTheDocument();
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("menolak konfirmasi kata sandi yang berbeda", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillForm(user, { confirm: "654321" });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Konfirmasi kata sandi tidak sama")).toBeInTheDocument();
  });

  it("registrasi sukses mengarahkan ke halaman login", async () => {
    const user = userEvent.setup();
    authApi.postRegister.mockResolvedValue({ ok: true, message: "Berhasil" });
    renderPage();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() => expect(screen.getByText("Halaman Login")).toBeInTheDocument());
    expect(authApi.postRegister).toHaveBeenCalledWith({ name: "Rouli", email: "a@b.co", password: "123456" });
  });

  it("registrasi gagal tetap di halaman dan menampilkan dialog error", async () => {
    const user = userEvent.setup();
    authApi.postRegister.mockResolvedValue({ ok: false, message: "Email sudah dipakai" });
    renderPage();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai"));
    expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/auth/login");
  });

  it("menampilkan teks loading saat request berjalan", async () => {
    const user = userEvent.setup();
    let resolve;
    authApi.postRegister.mockReturnValue(new Promise((r) => (resolve = r)));
    renderPage();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Daftar" }));
    expect(await screen.findByRole("button", { name: "Memproses..." })).toBeDisabled();

    resolve({ ok: false, message: "x" });
    await screen.findByRole("button", { name: "Daftar" });
  });
});
