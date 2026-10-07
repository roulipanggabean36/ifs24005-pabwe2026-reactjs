import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import HomePage from "./HomePage";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = { id: 1, name: "Rouli", email: "rouli@del.ac.id", photo: null };
const author = { name: "Rouli", photo: null };
const items = [
  { id: 1, user_id: 1, title: "Dompet hitam", description: "Hilang di kantin", status: "lost", is_completed: 0, cover: "http://x.test/c.png", created_at: "2024-02-28T07:49:32.000000Z", author },
  { id: 2, user_id: 2, title: "Kunci motor", description: "Ditemukan di parkiran", status: "found", is_completed: 1, cover: null, created_at: "2024-02-28T07:49:32.000000Z", author: { name: "Budi", photo: null } },
  { id: 3, user_id: 1, title: "Payung", description: "Payung biru di perpustakaan", status: "found", is_completed: 1, cover: null, created_at: "2024-02-28T07:49:32.000000Z", author },
];
const daily = { stats_losts: { "01-10-2024": 2, "02-10-2024": 0 }, stats_founds: { "01-10-2024": 0, "02-10-2024": 1 } };
const monthly = { stats_losts: { "09-2024": 1, "10-2024": 0 }, stats_founds: { "09-2024": 0, "10-2024": 3 } };

function mockApi() {
  api.getLostFounds.mockResolvedValue({ ok: true, data: { lost_founds: items } });
  api.getLostFoundStatsDaily.mockResolvedValue({ ok: true, data: daily });
  api.getLostFoundStatsMonthly.mockResolvedValue({ ok: true, data: monthly });
}

async function renderHome(options = {}) {
  const view = renderWithProviders(<HomePage />, { preloadedState: { profile }, ...options });
  await screen.findByText("Dompet hitam");
  return view;
}

