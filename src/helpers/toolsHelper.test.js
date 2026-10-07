import { describe, it, expect, vi, afterEach } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  getInitial,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  afterEach(() => vi.clearAllMocks());

  it("showSuccessDialog memanggil Swal ikon success", async () => {
    await showSuccessDialog("ok");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "ok" }));
  });

  it("showErrorDialog memanggil Swal ikon error", async () => {
    await showErrorDialog("err");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "err" }));
  });

  it("showWarningDialog memanggil Swal ikon warning", async () => {
    await showWarningDialog("warn");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: "warn" }));
  });

  it("showConfirmDialog mengembalikan true jika dikonfirmasi (teks default)", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    expect(await showConfirmDialog("yakin?")).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: "Ya" }));
  });

  it("showConfirmDialog mengembalikan false jika dibatalkan (teks kustom)", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    expect(await showConfirmDialog("yakin?", "Hapus")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: "Hapus" }));
  });

  it("formatDate memformat tanggal dan menangani nilai kosong", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("2024-02-28T07:49:32.000000Z")).toMatch(/2024/);
  });

  it("getInitial mengambil huruf pertama kapital", () => {
    expect(getInitial("  rouli")).toBe("R");
  });
});
