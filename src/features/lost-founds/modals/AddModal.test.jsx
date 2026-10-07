import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/lostFoundApi";
import AddModal from "./AddModal";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("AddModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validasi: judul dan deskripsi wajib diisi", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddModal onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Judul dan deskripsi wajib diisi")).toBeInTheDocument();
    expect(api.postLostFound).not.toHaveBeenCalled();
  });

  it("validasi: deskripsi kosong walau judul terisi", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddModal onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Judul dan deskripsi wajib diisi")).toBeInTheDocument();
  });

  it("menyimpan laporan baru lalu memanggil onSuccess dan onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    api.postLostFound.mockResolvedValue({ ok: true, message: "Berhasil" });
    renderWithProviders(<AddModal onClose={onClose} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.type(screen.getByLabelText("Deskripsi"), "Hilang di kantin");
    await user.selectOptions(screen.getByLabelText("Jenis laporan"), "found");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    expect(api.postLostFound).toHaveBeenCalledWith({
      title: "Dompet",
      description: "Hilang di kantin",
      status: "found",
    });
  });

  it("tetap terbuka jika penyimpanan gagal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    api.postLostFound.mockResolvedValue({ ok: false, message: "Gagal" });
    renderWithProviders(<AddModal onClose={onClose} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.type(screen.getByLabelText("Deskripsi"), "Hilang");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(api.postLostFound).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menampilkan label proses dan tombol tutup/batal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} onSuccess={vi.fn()} />, {
      preloadedState: { isLostFoundAdd: true },
    });

    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Tutup" }));
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
