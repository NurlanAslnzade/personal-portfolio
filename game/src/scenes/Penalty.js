// Penalty mini-game: aim (left / centre / right), stop the power bar, shoot.
// The keeper guesses; a save means another go, and the third shot always goes in.
import { COLORS, VIEW_H } from "../config.js";
import { UI_TEXT } from "../content.js";
import { audio } from "../audio.js";
import { confetti } from "../particles.js";
import { watchResize } from "../view.js";
import { stadiumBackdrop } from "../stadium.js";

const DIRS = ["left", "center", "right"];
const POWER_PERIOD = 1300; // ms for a full 0 -> 1 -> 0 sweep

export class Penalty extends Phaser.Scene {
  constructor() { super("Penalty"); }

  create() {
    const { hud, stage } = this.game.services;
    this.reduced = this.game.services.reduced();
    this.attempt = 0;
    this.aimIndex = 1;
    this.state = "aim";

    // one backdrop image (never tiled/mirrored); everything below is placed from its goal
    this.backdrop = stadiumBackdrop(this);
    const g = this.goal = this.backdrop.goal;
    this.spot = this.backdrop.spot;
    this.targets = {
      left: { x: g.l + g.w * 0.17, y: g.bar + g.h * 0.42 },
      center: { x: g.cx, y: g.bar + g.h * 0.3 },
      right: { x: g.r - g.w * 0.17, y: g.bar + g.h * 0.42 },
    };

    this.keeperScale = (g.h * 0.78) / this.textures.get("keeper-stand").getSourceImage().height;
    this.keeper = this.add.image(g.cx, g.line + 4, "keeper-stand").setOrigin(0.5, 1).setScale(this.keeperScale).setDepth(2);
    this.ballShadow = this.add.image(this.spot.x, this.spot.y + 6, "px-dust").setTint(0x000000).setAlpha(0.4).setScale(0.9, 0.3).setDepth(3);
    // drawn above NURLAN (depth 5): otherwise left/centre shots fly behind his body
    this.ball = this.add.sprite(this.spot.x, this.spot.y, "ball-1").setDepth(6);
    this.ballSize(20);
    this.hero = this.add.sprite(0, 0, "hero", "idle").setOrigin(0.5, 1).setScale(0.5).setDepth(5);
    this.heroHome = { x: this.spot.x - 210, y: this.spot.y + 14 };
    this.hero.setPosition(this.heroHome.x, this.heroHome.y);

    this.rings = this.add.graphics().setDepth(7);
    this.conf = confetti(this, this.reduced).setDepth(20);

    this.baseZoom = 1;
    // vertical bounds only: the GOAL punch-in can never pan below the pitch or above the sky
    this.cameras.main.setBounds(-100000, 0, 200000, VIEW_H);
    this.frameCamera(watchResize(this, (vw) => this.frameCamera(vw)));
    this.cameras.main.fadeIn(this.reduced ? 150 : 500, 0, 0, 0);

    stage.dataset.mode = "penalty";
    hud.setHudVisible(false);
    hud.hideCard();
    hud.showPenalty({
      onAim: (d) => { if (this.state === "aim") { this.aimIndex = DIRS.indexOf(d); this.syncUi(); } },
      onShoot: () => this.advance(),
    });
    this.syncUi(UI_TEXT.penaltyAim);
    this.events.once("shutdown", () => hud.hidePenalty());
  }

  /** Called on create and on every canvas resize (viewW = view width in world units). */
  frameCamera(viewW) {
    const cam = this.cameras.main;
    this.baseZoom = cam.zoom;           // fitCamera has just set the "whole view" zoom
    this.backdrop.layout(viewW);
    if (this.celebrating) {
      // resized during the GOAL punch-in: keep the punch-in, re-centred on the goal
      cam.zoomEffect.reset();
      cam.panEffect.reset();
      if (!this.reduced) cam.setZoom(this.baseZoom * 1.18);
      cam.centerOn(this.goal.cx, this.celebrateY);
    } else {
      cam.centerOn(this.goal.cx, VIEW_H / 2);
    }
  }

  ballSize(units) { this.ball.setScale(units / 62); } // ball frames: 62 px ball on a 64 px canvas

  spinBall(rate) {
    if (rate > 0) {
      if (!this.ball.anims.isPlaying) this.ball.play("ball-spin");
      this.ball.anims.timeScale = rate;
    } else {
      this.ball.stop();
    }
  }

