// Victory backdrop: the floodlit pitch (one image, goal centred), dimmed, with drifting
// confetti behind the DOM panel.
import { VIEW_H } from "../config.js";
import { confetti } from "../particles.js";
import { watchResize } from "../view.js";
import { stadiumBackdrop } from "../stadium.js";

export class Victory extends Phaser.Scene {
  constructor() { super("Victory"); }

  create() {
    const reduced = this.game.services.reduced();
    const bd = stadiumBackdrop(this, { tint: 0x8a8f9c });
    const g = bd.goal;
    // keeper on his knees inside the goal, NURLAN celebrating in front of it
    this.add.image(g.cx + g.w * 0.3, g.line + 4, "keeper-kneel").setOrigin(0.5, 1).setScale(0.5).setTint(0xb0b4c0);
    this.add.sprite(g.cx - g.w * 0.3, bd.spot.y + 20, "hero", "jump").setOrigin(0.5, 1).setScale(0.5);

    const frame = (viewW) => {
      bd.layout(viewW);
      this.cameras.main.centerOn(g.cx, VIEW_H / 2);
    };
    frame(watchResize(this, frame));
    this.cameras.main.fadeIn(reduced ? 150 : 500, 0, 0, 0);

    if (!reduced) {
      const conf = confetti(this, false);
      this.time.addEvent({
        delay: 260, loop: true,
        callback: () => {
          const v = this.cameras.main.worldView;
          conf.explode(2, Phaser.Math.Between(v.x, v.right), v.y - 10);
        },
      });
    }
  }
}
