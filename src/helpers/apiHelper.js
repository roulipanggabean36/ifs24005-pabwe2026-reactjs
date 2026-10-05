/* global DELCOM_BASEURL */
const TOKEN_KEY = "accessToken";

export const BASE_URL = DELCOM_BASEURL;

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Foto/cover dari API bisa berupa URL penuh atau path relatif (img/...).
export function getFileUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL.replace(/\/api\/v1$/, "")}/${path}`;
}

function buildUrl(path, query) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

/**
 * Wrapper fetch ke REST API Delcom.
 * - Otomatis menambahkan header Authorization: Bearer <token>
 * - Mendukung query params, body JSON, dan FormData
 * - Selalu mengembalikan { ok, status, message, data }
 */
export async function apiFetch(path, { method = "GET", query, body, formData } = {}) {
  const headers = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (formData) {
    options.body = formData;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), options);
  const json = await response.json();

  return {
    ok: json.status === "success",
    status: json.status,
    message: json.message,
    data: json.data,
  };
}
