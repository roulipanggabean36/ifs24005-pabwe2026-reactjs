import { describe, it, expect, vi, afterEach } from "vitest";
import * as apiHelper from "../../../helpers/apiHelper";
import * as api from "./lostFoundApi";

describe("lostFoundApi", () => {
  afterEach(() => vi.restoreAllMocks());
  const mock = () => vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({});

  it("getLostFounds tanpa argumen", async () => {
    const spy = mock();
    await api.getLostFounds();
    expect(spy).toHaveBeenCalledWith("/lost-founds", {
      query: { status: undefined, is_completed: undefined, is_me: undefined },
    });
  });

  it("getLostFounds dengan filter", async () => {
    const spy = mock();
    await api.getLostFounds({ status: "lost", isCompleted: 0, isMe: 1 });
    expect(spy).toHaveBeenCalledWith("/lost-founds", {
      query: { status: "lost", is_completed: 0, is_me: 1 },
    });
  });

  it("getLostFoundById", async () => {
    const spy = mock();
    await api.getLostFoundById(7);
    expect(spy).toHaveBeenCalledWith("/lost-founds/7");
  });

  it("postLostFound", async () => {
    const spy = mock();
    await api.postLostFound({ title: "t", description: "d", status: "lost" });
    expect(spy).toHaveBeenCalledWith("/lost-founds", {
      method: "POST",
      body: { title: "t", description: "d", status: "lost" },
    });
  });

  it("putLostFound memetakan is_completed ke 1/0", async () => {
    const spy = mock();
    await api.putLostFound(3, { title: "t", description: "d", status: "found", isCompleted: true });
    expect(spy).toHaveBeenLastCalledWith("/lost-founds/3", {
      method: "PUT",
      body: { title: "t", description: "d", status: "found", is_completed: 1 },
    });
    await api.putLostFound(3, { title: "t", description: "d", status: "found", isCompleted: false });
    expect(spy.mock.lastCall[1].body.is_completed).toBe(0);
  });

  it("postLostFoundCover mengirim FormData", async () => {
    const spy = mock();
    const file = new File(["x"], "c.png");
    await api.postLostFoundCover(4, file);
    const [path, options] = spy.mock.calls[0];
    expect(path).toBe("/lost-founds/4/cover");
    expect(options.formData.get("cover")).toBe(file);
  });

  it("deleteLostFound", async () => {
    const spy = mock();
    await api.deleteLostFound(9);
    expect(spy).toHaveBeenCalledWith("/lost-founds/9", { method: "DELETE" });
  });

  it("statistik harian dan bulanan", async () => {
    const spy = mock();
    await api.getLostFoundStatsDaily();
    expect(spy).toHaveBeenLastCalledWith("/lost-founds/stats/daily");
    await api.getLostFoundStatsMonthly();
    expect(spy).toHaveBeenLastCalledWith("/lost-founds/stats/monthly");
  });
});
