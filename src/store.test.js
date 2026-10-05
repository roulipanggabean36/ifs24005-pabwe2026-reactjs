import { describe, it, expect } from "vitest";
import { reducer, store } from "./store";
import { setUsersActionCreator } from "./features/users/states/action";
import { setLostFoundsActionCreator } from "./features/lost-founds/states/action";

describe("store", () => {
  it("menggabungkan reducer fitur auth, users, dan lost-founds", () => {
    const keys = Object.keys(store.getState());
    expect(keys).toEqual(Object.keys(reducer));
    expect(keys).toEqual(
      expect.arrayContaining(["isAuthLogin", "users", "profile", "lostFounds", "lostFoundStats"])
    );
  });

  it("state awal sesuai default tiap reducer", () => {
    const state = store.getState();
    expect(state.users).toEqual([]);
    expect(state.lostFounds).toEqual([]);
    expect(state.profile).toBeNull();
    expect(state.isLostFoundAdd).toBe(false);
  });

  it("memperbarui state ketika action di-dispatch", () => {
    store.dispatch(setUsersActionCreator([{ id: 1 }]));
    store.dispatch(setLostFoundsActionCreator([{ id: 9 }]));
    expect(store.getState().users).toEqual([{ id: 1 }]);
    expect(store.getState().lostFounds).toEqual([{ id: 9 }]);
  });
});
