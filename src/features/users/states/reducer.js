import { ActionType as AuthActionType } from "../../auth/states/action";
import { ActionType } from "./action";

const isLogout = (action) =>
  action.type === AuthActionType.SET_IS_AUTH_LOGOUT && action.payload.status === true;

export function usersReducer(users = [], action = {}) {
  if (action.type === ActionType.SET_USERS) return action.payload.users;
  return users;
}

export function userReducer(user = null, action = {}) {
  if (action.type === ActionType.SET_USER) return action.payload.user;
  return user;
}

export function profileReducer(profile = null, action = {}) {
  if (action.type === ActionType.SET_PROFILE) return action.payload.profile;
  if (isLogout(action)) return null;
  return profile;
}

export function isProfileReducer(status = false, action = {}) {
  if (action.type === ActionType.SET_IS_PROFILE) return action.payload.status;
  if (isLogout(action)) return false;
  return status;
}

export function isChangeProfileReducer(status = false, action = {}) {
  if (action.type === ActionType.SET_IS_CHANGE_PROFILE) return action.payload.status;
  return status;
}

export function isChangeProfilePhotoReducer(status = false, action = {}) {
  if (action.type === ActionType.SET_IS_CHANGE_PROFILE_PHOTO) return action.payload.status;
  return status;
}

export function isChangeProfilePasswordReducer(status = false, action = {}) {
  if (action.type === ActionType.SET_IS_CHANGE_PROFILE_PASSWORD) return action.payload.status;
  return status;
}
