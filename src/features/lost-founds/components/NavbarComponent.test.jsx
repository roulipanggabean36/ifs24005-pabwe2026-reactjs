import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSelector } from "react-redux";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../../auth/api/authApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import NavbarComponent from "./NavbarComponent";

vi.mock("../../auth/api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
}));

// Meniru layout asli: Navbar dilepas saat sesi berakhir.
function SessionGuard() {
  const isAuthLogin = useSelector((state) => state.isAuthLogin);
  return isAuthLogin ? <NavbarComponent onMenuClick={vi.fn()} /> : <p>Sesi berakhir</p>;
}

const profile = { id: 1, name: "Rouli", email: "rouli@del.ac.id", photo: null };

describe("NavbarComponent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan inisial saat tanpa foto dan memanggil onMenuClick", async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();
    renderWithProviders(<NavbarComponent onMenuClick={onMenuClick} />, { preloadedState: { profile } });

    expect(screen.getByText("R")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("menampilkan foto profil jika tersedia", () => {
    const { container } = renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, {
      preloadedState: { profile: { ...profile, photo: "http://x.test/p.png" } },
    });
    expect(container.querySelector('img[src="http://x.test/p.png"]')).toBeInTheDocument();
  });

  it("membuka dan menutup dropdown profil", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { preloadedState: { profile } });
    const trigger = screen.getByRole("button", { name: "Menu profil" });

    expect(screen.queryByText("rouli@del.ac.id")).not.toBeInTheDocument();
    await user.click(trigger);
    expect(screen.getByText("rouli@del.ac.id")).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByText("rouli@del.ac.id")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByRole("link", { name: /Profil saya/ }));
    expect(screen.queryByText("rouli@del.ac.id")).not.toBeInTheDocument();
  });

  it("logout dibatalkan jika konfirmasi ditolak", async () => {
    const user = userEvent.setup();
    toolsHelper.showConfirmDialog.mockResolvedValue(false);
    renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, {
      preloadedState: { profile, isAuthLogin: true },
    });

    await user.click(screen.getByRole("button", { name: "Menu profil" }));
    await user.click(screen.getByRole("button", { name: /Keluar/ }));

    expect(authApi.postLogout).not.toHaveBeenCalled();
  });

  it("logout dijalankan jika dikonfirmasi", async () => {
    const user = userEvent.setup();
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    authApi.postLogout.mockResolvedValue({ ok: true });
    const { store } = renderWithProviders(<SessionGuard />, {
      preloadedState: { profile, isAuthLogin: true },
    });

    await user.click(screen.getByRole("button", { name: "Menu profil" }));
    await user.click(screen.getByRole("button", { name: /Keluar/ }));

    await waitFor(() => expect(store.getState().isAuthLogin).toBe(false));
    expect(screen.getByText("Sesi berakhir")).toBeInTheDocument();
    expect(store.getState().profile).toBeNull();
  });
});
