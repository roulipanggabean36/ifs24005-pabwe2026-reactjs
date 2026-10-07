import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authApi from "../api/authApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import {
  ActionType,
  asyncSetIsAuthLogin,
  asyncSetIsAuthLogout,
  asyncSetIsAuthRegister,
  setIsAuthLoginActionCreator,
  setIsAuthLogoutActionCreator,
  setIsAuthRegisterActionCreator,
} from "./action";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper");

describe("auth action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("action creators menghasilkan action yang benar", () => {
    expect(setIsAuthLoginActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGIN,
      payload: { status: true },
    });
    expect(setIsAuthRegisterActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_REGISTER,
      payload: { status: true },
    });
    expect(setIsAuthLogoutActionCreator(false)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGOUT,
      payload: { status: false },
    });
  });

  it("asyncSetIsAuthLogin sukses: simpan token dan dispatch status", async () => {
    authApi.postLogin.mockResolvedValue({ ok: true, data: { token: "tok" } });
    const dispatch = vi.fn();

    const result = await asyncSetIsAuthLogin({ email: "a", password: "b" })(dispatch);

    expect(result).toBe(true);
    expect(getAccessToken()).toBe("tok");
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(false));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(true));
  });

  it("asyncSetIsAuthLogin gagal: tampilkan dialog error", async () => {
    authApi.postLogin.mockResolvedValue({ ok: false, message: "Kredensial salah" });
    const dispatch = vi.fn();

    const result = await asyncSetIsAuthLogin({ email: "a", password: "b" })(dispatch);

    expect(result).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
  });

  it("asyncSetIsAuthRegister sukses", async () => {
    authApi.postRegister.mockResolvedValue({ ok: true, message: "Berhasil" });
    const dispatch = vi.fn();

    const result = await asyncSetIsAuthRegister({ name: "n", email: "e", password: "p" })(dispatch);

    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(true));
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Berhasil");
  });

  it("asyncSetIsAuthRegister gagal", async () => {
    authApi.postRegister.mockResolvedValue({ ok: false, message: "Email sudah dipakai" });
    const dispatch = vi.fn();

    const result = await asyncSetIsAuthRegister({ name: "n", email: "e", password: "p" })(dispatch);

    expect(result).toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
  });

  it("asyncSetIsAuthLogout membersihkan token saat request berhasil", async () => {
    putAccessToken("tok");
    authApi.postLogout.mockResolvedValue({ ok: true });
    const dispatch = vi.fn();

    await asyncSetIsAuthLogout()(dispatch);

    expect(getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
  });

  it("asyncSetIsAuthLogout tetap membersihkan token walau request gagal", async () => {
    putAccessToken("tok");
    authApi.postLogout.mockRejectedValue(new Error("network"));
    const dispatch = vi.fn();

    await asyncSetIsAuthLogout()(dispatch);

    expect(getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
  });
});
