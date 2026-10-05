import { useEffect, useState } from "react";
import { IconPhoto } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../../helpers/apiHelper";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  asyncDeleteLostFound,
  asyncSetLostFound,
  setLostFoundActionCreator,
} from "../states/action";

export default function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lostFound = useSelector((state) => state.lostFound);
  const profile = useSelector((state) => state.profile);
  const [modal, setModal] = useState(null);

  const reload = () => dispatch(asyncSetLostFound(id));

  useEffect(() => {
    dispatch(setLostFoundActionCreator(null));
    dispatch(asyncSetLostFound(id)).then((success) => {
      if (!success) navigate("/");
    });
  }, [dispatch, id, navigate]);

  async function handleDelete() {
    const confirmed = await showConfirmDialog("Hapus laporan ini secara permanen?", "Hapus");
    if (!confirmed) return;
    const success = await dispatch(asyncDeleteLostFound(lostFound.id));
    if (success) navigate("/");
  }

  if (!lostFound) {
    return <p className="text-slate-500">Memuat detail laporan...</p>;
  }

  const cover = getFileUrl(lostFound.cover);
  const isOwner = lostFound.user_id === profile.id;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div className="grid aspect-video place-items-center overflow-hidden rounded-2xl bg-slate-100">
        {cover ? (
          <img src={cover} alt={lostFound.title} className="h-full w-full object-contain" />
        ) : (
          <IconPhoto size={56} className="text-slate-300" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className={`rounded-full px-3 py-1 ${lostFound.status === "lost" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
          {lostFound.status === "lost" ? "Barang hilang" : "Barang ditemukan"}
        </span>
        <span className={`rounded-full px-3 py-1 ${lostFound.is_completed === 1 ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
          {lostFound.is_completed === 1 ? "Selesai" : "Belum selesai"}
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold">{lostFound.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dilaporkan oleh {lostFound.author.name} pada {formatDate(lostFound.created_at)}
        </p>
      </div>

      <p className="whitespace-pre-line leading-relaxed text-slate-700">{lostFound.description}</p>

      {isOwner && (
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={() => setModal("cover")} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100">
            Ubah cover
          </button>
          <button type="button" onClick={() => setModal("change")} className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
            Ubah data
          </button>
          <button type="button" onClick={handleDelete} className="ml-auto rounded-lg border border-rose-300 px-4 py-2 font-semibold text-rose-600 hover:bg-rose-50">
            Hapus
          </button>
        </div>
      )}

      {modal === "cover" && (
        <ChangeCoverModal lostFound={lostFound} onClose={() => setModal(null)} onSuccess={reload} />
      )}
      {modal === "change" && (
        <ChangeModal lostFound={lostFound} onClose={() => setModal(null)} onSuccess={reload} />
      )}
    </article>
  );
}
