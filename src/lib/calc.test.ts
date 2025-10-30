import { describe, it, expect } from "vitest";
import { calculate } from "./calc";
import type { Inputs } from "./types";

const base: Inputs = {
  a1: 2300,
  a2: 175,
  trPct: 100,
  b: 2000,
  m: 1500,
  advanced: false,
  E: 0,
  biasPts: 0,
};

describe("calculate", () => {
  it("simple case matches sum m", () => {
    const r = calculate(base);
    expect(r.depositD + r.depositM).toBeCloseTo(r.cashNeeded, 2);
    expect(r.cashNeeded).toBeCloseTo(1500, 2);
  });

  it("advanced: E > TR => cash includes E-V", () => {
    const inp: Inputs = { ...base, advanced: true, E: 600 };
    const r = calculate(inp);
    expect(r.cashNeeded).toBeCloseTo(1500 + (600 - 175), 2);
  });

  it("bias increases partner A's share", () => {
    const r0 = calculate(base);
    const r1 = calculate({ ...base, biasPts: 5 });
    expect(r1.depositD).toBeGreaterThanOrEqual(r0.depositD);
  });

  it("bounds negative deposit to zero", () => {
    const inp: Inputs = { ...base, m: 10, biasPts: 10 };
    const r = calculate(inp);
    expect(r.depositD).toBeGreaterThanOrEqual(0);
    expect(r.depositM).toBeCloseTo(r.cashNeeded, 2);
  });
});
