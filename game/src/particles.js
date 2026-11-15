// Procedural textures (drawn on canvases at boot) and the particle effects built from them.
import { COLORS } from "./config.js";

function canvasTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const tex = scene.textures.createCanvas(key, w, h);
  draw(tex.getContext(), w, h);
  tex.refresh();
  return tex;
}

export function makeTextures(scene) {
  canvasTexture(scene, "px-dust", 32, 32, (c) => {
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 32, 32);
  });
  canvasTexture(scene, "px-glow", 128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.35, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
  canvasTexture(scene, "px-spark", 16, 16, (c) => {
    c.fillStyle = "#fff";
    c.fillRect(7, 1, 2, 14);
    c.fillRect(1, 7, 14, 2);
    c.fillRect(6, 6, 4, 4);
  });
  canvasTexture(scene, "px-leaf", 12, 8, (c) => {
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(6, 4, 5.5, 3, 0.3, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(0,0,0,0.25)";
    c.fillRect(2, 4, 8, 1);
  });
  canvasTexture(scene, "px-confetti", 8, 4, (c) => { c.fillStyle = "#fff"; c.fillRect(0, 0, 8, 4); });

  // data glyphs for the lab: a square bit, "0" and "1" in a 3x5 pixel font (x2)
  const data = canvasTexture(scene, "px-data", 30, 10, (c) => {
    c.fillStyle = "#fff";
    c.fillRect(1, 2, 6, 6);
    const zero = ["111", "101", "101", "101", "111"];
    const one = ["010", "110", "010", "010", "111"];
    [[zero, 12], [one, 22]].forEach(([g, ox]) => g.forEach((row, y) => [...row].forEach((v, x) => {
      if (v === "1") c.fillRect(ox + x * 2, y * 2, 2, 2);
    })));
  });
  if (!data.has("sq")) {
    data.add("sq", 0, 0, 0, 10, 10);
    data.add("0", 0, 10, 0, 10, 10);
    data.add("1", 0, 20, 0, 10, 10);
  }

  // exit light column
  canvasTexture(scene, "px-beam", 64, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 256);
    c.globalCompositeOperation = "destination-in";
    const v = c.createLinearGradient(0, 0, 0, 256);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.6, "rgba(0,0,0,0.8)");
    v.addColorStop(1, "rgba(0,0,0,1)");
    c.fillStyle = v;
    c.fillRect(0, 0, 64, 256);
  });

  // World 4 ground: mown pitch stripes with a touchline (not in the supplied art)
  canvasTexture(scene, "pitch", 128, 60, (c) => {
    c.fillStyle = "#2f7a3a";
    c.fillRect(0, 0, 64, 60);
    c.fillStyle = "#286b33";
    c.fillRect(64, 0, 64, 60);
    c.fillStyle = "#e9efe6";
    c.fillRect(0, 6, 128, 4);
    c.fillStyle = "rgba(255,255,255,0.18)";
    c.fillRect(0, 0, 128, 3);
    const g = c.createLinearGradient(0, 10, 0, 60);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.35)");
    c.fillStyle = g;
    c.fillRect(0, 10, 128, 50);
  });
}

const rnd = (a, b) => a + Math.random() * (b - a);

