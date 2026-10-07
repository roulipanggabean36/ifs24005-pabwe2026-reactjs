import { describe, it, expect, vi, afterEach } from "vitest";
import * as apiHelper from "../../../helpers/apiHelper";
import { postLogin, postLogout, postRegister } from "./authApi";

describe("authApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("postLogin memanggil POST /auth/login", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({ ok: true });
    await postLogin({ email: "a@b.c", password: "123456" });
    expect(spy).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
    });
  });

  it("postRegister memanggil POST /auth/register", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({ ok: true });
    await postRegister({ name: "N", email: "a@b.c", password: "123456" });
    expect(spy).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "N", email: "a@b.c", password: "123456" },
    });
  });

  it("postLogout memanggil POST /auth/logout", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({ ok: true });
    await postLogout();
    expect(spy).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});
