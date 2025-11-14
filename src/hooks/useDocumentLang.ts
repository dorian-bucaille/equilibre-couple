import { useEffect } from "react";

const DEFAULT_LANG = "fr";

export function useDocumentLang(language?: string, fallback = DEFAULT_LANG) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const langToApply = language?.trim() || fallback;
    document.documentElement.setAttribute("lang", langToApply);
  }, [language, fallback]);
}
