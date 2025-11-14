import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Inputs } from "./types";
import { loadHistory, loadState, saveState } from "./storage";

const { mockCalculate, mockT } = vi.hoisted(() => ({
  mockCalculate: vi.fn(),
  mockT: vi.fn(),
}));

vi.mock("./calc", () => ({
  calculate: mockCalculate,
}));

vi.mock("./i18n", () => ({
  default: {
    t: mockT,
  },
}));

const baseInputs: Inputs = {
  partnerAName: "Alex",
  partnerBName: "Bailey",
  a1: 3000,
  a2: 200,
  b2: 180,
  trPct: 80,
  b: 3200,
  m: 900,
  advanced: false,
  E: 0,
  biasPts: 0,
  mode: "proportional",
};

const makeInputs = (overrides: Partial<Inputs> = {}): Inputs => ({
  ...baseInputs,
  ...overrides,
});

let storageBacking: Record<string, string> = {};

const getItemSpy = vi.fn((key: string) => storageBacking[key] ?? null);
const setItemSpy = vi.fn((key: string, value: string) => {
  storageBacking[key] = value;
});
const removeItemSpy = vi.fn((key: string) => {
  delete storageBacking[key];
});
const clearSpy = vi.fn(() => {
  storageBacking = {};
});
const keySpy = vi.fn((index: number) => Object.keys(storageBacking)[index] ?? null);

const mockLocalStorage = {
  getItem: getItemSpy,
  setItem: setItemSpy,
  removeItem: removeItemSpy,
  clear: clearSpy,
  key: keySpy,
  get length() {
    return Object.keys(storageBacking).length;
  },
} as Storage;

beforeEach(() => {
  storageBacking = {};
  getItemSpy.mockClear();
  setItemSpy.mockClear();
  removeItemSpy.mockClear();
  clearSpy.mockClear();
  keySpy.mockClear();
  vi.stubGlobal("localStorage", mockLocalStorage);

  mockCalculate.mockReset();
  mockCalculate.mockReturnValue({
    depositD: 100,
    depositM: 200,
    cashNeeded: 300,
    V: 400,
  });

  mockT.mockReset();
  mockT.mockImplementation((key: string, opts: { label?: string } = {}) => `${key}-${opts.label ?? ""}`);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("saveState/loadState", () => {
  it("persists state to localStorage and merges it back with defaults", () => {
    const state = makeInputs({ advanced: true, b: 9999 });

    saveState(state);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("eqc_state_v1", JSON.stringify(state));

    const defaults = makeInputs({ advanced: false, b: 1234 });
    const loaded = loadState(defaults);

    expect(loaded).toEqual({ ...defaults, ...state });
  });
});

describe("loadHistory", () => {
  const makeLegacyItem = (overrides: Record<string, unknown> = {}) => ({
    id: "item-1",
    dateISO: "2024-10-01",
    note: "note",
    inputs: makeInputs(),
    ...overrides,
  });

  it("returns the already upgraded history stored under the current key", () => {
    const upgradedItem = {
      ...makeLegacyItem(),
      result: {
        depositA: 10,
        depositB: 20,
        cashNeeded: 30,
        usedTR: 40,
        partnerAName: "Alex",
        partnerBName: "Bailey",
      },
    };
    storageBacking["eqc_history_v2"] = JSON.stringify([upgradedItem]);

    const history = loadHistory();

    expect(history).toEqual([upgradedItem]);
    expect(mockCalculate).not.toHaveBeenCalled();
  });

  it("upgrades items without result using their custom partner names", () => {
    const legacyItem = makeLegacyItem({
      inputs: makeInputs({ partnerAName: "  Alice  ", partnerBName: "Bob" }),
    });
    storageBacking["eqc_history_v2"] = JSON.stringify([legacyItem]);
    mockCalculate.mockReturnValueOnce({
      depositD: 111,
      depositM: 222,
      cashNeeded: 333,
      V: 444,
    });

    const history = loadHistory();

    expect(history).toHaveLength(1);
    expect(history[0].result).toEqual({
      depositA: 111,
      depositB: 222,
      cashNeeded: 333,
      usedTR: 444,
      partnerAName: "Alice",
      partnerBName: "Bob",
    });
    expect(mockT).not.toHaveBeenCalled();
  });

  it("migrates legacy history keys and fills missing partner names with placeholders", () => {
    const legacyItem = makeLegacyItem({
      inputs: makeInputs({ partnerAName: "   ", partnerBName: "" }),
    });
    storageBacking["eqc_history_v1"] = JSON.stringify([legacyItem]);
    mockCalculate.mockReturnValueOnce({
      depositD: 12,
      depositM: 34,
      cashNeeded: 56,
      V: 78,
    });

    const history = loadHistory();

    expect(history[0].result).toEqual({
      depositA: 12,
      depositB: 34,
      cashNeeded: 56,
      usedTR: 78,
      partnerAName: "parameters.partnerPlaceholder-A",
      partnerBName: "parameters.partnerPlaceholder-B",
    });
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("eqc_history_v1");
    expect(storageBacking["eqc_history_v2"]).toBeDefined();
  });
});
