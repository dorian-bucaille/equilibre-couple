import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";
import { ThemeToggle } from "./ThemeToggle";

type GlobalWithWindow = typeof globalThis & {
  window?: Window & typeof globalThis;
};

describe("ThemeToggle", () => {
  it("renders without crashing when window is undefined", () => {
    const globalRef = globalThis as GlobalWithWindow;
    const originalWindow = globalRef.window;

    globalRef.window = undefined as unknown as Window & typeof globalThis;
    try {
      expect(() =>
        renderToString(
          <I18nextProvider i18n={i18n}>
            <ThemeToggle />
          </I18nextProvider>,
        ),
      ).not.toThrow();
    } finally {
      if (originalWindow) {
        globalRef.window = originalWindow;
      } else {
        delete globalRef.window;
      }
    }
  });
});