  syncUi(msg) {
    const { hud } = this.game.services;
    hud.setPenalty({
      msg,
      aim: DIRS[this.aimIndex],
      locked: this.state !== "aim",
      shootLabel: this.state === "power" ? "Kick!" : "Shoot",
      power: this.state === "aim" ? 0 : undefined,
    });
  }

  advance() {
    if (this.state === "aim") {
      this.state = "power";
      this.powerStart = this.time.now;
      audio.play("ui");
      this.syncUi(UI_TEXT.penaltyPower);
    } else if (this.state === "power") {
      this.shoot(this.power);
    }
  }

  update(time) {
    const { input, hud } = this.game.services;
    if (this.state === "aim") {
      if (input.take("left")) { this.aimIndex = Math.max(0, this.aimIndex - 1); this.syncUi(); }
      if (input.take("right")) { this.aimIndex = Math.min(2, this.aimIndex + 1); this.syncUi(); }
      if (input.take("jump") || input.take("interact")) this.advance();
    } else if (this.state === "power") {
      const t = ((time - this.powerStart) % POWER_PERIOD) / POWER_PERIOD;
      this.power = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
      hud.setPenalty({ power: this.power });
      if (input.take("jump") || input.take("interact")) this.advance();
    } else {
      input.take("jump"); input.take("interact"); input.take("left"); input.take("right");
    }
    this.drawRings(time);
  }

  drawRings(time) {
    const gfx = this.rings;
    gfx.clear();
    if (this.state !== "aim" && this.state !== "power") return;
    DIRS.forEach((d, i) => {
      const t = this.targets[d];
      const on = i === this.aimIndex;
      const pulse = on && !this.reduced ? 1 + Math.sin(time * 0.008) * 0.08 : 1;
      if (on) {
        gfx.fillStyle(COLORS.gold, 0.22);
        gfx.fillCircle(t.x, t.y, 20 * pulse);
      }
      gfx.lineStyle(on ? 3 : 2, on ? COLORS.gold : 0xffffff, on ? 1 : 0.45);
      gfx.strokeCircle(t.x, t.y, 20 * pulse);
    });
  }

  shoot(power) {
    this.state = "shot";
    this.attempt += 1;
    this.syncUi("");
    const aim = DIRS[this.aimIndex];

    // the keeper guesses at random; the third attempt always beats him
    let keeperDir;
    if (this.attempt >= 3) keeperDir = Phaser.Utils.Array.GetRandom(DIRS.filter((d) => d !== aim));
    else keeperDir = Phaser.Utils.Array.GetRandom(DIRS);
    const tooSoft = power < 0.15;
    const saved = this.attempt < 3 && (keeperDir === aim || tooSoft);

    // run-up
    this.hero.play("run");
    this.tweens.add({
      targets: this.hero, x: this.spot.x - 46, duration: 430, ease: "Sine.easeIn",
      onComplete: () => {
        this.hero.stop();
        this.hero.setFrame("kick");
        audio.play("kick");
        if (!this.reduced) this.cameras.main.shake(90, 0.002);
        this.flyBall(aim, power, saved, keeperDir, tooSoft);
        this.dive(tooSoft && saved ? aim : keeperDir);
      },
    });
  }

  flyBall(aim, power, saved, keeperDir, tooSoft) {
    const g = this.goal;
    const t = { ...this.targets[aim] };
    t.y = Phaser.Math.Clamp(t.y - (power - 0.5) * g.h * 0.45, g.bar + 14, g.line - 14);
    const from = { x: this.spot.x, y: this.spot.y };
    const dur = (tooSoft ? 900 : 620) - power * 200;
    const arc = 30 + power * 30;
    const p = { t: 0 };
    this.spinBall(0.8 + power); // harder shots spin faster
    this.tweens.add({
      targets: p, t: 1, duration: dur, ease: "Sine.easeOut",
      onUpdate: () => {
        const k = p.t;
        this.ball.setPosition(Phaser.Math.Linear(from.x, t.x, k), Phaser.Math.Linear(from.y, t.y, k) - Math.sin(Math.PI * k) * arc);
        this.ball.setRotation(k * 9);
        this.ballSize(Phaser.Math.Linear(20, 11, k));
        this.ballShadow.setPosition(this.ball.x, Phaser.Math.Linear(from.y + 6, g.line, k)).setScale(Phaser.Math.Linear(0.9, 0.5, k), 0.3 * Phaser.Math.Linear(1, 0.6, k));
      },
      onComplete: () => (saved ? this.onSaved(t, keeperDir, tooSoft) : this.onGoal(t)),
    });
  }

