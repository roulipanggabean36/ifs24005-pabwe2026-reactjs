import { IconSearch } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.isAuthLogin);

  if (isAuthLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <aside
        data-testid="auth-banner"
        className="hidden lg:flex flex-col justify-between bg-teal-800 text-teal-50 p-12"
      >
        <div className="flex items-center gap-3 text-xl font-bold">
          <span className="grid place-items-center size-10 rounded-xl bg-amber-300 text-teal-900">
            <IconSearch size={22} stroke={2.5} />
          </span>
          Lost &amp; Founds
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight max-w-md">
            Barang hilang? Barang ditemukan? Laporkan di sini.
          </h1>
          <p className="mt-4 text-teal-100 max-w-md">
            Pusat laporan kehilangan dan temuan barang untuk seluruh civitas kampus.
          </p>
        </div>
        <p className="text-sm text-teal-200">Praktikum PABWE 2026</p>
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
