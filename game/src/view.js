import { VIEW_H } from "./config.js";

/** Sizes the main camera so the view is always VIEW_H world units tall. Returns view width. */
export function fitCamera(scene) {
  const cam = scene.cameras.main;
  const { width, height } = scene.scale.gameSize;
  cam.setSize(width, height);
  cam.setZoom(height / VIEW_H);
  return width / cam.zoom;
}

/** Re-fits on every canvas resize for the lifetime of the scene. */
export function watchResize(scene, fn) {
  const handler = () => fn(fitCamera(scene));
  scene.scale.on("resize", handler);
  scene.events.once("shutdown", () => scene.scale.off("resize", handler));
  return fitCamera(scene);
}

/**
 * Phaser applies scrollFactor before zooming around the camera centre, which shifts
 * parallax layers by an amount that depends on canvas size. This offset cancels that,
 * so a layer's visible x is exactly worldView.x * factor.
 */
export function parallaxOffset(cam, factor) {
  return (cam.width / 2) * (1 - 1 / cam.zoom) * (1 - factor);
}
