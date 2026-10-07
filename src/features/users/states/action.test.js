import { describe, it, expect, vi, beforeEach } from "vitest";
import * as userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as A from "./action";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper");

const ok = (data, message = "Berhasil") => ({ ok: true, message, data });
const fail = (message = "Gagal") => ({ ok: false, message });

describe("users action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("action creators", () => {
    expect(A.setUsersActionCreator([1])).toEqual({ type: A.ActionType.SET_USERS, payload: { users: [1] } });
    expect(A.setUserActionCreator({ id: 1 })).toEqual({ type: A.ActionType.SET_USER, payload: { user: { id: 1 } } });
    expect(A.setProfileActionCreator({ id: 2 })).toEqual({ type: A.ActionType.SET_PROFILE, payload: { profile: { id: 2 } } });
    expect(A.setIsProfileActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_PROFILE, payload: { status: true } });
    expect(A.setIsChangeProfileActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_CHANGE_PROFILE, payload: { status: true } });
    expect(A.setIsChangeProfilePhotoActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: { status: true } });
    expect(A.setIsChangeProfilePasswordActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_CHANGE_PROFILE_PASSWORD, payload: { status: true } });
  });

  it("asyncSetUsers sukses dan gagal", async () => {
    const dispatch = vi.fn();
    userApi.getUsers.mockResolvedValueOnce(ok({ users: [{ id: 1 }] }));
    await A.asyncSetUsers()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(A.setUsersActionCreator([{ id: 1 }]));

    userApi.getUsers.mockResolvedValueOnce(fail("err users"));
    await A.asyncSetUsers()(dispatch);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err users");
  });

  it("asyncSetUser sukses dan gagal", async () => {
    const dispatch = vi.fn();
    userApi.getUserById.mockResolvedValueOnce(ok({ user: { id: 3 } }));
    await A.asyncSetUser(3)(dispatch);
    expect(userApi.getUserById).toHaveBeenCalledWith(3);
    expect(dispatch).toHaveBeenCalledWith(A.setUserActionCreator({ id: 3 }));

    userApi.getUserById.mockResolvedValueOnce(fail("err user"));
    await A.asyncSetUser(3)(dispatch);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err user");
  });

  it("asyncSetProfile sukses mengembalikan true", async () => {
    const dispatch = vi.fn();
    userApi.getProfile.mockResolvedValue(ok({ user: { id: 1 } }));
    expect(await A.asyncSetProfile()(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setProfileActionCreator({ id: 1 }));
    expect(dispatch).toHaveBeenCalledWith(A.setIsProfileActionCreator(true));
  });

  it("asyncSetProfile gagal mengembalikan false tanpa dialog", async () => {
    const dispatch = vi.fn();
    userApi.getProfile.mockResolvedValue(fail());
    expect(await A.asyncSetProfile()(dispatch)).toBe(false);
    expect(dispatch).toHaveBeenCalledWith(A.setProfileActionCreator(null));
    expect(dispatch).toHaveBeenCalledWith(A.setIsProfileActionCreator(false));
    expect(toolsHelper.showErrorDialog).not.toHaveBeenCalled();
  });

  it("asyncChangeProfile sukses dan gagal", async () => {
    const dispatch = vi.fn();
    userApi.putProfile.mockResolvedValueOnce(ok({ user: { id: 1, name: "B" } }, "Diubah"));
    expect(await A.asyncChangeProfile({ name: "B", email: "e" })(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setProfileActionCreator({ id: 1, name: "B" }));
    expect(dispatch).toHaveBeenCalledWith(A.setIsChangeProfileActionCreator(true));
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Diubah");

    userApi.putProfile.mockResolvedValueOnce(fail("err profil"));
    expect(await A.asyncChangeProfile({ name: "B", email: "e" })(dispatch)).toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err profil");
  });

  it("asyncChangeProfilePhoto sukses dan gagal", async () => {
    const dispatch = vi.fn();
    const file = new File(["x"], "a.png");
    userApi.postProfilePhoto.mockResolvedValueOnce(ok(undefined, "Foto diubah"));
    expect(await A.asyncChangeProfilePhoto(file)(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setIsChangeProfilePhotoActionCreator(true));
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Foto diubah");

    userApi.postProfilePhoto.mockResolvedValueOnce(fail("err foto"));
    expect(await A.asyncChangeProfilePhoto(file)(dispatch)).toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err foto");
  });

  it("asyncChangeProfilePassword sukses dan gagal", async () => {
    const dispatch = vi.fn();
    const payload = { password: "a", newPassword: "b", confirmPassword: "b" };
    userApi.putProfilePassword.mockResolvedValueOnce(ok(undefined, "Sandi diubah"));
    expect(await A.asyncChangeProfilePassword(payload)(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setIsChangeProfilePasswordActionCreator(true));

    userApi.putProfilePassword.mockResolvedValueOnce(fail("err sandi"));
    expect(await A.asyncChangeProfilePassword(payload)(dispatch)).toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err sandi");
  });
});
