import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  BASE_URL,
  apiFetch,
  getAccessToken,
  getFileUrl,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("GET tanpa token dan tanpa query", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ status: "success", message: "ok", data: { a: 1 } }),
    });

    const result = await apiFetch("/users");

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/users`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    expect(result).toEqual({ ok: true, status: "success", message: "ok", data: { a: 1 } });
  });

  it("menambahkan bearer token, query params (mengabaikan nilai kosong), dan body JSON", async () => {
    putAccessToken("tok");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ status: "fail", message: "gagal" }),
    });

    const result = await apiFetch("/lost-founds", {
      method: "POST",
      query: { status: "lost", is_me: 1, kosong: "", nol: null, undef: undefined },
      body: { title: "x" },
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/lost-founds?status=lost&is_me=1`);
    expect(options.headers.Authorization).toBe("Bearer tok");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ title: "x" }));
    expect(result.ok).toBe(false);
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ status: "success", message: "ok" }),
    });
    const formData = new FormData();
    formData.append("cover", "file");

    await apiFetch("/lost-founds/1/cover", { method: "POST", formData });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.body).toBe(formData);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("getFileUrl menangani null, URL penuh, dan path relatif", () => {
    expect(getFileUrl(null)).toBeNull();
    expect(getFileUrl("http://x.test/a.png")).toBe("http://x.test/a.png");
    expect(getFileUrl("img/profile/1.png")).toBe(`${BASE_URL.replace(/\/api\/v1$/, "")}/img/profile/1.png`);
  });
});
