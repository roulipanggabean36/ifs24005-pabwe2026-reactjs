import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthRegister } from "../states/action";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, handleName] = useInput("");
  const [email, handleEmail] = useInput("");
  const [password, handlePassword] = useInput("");
  const [confirm, handleConfirm] = useInput("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (name.trim() === "") nextErrors.name = "Nama wajib diisi";
    if (!EMAIL_PATTERN.test(email)) nextErrors.email = "Format email tidak valid";
    if (password.length < 6) nextErrors.password = "Kata sandi minimal 6 karakter";
    if (confirm !== password) nextErrors.confirm = "Konfirmasi kata sandi tidak sama";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const success = await dispatch(asyncSetIsAuthRegister({ name, email, password }));
    setLoading(false);
    if (success) navigate("/auth/login");
  }

  const fieldClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Buat akun</h2>
        <p className="mt-1 text-slate-500">Daftar untuk mulai melaporkan barang.</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-1">Nama</label>
        <input id="name" type="text" value={name} onChange={handleName} className={fieldClass} />
        {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1">Email</label>
        <input id="email" type="email" value={email} onChange={handleEmail} className={fieldClass} />
        {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1">Kata sandi</label>
        <input id="password" type="password" value={password} onChange={handlePassword} className={fieldClass} />
        {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-semibold mb-1">Konfirmasi kata sandi</label>
        <input id="confirm" type="password" value={confirm} onChange={handleConfirm} className={fieldClass} />
        {errors.confirm && <p className="mt-1 text-sm text-rose-600">{errors.confirm}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Daftar"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="font-semibold text-teal-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
