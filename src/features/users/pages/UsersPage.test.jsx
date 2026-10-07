import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as userApi from "../api/userApi";
import UsersPage from "./UsersPage";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
}));

const users = [
  { id: 1, name: "Ani Wijaya", email: "ani@del.ac.id", photo: null },
  { id: 2, name: "Budi", email: "budi@del.ac.id", photo: "http://x.test/budi.png" },
];

describe("UsersPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("memuat dan menampilkan pengguna (foto atau inisial)", async () => {
    userApi.getUsers.mockResolvedValue({ ok: true, data: { users } });
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("Ani Wijaya")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Budi" })).toHaveAttribute("src", "http://x.test/budi.png");
  });

  it("memfilter berdasarkan nama/email dan menampilkan pesan kosong", async () => {
    const user = userEvent.setup();
    userApi.getUsers.mockResolvedValue({ ok: true, data: { users } });
    renderWithProviders(<UsersPage />);
    await screen.findByText("Ani Wijaya");

    await user.type(screen.getByLabelText("Cari pengguna"), "budi@");
    expect(screen.queryByText("Ani Wijaya")).not.toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Cari pengguna"));
    await user.type(screen.getByLabelText("Cari pengguna"), "zzz");
    expect(screen.getByText("Tidak ada pengguna yang cocok.")).toBeInTheDocument();
  });

  it("tetap tampil kosong saat API gagal", async () => {
    userApi.getUsers.mockResolvedValue({ ok: false, message: "gagal" });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(userApi.getUsers).toHaveBeenCalled());
    expect(screen.getByText("Tidak ada pengguna yang cocok.")).toBeInTheDocument();
  });
});
