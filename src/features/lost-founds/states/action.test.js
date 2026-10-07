import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as A from "./action";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper");

const ok = (data, message = "Berhasil") => ({ ok: true, message, data });
const fail = (message = "Gagal") => ({ ok: false, message });

describe("lost-founds action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("action creators", () => {
    const T = A.ActionType;
    expect(A.setLostFoundsActionCreator([1])).toEqual({ type: T.SET_LOST_FOUNDS, payload: { lostFounds: [1] } });
    expect(A.setLostFoundActionCreator({ id: 1 })).toEqual({ type: T.SET_LOST_FOUND, payload: { lostFound: { id: 1 } } });
    expect(A.setLostFoundStatsActionCreator({ a: 1 })).toEqual({ type: T.SET_LOST_FOUND_STATS, payload: { stats: { a: 1 } } });
    expect(A.setIsLostFoundActionCreator(true)).toEqual({ type: T.SET_IS_LOST_FOUND, payload: { status: true } });
    expect(A.setIsLostFoundAddActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_ADD);
    expect(A.setIsLostFoundAddedActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_ADDED);
    expect(A.setIsLostFoundChangeActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_CHANGE);
    expect(A.setIsLostFoundChangedActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_CHANGED);
    expect(A.setIsLostFoundChangeCoverActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_CHANGE_COVER);
    expect(A.setIsLostFoundChangedCoverActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_CHANGED_COVER);
    expect(A.setIsLostFoundDeleteActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_DELETE);
    expect(A.setIsLostFoundDeletedActionCreator(true).type).toBe(T.SET_IS_LOST_FOUND_DELETED);
  });

  it("asyncSetLostFounds sukses (filter default dan kustom) dan gagal", async () => {
    const dispatch = vi.fn();
    api.getLostFounds.mockResolvedValueOnce(ok({ lost_founds: [{ id: 1 }] }));
    await A.asyncSetLostFounds()(dispatch);
    expect(api.getLostFounds).toHaveBeenCalledWith({});
    expect(dispatch).toHaveBeenCalledWith(A.setLostFoundsActionCreator([{ id: 1 }]));
    expect(dispatch).toHaveBeenCalledWith(A.setIsLostFoundActionCreator(true));

    api.getLostFounds.mockResolvedValueOnce(ok({ lost_founds: [] }));
    await A.asyncSetLostFounds({ status: "lost" })(dispatch);
    expect(api.getLostFounds).toHaveBeenLastCalledWith({ status: "lost" });

    api.getLostFounds.mockResolvedValueOnce(fail("err list"));
    await A.asyncSetLostFounds()(dispatch);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err list");
  });

  it("asyncSetLostFound sukses dan gagal", async () => {
    const dispatch = vi.fn();
    api.getLostFoundById.mockResolvedValueOnce(ok({ lost_found: { id: 2 } }));
    expect(await A.asyncSetLostFound(2)(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(A.setLostFoundActionCreator({ id: 2 }));

    api.getLostFoundById.mockResolvedValueOnce(fail("err detail"));
    expect(await A.asyncSetLostFound(2)(dispatch)).toBe(false);
    expect(dispatch).toHaveBeenCalledWith(A.setLostFoundActionCreator(null));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err detail");
  });

  it("asyncSetLostFoundStats sukses dan dua jenis gagal", async () => {
    const dispatch = vi.fn();
    api.getLostFoundStatsDaily.mockResolvedValueOnce(ok({ d: 1 }));
    api.getLostFoundStatsMonthly.mockResolvedValueOnce(ok({ m: 1 }));
    await A.asyncSetLostFoundStats()(dispatch);
    expect(dispatch).toHaveBeenCalledWith(A.setLostFoundStatsActionCreator({ daily: { d: 1 }, monthly: { m: 1 } }));

    api.getLostFoundStatsDaily.mockResolvedValueOnce(fail("err harian"));
    api.getLostFoundStatsMonthly.mockResolvedValueOnce(ok({}));
    await A.asyncSetLostFoundStats()(dispatch);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err harian");

    api.getLostFoundStatsDaily.mockResolvedValueOnce(ok({}));
    api.getLostFoundStatsMonthly.mockResolvedValueOnce(fail("err bulanan"));
    await A.asyncSetLostFoundStats()(dispatch);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("err bulanan");
  });

  it.each([
    ["asyncAddLostFound", () => A.asyncAddLostFound({ title: "t", description: "d", status: "lost" }), "postLostFound", A.setIsLostFoundAddActionCreator, A.setIsLostFoundAddedActionCreator],
    ["asyncChangeLostFound", () => A.asyncChangeLostFound(1, { title: "t" }), "putLostFound", A.setIsLostFoundChangeActionCreator, A.setIsLostFoundChangedActionCreator],
    ["asyncChangeLostFoundCover", () => A.asyncChangeLostFoundCover(1, new File(["x"], "c.png")), "postLostFoundCover", A.setIsLostFoundChangeCoverActionCreator, A.setIsLostFoundChangedCoverActionCreator],
    ["asyncDeleteLostFound", () => A.asyncDeleteLostFound(1), "deleteLostFound", A.setIsLostFoundDeleteActionCreator, A.setIsLostFoundDeletedActionCreator],
  ])("%s sukses dan gagal", async (_name, make, apiFn, setProcess, setDone) => {
    const dispatch = vi.fn();
    api[apiFn].mockResolvedValueOnce(ok(undefined, "Sukses mutasi"));
    expect(await make()(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setProcess(true));
    expect(dispatch).toHaveBeenCalledWith(setDone(true));
    expect(dispatch).toHaveBeenLastCalledWith(setProcess(false));
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Sukses mutasi");

    api[apiFn].mockResolvedValueOnce(fail("Gagal mutasi"));
    expect(await make()(dispatch)).toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal mutasi");
    expect(dispatch).toHaveBeenLastCalledWith(setProcess(false));
  });
});
