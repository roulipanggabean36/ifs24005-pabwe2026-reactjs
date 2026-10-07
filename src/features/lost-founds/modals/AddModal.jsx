import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import { asyncAddLostFound } from "../states/action";

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600";

export default function AddModal({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const isAdding = useSelector((state) => state.isLostFoundAdd);
  const [title, handleTitle] = useInput("");
  const [description, handleDescription] = useInput("");
  const [status, handleStatus] = useInput("lost");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (title.trim() === "" || description.trim() === "") {
      setError("Judul dan deskripsi wajib diisi");
      return;
    }
    setError("");
    const success = await dispatch(asyncAddLostFound({ title, description, status }));
    if (success) {
      onSuccess();
      onClose();
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Tambah laporan" className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Tambah laporan</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <IconX size={20} />
          </button>
        </div>

        <div>
          <label htmlFor="add-title" className="mb-1 block text-sm font-semibold">Judul</label>
          <input id="add-title" value={title} onChange={handleTitle} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="add-description" className="mb-1 block text-sm font-semibold">Deskripsi</label>
          <textarea id="add-description" rows={4} value={description} onChange={handleDescription} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="add-status" className="mb-1 block text-sm font-semibold">Jenis laporan</label>
          <select id="add-status" value={status} onChange={handleStatus} className={fieldClass}>
            <option value="lost">Barang hilang</option>
            <option value="found">Barang ditemukan</option>
          </select>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-semibold hover:bg-slate-100">
            Batal
          </button>
          <button type="submit" disabled={isAdding} className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {isAdding ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
