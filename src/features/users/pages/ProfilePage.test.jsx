import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import ProfilePage from "./ProfilePage";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

const profile = { id: 1, name: "Rouli", email: "rouli@del.ac.id", photo: null };

describe("ProfilePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tidak merender apa pun jika profil belum ada", () => {
    const { container } = renderWithProviders(<ProfilePage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("menampilkan data profil dan inisial saat belum punya foto", () => {
    renderWithProviders(<ProfilePage />, { preloadedState: { profile } });
    expect(screen.getByLabelText("Nama")).toHaveValue("Rouli");
    expect(screen.getByLabelText("Email")).toHaveValue("rouli@del.ac.id");
    expect(screen.getByText("R")).toBeInTheDocument();
  });

  it("menampilkan foto jika tersedia", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: { ...profile, photo: "http://x.test/p.png" } },
    });
    expect(screen.getByRole("img", { name: "Foto profil" })).toHaveAttribute("src", "http://x.test/p.png");
  });

  it("mengubah informasi akun", async () => {
    const user = userEvent.setup();
    userApi.putProfile.mockResolvedValue({
      ok: true,
      message: "Diubah",
      data: { user: { ...profile, name: "Rouli C" } },
    });
    const { store } = renderWithProviders(<ProfilePage />, { preloadedState: { profile } });

    await user.type(screen.getByLabelText("Nama"), " C");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => expect(store.getState().profile.name).toBe("Rouli C"));
    expect(userApi.putProfile).toHaveBeenCalledWith({ name: "Rouli C", email: "rouli@del.ac.id" });
  });

  it("peringatan jika unggah foto tanpa memilih berkas", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { preloadedState: { profile } });

    await user.click(screen.getByRole("button", { name: "Unggah foto" }));

    expect(toolsHelper.showWarningDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu");
    expect(userApi.postProfilePhoto).not.toHaveBeenCalled();
  });

  it("mengunggah foto yang dipilih lalu memuat ulang profil", async () => {
    const user = userEvent.setup();
    const file = new File(["x"], "foto.png", { type: "image/png" });
    userApi.postProfilePhoto.mockResolvedValue({ ok: true, message: "Foto diubah" });
    userApi.getProfile.mockResolvedValue({ ok: true, data: { user: { ...profile, photo: "http://x.test/n.png" } } });
    const { store } = renderWithProviders(<ProfilePage />, { preloadedState: { profile } });

    await user.upload(screen.getByLabelText("Berkas foto"), file);
    await user.click(screen.getByRole("button", { name: "Unggah foto" }));

    await waitFor(() => expect(store.getState().profile.photo).toBe("http://x.test/n.png"));
    expect(userApi.postProfilePhoto).toHaveBeenCalledWith(file);
  });

  it("tidak error ketika dialog berkas dibatalkan (files kosong)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { preloadedState: { profile } });
    const input = screen.getByLabelText("Berkas foto");

    await user.upload(input, new File(["x"], "a.png", { type: "image/png" }));
    await user.upload(input, []);
    await user.click(screen.getByRole("button", { name: "Unggah foto" }));

    expect(toolsHelper.showWarningDialog).toHaveBeenCalled();
  });

  it("validasi kata sandi baru: terlalu pendek dan tidak sama", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { preloadedState: { profile } });

    await user.type(screen.getByLabelText("Kata sandi baru"), "123");
    await user.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    expect(screen.getByText("Kata sandi baru minimal 6 karakter")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Kata sandi baru"));
    await user.type(screen.getByLabelText("Kata sandi baru"), "654321");
    await user.type(screen.getByLabelText("Konfirmasi kata sandi baru"), "000000");
    await user.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    expect(screen.getByText("Konfirmasi kata sandi tidak sama")).toBeInTheDocument();
    expect(userApi.putProfilePassword).not.toHaveBeenCalled();
  });

  it("ganti kata sandi sukses mengosongkan form, gagal mempertahankan isi", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { preloadedState: { profile } });

    userApi.putProfilePassword.mockResolvedValueOnce({ ok: false, message: "Sandi salah" });
    await user.type(screen.getByLabelText("Kata sandi saat ini"), "lama11");
    await user.type(screen.getByLabelText("Kata sandi baru"), "654321");
    await user.type(screen.getByLabelText("Konfirmasi kata sandi baru"), "654321");
    await user.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Sandi salah"));
    expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue("lama11");

    userApi.putProfilePassword.mockResolvedValueOnce({ ok: true, message: "Sandi diubah" });
    await user.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    await waitFor(() => expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue(""));
    expect(userApi.putProfilePassword).toHaveBeenLastCalledWith({
      password: "lama11",
      newPassword: "654321",
      confirmPassword: "654321",
    });
  });
});