  dive(dir) {
    const g = this.goal;
    const k = this.keeper;
    if (dir === "center") {
      this.tweens.add({ targets: k, y: k.y - 18, duration: 220, yoyo: true, ease: "Sine.easeOut", delay: 80 });
      return;
    }
    const tex = dir === "left" ? "keeper-dive-left" : "keeper-dive-right";
    const target = this.targets[dir];
    this.time.delayedCall(70, () => {
      k.setTexture(tex).setOrigin(0.5, 0.5).setY(g.line - g.h * 0.3);
      this.tweens.add({
        targets: k, x: target.x + (dir === "left" ? 18 : -18), y: target.y + 6,
        duration: 360, ease: "Cubic.easeOut",
      });
    });
  }

  onSaved(t, keeperDir, tooSoft) {
    const { hud } = this.game.services;
    audio.play("save");
    const side = t.x < this.goal.cx ? -1 : 1;
    this.tweens.add({
      targets: this.ball, x: t.x + side * 90, y: this.goal.line + 50, rotation: this.ball.rotation - 6,
      duration: 520, ease: "Quad.easeIn",
      onComplete: () => this.spinBall(0),
    });
    this.spinBall(0.7); // parried: still turning, a little slower
    if (!this.reduced) this.cameras.main.shake(140, 0.003);
    hud.showBanner("Saved!", true);
    const msg = tooSoft ? UI_TEXT.soft : UI_TEXT.saved[Math.min(this.attempt - 1, 1)];
    this.time.delayedCall(1500, () => {
      hud.hideBanner();
      this.resetShot();
      this.syncUi(msg);
    });
  }

  resetShot() {
    const g = this.goal;
    this.tweens.killAll();
    this.keeper.setTexture("keeper-stand").setOrigin(0.5, 1).setPosition(g.cx, g.line + 4).setRotation(0);
    this.spinBall(0);
    this.ball.setTexture("ball-1").setPosition(this.spot.x, this.spot.y).setRotation(0);
    this.ballSize(20);
    this.ballShadow.setPosition(this.spot.x, this.spot.y + 6).setScale(0.9, 0.3);
    this.hero.setFrame("idle").setPosition(this.heroHome.x, this.heroHome.y);
    this.state = "aim";
  }

  onGoal(t) {
    const { hud } = this.game.services;
    const g = this.goal;
    const cam = this.cameras.main;
    this.state = "goal";
    this.celebrating = true;
    this.celebrateY = (g.bar + g.line) / 2 + 40;   // punch-in target (bounds keep it on the pitch)
    audio.play("goal");
    // ball hits the net, drops
    this.spinBall(0.5);
    this.tweens.add({
      targets: this.ball, y: g.line - 8, x: t.x + (t.x - g.cx) * 0.05, duration: 420, ease: "Bounce.easeOut",
      onComplete: () => this.spinBall(0),
    });
    this.ballShadow.setVisible(false);
    hud.showBanner("GOAL!");
    hud.setPenalty({ msg: "" });

    if (!this.reduced) {
      cam.zoomTo(this.baseZoom * 1.18, 380, "Cubic.easeOut");
      cam.pan(g.cx, this.celebrateY, 380, "Cubic.easeOut");
      cam.shake(200, 0.004);
    }
    // confetti from above the goal
    const view = cam.worldView;
    const bursts = this.reduced ? 6 : 26;
    this.time.addEvent({
      delay: 70, repeat: bursts - 1,
      callback: () => this.conf.explode(this.reduced ? 3 : 6, Phaser.Math.Between(view.x, view.right), view.y - 10),
    });
    // keeper ends up on his knees
    this.time.delayedCall(650, () => {
      this.tweens.killTweensOf(this.keeper);
      this.keeper.setTexture("keeper-kneel").setOrigin(0.5, 1).setPosition(this.keeper.x, g.line + 4).setAlpha(0);
      this.tweens.add({ targets: this.keeper, alpha: 1, duration: 220 });
    });
    // NURLAN celebrates
    this.hero.setFrame("jump");
    if (!this.reduced) this.tweens.add({ targets: this.hero, y: this.hero.y - 26, duration: 260, yoyo: true, repeat: 2, ease: "Sine.easeOut" });

    this.time.delayedCall(2900, () => {
      hud.hideBanner();
      cam.fadeOut(this.reduced ? 200 : 600, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => this.game.events.emit("penalty-done"));
    });
  }
}
