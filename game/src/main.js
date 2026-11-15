// Entry point: builds the services (input, HUD), the Phaser game, and keeps the canvas
// sized to its frame at the device pixel ratio (sharp on high-DPI screens).
import { ASPECT_MAX, ASPECT_MIN, MAX_DPR, PLAYER } from "./config.js";
import { Input } from "./input.js";
import { Hud } from "./hud.js";
import { Boot } from "./scenes/Boot.js";
import { Preload } from "./scenes/Preload.js";
import { World } from "./scenes/World.js";
import { Penalty } from "./scenes/Penalty.js";
import { Victory } from "./scenes/Victory.js";
import { UI } from "./scenes/UI.js";

const stage = document.getElementById("stage");
const wrap = document.getElementById("game-wrap");
const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const services = {
  input: new Input(stage, document.getElementById("touch")),
  hud: new Hud(document.getElementById("hud-root"), stage),
  stage,
  reduced: () => reducedQuery.matches,
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: wrap,
  backgroundColor: "#07090d",
  banner: false,
  scale: { mode: Phaser.Scale.NONE, width: 960, height: 540 },
  render: { antialias: true, pixelArt: false, roundPixels: false, powerPreference: "high-performance" },
  physics: { default: "arcade", arcade: { gravity: { x: 0, y: PLAYER.gravity }, debug: false } },
  // all input is handled by input.js (keyboard scoped to the stage element, DOM touch buttons)
  input: { keyboard: false, mouse: false, touch: false, gamepad: false },
  audio: { noAudio: true },
  scene: [Boot, Preload, World, Penalty, Victory, UI],
});
game.services = services;

function layout() {
  const r = wrap.getBoundingClientRect();
  if (!r.width || !r.height) return;
  let w = r.width;
  let h = r.height;
  // clamp the aspect ratio; extra space letterboxes (wrap centres the canvas)
  if (w / h > ASPECT_MAX) w = h * ASPECT_MAX;
  if (w / h < ASPECT_MIN) h = w / ASPECT_MIN;
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  const sm = game.scale;
  const style = game.canvas.style;
  style.width = `${w}px`;
  style.height = `${h}px`;
  if (sm.width === pw && sm.height === ph) return;
  sm.resize(pw, ph);
  // Scale.NONE keeps whatever CSS size it set first; the canvas shows at CSS size w x h
  style.width = `${w}px`;
  style.height = `${h}px`;
}

game.events.once("ready", () => {
  layout();
  new ResizeObserver(layout).observe(wrap);
  window.addEventListener("resize", layout); // DPR changes (zoom, moving between monitors)
});

// debugging / automated checks: only with ?debug in the URL
if (new URLSearchParams(location.search).has("debug")) window.__game = game;
