import React, { act } from "react";
import { createRoot } from "react-dom/client";

if (typeof globalThis !== "undefined") {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
}

export function renderHook<TValue>(callback: () => TValue) {
  const result: { current: TValue } = {
    current: undefined as TValue,
  };
  const container = document.createElement("div");
  const root = createRoot(container);

  function HookContainer() {
    result.current = callback();
    return null;
  }

  act(() => {
    root.render(<HookContainer />);
  });

  return {
    result,
    rerender() {
      act(() => {
        root.render(<HookContainer />);
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
    },
  };
}

export { act } from "react";
