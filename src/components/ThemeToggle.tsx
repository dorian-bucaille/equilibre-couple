import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function detectPrefersDarkMode() {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof window.matchMedia !== "function") {
    return false;
  }

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function ThemeToggle() {
  const { t } = useTranslation();
  const [dark, setDark] = useState(detectPrefersDarkMode);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <button
      className="btn btn-ghost transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
      aria-label={t("accessibility.toggleDarkMode")}
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