// Kartu metrik = elemen berisi label dan angka besar (label "Selesai" juga muncul sebagai badge).
const metric = (label) =>
  screen.getAllByText(label).map((el) => el.parentElement).find((el) => el.querySelector("p.text-3xl"));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi();
  });

  it("menampilkan metrik, kartu laporan, dan aksi hanya untuk pemilik", async () => {
    await renderHome();

    expect(metric("Total")).toHaveTextContent("3");
    expect(metric("Barang Hilang")).toHaveTextContent("1");
    expect(metric("Barang Ditemukan")).toHaveTextContent("2");
    expect(metric("Selesai")).toHaveTextContent("2");

    expect(screen.getByRole("img", { name: "Dompet hitam" })).toHaveAttribute("src", "http://x.test/c.png");
    expect(screen.getByText("Tandai selesai")).toBeInTheDocument();
    expect(screen.getByText("Tandai belum selesai")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Hapus" })).toHaveLength(2); // item 2 milik orang lain
    expect(screen.getAllByText("Selesai").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Hilang").length).toBeGreaterThan(0);
  });

  it("menampilkan statistik harian dan bulanan", async () => {
    await renderHome();
    expect(await screen.findByText("Statistik")).toBeInTheDocument();
    expect(screen.getByText("7 hari terakhir")).toBeInTheDocument();
    expect(screen.getByText("Bulanan")).toBeInTheDocument();
    expect(screen.getByText("10-2024")).toBeInTheDocument();
  });

  it("tidak menampilkan bagian statistik jika API statistik gagal", async () => {
    api.getLostFoundStatsDaily.mockResolvedValue({ ok: false, message: "gagal" });
    await renderHome();
    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("gagal"));
    expect(screen.queryByText("Statistik")).not.toBeInTheDocument();
  });

  it("memfilter berdasarkan jenis dan status penyelesaian", async () => {
    const user = userEvent.setup();
    await renderHome();

    await user.selectOptions(screen.getByLabelText("Filter jenis"), "found");
    expect(screen.queryByText("Dompet hitam")).not.toBeInTheDocument();
    expect(screen.getByText("Kunci motor")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter jenis"), "");
    await user.selectOptions(screen.getByLabelText("Filter status"), "0");
    expect(screen.getByText("Dompet hitam")).toBeInTheDocument();
    expect(screen.queryByText("Kunci motor")).not.toBeInTheDocument();
  });

  it("pencarian cocok pada judul atau deskripsi, dan menampilkan pesan kosong", async () => {
    const user = userEvent.setup();
    await renderHome();
    const search = screen.getByLabelText("Cari laporan");

    await user.type(search, "kantin"); // hanya cocok di deskripsi
    expect(screen.getByText("Dompet hitam")).toBeInTheDocument();
    expect(screen.queryByText("Payung")).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "payung"); // cocok di judul
    expect(screen.getByText("Payung")).toBeInTheDocument();
    expect(screen.queryByText("Dompet hitam")).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "tidak-ada");
    expect(screen.getByText("Belum ada laporan yang cocok.")).toBeInTheDocument();
  });

  it("filter 'Laporan saya' memuat ulang dengan is_me=1", async () => {
    const user = userEvent.setup();
    await renderHome();
    expect(api.getLostFounds).toHaveBeenLastCalledWith({});

    await user.click(screen.getByLabelText("Laporan saya"));

    await waitFor(() => expect(api.getLostFounds).toHaveBeenLastCalledWith({ isMe: 1 }));
  });

  it("menandai selesai / belum selesai lalu memuat ulang daftar", async () => {
    const user = userEvent.setup();
    api.putLostFound.mockResolvedValue({ ok: true, message: "Diubah" });
    await renderHome();
    const before = api.getLostFounds.mock.calls.length;

    await user.click(screen.getByText("Tandai selesai"));
    await waitFor(() =>
      expect(api.putLostFound).toHaveBeenLastCalledWith(1, {
        title: "Dompet hitam",
        description: "Hilang di kantin",
        status: "lost",
        isCompleted: true,
      })
    );
    await waitFor(() => expect(api.getLostFounds.mock.calls.length).toBeGreaterThan(before));

    await user.click(screen.getByText("Tandai belum selesai"));
    await waitFor(() => expect(api.putLostFound).toHaveBeenLastCalledWith(3, expect.objectContaining({ isCompleted: false })));
  });

  it("menghapus laporan hanya setelah konfirmasi", async () => {
    const user = userEvent.setup();
    api.deleteLostFound.mockResolvedValue({ ok: true, message: "Dihapus" });
    await renderHome();
    const card = screen.getByText("Dompet hitam").closest("li");

    toolsHelper.showConfirmDialog.mockResolvedValueOnce(false);
    await user.click(within(card).getByRole("button", { name: "Hapus" }));
    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(api.deleteLostFound).not.toHaveBeenCalled();

    toolsHelper.showConfirmDialog.mockResolvedValueOnce(true);
    const before = api.getLostFounds.mock.calls.length;
    await user.click(within(card).getByRole("button", { name: "Hapus" }));
    await waitFor(() => expect(api.deleteLostFound).toHaveBeenCalledWith(1));
    await waitFor(() => expect(api.getLostFounds.mock.calls.length).toBeGreaterThan(before));
  });

  it("membuka modal tambah laporan, menyimpan, dan memuat ulang daftar", async () => {
    const user = userEvent.setup();
    api.postLostFound.mockResolvedValue({ ok: true, message: "Berhasil" });
    await renderHome();
    const before = api.getLostFounds.mock.calls.length;

    await user.click(screen.getByRole("button", { name: /Lapor barang/ }));
    expect(screen.getByRole("dialog", { name: "Tambah laporan" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Judul"), "Tas");
    await user.type(screen.getByLabelText("Deskripsi"), "Tas ransel hitam");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(api.getLostFounds.mock.calls.length).toBeGreaterThan(before);
  });

  it("menutup modal tambah laporan lewat tombol batal", async () => {
    const user = userEvent.setup();
    await renderHome();

    await user.click(screen.getByRole("button", { name: /Lapor barang/ }));
    await user.click(screen.getByRole("button", { name: "Batal" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menggulir ke bagian statistik jika URL memiliki hash #statistik", async () => {
    await renderHome({ route: "/#statistik" });
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" }));
  });

  it("tidak menggulir tanpa hash", async () => {
    await renderHome();
    await screen.findByText("Statistik");
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
