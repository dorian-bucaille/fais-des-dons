import type { Inputs } from "./types";

const KEY_STATE = "fdd_state_v1";

export function saveState(state: Inputs) {
  try {
    localStorage.setItem(KEY_STATE, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function loadState(defaults: Inputs): Inputs {
  try {
    const raw = localStorage.getItem(KEY_STATE);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

