import type { Inputs } from "./types";

const KEY_STATE = "eqc_state_v1";
const KEY_HISTORY = "eqc_history_v1";

export function saveState(state: Inputs) {
  localStorage.setItem(KEY_STATE, JSON.stringify(state));
}

export function loadState(defaults: Inputs): Inputs {
  const raw = localStorage.getItem(KEY_STATE);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export type HistoryItem = { id: string; dateISO: string; note: string; inputs: Inputs };
export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY_HISTORY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}
export function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(KEY_HISTORY, JSON.stringify(items));
}
