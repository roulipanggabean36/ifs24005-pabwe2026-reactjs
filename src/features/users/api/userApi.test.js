import { describe, it, expect, vi, afterEach } from "vitest";
import * as apiHelper from "../../../helpers/apiHelper";
import {
  getProfile,
  getUserById,
  getUsers,
  postProfilePhoto,
  putProfile,
  putProfilePassword,
} from "./userApi";

describe("userApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getUsers", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({});
    await getUsers();
    expect(spy).toHaveBeenCalledWith("/users");
  });

  it("getUserById", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({});
    await getUserById(5);
    expect(spy).toHaveBeenCalledWith("/users/5");
  });

  it("getProfile", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({});
    await getProfile();
    expect(spy).toHaveBeenCalledWith("/users/me");
  });

  it("putProfile", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({});
    await putProfile({ name: "N", email: "e@x.y" });
    expect(spy).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "N", email: "e@x.y" },
    });
  });

  it("postProfilePhoto mengirim FormData berisi file", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({});
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await postProfilePhoto(file);
    const [path, options] = spy.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.formData.get("photo")).toBe(file);
  });

  it("putProfilePassword memetakan field ke snake_case", async () => {
    const spy = vi.spyOn(apiHelper, "apiFetch").mockResolvedValue({});
    await putProfilePassword({ password: "a", newPassword: "b", confirmPassword: "b" });
    expect(spy).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: { password: "a", new_password: "b", new_password_confirmation: "b" },
    });
  });
});
