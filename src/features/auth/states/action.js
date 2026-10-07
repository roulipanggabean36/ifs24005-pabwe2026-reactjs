import * as authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_IS_AUTH_LOGIN: "auth/setIsAuthLogin",
  SET_IS_AUTH_REGISTER: "auth/setIsAuthRegister",
  SET_IS_AUTH_LOGOUT: "auth/setIsAuthLogout",
};

export function setIsAuthLoginActionCreator(status) {
  return { type: ActionType.SET_IS_AUTH_LOGIN, payload: { status } };
}

export function setIsAuthRegisterActionCreator(status) {
  return { type: ActionType.SET_IS_AUTH_REGISTER, payload: { status } };
}

export function setIsAuthLogoutActionCreator(status) {
  return { type: ActionType.SET_IS_AUTH_LOGOUT, payload: { status } };
}

export function asyncSetIsAuthLogin({ email, password }) {
  return async (dispatch) => {
    try {
      const result = await authApi.postLogin({ email, password });
      if (!result.ok) throw new Error(result.message);

      putAccessToken(result.data.token);
      dispatch(setIsAuthLogoutActionCreator(false));
      dispatch(setIsAuthLoginActionCreator(true));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncSetIsAuthRegister({ name, email, password }) {
  return async (dispatch) => {
    try {
      const result = await authApi.postRegister({ name, email, password });
      if (!result.ok) throw new Error(result.message);

      dispatch(setIsAuthRegisterActionCreator(true));
      showSuccessDialog(result.message);
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncSetIsAuthLogout() {
  return async (dispatch) => {
    try {
      await authApi.postLogout();
    } catch {
      // token tetap dibersihkan di sisi klien walau request gagal
    }
    removeAccessToken();
    dispatch(setIsAuthLoginActionCreator(false));
    dispatch(setIsAuthLogoutActionCreator(true));
  };
}
