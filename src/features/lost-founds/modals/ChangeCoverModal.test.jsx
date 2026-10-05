import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import ChangeCoverModal from "./ChangeCoverModal";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

const lostFound = { id: 3, cover: null };
const png = () => new File(["x"], "cover.png", { type: "image/png" });

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  it("menampilkan placeholder jika belum ada cover", () => {
    renderWithProviders(<ChangeCoverModal lostFound={lostFound} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText("Belum ada cover")).toBeInTheDocument();
  });

  it("menampilkan cover saat ini jika ada", () => {
    renderWithProviders(
      <ChangeCoverModal lostFound={{ id: 3, cover: "http://x.test/c.png" }} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(screen.getByRole("img", { name: "Pratinjau cover" })).toHaveAttribute("src", "http://x.test/c.png");
  });

  it("peringatan jika mengunggah tanpa memilih gambar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeCoverModal lostFound={lostFound} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Unggah cover" }));

    expect(toolsHelper.showWarningDialog).toHaveBeenCalledWith("Pilih gambar terlebih dahulu");
    expect(api.postLostFoundCover).not.toHaveBeenCalled();
  });

  it("menampilkan pratinjau, membatalkan pilihan, dan membersihkan object URL", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeCoverModal lostFound={lostFound} onClose={vi.fn()} onSuccess={vi.fn()} />);
    const input = screen.getByLabelText("Berkas cover");

    await user.upload(input, png());
    expect(screen.getByRole("img", { name: "Pratinjau cover" })).toHaveAttribute("src", "blob:preview");

    await user.upload(input, []);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(screen.getByText("Belum ada cover")).toBeInTheDocument();
  });

  it("mengunggah cover lalu memanggil onSuccess dan onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const file = png();
    api.postLostFoundCover.mockResolvedValue({ ok: true, message: "Cover diubah" });
    renderWithProviders(<ChangeCoverModal lostFound={lostFound} onClose={onClose} onSuccess={onSuccess} />);

    await user.upload(screen.getByLabelText("Berkas cover"), file);
    await user.click(screen.getByRole("button", { name: "Unggah cover" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    expect(api.postLostFoundCover).toHaveBeenCalledWith(3, file);
  });

  it("tidak menutup jika unggah gagal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    api.postLostFoundCover.mockResolvedValue({ ok: false, message: "Gagal" });
    renderWithProviders(<ChangeCoverModal lostFound={lostFound} onClose={onClose} onSuccess={vi.fn()} />);

    await user.upload(screen.getByLabelText("Berkas cover"), png());
    await user.click(screen.getByRole("button", { name: "Unggah cover" }));

    await waitFor(() => expect(api.postLostFoundCover).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("label proses dan tombol tutup/batal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal lostFound={lostFound} onClose={onClose} onSuccess={vi.fn()} />, {
      preloadedState: { isLostFoundChangeCover: true },
    });

    expect(screen.getByRole("button", { name: "Mengunggah..." })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Tutup" }));
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
