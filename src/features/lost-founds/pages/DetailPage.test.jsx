import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import DetailPage from "./DetailPage";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

const profile = { id: 1, name: "Rouli", email: "rouli@del.ac.id", photo: null };
const base = {
  id: 1,
  user_id: 1,
  title: "Dompet hitam",
  description: "Hilang di kantin\nlantai 2",
  status: "lost",
  is_completed: 0,
  cover: "http://x.test/c.png",
  created_at: "2024-02-28T07:49:32.000000Z",
  author: { name: "Rouli", photo: null },
};

function renderDetail() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<p>Beranda</p>} />
      <Route path="/lost-founds/:id" element={<DetailPage />} />
    </Routes>,
    { route: "/lost-founds/1", preloadedState: { profile } }
  );
}

const respond = (lostFound) => api.getLostFoundById.mockResolvedValue({ ok: true, data: { lost_found: lostFound } });

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
  });

  it("menampilkan teks memuat sebelum data tiba", async () => {
    let resolve;
    api.getLostFoundById.mockReturnValue(new Promise((r) => (resolve = r)));
    renderDetail();

    expect(screen.getByText("Memuat detail laporan...")).toBeInTheDocument();
    resolve({ ok: true, data: { lost_found: base } });
    expect(await screen.findByText("Dompet hitam")).toBeInTheDocument();
  });

  it("menampilkan rincian laporan hilang yang belum selesai (milik sendiri)", async () => {
    respond(base);
    renderDetail();

    expect(await screen.findByRole("heading", { name: "Dompet hitam" })).toBeInTheDocument();
    expect(screen.getByText("Barang hilang")).toBeInTheDocument();
    expect(screen.getByText("Belum selesai")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Dompet hitam" })).toHaveAttribute("src", "http://x.test/c.png");
    expect(screen.getByText(/Dilaporkan oleh Rouli pada/)).toHaveTextContent("2024");
    expect(screen.getByRole("button", { name: "Ubah cover" })).toBeInTheDocument();
  });

  it("menampilkan laporan temuan yang selesai milik orang lain tanpa aksi", async () => {
    respond({ ...base, user_id: 2, status: "found", is_completed: 1, cover: null, author: { name: "Budi", photo: null } });
    renderDetail();

    expect(await screen.findByText("Barang ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Dompet hitam" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ubah cover" })).not.toBeInTheDocument();
  });

  it("kembali ke beranda jika laporan gagal dimuat", async () => {
    api.getLostFoundById.mockResolvedValue({ ok: false, message: "Tidak ditemukan" });
    renderDetail();

    expect(await screen.findByText("Beranda")).toBeInTheDocument();
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Tidak ditemukan");
  });

  it("menghapus laporan: batal, lalu berhasil kembali ke beranda", async () => {
    const user = userEvent.setup();
    respond(base);
    api.deleteLostFound.mockResolvedValue({ ok: true, message: "Dihapus" });
    renderDetail();
    await screen.findByText("Dompet hitam");

    toolsHelper.showConfirmDialog.mockResolvedValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(api.deleteLostFound).not.toHaveBeenCalled();

    toolsHelper.showConfirmDialog.mockResolvedValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    expect(await screen.findByText("Beranda")).toBeInTheDocument();
    expect(api.deleteLostFound).toHaveBeenCalledWith(1);
  });

  it("tetap di halaman jika penghapusan gagal", async () => {
    const user = userEvent.setup();
    respond(base);
    api.deleteLostFound.mockResolvedValue({ ok: false, message: "Gagal hapus" });
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    renderDetail();
    await screen.findByText("Dompet hitam");

    await user.click(screen.getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal hapus"));
    expect(screen.getByText("Dompet hitam")).toBeInTheDocument();
  });

  it("membuka dan menutup modal ubah cover serta ubah data", async () => {
    const user = userEvent.setup();
    respond(base);
    renderDetail();
    await screen.findByText("Dompet hitam");

    await user.click(screen.getByRole("button", { name: "Ubah cover" }));
    expect(screen.getByRole("dialog", { name: "Ubah cover" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ubah data" }));
    expect(screen.getByRole("dialog", { name: "Ubah laporan" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("memuat ulang detail setelah ubah data dan ubah cover berhasil", async () => {
    const user = userEvent.setup();
    respond(base);
    api.putLostFound.mockResolvedValue({ ok: true, message: "Diubah" });
    api.postLostFoundCover.mockResolvedValue({ ok: true, message: "Cover diubah" });
    renderDetail();
    await screen.findByText("Dompet hitam");
    expect(api.getLostFoundById).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Ubah data" }));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(api.getLostFoundById).toHaveBeenCalledTimes(2));

    await user.click(screen.getByRole("button", { name: "Ubah cover" }));
    await user.upload(screen.getByLabelText("Berkas cover"), new File(["x"], "c.png", { type: "image/png" }));
    await user.click(screen.getByRole("button", { name: "Unggah cover" }));
    await waitFor(() => expect(api.getLostFoundById).toHaveBeenCalledTimes(3));
  });
});
