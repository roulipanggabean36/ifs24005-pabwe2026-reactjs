import { getAccessToken } from "../../../helpers/apiHelper";
import { ActionType } from "./action";

export function isAuthLoginReducer(state = getAccessToken() !== null, action = {}) {
  if (action.type === ActionType.SET_IS_AUTH_LOGIN) return action.payload.status;
  return state;
}

export function isAuthRegisterReducer(state = false, action = {}) {
  if (action.type === ActionType.SET_IS_AUTH_REGISTER) return action.payload.status;
  return state;
}

export function isAuthLogoutReducer(state = false, action = {}) {
  if (action.type === ActionType.SET_IS_AUTH_LOGOUT) return action.payload.status;
  return state;
}
