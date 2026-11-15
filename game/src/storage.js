// Progress in localStorage. Every access is guarded: private windows and blocked storage
// simply mean progress is not remembered.
import { SAVE_KEY } from "./config.js";

const DEFAULTS = { world: 1, checkpoint: -1, collected: [], maxWorld: 1, done: false, sound: false };

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return { ...DEFAULTS, collected: [] };
}

function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export const save = {
  get: () => state,
  hasProgress: () => state.world > 1 || state.checkpoint >= 0 || state.collected.length > 0,
  set(patch) {
    state = { ...state, ...patch };
    state.maxWorld = Math.max(state.maxWorld, state.world);
    persist();
  },
  collect(id) {
    if (!state.collected.includes(id)) {
      state.collected = [...state.collected, id];
      persist();
    }
  },
  resetRun() {
    // keeps the sound preference and which worlds are unlocked
    state = { ...DEFAULTS, collected: [], sound: state.sound, maxWorld: state.maxWorld, done: state.done };
    persist();
  },
};
