// The floodlit penalty backdrop: ONE image, never tiled or mirrored, with the goal centred.
// If the view is wider than the image, blurred/darkened edge extensions (made by
// tools/process.py from the image's own outer pixels) fill the sides.
// Every gameplay position (goal, penalty spot) is derived from the goal's pixel coordinates
// in the source image, so it stays correct at any canvas size.
import { VIEW_H } from "./config.js";

const SRC = { w: 1024, h: 572 };
// measured on assets/layers/penalty-scene.webp (source pixels)
const PX = { postL: 306, postR: 717, bar: 246, line: 408, spotX: 512, spotY: 468 };

export function stadiumBackdrop(scene, { tint = null, depth = -10 } = {}) {
  const s = VIEW_H / SRC.h;          // fit height: the goal line and penalty spot stay in view
  const width = SRC.w * s;
  const x0 = -width / 2;             // image centred on world x = 0
  const main = scene.add.image(0, 0, "penalty-scene").setOrigin(0.5, 0).setScale(s).setDepth(depth);
  // extensions tuck 1 unit under the image so no hairline seam shows
  const extL = scene.add.image(x0 + 1, 0, "penalty-ext-l").setOrigin(1, 0).setDepth(depth - 1);
  const extR = scene.add.image(-x0 - 1, 0, "penalty-ext-r").setOrigin(0, 0).setDepth(depth - 1);
  if (tint != null) [main, extL, extR].forEach((im) => im.setTint(tint));

  const gx = (px) => x0 + px * s;
  const gy = (py) => py * s;
  const goal = { l: gx(PX.postL), r: gx(PX.postR), bar: gy(PX.bar), line: gy(PX.line) };
  goal.w = goal.r - goal.l;
  goal.h = goal.line - goal.bar;
  goal.cx = (goal.l + goal.r) / 2;
  const spot = { x: gx(PX.spotX), y: gy(PX.spotY) };

  /** Size the side extensions for a view `viewW` world units wide (centred on the goal). */
  function layout(viewW) {
    const viewL = goal.cx - viewW / 2;
    const viewR = goal.cx + viewW / 2;
    const needL = Math.max(0, x0 - viewL) + 24;      // + margin so zoom/shake never shows an edge
    const needR = Math.max(0, viewR + x0) + 24;      // image right edge is at -x0
    extL.setDisplaySize(needL, VIEW_H).setVisible(viewL < x0 + 1);
    extR.setDisplaySize(needR, VIEW_H).setVisible(viewR > -x0 - 1);
  }

  return { goal, spot, layout, scale: s, width, images: [main, extL, extR] };
}
