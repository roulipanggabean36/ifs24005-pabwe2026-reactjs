import Swal from "sweetalert2";

export function showSuccessDialog(message) {
  return Swal.fire({ icon: "success", title: "Berhasil", text: message, confirmButtonColor: "#0f766e" });
}

export function showErrorDialog(message) {
  return Swal.fire({ icon: "error", title: "Gagal", text: message, confirmButtonColor: "#dc2626" });
}

export function showWarningDialog(message) {
  return Swal.fire({ icon: "warning", title: "Perhatian", text: message, confirmButtonColor: "#d97706" });
}

export async function showConfirmDialog(message, confirmText = "Ya") {
  const result = await Swal.fire({
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: "#0f766e",
  });
  return result.isConfirmed;
}

export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getInitial(name) {
  return name.trim().charAt(0).toUpperCase();
}
