import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../api/authApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import LoginPage from "./LoginPage";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper");

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("menampilkan error validasi lalu menghilang setelah input valid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi minimal 6 karakter")).toBeInTheDocument();
    expect(authApi.postLogin).not.toHaveBeenCalled();

    authApi.postLogin.mockResolvedValue({ ok: false, message: "Kredensial salah" });
    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.type(screen.getByLabelText("Kata sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(authApi.postLogin).toHaveBeenCalledWith({ email: "a@b.co", password: "123456" }));
    expect(screen.queryByText("Format email tidak valid")).not.toBeInTheDocument();
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
  });

  it("login sukses menyimpan token dan mengubah state login", async () => {
    const user = userEvent.setup();
    authApi.postLogin.mockResolvedValue({ ok: true, data: { token: "tok" } });
    const { store } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.type(screen.getByLabelText("Kata sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(store.getState().isAuthLogin).toBe(true));
    expect(localStorage.getItem("accessToken")).toBe("tok");
  });

  it("menampilkan teks loading saat request berjalan dan tautan daftar", async () => {
    const user = userEvent.setup();
    let resolve;
    authApi.postLogin.mockReturnValue(new Promise((r) => (resolve = r)));
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute("href", "/auth/register");
    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.type(screen.getByLabelText("Kata sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByRole("button", { name: "Memproses..." })).toBeDisabled();
    resolve({ ok: false, message: "x" });
    await screen.findByRole("button", { name: "Masuk" });
  });
});
