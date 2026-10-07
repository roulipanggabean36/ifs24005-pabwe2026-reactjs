import * as api from "../api/lostFoundApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_LOST_FOUNDS: "lostFounds/setLostFounds",
  SET_LOST_FOUND: "lostFounds/setLostFound",
  SET_IS_LOST_FOUND: "lostFounds/setIsLostFound",
  SET_IS_LOST_FOUND_ADD: "lostFounds/setIsLostFoundAdd",
  SET_IS_LOST_FOUND_ADDED: "lostFounds/setIsLostFoundAdded",
  SET_IS_LOST_FOUND_CHANGE: "lostFounds/setIsLostFoundChange",
  SET_IS_LOST_FOUND_CHANGED: "lostFounds/setIsLostFoundChanged",
  SET_IS_LOST_FOUND_CHANGE_COVER: "lostFounds/setIsLostFoundChangeCover",
  SET_IS_LOST_FOUND_CHANGED_COVER: "lostFounds/setIsLostFoundChangedCover",
  SET_IS_LOST_FOUND_DELETE: "lostFounds/setIsLostFoundDelete",
  SET_IS_LOST_FOUND_DELETED: "lostFounds/setIsLostFoundDeleted",
  SET_LOST_FOUND_STATS: "lostFounds/setLostFoundStats",
};

const flag = (type) => (status) => ({ type, payload: { status } });

export const setLostFoundsActionCreator = (lostFounds) => ({
  type: ActionType.SET_LOST_FOUNDS,
  payload: { lostFounds },
});
export const setLostFoundActionCreator = (lostFound) => ({
  type: ActionType.SET_LOST_FOUND,
  payload: { lostFound },
});
export const setLostFoundStatsActionCreator = (stats) => ({
  type: ActionType.SET_LOST_FOUND_STATS,
  payload: { stats },
});
export const setIsLostFoundActionCreator = flag(ActionType.SET_IS_LOST_FOUND);
export const setIsLostFoundAddActionCreator = flag(ActionType.SET_IS_LOST_FOUND_ADD);
export const setIsLostFoundAddedActionCreator = flag(ActionType.SET_IS_LOST_FOUND_ADDED);
export const setIsLostFoundChangeActionCreator = flag(ActionType.SET_IS_LOST_FOUND_CHANGE);
export const setIsLostFoundChangedActionCreator = flag(ActionType.SET_IS_LOST_FOUND_CHANGED);
export const setIsLostFoundChangeCoverActionCreator = flag(ActionType.SET_IS_LOST_FOUND_CHANGE_COVER);
export const setIsLostFoundChangedCoverActionCreator = flag(ActionType.SET_IS_LOST_FOUND_CHANGED_COVER);
export const setIsLostFoundDeleteActionCreator = flag(ActionType.SET_IS_LOST_FOUND_DELETE);
export const setIsLostFoundDeletedActionCreator = flag(ActionType.SET_IS_LOST_FOUND_DELETED);

export function asyncSetLostFounds(filters = {}) {
  return async (dispatch) => {
    dispatch(setIsLostFoundActionCreator(false));
    try {
      const result = await api.getLostFounds(filters);
      if (!result.ok) throw new Error(result.message);
      dispatch(setLostFoundsActionCreator(result.data.lost_founds));
      dispatch(setIsLostFoundActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetLostFound(id) {
  return async (dispatch) => {
    try {
      const result = await api.getLostFoundById(id);
      if (!result.ok) throw new Error(result.message);
      dispatch(setLostFoundActionCreator(result.data.lost_found));
      return true;
    } catch (error) {
      dispatch(setLostFoundActionCreator(null));
      showErrorDialog(error.message);
      return false;
    }
  };
}

export function asyncSetLostFoundStats() {
  return async (dispatch) => {
    try {
      const [daily, monthly] = await Promise.all([
        api.getLostFoundStatsDaily(),
        api.getLostFoundStatsMonthly(),
      ]);
      if (!daily.ok) throw new Error(daily.message);
      if (!monthly.ok) throw new Error(monthly.message);
      dispatch(setLostFoundStatsActionCreator({ daily: daily.data, monthly: monthly.data }));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

// Pola umum untuk aksi mutasi: proses -> selesai -> dialog.
async function mutate(dispatch, { setProcess, setDone, request }) {
  dispatch(setProcess(true));
  dispatch(setDone(false));
  try {
    const result = await request();
    if (!result.ok) throw new Error(result.message);
    dispatch(setDone(true));
    dispatch(setProcess(false));
    showSuccessDialog(result.message);
    return true;
  } catch (error) {
    dispatch(setProcess(false));
    showErrorDialog(error.message);
    return false;
  }
}

export function asyncAddLostFound({ title, description, status }) {
  return (dispatch) =>
    mutate(dispatch, {
      setProcess: setIsLostFoundAddActionCreator,
      setDone: setIsLostFoundAddedActionCreator,
      request: () => api.postLostFound({ title, description, status }),
    });
}

export function asyncChangeLostFound(id, payload) {
  return (dispatch) =>
    mutate(dispatch, {
      setProcess: setIsLostFoundChangeActionCreator,
      setDone: setIsLostFoundChangedActionCreator,
      request: () => api.putLostFound(id, payload),
    });
}

export function asyncChangeLostFoundCover(id, file) {
  return (dispatch) =>
    mutate(dispatch, {
      setProcess: setIsLostFoundChangeCoverActionCreator,
      setDone: setIsLostFoundChangedCoverActionCreator,
      request: () => api.postLostFoundCover(id, file),
    });
}

export function asyncDeleteLostFound(id) {
  return (dispatch) =>
    mutate(dispatch, {
      setProcess: setIsLostFoundDeleteActionCreator,
      setDone: setIsLostFoundDeletedActionCreator,
      request: () => api.deleteLostFound(id),
    });
}
