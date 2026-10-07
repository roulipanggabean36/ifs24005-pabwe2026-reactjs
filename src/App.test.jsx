import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import * as lostFoundApi from "./features/lost-founds/api/lostFoundApi";
import * as userApi from "./features/users/api/userApi";
import App from "./App";

vi.mock("./features/lost-founds/api/lostFoundApi");
vi.mock("./features/users/api/userApi");
vi.mock("./helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = { id: 1, name: "Rouli", email: "rouli@del.ac.id", photo: null };
const session = { isAuthLogin: true, isProfile: true, profile };

describe("App routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lostFoundApi.getLostFounds.mockResolvedValue({ ok: true, data: { lost_founds: [] } });
    lostFoundApi.getLostFoundStatsDaily.mockResolvedValue({ ok: false, message: "x" });
    lostFoundApi.getLostFoundStatsMonthly.mockResolvedValue({ ok: false, message: "x" });
    lostFoundApi.getLostFoundById.mockResolvedValue({
      ok: true,
      data: {
        lost_found: {
          id: 1, user_id: 1, title: "Detail Barang", description: "d", status: "lost",
          is_completed: 0, cover: null, created_at: "2024-02-28T07:49:32.000000Z", author: { name: "Rouli" },
        },
      },
    });
    userApi.getUsers.mockResolvedValue({ ok: true, data: { users: [] } });
  });

  it("/auth/login menampilkan halaman login", () => {
    renderWithProviders(<App />, { route: "/auth/login", preloadedState: { isAuthLogin: false } });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("/auth/register menampilkan halaman registrasi", () => {
    renderWithProviders(<App />, { route: "/auth/register", preloadedState: { isAuthLogin: false } });
    expect(screen.getByRole("heading", { name: "Buat akun" })).toBeInTheDocument();
  });

  it("/ tanpa sesi dialihkan ke login", () => {
    renderWithProviders(<App />, { route: "/", preloadedState: { isAuthLogin: false } });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("/ dengan sesi menampilkan beranda laporan", async () => {
    renderWithProviders(<App />, { route: "/", preloadedState: session });
    expect(await screen.findByRole("heading", { name: "Laporan barang" })).toBeInTheDocument();
  });

  it("/lost-founds/:id menampilkan detail", async () => {
    renderWithProviders(<App />, { route: "/lost-founds/1", preloadedState: session });
    expect(await screen.findByRole("heading", { name: "Detail Barang" })).toBeInTheDocument();
  });

  it("/users menampilkan daftar pengguna", async () => {
    renderWithProviders(<App />, { route: "/users", preloadedState: session });
    expect(await screen.findByRole("heading", { name: "Pengguna" })).toBeInTheDocument();
  });

  it("/profile menampilkan profil", async () => {
    renderWithProviders(<App />, { route: "/profile", preloadedState: session });
    expect(await screen.findByRole("heading", { name: "Profil saya" })).toBeInTheDocument();
  });

  it("pengguna yang sudah login diarahkan keluar dari halaman auth", async () => {
    renderWithProviders(<App />, { route: "/auth/login", preloadedState: session });
    expect(await screen.findByRole("heading", { name: "Laporan barang" })).toBeInTheDocument();
  });
});
