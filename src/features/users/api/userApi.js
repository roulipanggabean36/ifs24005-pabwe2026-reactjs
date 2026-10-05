import { apiFetch } from "../../../helpers/apiHelper";

export function getUsers() {
  return apiFetch("/users");
}

export function getUserById(id) {
  return apiFetch(`/users/${id}`);
}

export function getProfile() {
  return apiFetch("/users/me");
}

export function putProfile({ name, email }) {
  return apiFetch("/users/me", { method: "PUT", body: { name, email } });
}

export function postProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  return apiFetch("/users/me/photo", { method: "POST", formData });
}

export function putProfilePassword({ password, newPassword, confirmPassword }) {
  return apiFetch("/users/password", {
    method: "PUT",
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    },
  });
}
