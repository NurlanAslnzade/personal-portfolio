// Loads the processed art (with a progress bar), prepares derived frames and animations.
import { RUN } from "../config.js";
const PROPS = [
  "platform-grass-long", "platform-grass-short", "platform-glass-long", "platform-glass-short",
  "platform-tech-long", "platform-tech-short", "icon-cap", "icon-diploma", "icon-medal", "icon-book",
  "icon-robot", "icon-chip", "icon-star", "flag", "sign",
];
const KEEPER = ["keeper-stand", "keeper-dive-left", "keeper-dive-right", "keeper-kneel"];
const LAYERS = ["w1-far", "w1-mid", "w2-far", "w2-mid", "w3-far", "w3-mid", "w4-far", "w4-mid", "penalty-scene"];

export class Preload extends Phaser.Scene {
  constructor() { super("Preload"); }

  preload() {
    const { hud } = this.game.services;
    this.load.on("progress", (p) => hud.setLoading(p));
    this.load.atlas("hero", "assets/character.webp", "assets/character.json");
    PROPS.forEach((k) => this.load.image(k, `assets/props/${k}.webp`));
    KEEPER.forEach((k) => this.load.image(k, `assets/keeper/${k}.webp`));
    LAYERS.forEach((k) => this.load.image(k, `assets/layers/${k}.webp`));
    // blurred side extensions for the penalty backdrop on wide screens (linear filtering)
    ["penalty-ext-l", "penalty-ext-r"].forEach((k) => this.load.image(k, `assets/layers/${k}.webp`));
    // ball rotation frames + corner flag from props-2 (its goal and grey keeper are not used)
    [1, 2, 3].forEach((i) => this.load.image(`ball-${i}`, `assets/fx/ball-${i}.webp`));
    this.load.image("corner-flag", "assets/props/corner-flag.webp");
  }

  create() {
    // Painted backgrounds are shown larger than their source: nearest-neighbour keeps the
    // pixel-art edges crisp. Sprites are shown smaller than their source: linear filtering.
    LAYERS.forEach((k) => this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST));

    // ground pieces: end caps + a repeatable middle cut from each long platform
    ["platform-grass-long", "platform-glass-long", "platform-tech-long"].forEach((k) => {
      const tex = this.textures.get(k);
      const { width: w, height: h } = tex.getSourceImage();
      const cap = Math.round(w * 0.2);
      tex.add("capL", 0, 0, 0, cap, h);
      tex.add("capR", 0, w - cap, 0, cap, h);
      tex.add("mid", 0, cap, 0, w - 2 * cap, h);
    });

    // used by the penalty run-up; World drives the same order by distance travelled
    this.anims.create({
      key: "run",
      frames: RUN.order.map((frame) => ({ key: "hero", frame })),
      frameRate: 17,   // 6 frames: two steps per ~0.35 s
      repeat: -1,
    });

    // the ball's three rotation frames; the penalty sets the speed while it flies
    this.anims.create({
      key: "ball-spin",
      frames: [1, 2, 3].map((i) => ({ key: `ball-${i}` })),
      frameRate: 18,
      repeat: -1,
    });

    this.scene.start("UI");
  }
}
