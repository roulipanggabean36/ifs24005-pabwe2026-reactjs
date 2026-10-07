import { useEffect } from "react";
import { IconSearch } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { getFileUrl } from "../../../helpers/apiHelper";
import { getInitial } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import { asyncSetUsers } from "../states/action";

export default function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);
  const [keyword, handleKeyword] = useInput("");

  useEffect(() => {
    dispatch(asyncSetUsers());
  }, [dispatch]);

  const query = keyword.trim().toLowerCase();
  const filtered = users.filter(
    (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  );

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Pengguna</h1>
          <p className="text-slate-500">Daftar seluruh pengguna terdaftar.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            aria-label="Cari pengguna"
            placeholder="Cari nama atau email"
            value={keyword}
            onChange={handleKeyword}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Tidak ada pengguna yang cocok.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((user) => {
            const photo = getFileUrl(user.photo);
            return (
              <li key={user.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
                {photo ? (
                  <img src={photo} alt={user.name} className="size-12 rounded-full object-cover" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-full bg-teal-100 font-bold text-teal-800">
                    {getInitial(user.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-slate-500">{user.email}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
