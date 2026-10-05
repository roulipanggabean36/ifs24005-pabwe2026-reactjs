import { useState } from "react";
import { IconLogout, IconMenu2, IconSearch, IconUser } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getFileUrl } from "../../../helpers/apiHelper";
import { getInitial, showConfirmDialog } from "../../../helpers/toolsHelper";
import { asyncSetIsAuthLogout } from "../../auth/states/action";

export default function NavbarComponent({ onMenuClick }) {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const [open, setOpen] = useState(false);
  const photo = getFileUrl(profile.photo);

  async function handleLogout() {
    const confirmed = await showConfirmDialog("Yakin ingin keluar dari akun ini?", "Keluar");
    if (confirmed) {
      dispatch(asyncSetIsAuthLogout());
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        >
          <IconMenu2 size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-teal-800">
          <span className="grid size-9 place-items-center rounded-lg bg-teal-700 text-amber-200">
            <IconSearch size={20} stroke={2.5} />
          </span>
          Lost &amp; Founds
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Menu profil"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-3 rounded-full p-1 pr-3 hover:bg-slate-100"
        >
          {photo ? (
            <img src={photo} alt="" className="size-9 rounded-full object-cover" />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-teal-100 font-bold text-teal-800">
              {getInitial(profile.name)}
            </span>
          )}
          <span className="hidden text-sm font-semibold sm:block">{profile.name}</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="border-b border-slate-100 px-3 pb-2">
              <p className="truncate font-semibold">{profile.name}</p>
              <p className="truncate text-sm text-slate-500">{profile.email}</p>
            </div>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              <IconUser size={18} /> Profil saya
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <IconLogout size={18} /> Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
