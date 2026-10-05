import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import { asyncChangeLostFound } from "../states/action";

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600";

export default function ChangeModal({ lostFound, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const isChanging = useSelector((state) => state.isLostFoundChange);
  const [title, handleTitle] = useInput(lostFound.title);
  const [description, handleDescription] = useInput(lostFound.description);
  const [status, handleStatus] = useInput(lostFound.status);
  const [isCompleted, setIsCompleted] = useState(lostFound.is_completed === 1);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (title.trim() === "" || description.trim() === "") {
      setError("Judul dan deskripsi wajib diisi");
      return;
    }
    setError("");
    const success = await dispatch(
      asyncChangeLostFound(lostFound.id, { title, description, status, isCompleted })
    );
    if (success) {
      onSuccess();
      onClose();
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Ubah laporan" className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Ubah laporan</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <IconX size={20} />
          </button>
        </div>

        <div>
          <label htmlFor="change-title" className="mb-1 block text-sm font-semibold">Judul</label>
          <input id="change-title" value={title} onChange={handleTitle} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="change-description" className="mb-1 block text-sm font-semibold">Deskripsi</label>
          <textarea id="change-description" rows={4} value={description} onChange={handleDescription} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="change-status" className="mb-1 block text-sm font-semibold">Jenis laporan</label>
          <select id="change-status" value={status} onChange={handleStatus} className={fieldClass}>
            <option value="lost">Barang hilang</option>
            <option value="found">Barang ditemukan</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(event) => setIsCompleted(event.target.checked)}
            className="size-4 accent-teal-700"
          />
          Tandai sudah selesai
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-semibold hover:bg-slate-100">
            Batal
          </button>
          <button type="submit" disabled={isChanging} className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {isChanging ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
