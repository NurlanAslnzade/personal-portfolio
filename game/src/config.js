// Tunables shared by every scene. World units: the view is always VIEW_H units tall;
// its width follows the canvas aspect ratio (clamped), so wide screens see further ahead.

export const VIEW_H = 540;
export const ASPECT_MIN = 4 / 3;
export const ASPECT_MAX = 2.4;
export const MAX_DPR = 2.5;

export const GROUND_Y = 460;      // top surface of the ground
export const FALL_LIMIT = 640;    // below this the player respawns at the last checkpoint

export const PLAYER = {
  scale: 0.42,          // character frames are exported at ~2.4x their on-screen size
  bodyW: 40,
  bodyH: 96,
  maxSpeed: 300,
  accelGround: 2600,
  accelAir: 1700,
  decelGround: 3000,
  gravity: 1900,
  jumpVelocity: 780,    // full hold: apex ~155 units
  // Variable height without an abrupt cut: once the jump button is up (and at least
  // jumpMinHoldMs has passed) gravity is raised while rising. A tap gives ~72% of a full jump.
  jumpMinHoldMs: 80,
  releaseGravityScale: 1.7,
  coyoteMs: 100,
  bufferMs: 100,
  maxFall: 1100,
};

// Run cycle from raw-assets/run-sheet.png: 6 frames, arms and legs alternating
// (1-3 one step, 4-6 the other). Per step: contact (foot strikes) -> down (weight on the
// leg, lowest) -> up (push-off, highest). Frame rate follows horizontal speed.
export const RUN = {
  order: ["run-1", "run-2", "run-3", "run-4", "run-5", "run-6"],
  contact: { "run-1": true, "run-4": true },   // foot strike: dust puff
  down: { "run-2": true, "run-5": true },      // lowest point: small squash
  // vertical offset per frame as a fraction of `bob` (0 = lowest, 1 = highest)
  bobProfile: { "run-1": 0.3, "run-2": 0, "run-3": 1, "run-4": 0.3, "run-5": 0, "run-6": 1 },
  unitsPerFrame: 17,    // one 6-frame cycle (two steps) per ~102 units -> ~17.6 fps at full speed
  minFps: 5,
  maxFps: 20,
  bob: 3,               // units; the drawn crouch on frames 2/5 adds to this
  sway: 0.7,            // units of forward/back surge per stride
  lean: 0.07,           // radians at full speed
};

export const PARALLAX = { far: 0.2, mid: 0.5 };

export const CAMERA = { lerp: 0.12, lookAhead: 90, lookLerp: 0.04 };

// Platform art: display scale and how far below the sprite top the walkable surface is.
export const PLATFORM_ART = {
  grass: { long: "platform-grass-long", short: "platform-grass-short", inset: 12, fill: 0x2d241e, scale: 0.8 },
  glass: { long: "platform-glass-long", short: "platform-glass-short", inset: 5, fill: 0x2a313d, scale: 0.8 },
  tech: { long: "platform-tech-long", short: "platform-tech-short", inset: 4, fill: 0x0c1a21, scale: 0.8 },
  pitch: { long: "pitch", short: "pitch", inset: 0, fill: 0x14301c, scale: 1 },
};

export const SAVE_KEY = "nurlan-resume-game-v2";

// The game lives in game/ and is embedded in resume-game.html. CV links target the top
// window so they replace the whole resume page (CV view), not just the iframe.
export const LINKS = {
  cv: "../resume-game.html",
  cvTarget: "_top",
};

export const COLORS = { garnet: 0xa50044, blue: 0x1d4fa3, gold: 0xedbb00, white: 0xffffff };
