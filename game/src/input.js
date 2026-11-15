// Unified input: keyboard (only while the stage has focus), on-screen touch buttons, gamepad.
// Scenes read `held(action)` for continuous input and `take(action, bufferMs)` for presses.

const KEYMAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  Space: "jump", KeyW: "jump", ArrowUp: "jump",
  KeyE: "interact", Enter: "interact", NumpadEnter: "interact",
  Escape: "pause", KeyP: "pause",
};
const INTERACTIVE = "button, a, input, select, textarea";
const ICONS = {
  left: '<svg viewBox="0 0 24 24"><path d="M15.5 4 7 12l8.5 8 1.5-1.5L10 12l7-6.5z"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M8.5 4 17 12l-8.5 8L7 18.5 14 12 7 5.5z"/></svg>',
  jump: '<svg viewBox="0 0 24 24"><path d="M12 4 4 13l1.5 1.5L11 8.6V20h2V8.6l5.5 5.9L20 13z"/></svg>',
};

export class Input {
  constructor(stage, touchRoot) {
    this.stage = stage;
    this.keys = new Set();
    this.touch = new Set();
    this.pad = new Set();
    this.pressAt = {};
    this.listeners = new Set();
    this.prevPadButtons = [];

    stage.addEventListener("keydown", (e) => this.onKey(e, true));
    stage.addEventListener("keyup", (e) => this.onKey(e, false));
    stage.addEventListener("focusout", (e) => {
      if (!stage.contains(e.relatedTarget)) this.keys.clear();
    });
    window.addEventListener("blur", () => { this.keys.clear(); this.touch.clear(); });
    // tapping/clicking the game gives it keyboard focus (without scrolling the page)
    stage.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(INTERACTIVE)) stage.focus({ preventScroll: true });
    });

    this.buildTouch(touchRoot);
  }

  onKey(e, down) {
    const action = KEYMAP[e.code];
    if (!action) return;
    const onControl = e.target !== this.stage && e.target.closest && e.target.closest(INTERACTIVE);
    // Space / Enter on a focused button or link belong to that control
    if (onControl && (action === "jump" || action === "interact")) return;
    // arrows still steer from HUD buttons, but belong to the menu inside overlays
    if (onControl && (action === "left" || action === "right") && e.target.closest(".overlay")) return;
    e.preventDefault();
    if (down) {
      if (!this.keys.has(e.code) && !e.repeat) this.press(action);
      this.keys.add(e.code);
    } else {
      this.keys.delete(e.code);
    }
  }

  press(action) {
    this.pressAt[action] = performance.now();
    this.listeners.forEach((fn) => fn(action));
  }

  /** Subscribe to presses (used for pause, which must work while scenes are paused). */
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  held(action) {
    for (const code of this.keys) if (KEYMAP[code] === action) return true;
    return this.touch.has(action) || this.pad.has(action);
  }

  /** True once if `action` was pressed within the last `bufferMs` (min one frame). */
  take(action, bufferMs = 0) {
    const t = this.pressAt[action];
    if (!t) return false;
    if (performance.now() - t > Math.max(bufferMs, 120)) return false;
    this.pressAt[action] = 0;
    return true;
  }

  peek(action, bufferMs) {
    const t = this.pressAt[action];
    return !!t && performance.now() - t <= bufferMs;
  }

  clear() {
    this.pressAt = {};
    this.touch.clear();
  }

  /** Poll the first connected gamepad (call once per frame). */
  update() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && [...pads].find((p) => p && p.connected);
    this.pad.clear();
    if (!gp) return;
    const b = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
    const ax = gp.axes[0] || 0;
    if (ax < -0.4 || b(14)) this.pad.add("left");
    if (ax > 0.4 || b(15)) this.pad.add("right");
    if (b(0) || b(12)) this.pad.add("jump");
    if (b(2) || b(1)) this.pad.add("interact");
    const map = { 0: "jump", 12: "jump", 2: "interact", 1: "interact", 9: "pause", 14: "left", 15: "right" };
    for (const [i, action] of Object.entries(map)) {
      const now = b(+i);
      if (now && !this.prevPadButtons[i]) this.press(action);
      this.prevPadButtons[i] = now;
    }
  }

  buildTouch(root) {
    root.innerHTML = `
      <div class="pad">
        <button type="button" class="tbtn" data-a="left" tabindex="-1" aria-label="Run left">${ICONS.left}</button>
        <button type="button" class="tbtn" data-a="right" tabindex="-1" aria-label="Run right">${ICONS.right}</button>
      </div>
      <div class="pad">
        <button type="button" class="tbtn act" data-a="interact" tabindex="-1" aria-label="Read" hidden>E</button>
        <button type="button" class="tbtn jump" data-a="jump" tabindex="-1" aria-label="Jump">${ICONS.jump}</button>
      </div>`;
    this.interactBtn = root.querySelector('[data-a="interact"]');
    root.querySelectorAll(".tbtn").forEach((btn) => {
      const a = btn.dataset.a;
      const down = (e) => {
        e.preventDefault();
        try { btn.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        if (!this.touch.has(a)) this.press(a);
        this.touch.add(a);
        btn.classList.add("is-down");
        if (navigator.vibrate && a === "jump") navigator.vibrate(8);
      };
      const up = () => { this.touch.delete(a); btn.classList.remove("is-down"); };
      btn.addEventListener("pointerdown", down);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
      btn.addEventListener("lostpointercapture", up);
      btn.addEventListener("contextmenu", (e) => e.preventDefault());
    });
    const enable = () => this.stage.classList.add("touch-on");
    if (window.matchMedia("(pointer: coarse)").matches) enable();
    window.addEventListener("touchstart", enable, { once: true, passive: true });
  }

  setInteractVisible(on) {
    if (this.interactBtn) this.interactBtn.hidden = !on;
  }
}
