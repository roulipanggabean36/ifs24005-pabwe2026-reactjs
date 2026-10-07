import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai nilai default string kosong", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });

  it("memperbarui nilai lewat handleChange dan setValue", () => {
    const { result } = renderHook(() => useInput("awal"));
    expect(result.current[0]).toBe("awal");

    act(() => result.current[1]({ target: { value: "baru" } }));
    expect(result.current[0]).toBe("baru");

    act(() => result.current[2]("manual"));
    expect(result.current[0]).toBe("manual");
  });
});
