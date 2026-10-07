import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFileUrl } from "../../../helpers/apiHelper";
import { getInitial, showWarningDialog } from "../../../helpers/toolsHelper";
import useInput from "../../../hooks/useInput";
import {
  asyncChangeProfile,
  asyncChangeProfilePassword,
  asyncChangeProfilePhoto,
} from "../states/action";

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600";
const buttonClass =
  "rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-60";

function ProfileInfoForm({ profile }) {
  const dispatch = useDispatch();
  const [name, handleName] = useInput(profile.name);
  const [email, handleEmail] = useInput(profile.email);

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(asyncChangeProfile({ name, email }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold">Informasi akun</h2>
      <div>
        <label htmlFor="profile-name" className="mb-1 block text-sm font-semibold">Nama</label>
        <input id="profile-name" value={name} onChange={handleName} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-1 block text-sm font-semibold">Email</label>
        <input id="profile-email" type="email" value={email} onChange={handleEmail} className={fieldClass} />
      </div>
      <button type="submit" className={buttonClass}>Simpan perubahan</button>
    </form>
  );
}

function ProfilePhotoForm({ profile }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const photo = getFileUrl(profile.photo);

  function handleFile(event) {
    setFile(event.target.files[0] ?? null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      showWarningDialog("Pilih foto terlebih dahulu");
      return;
    }
    await dispatch(asyncChangeProfilePhoto(file));
    setFile(null);
    event.target.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold">Foto profil</h2>
      <div className="flex items-center gap-4">
        {photo ? (
          <img src={photo} alt="Foto profil" className="size-20 rounded-full object-cover" />
        ) : (
          <span className="grid size-20 place-items-center rounded-full bg-teal-100 text-2xl font-bold text-teal-800">
            {getInitial(profile.name)}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          aria-label="Berkas foto"
          onChange={handleFile}
          className="text-sm"
        />
      </div>
      <button type="submit" className={buttonClass}>Unggah foto</button>
    </form>
  );
}

function PasswordForm() {
  const dispatch = useDispatch();
  const [password, handlePassword, setPassword] = useInput("");
  const [newPassword, handleNewPassword, setNewPassword] = useInput("");
  const [confirmPassword, handleConfirmPassword, setConfirmPassword] = useInput("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak sama");
      return;
    }
    setError("");
    const success = await dispatch(asyncChangeProfilePassword({ password, newPassword, confirmPassword }));
    if (success) {
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold">Ganti kata sandi</h2>
      <div>
        <label htmlFor="old-password" className="mb-1 block text-sm font-semibold">Kata sandi saat ini</label>
        <input id="old-password" type="password" value={password} onChange={handlePassword} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-semibold">Kata sandi baru</label>
        <input id="new-password" type="password" value={newPassword} onChange={handleNewPassword} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-semibold">Konfirmasi kata sandi baru</label>
        <input id="confirm-password" type="password" value={confirmPassword} onChange={handleConfirmPassword} className={fieldClass} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" className={buttonClass}>Ubah kata sandi</button>
    </form>
  );
}

export default function ProfilePage() {
  const profile = useSelector((state) => state.profile);

  if (!profile) return null;

  return (
    <section>
      <h1 className="mb-6 text-2xl font-extrabold">Profil saya</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileInfoForm profile={profile} />
        <ProfilePhotoForm profile={profile} />
        <PasswordForm />
      </div>
    </section>
  );
}
