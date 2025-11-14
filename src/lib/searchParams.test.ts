import { describe, it, expect } from "vitest";
import { readNumericParam } from "./searchParams";

describe("readNumericParam", () => {
  it("returns fallback when param is missing", () => {
    const params = new URLSearchParams("");
    expect(readNumericParam(params, "a1", 123)).toBe(123);
  });

  it("ignores empty strings and whitespace", () => {
    const params = new URLSearchParams("a1=%20%20");
    expect(readNumericParam(params, "a1", 456)).toBe(456);
  });

  it("ignores invalid numbers", () => {
    const params = new URLSearchParams("a1=oops");
    expect(readNumericParam(params, "a1", 789)).toBe(789);
  });

  it("parses valid numeric values", () => {
    const params = new URLSearchParams("a1=321.5");
    expect(readNumericParam(params, "a1", 0)).toBeCloseTo(321.5);
  });
});
