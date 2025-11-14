import { useCallback, useEffect, useMemo, useState } from "react";
import type { Inputs } from "../lib/types";
import { loadState, saveState } from "../lib/storage";
import {
  DEFAULT_INPUTS,
  areInputsEqual,
  parseInputsFromQuery,
} from "../lib/inputs";

const cloneDefaults = () => ({ ...DEFAULT_INPUTS });

export function useInputsState() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const stored = loadState(DEFAULT_INPUTS);
    return parseInputsFromQuery(window.location.href, stored);
  });

  const [lastLoadedInputs, setLastLoadedInputs] = useState(inputs);

  useEffect(() => {
    saveState(inputs);
  }, [inputs]);

  const isDirty = useMemo(
    () => !areInputsEqual(inputs, lastLoadedInputs),
    [inputs, lastLoadedInputs],
  );

  const resetInputs = useCallback(() => {
    const fresh = cloneDefaults();
    setInputs(fresh);
    setLastLoadedInputs(fresh);
  }, []);

  const loadInputs = useCallback((next: Inputs) => {
    const snapshot = { ...next };
    setInputs(snapshot);
    setLastLoadedInputs(snapshot);
  }, []);

  return {
    inputs,
    setInputs,
    isDirty,
    resetInputs,
    loadInputs,
  } as const;
}
