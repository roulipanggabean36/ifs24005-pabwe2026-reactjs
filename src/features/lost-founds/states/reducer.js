import { ActionType } from "./action";

export function lostFoundsReducer(lostFounds = [], action = {}) {
  if (action.type === ActionType.SET_LOST_FOUNDS) return action.payload.lostFounds;
  return lostFounds;
}

export function lostFoundReducer(lostFound = null, action = {}) {
  if (action.type === ActionType.SET_LOST_FOUND) return action.payload.lostFound;
  return lostFound;
}

export function lostFoundStatsReducer(stats = null, action = {}) {
  if (action.type === ActionType.SET_LOST_FOUND_STATS) return action.payload.stats;
  return stats;
}

function createFlagReducer(type) {
  return (status = false, action = {}) => {
    if (action.type === type) return action.payload.status;
    return status;
  };
}

export const isLostFoundReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND);
export const isLostFoundAddReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_ADD);
export const isLostFoundAddedReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_ADDED);
export const isLostFoundChangeReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_CHANGE);
export const isLostFoundChangedReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_CHANGED);
export const isLostFoundChangeCoverReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_CHANGE_COVER);
export const isLostFoundChangedCoverReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_CHANGED_COVER);
export const isLostFoundDeleteReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_DELETE);
export const isLostFoundDeletedReducer = createFlagReducer(ActionType.SET_IS_LOST_FOUND_DELETED);
