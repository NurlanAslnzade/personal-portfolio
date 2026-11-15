import { makeTextures } from "../particles.js";

// Generates procedural textures, shows the loading panel, hands over to Preload.
export class Boot extends Phaser.Scene {
  constructor() { super("Boot"); }

  create() {
    makeTextures(this);
    this.game.services.hud.showLoading();
    this.scene.start("Preload");
  }
}
