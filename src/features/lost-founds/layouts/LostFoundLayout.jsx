import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { asyncSetIsAuthLogout } from "../../auth/states/action";
import { asyncSetProfile } from "../../users/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

export default function LostFoundLayout() {
  const dispatch = useDispatch();
  const isAuthLogin = useSelector((state) => state.isAuthLogin);
  const isProfile = useSelector((state) => state.isProfile);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Route guard: verifikasi token dengan memuat profil; token tidak valid -> logout.
  useEffect(() => {
    if (isAuthLogin && !isProfile) {
      dispatch(asyncSetProfile()).then((success) => {
        if (!success) dispatch(asyncSetIsAuthLogout());
      });
    }
  }, [isAuthLogin, isProfile, dispatch]);

  if (!isAuthLogin) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isProfile) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Memuat sesi...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarComponent onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <SidebarComponent open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
