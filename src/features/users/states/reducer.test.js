import { describe, it, expect } from "vitest";
import { ActionType as AuthActionType } from "../../auth/states/action";
import { ActionType } from "./action";
import * as R from "./reducer";

describe("users reducer", () => {
  it("usersReducer", () => {
    expect(R.usersReducer(undefined, {})).toEqual([]);
    expect(R.usersReducer(undefined)).toEqual([]);
    expect(R.usersReducer([], { type: ActionType.SET_USERS, payload: { users: [1] } })).toEqual([1]);
  });

  it("userReducer", () => {
    expect(R.userReducer(undefined, {})).toBeNull();
    expect(R.userReducer(undefined)).toBeNull();
    expect(R.userReducer(null, { type: ActionType.SET_USER, payload: { user: { id: 1 } } })).toEqual({ id: 1 });
  });

  it("profileReducer", () => {
    expect(R.profileReducer(undefined, {})).toBeNull();
    expect(R.profileReducer(undefined)).toBeNull();
    expect(R.profileReducer(null, { type: ActionType.SET_PROFILE, payload: { profile: { id: 2 } } })).toEqual({ id: 2 });
  });

  it.each([
    ["isProfileReducer", R.isProfileReducer, ActionType.SET_IS_PROFILE],
    ["isChangeProfileReducer", R.isChangeProfileReducer, ActionType.SET_IS_CHANGE_PROFILE],
    ["isChangeProfilePhotoReducer", R.isChangeProfilePhotoReducer, ActionType.SET_IS_CHANGE_PROFILE_PHOTO],
    ["isChangeProfilePasswordReducer", R.isChangeProfilePasswordReducer, ActionType.SET_IS_CHANGE_PROFILE_PASSWORD],
  ])("%s", (_name, reducer, type) => {
    expect(reducer(undefined, {})).toBe(false);
    expect(reducer(undefined)).toBe(false);
    expect(reducer(false, { type, payload: { status: true } })).toBe(true);
    expect(reducer(true, { type: "lain" })).toBe(true);
  });

  it("profil dan isProfile direset saat logout (dan tidak saat login ulang)", () => {
    const logout = { type: AuthActionType.SET_IS_AUTH_LOGOUT, payload: { status: true } };
    const notLogout = { type: AuthActionType.SET_IS_AUTH_LOGOUT, payload: { status: false } };
    expect(R.profileReducer({ id: 1 }, logout)).toBeNull();
    expect(R.isProfileReducer(true, logout)).toBe(false);
    expect(R.profileReducer({ id: 1 }, notLogout)).toEqual({ id: 1 });
    expect(R.isProfileReducer(true, notLogout)).toBe(true);
  });
});
