import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthLogin } from "../states/action";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function LoginPage() {
  const dispatch = useDispatch();
  const [email, handleEmail] = useInput("");
  const [password, handlePassword] = useInput("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!EMAIL_PATTERN.test(email)) nextErrors.email = "Format email tidak valid";
    if (password.length < 6) nextErrors.password = "Kata sandi minimal 6 karakter";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    await dispatch(asyncSetIsAuthLogin({ email, password }));
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Masuk</h2>
        <p className="mt-1 text-slate-500">Masuk untuk melihat dan membuat laporan.</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmail}
          placeholder="nama@del.ac.id"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1">Kata sandi</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePassword}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-semibold text-teal-700 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
