import { describe, it, expect } from "vitest";
import { ActionType } from "./action";
import * as R from "./reducer";

describe("lost-founds reducer", () => {
  it("lostFoundsReducer", () => {
    expect(R.lostFoundsReducer(undefined, {})).toEqual([]);
    expect(R.lostFoundsReducer(undefined)).toEqual([]);
    expect(R.lostFoundsReducer([], { type: ActionType.SET_LOST_FOUNDS, payload: { lostFounds: [1] } })).toEqual([1]);
  });

  it("lostFoundReducer", () => {
    expect(R.lostFoundReducer(undefined, {})).toBeNull();
    expect(R.lostFoundReducer(undefined)).toBeNull();
    expect(R.lostFoundReducer(null, { type: ActionType.SET_LOST_FOUND, payload: { lostFound: { id: 1 } } })).toEqual({ id: 1 });
  });

  it("lostFoundStatsReducer", () => {
    expect(R.lostFoundStatsReducer(undefined, {})).toBeNull();
    expect(R.lostFoundStatsReducer(undefined)).toBeNull();
    expect(R.lostFoundStatsReducer(null, { type: ActionType.SET_LOST_FOUND_STATS, payload: { stats: { a: 1 } } })).toEqual({ a: 1 });
  });

  it.each([
    ["isLostFoundReducer", R.isLostFoundReducer, ActionType.SET_IS_LOST_FOUND],
    ["isLostFoundAddReducer", R.isLostFoundAddReducer, ActionType.SET_IS_LOST_FOUND_ADD],
    ["isLostFoundAddedReducer", R.isLostFoundAddedReducer, ActionType.SET_IS_LOST_FOUND_ADDED],
    ["isLostFoundChangeReducer", R.isLostFoundChangeReducer, ActionType.SET_IS_LOST_FOUND_CHANGE],
    ["isLostFoundChangedReducer", R.isLostFoundChangedReducer, ActionType.SET_IS_LOST_FOUND_CHANGED],
    ["isLostFoundChangeCoverReducer", R.isLostFoundChangeCoverReducer, ActionType.SET_IS_LOST_FOUND_CHANGE_COVER],
    ["isLostFoundChangedCoverReducer", R.isLostFoundChangedCoverReducer, ActionType.SET_IS_LOST_FOUND_CHANGED_COVER],
    ["isLostFoundDeleteReducer", R.isLostFoundDeleteReducer, ActionType.SET_IS_LOST_FOUND_DELETE],
    ["isLostFoundDeletedReducer", R.isLostFoundDeletedReducer, ActionType.SET_IS_LOST_FOUND_DELETED],
  ])("%s", (_name, reducer, type) => {
    expect(reducer(undefined, {})).toBe(false);
    expect(reducer(undefined)).toBe(false);
    expect(reducer(false, { type, payload: { status: true } })).toBe(true);
    expect(reducer(true, { type: "lain" })).toBe(true);
  });
});
