import { useCallback, useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";
import type { Inputs } from "../lib/types";
import { inputsToShareableUrl } from "../lib/inputs";

type TooltipState = { message: string; tone: "success" | "error" } | null;

export function useSharing(inputs: Inputs, t: TFunction) {
  const [ariaMessage, setAriaMessage] = useState("");
  const [copyTooltip, setCopyTooltip] = useState<TooltipState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyLink = useCallback(async () => {
    const url = inputsToShareableUrl(inputs);
    try {
      await navigator.clipboard.writeText(url);
      const message = t("actions.copyLinkSuccess");
      setAriaMessage(message);
      setCopyTooltip({ message, tone: "success" });
    } catch {
      const message = t("actions.copyLinkError");
      setAriaMessage(message);
      setCopyTooltip({ message, tone: "error" });
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setCopyTooltip(null), 2400);
  }, [inputs, t]);

  return {
    ariaMessage,
    setAriaMessage,
    copyTooltip,
    copyLink,
  } as const;
}
