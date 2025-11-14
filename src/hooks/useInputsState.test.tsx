import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "../test/renderHook";
import { useInputsState } from "./useInputsState";
import { DEFAULT_INPUTS } from "../lib/inputs";
import { loadState, saveState } from "../lib/storage";

vi.mock("../lib/storage", () => ({
  loadState: vi.fn(),
  saveState: vi.fn(),
}));

const loadStateMock = loadState as unknown as ReturnType<typeof vi.fn>;
const saveStateMock = saveState as unknown as ReturnType<typeof vi.fn>;

describe("useInputsState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/");
    loadStateMock.mockReturnValue({ ...DEFAULT_INPUTS });
  });

  it("merges persisted state with query parameters", () => {
    window.history.replaceState({}, "", "/?a1=3200");

    const { result } = renderHook(() => useInputsState());

    expect(result.current.inputs.a1).toBe(3200);
    expect(loadState).toHaveBeenCalledWith(DEFAULT_INPUTS);
  });

  it("exposes dirty flag when inputs diverge", () => {
    const { result } = renderHook(() => useInputsState());

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.setInputs((prev) => ({ ...prev, partnerAName: "Alex" }));
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.loadInputs({ ...DEFAULT_INPUTS, partnerAName: "Alex" });
    });

    expect(result.current.isDirty).toBe(false);
  });

  it("resets inputs back to defaults", () => {
    const { result } = renderHook(() => useInputsState());

    act(() => {
      result.current.setInputs((prev) => ({ ...prev, a1: 9999 }));
    });

    act(() => {
      result.current.resetInputs();
    });

    expect(result.current.inputs).toEqual(DEFAULT_INPUTS);
  });

  it("persists inputs on change", () => {
    const { result } = renderHook(() => useInputsState());

    act(() => {
      result.current.setInputs((prev) => ({ ...prev, m: 2500 }));
    });

    expect(saveStateMock).toHaveBeenCalled();
  });
});
