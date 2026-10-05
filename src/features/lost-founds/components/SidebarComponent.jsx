import { IconChartBar, IconClipboardList, IconUser, IconUsers, IconX } from "@tabler/icons-react";
import { Link, NavLink } from "react-router-dom";

const baseClass = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold";
const navClass = ({ isActive }) =>
  `${baseClass} ${isActive ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"}`;

export default function SidebarComponent({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          data-testid="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}
      <aside
        data-testid="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white p-4 transition-transform lg:static lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="font-extrabold text-teal-800">Menu</span>
          <button type="button" aria-label="Tutup menu" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <IconX size={20} />
          </button>
        </div>
        <nav className="space-y-1">
          <NavLink to="/" end onClick={onClose} className={navClass}>
            <IconClipboardList size={20} /> Laporan
          </NavLink>
          <Link to={{ pathname: "/", hash: "#statistik" }} onClick={onClose} className={`${baseClass} text-slate-600 hover:bg-slate-100`}>
            <IconChartBar size={20} /> Statistik
          </Link>
          <NavLink to="/users" onClick={onClose} className={navClass}>
            <IconUsers size={20} /> Pengguna
          </NavLink>
          <NavLink to="/profile" onClick={onClose} className={navClass}>
            <IconUser size={20} /> Profil Saya
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