/** Ambient particles that follow the camera view. Returns { update(cam), destroy() }. */
export function ambient(scene, kind, reduced) {
  const zone = new Phaser.Geom.Rectangle(0, 0, 10, 10);
  const slow = reduced ? 4 : 1;
  let cfg;
  let fit; // positions the zone relative to the camera's world view
  switch (kind) {
    case "leaves":
      cfg = {
        texture: "px-leaf",
        lifespan: 9000, frequency: 260 * slow, quantity: 1,
        speedY: { min: 35, max: 70 }, speedX: { min: -40, max: 5 },
        accelerationX: { min: -12, max: 12 },
        scale: { min: 0.9, max: 1.6 }, alpha: { start: 0.95, end: 0.6 },
        rotate: { onEmit: () => rnd(0, 360), onUpdate: (p, k, t, v) => v + 1.6 },
        tint: [0xd9822b, 0xc2541f, 0xe3b23c, 0xa8401c],
      };
      fit = (wv) => zone.setTo(wv.x - 40, -30, wv.width + 260, 10);
      break;
    case "motes":
      cfg = {
        texture: "px-dust",
        lifespan: 5200, frequency: 180 * slow,
        speedY: { min: -14, max: -4 }, speedX: { min: -8, max: 8 },
        scale: { min: 0.12, max: 0.28 },
        alpha: { values: [0, 0.75, 0], interpolation: "linear" },
        tint: [0xfff1c9, 0xffffff, 0xffe0a8], blendMode: "ADD",
      };
      fit = (wv) => zone.setTo(wv.x, 40, wv.width, 400);
      break;
    case "data":
      cfg = {
        texture: "px-data", frame: ["sq", "0", "1", "1", "0"],
        lifespan: 4200, frequency: 110 * slow,
        speedY: { min: -60, max: -22 }, speedX: { min: -4, max: 4 },
        scale: { min: 0.7, max: 1.4 },
        alpha: { values: [0, 0.8, 0], interpolation: "linear" },
        tint: [0x5ff6ff, 0x2fd6c8, 0x9be9ff], blendMode: "ADD",
      };
      fit = (wv) => zone.setTo(wv.x, 120, wv.width, 400);
      break;
    case "flashes":
      if (reduced) return { update() {}, destroy() {} };
      cfg = {
        texture: "px-glow",
        lifespan: 160, frequency: 140,
        scale: { min: 0.06, max: 0.16 }, alpha: { start: 0.9, end: 0 },
        tint: 0xffffff, blendMode: "ADD",
      };
      fit = (wv) => zone.setTo(wv.x, 120, wv.width, 170);
      break;
    default:
      return { update() {}, destroy() {} };
  }
  const { texture, ...rest } = cfg;
  const em = scene.add.particles(0, 0, texture, { ...rest, emitZone: { type: "random", source: zone } });
  return {
    emitter: em,
    update(cam) { fit(cam.worldView); },
    destroy() { em.destroy(); },
  };
}

export function dustBurst(scene, tint) {
  return scene.add.particles(0, 0, "px-dust", {
    emitting: false,
    lifespan: 480,
    speedX: { min: -90, max: 90 }, speedY: { min: -70, max: -10 },
    scale: { start: 0.35, end: 0.9 }, alpha: { start: 0.55, end: 0 },
    tint,
  });
}

/** Tiny puffs kicked up on each foot contact while running. */
export function stepDust(scene, tint) {
  return scene.add.particles(0, 0, "px-dust", {
    emitting: false,
    lifespan: 320,
    speedX: { min: -35, max: 35 }, speedY: { min: -32, max: -6 },
    scale: { start: 0.14, end: 0.38 }, alpha: { start: 0.42, end: 0 },
    tint,
  });
}

export function sparkBurst(scene) {
  return scene.add.particles(0, 0, "px-spark", {
    emitting: false,
    lifespan: 650,
    speed: { min: 80, max: 230 },
    scale: { start: 1, end: 0 },
    tint: [COLORS.gold, 0xffffff, 0xffe27a],
    blendMode: "ADD",
  });
}

export function confetti(scene, reduced) {
  return scene.add.particles(0, 0, "px-confetti", {
    emitting: false,
    lifespan: 4200,
    speedY: { min: 60, max: 220 }, speedX: { min: -90, max: 90 },
    gravityY: 140,
    scale: { min: 0.9, max: 1.6 },
    rotate: { onEmit: () => rnd(0, 360), onUpdate: (p, k, t, v) => v + 5 },
    tint: [COLORS.garnet, COLORS.blue, COLORS.gold, 0xffffff],
    quantity: reduced ? 1 : 4,
  });
}
