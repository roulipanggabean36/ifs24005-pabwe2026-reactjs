import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent";

describe("SidebarComponent", () => {
  it("tertutup: tanpa overlay dan dengan kelas geser", () => {
    renderWithProviders(<SidebarComponent open={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toHaveClass("-translate-x-full");
  });

  it("terbuka: overlay dan tombol tutup memanggil onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent open onClose={onClose} />);

    expect(screen.getByTestId("sidebar")).toHaveClass("translate-x-0");
    await user.click(screen.getByTestId("sidebar-overlay"));
    await user.click(screen.getByRole("button", { name: "Tutup menu" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("menandai menu aktif sesuai rute dan menutup drawer saat menu diklik", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent open onClose={onClose} />, { route: "/users" });

    expect(screen.getByRole("link", { name: /Pengguna/ })).toHaveClass("bg-teal-700");
    expect(screen.getByRole("link", { name: /Laporan/ })).not.toHaveClass("bg-teal-700");
    expect(screen.getByRole("link", { name: /Statistik/ })).toHaveAttribute("href", "/#statistik");

    await user.click(screen.getByRole("link", { name: /Laporan/ }));
    await user.click(screen.getByRole("link", { name: /Statistik/ }));
    await user.click(screen.getByRole("link", { name: /Profil Saya/ }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
