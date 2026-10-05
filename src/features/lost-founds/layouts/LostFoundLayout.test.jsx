import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import * as userApi from "../../users/api/userApi";
import * as authApi from "../../auth/api/authApi";
import LostFoundLayout from "./LostFoundLayout";

vi.mock("../../users/api/userApi");
vi.mock("../../auth/api/authApi");

const profile = { id: 1, name: "Rouli", email: "rouli@del.ac.id", photo: null };

function renderLayout(preloadedState) {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/login" element={<p>Halaman Login</p>} />
      <Route path="/" element={<LostFoundLayout />}>
        <Route index element={<p>Isi Beranda</p>} />
      </Route>
    </Routes>,
    { preloadedState }
  );
}

describe("LostFoundLayout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mengalihkan ke login jika belum terautentikasi", () => {
    renderLayout({ isAuthLogin: false });
    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

  it("memuat profil lalu menampilkan layout lengkap", async () => {
    userApi.getProfile.mockResolvedValue({ ok: true, data: { user: profile } });
    renderLayout({ isAuthLogin: true });

    expect(screen.getByText("Memuat sesi...")).toBeInTheDocument();
    expect(await screen.findByText("Isi Beranda")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu profil" })).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("tidak memuat ulang profil jika sudah ada", () => {
    renderLayout({ isAuthLogin: true, isProfile: true, profile });
    expect(screen.getByText("Isi Beranda")).toBeInTheDocument();
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

  it("logout otomatis jika token tidak valid", async () => {
    userApi.getProfile.mockResolvedValue({ ok: false, message: "Unauthenticated." });
    authApi.postLogout.mockResolvedValue({ ok: false });
    const { store } = renderLayout({ isAuthLogin: true });

    expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
    expect(store.getState().isAuthLogin).toBe(false);
  });

  it("membuka drawer dari navbar dan menutupnya lewat overlay", async () => {
    const user = userEvent.setup();
    renderLayout({ isAuthLogin: true, isProfile: true, profile });

    await user.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(screen.getByTestId("sidebar")).toHaveClass("translate-x-0");

    await user.click(screen.getByTestId("sidebar-overlay"));
    await waitFor(() => expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument());
  });
});
