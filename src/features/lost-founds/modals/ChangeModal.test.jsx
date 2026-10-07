import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/lostFoundApi";
import ChangeModal from "./ChangeModal";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const lostFound = { id: 5, title: "Dompet", description: "Hilang", status: "lost", is_completed: 0 };

describe("ChangeModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mengisi form dari data laporan (belum selesai)", () => {
    renderWithProviders(<ChangeModal lostFound={lostFound} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByLabelText("Judul")).toHaveValue("Dompet");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Hilang");
    expect(screen.getByLabelText("Jenis laporan")).toHaveValue("lost");
    expect(screen.getByLabelText("Tandai sudah selesai")).not.toBeChecked();
  });

  it("mencentang checkbox jika laporan sudah selesai", () => {
    renderWithProviders(<ChangeModal lostFound={{ ...lostFound, is_completed: 1 }} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByLabelText("Tandai sudah selesai")).toBeChecked();
  });

  it("validasi: judul kosong dan deskripsi kosong", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeModal lostFound={lostFound} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.clear(screen.getByLabelText("Judul"));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(screen.getByText("Judul dan deskripsi wajib diisi")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.clear(screen.getByLabelText("Deskripsi"));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(screen.getByText("Judul dan deskripsi wajib diisi")).toBeInTheDocument();
    expect(api.putLostFound).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan lalu memanggil onSuccess dan onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    api.putLostFound.mockResolvedValue({ ok: true, message: "Diubah" });
    renderWithProviders(<ChangeModal lostFound={lostFound} onClose={onClose} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Judul"), " baru");
    await user.selectOptions(screen.getByLabelText("Jenis laporan"), "found");
    await user.click(screen.getByLabelText("Tandai sudah selesai"));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    expect(api.putLostFound).toHaveBeenCalledWith(5, {
      title: "Dompet baru",
      description: "Hilang",
      status: "found",
      isCompleted: true,
    });
  });

  it("tidak menutup jika gagal, dan menampilkan label proses + tombol tutup/batal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    api.putLostFound.mockResolvedValue({ ok: false, message: "Gagal" });
    const { unmount } = renderWithProviders(<ChangeModal lostFound={lostFound} onClose={onClose} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(api.putLostFound).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    unmount();

    renderWithProviders(<ChangeModal lostFound={lostFound} onClose={onClose} onSuccess={vi.fn()} />, {
      preloadedState: { isLostFoundChange: true },
    });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Tutup" }));
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
