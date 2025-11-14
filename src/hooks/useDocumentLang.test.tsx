import React, { act } from "react";
import { describe, expect, it } from "vitest";
import { createRoot } from "react-dom/client";
import { useDocumentLang } from "./useDocumentLang";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("useDocumentLang", () => {
  function TestHarness({ lang }: { lang?: string }) {
    useDocumentLang(lang);
    return null;
  }

  const renderHarness = (lang?: string) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<TestHarness lang={lang} />);
    });
    return { root, container };
  };

  it("applies the provided language to the document", () => {
    document.documentElement.setAttribute("lang", "");
    const { root, container } = renderHarness("en");

    expect(document.documentElement.lang).toBe("en");

    act(() => {
      root.render(<TestHarness lang="fr" />);
    });

    expect(document.documentElement.lang).toBe("fr");

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("falls back to fr when no language is provided", () => {
    document.documentElement.setAttribute("lang", "");
    const { root, container } = renderHarness(undefined);

    expect(document.documentElement.lang).toBe("fr");

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
