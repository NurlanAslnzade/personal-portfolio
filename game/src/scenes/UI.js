// Game flow and pause: start screen, world -> world -> penalty -> victory, pause menu,
// tab-hidden pause, gamepad polling. Runs for the whole session alongside the play scenes.
import { TOTAL_ITEMS, WORLDS } from "../content.js";
import { save } from "../storage.js";
import { audio } from "../audio.js";

const PLAY_SCENES = ["World", "Penalty", "Victory"];

export class UI extends Phaser.Scene {
  constructor() { super("UI"); }

  create() {
    const { input, hud, stage } = this.game.services;
    this.mode = "menu";
    this.paused = false;
    audio.setEnabled(save.get().sound);

    input.on((action) => {
      if (action === "pause" && (this.mode === "world" || this.mode === "penalty")) this.togglePause();
    });
    hud.onPause(() => this.togglePause());
    this.onVisibility = () => {
      if (document.hidden && !this.paused && (this.mode === "world" || this.mode === "penalty")) this.openPause();
    };
    document.addEventListener("visibilitychange", this.onVisibility);

    this.game.events.on("world-exit", (n) => {
      if (n < WORLDS.length) {
        save.set({ world: n + 1, checkpoint: -1 });
        this.startWorld(n + 1, -1);
      } else this.startPenalty();
    });
    this.game.events.on("penalty-done", () => this.showVictory());

    this.showStart();
  }

  update() { this.game.services.input.update(); }

  setMode(mode) {
    this.mode = mode;
    this.game.services.stage.dataset.mode = mode;
  }

  stopPlay() {
    PLAY_SCENES.forEach((k) => {
      if (this.scene.isActive(k) || this.scene.isPaused(k)) this.scene.stop(k);
    });
  }

  showStart() {
    const { hud } = this.game.services;
    const st = save.get();
    this.setMode("menu");
    hud.setHudVisible(false);
    hud.showStart(
      { canContinue: save.hasProgress() && !st.done, world: st.world },
      {
        onContinue: () => this.begin(() => this.startWorld(st.world, st.checkpoint)),
        onNew: () => this.begin(() => { save.resetRun(); this.startWorld(1, -1); }),
      },
    );
  }

  begin(fn) {
    const { hud, stage } = this.game.services;
    hud.closeOverlay();
    stage.focus({ preventScroll: true });
    const r = stage.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      stage.scrollIntoView({ block: "center", behavior: this.game.services.reduced() ? "auto" : "smooth" });
    }
    fn();
  }

  startWorld(n, checkpoint) {
    const { input } = this.game.services;
    this.stopPlay();
    this.paused = false;
    input.clear();
    this.setMode("world");
    this.scene.launch("World", { world: n, checkpoint });
    this.scene.bringToTop();
  }

  startPenalty() {
    this.stopPlay();
    this.game.services.input.clear();
    this.setMode("penalty");
    this.scene.launch("Penalty");
    this.scene.bringToTop();
  }

  showVictory() {
    const { hud } = this.game.services;
    this.stopPlay();
    save.set({ done: true, world: 4, checkpoint: -1 });
    this.setMode("victory");
    this.scene.launch("Victory");
    hud.setHudVisible(false);
    hud.showVictory(
      { collected: save.get().collected.length, total: TOTAL_ITEMS },
      { onReplay: () => this.begin(() => { save.resetRun(); this.startWorld(1, -1); }) },
    );
  }

  get playKey() { return this.mode === "penalty" ? "Penalty" : "World"; }

  togglePause() {
    if (this.paused) this.resume();
    else this.openPause();
  }

  openPause() {
    if (this.paused || !this.scene.isActive(this.playKey)) return;
    const { hud } = this.game.services;
    this.paused = true;
    this.scene.pause(this.playKey);
    this.renderPause();
  }

  renderPause() {
    const { hud } = this.game.services;
    const st = save.get();
    hud.showPause(
      { world: this.mode === "penalty" ? 4 : st.world, maxWorld: st.maxWorld, sound: st.sound },
      {
        onResume: () => this.resume(),
        onRestart: () => this.begin(() => (this.mode === "penalty" ? this.startPenalty() : this.startWorld(save.get().world, -1))),
        onWorld: (n) => this.begin(() => this.startWorld(n, -1)),
        onSound: () => {
          save.set({ sound: !save.get().sound });
          audio.setEnabled(save.get().sound);
          audio.play("ui");
          this.renderPause();
        },
      },
    );
  }

  resume() {
    const { hud, input, stage } = this.game.services;
    if (!this.paused) return;
    this.paused = false;
    hud.closeOverlay();
    input.clear();
    stage.focus({ preventScroll: true });
    this.scene.resume(this.playKey);
    const world = this.scene.get("World");
    if (world && this.playKey === "World") world.nearSign = undefined; // re-show the sign prompt
  }
}
