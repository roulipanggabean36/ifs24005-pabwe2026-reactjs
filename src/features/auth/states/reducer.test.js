import { describe, it, expect } from "vitest";
import { putAccessToken } from "../../../helpers/apiHelper";
import { ActionType } from "./action";
import { isAuthLoginReducer, isAuthLogoutReducer, isAuthRegisterReducer } from "./reducer";

describe("auth reducer", () => {
  it("isAuthLoginReducer: default mengikuti ada/tidaknya token", () => {
    localStorage.clear();
    expect(isAuthLoginReducer(undefined, {})).toBe(false);
    putAccessToken("tok");
    expect(isAuthLoginReducer(undefined)).toBe(true);
    localStorage.clear();
  });

  it("isAuthLoginReducer: menangani SET_IS_AUTH_LOGIN dan action lain", () => {
    expect(
      isAuthLoginReducer(false, { type: ActionType.SET_IS_AUTH_LOGIN, payload: { status: true } })
    ).toBe(true);
    expect(isAuthLoginReducer(true, { type: "lain" })).toBe(true);
  });

  it("isAuthRegisterReducer", () => {
    expect(isAuthRegisterReducer(undefined, {})).toBe(false);
    expect(isAuthRegisterReducer(undefined)).toBe(false);
    expect(
      isAuthRegisterReducer(false, { type: ActionType.SET_IS_AUTH_REGISTER, payload: { status: true } })
    ).toBe(true);
  });

  it("isAuthLogoutReducer", () => {
    expect(isAuthLogoutReducer(undefined, {})).toBe(false);
    expect(isAuthLogoutReducer(undefined)).toBe(false);
    expect(
      isAuthLogoutReducer(false, { type: ActionType.SET_IS_AUTH_LOGOUT, payload: { status: true } })
    ).toBe(true);
  });
});
