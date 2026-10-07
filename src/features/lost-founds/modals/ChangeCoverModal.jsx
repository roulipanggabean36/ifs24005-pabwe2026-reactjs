import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { getFileUrl } from "../../../helpers/apiHelper";
import { showWarningDialog } from "../../../helpers/toolsHelper";
import { asyncChangeLostFoundCover } from "../states/action";

export default function ChangeCoverModal({ lostFound, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const isChanging = useSelector((state) => state.isLostFoundChangeCover);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  function handleFile(event) {
    const selected = event.target.files[0];
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      showWarningDialog("Pilih gambar terlebih dahulu");
      return;
    }
    const success = await dispatch(asyncChangeLostFoundCover(lostFound.id, file));
    if (success) {
      onSuccess();
      onClose();
    }
  }

  const current = preview ?? getFileUrl(lostFound.cover);

  return (
    <div role="dialog" aria-modal="true" aria-label="Ubah cover" className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Ubah cover</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <IconX size={20} />
          </button>
        </div>

        <div className="grid aspect-video place-items-center overflow-hidden rounded-xl bg-slate-100">
          {current ? (
            <img src={current} alt="Pratinjau cover" className="h-full w-full object-contain" />
          ) : (
            <p className="text-sm text-slate-500">Belum ada cover</p>
          )}
        </div>

        <input type="file" accept="image/*" aria-label="Berkas cover" onChange={handleFile} className="text-sm" />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-semibold hover:bg-slate-100">
            Batal
          </button>
          <button type="submit" disabled={isChanging} className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {isChanging ? "Mengunggah..." : "Unggah cover"}
          </button>
        </div>
      </form>
    </div>
  );
}
