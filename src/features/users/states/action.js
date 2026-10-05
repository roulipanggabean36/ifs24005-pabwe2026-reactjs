import * as userApi from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_USERS: "users/setUsers",
  SET_USER: "users/setUser",
  SET_PROFILE: "users/setProfile",
  SET_IS_PROFILE: "users/setIsProfile",
  SET_IS_CHANGE_PROFILE: "users/setIsChangeProfile",
  SET_IS_CHANGE_PROFILE_PHOTO: "users/setIsChangeProfilePhoto",
  SET_IS_CHANGE_PROFILE_PASSWORD: "users/setIsChangeProfilePassword",
};

export const setUsersActionCreator = (users) => ({ type: ActionType.SET_USERS, payload: { users } });
export const setUserActionCreator = (user) => ({ type: ActionType.SET_USER, payload: { user } });
export const setProfileActionCreator = (profile) => ({
  type: ActionType.SET_PROFILE,
  payload: { profile },
});
export const setIsProfileActionCreator = (status) => ({
  type: ActionType.SET_IS_PROFILE,
  payload: { status },
});
export const setIsChangeProfileActionCreator = (status) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE,
  payload: { status },
});
export const setIsChangeProfilePhotoActionCreator = (status) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO,
  payload: { status },
});
export const setIsChangeProfilePasswordActionCreator = (status) => ({
  type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
  payload: { status },
});

export function asyncSetUsers() {
  return async (dispatch) => {
    try {
      const result = await userApi.getUsers();
      if (!result.ok) throw new Error(result.message);
      dispatch(setUsersActionCreator(result.data.users));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetUser(id) {
  return async (dispatch) => {
    try {
      const result = await userApi.getUserById(id);
      if (!result.ok) throw new Error(result.message);
      dispatch(setUserActionCreator(result.data.user));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

// Dipakai route guard: tanpa dialog, mengembalikan boolean.
export function asyncSetProfile() {
  return async (dispatch) => {
    try {
      const result = await userApi.getProfile();
      if (!result.ok) throw new Error(result.message);
      dispatch(setProfileActionCreator(result.data.user));
      dispatch(setIsProfileActionCreator(true));
      return true;
    } catch {
      dispatch(setProfileActionCreator(null));
      dispatch(setIsProfileActionCreator(false));
      return false;
    }
  };
}

export function asyncChangeProfile({ name, email }) {
  return async (dispatch) => {
    dispatch(setIsChangeProfileActionCreator(false));
    try {
      const result = await userApi.putProfile({ name, email });
      if (!result.ok) throw new Error(result.message);
      dispatch(setProfileActionCreator(result.data.user));
      dispatch(setIsChangeProfileActionCreator(true));
      showSuccessDialog(result.message);
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncChangeProfilePhoto(file) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePhotoActionCreator(false));
    try {
      const result = await userApi.postProfilePhoto(file);
      if (!result.ok) throw new Error(result.message);
      await dispatch(asyncSetProfile());
      dispatch(setIsChangeProfilePhotoActionCreator(true));
      showSuccessDialog(result.message);
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncChangeProfilePassword({ password, newPassword, confirmPassword }) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePasswordActionCreator(false));
    try {
      const result = await userApi.putProfilePassword({ password, newPassword, confirmPassword });
      if (!result.ok) throw new Error(result.message);
      dispatch(setIsChangeProfilePasswordActionCreator(true));
      showSuccessDialog(result.message);
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      return false;
    }
  };
}
