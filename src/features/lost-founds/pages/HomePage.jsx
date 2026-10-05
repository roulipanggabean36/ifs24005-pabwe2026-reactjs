import { useCallback, useEffect, useRef, useState } from "react";
import { IconPhoto, IconPlus, IconSearch } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { getFileUrl } from "../../../helpers/apiHelper";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import AddModal from "../modals/AddModal";
import {
  asyncChangeLostFound,
  asyncDeleteLostFound,
  asyncSetLostFoundStats,
  asyncSetLostFounds,
} from "../states/action";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600";

function MetricCard({ label, value, tone }) {
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function StatBars({ title, losts, founds }) {
  const keys = Object.keys(losts);
  const max = Math.max(1, ...Object.values(losts), ...Object.values(founds));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-bold">{title}</h3>
      <ul className="space-y-2">
        {keys.map((key) => (
          <li key={key} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-xs">
            <span className="text-slate-500">{key}</span>
            <div className="space-y-1">
              <div className="h-2 rounded bg-rose-500" style={{ width: `${(losts[key] / max) * 100}%` }} title={`Hilang: ${losts[key]}`} />
              <div className="h-2 rounded bg-emerald-500" style={{ width: `${(founds[key] / max) * 100}%` }} title={`Ditemukan: ${founds[key]}`} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        <span className="mr-3 inline-flex items-center gap-1"><i className="inline-block size-2 rounded bg-rose-500" /> Hilang</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2 rounded bg-emerald-500" /> Ditemukan</span>
      </p>
    </div>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const { hash } = useLocation();
  const lostFounds = useSelector((state) => state.lostFounds);
  const stats = useSelector((state) => state.lostFoundStats);
  const profile = useSelector((state) => state.profile);

  const [status, setStatus] = useState("");
  const [completed, setCompleted] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [keyword, handleKeyword] = useInput("");
  const [showAdd, setShowAdd] = useState(false);
  const statsRef = useRef(null);

  const load = useCallback(() => {
    dispatch(asyncSetLostFounds(onlyMine ? { isMe: 1 } : {}));
    dispatch(asyncSetLostFoundStats());
  }, [dispatch, onlyMine]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (hash === "#statistik" && stats) {
      statsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash, stats]);

  const query = keyword.trim().toLowerCase();
  const visible = lostFounds.filter(
    (item) =>
      (status === "" || item.status === status) &&
      (completed === "" || String(item.is_completed) === completed) &&
      (query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query))
  );

  async function handleToggleCompleted(item) {
    await dispatch(
      asyncChangeLostFound(item.id, {
        title: item.title,
        description: item.description,
        status: item.status,
        isCompleted: item.is_completed !== 1,
      })
    );
    load();
  }

  async function handleDelete(item) {
    const confirmed = await showConfirmDialog(`Hapus laporan "${item.title}"?`, "Hapus");
    if (!confirmed) return;
    await dispatch(asyncDeleteLostFound(item.id));
    load();
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Laporan barang</h1>
          <p className="text-slate-500">Pantau barang hilang dan temuan di lingkungan kampus.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
        >
          <IconPlus size={18} /> Lapor barang
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total" value={lostFounds.length} tone="border-slate-200 bg-white" />
        <MetricCard label="Barang Hilang" value={lostFounds.filter((i) => i.status === "lost").length} tone="border-rose-200 bg-rose-50 text-rose-800" />
        <MetricCard label="Barang Ditemukan" value={lostFounds.filter((i) => i.status === "found").length} tone="border-emerald-200 bg-emerald-50 text-emerald-800" />
        <MetricCard label="Selesai" value={lostFounds.filter((i) => i.is_completed === 1).length} tone="border-teal-200 bg-teal-50 text-teal-800" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Cari laporan"
            placeholder="Cari judul atau deskripsi"
            value={keyword}
            onChange={handleKeyword}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <select aria-label="Filter jenis" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">Semua jenis</option>
          <option value="lost">Hilang</option>
          <option value="found">Ditemukan</option>
        </select>
        <select aria-label="Filter status" value={completed} onChange={(e) => setCompleted(e.target.value)} className={selectClass}>
          <option value="">Semua status</option>
          <option value="0">Belum selesai</option>
          <option value="1">Selesai</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="size-4 accent-teal-700" />
          Laporan saya
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Belum ada laporan yang cocok.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => {
            const cover = getFileUrl(item.cover);
            const isOwner = item.user_id === profile.id;
            return (
              <li key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Link to={`/lost-founds/${item.id}`} className="block">
                  <div className="grid aspect-video place-items-center bg-slate-100">
                    {cover ? (
                      <img src={cover} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <IconPhoto size={36} className="text-slate-300" />
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className={`rounded-full px-2 py-0.5 ${item.status === "lost" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {item.status === "lost" ? "Hilang" : "Ditemukan"}
                    </span>
                    {item.is_completed === 1 && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-700">Selesai</span>
                    )}
                  </div>
                  <Link to={`/lost-founds/${item.id}`} className="font-bold hover:underline">{item.title}</Link>
                  <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
                  <p className="mt-auto text-xs text-slate-500">
                    {item.author.name} · {formatDate(item.created_at)}
                  </p>
                  {isOwner && (
                    <div className="flex gap-2 border-t border-slate-100 pt-3 text-sm font-semibold">
                      <button type="button" onClick={() => handleToggleCompleted(item)} className="text-teal-700 hover:underline">
                        {item.is_completed === 1 ? "Tandai belum selesai" : "Tandai selesai"}
                      </button>
                      <button type="button" onClick={() => handleDelete(item)} className="ml-auto text-rose-600 hover:underline">
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {stats && (
        <div id="statistik" ref={statsRef} className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-extrabold">Statistik</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <StatBars title="7 hari terakhir" losts={stats.daily.stats_losts} founds={stats.daily.stats_founds} />
            <StatBars title="Bulanan" losts={stats.monthly.stats_losts} founds={stats.monthly.stats_founds} />
          </div>
        </div>
      )}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSuccess={load} />}
    </section>
  );
}
