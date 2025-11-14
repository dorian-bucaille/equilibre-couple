import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "../test/renderHook";
import { useSharing } from "./useSharing";
import { DEFAULT_INPUTS } from "../lib/inputs";

describe("useSharing", () => {
  const t = (key: string) => {
    if (key === "actions.copyLinkSuccess") return "copied";
    if (key === "actions.copyLinkError") return "error";
    return key;
  };
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies the shareable URL and exposes a tooltip", async () => {
    const { result } = renderHook(() => useSharing(DEFAULT_INPUTS, t));

    await act(async () => {
      await result.current.copyLink();
    });

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("a1=2000"));
    expect(result.current.copyTooltip).toEqual({ message: "copied", tone: "success" });
    expect(result.current.ariaMessage).toBe("copied");

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.copyTooltip).toBeNull();
  });

  it("handles clipboard failures", async () => {
    writeTextMock.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useSharing(DEFAULT_INPUTS, t));

    await act(async () => {
      await result.current.copyLink();
    });

    expect(result.current.copyTooltip).toEqual({ message: "error", tone: "error" });
    expect(result.current.ariaMessage).toBe("error");
  });

  it("allows external aria messages", () => {
    const { result } = renderHook(() => useSharing(DEFAULT_INPUTS, t));

    act(() => {
      result.current.setAriaMessage("history loaded");
    });

    expect(result.current.ariaMessage).toBe("history loaded");
  });
});
