// One side-scrolling world: parallax layers, ground and platforms, NURLAN, resume items,
// signs, checkpoint flags and the exit. Started with { world, checkpoint }.
import { CAMERA, FALL_LIMIT, GROUND_Y, PARALLAX, PLATFORM_ART, PLAYER, RUN, VIEW_H, COLORS } from "../config.js";
import { ITEMS, SIGNS, TOTAL_ITEMS, WORLDS } from "../content.js";
import { save } from "../storage.js";
import { audio } from "../audio.js";
import { ambient, dustBurst, sparkBurst, stepDust } from "../particles.js";
import { parallaxOffset, watchResize } from "../view.js";

const WORLD_LOOK = {
  1: { bg: 0xe9c79a, dust: 0xc9b08a, beam: 0xffc76b },
  2: { bg: 0xd9c3a0, dust: 0xc7c2b8, beam: 0xffe3a3 },
  3: { bg: 0x10262d, dust: 0x6fd6d6, beam: 0x5ff6ff },
  4: { bg: 0x0d1a24, dust: 0xa8c9a0, beam: 0xedbb00 },
};

const approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));

export class World extends Phaser.Scene {
  constructor() { super("World"); }

  init(data) {
    this.W = WORLDS[(data.world || 1) - 1];
    this.cpIndex = data.checkpoint ?? -1;
  }

  create() {
    const { hud } = this.game.services;
    const W = this.W;
    this.look = WORLD_LOOK[W.n];
    this.reduced = this.game.services.reduced();
    this.exiting = false;
    this.respawning = false;
    this.lookX = 0;
    this.solids = [];
    this.surfaces = []; // [x0, x1, y] for the drop shadow

    const cam = this.cameras.main;
    cam.setBackgroundColor(this.look.bg);
    cam.setBounds(0, 0, W.width, VIEW_H);
    this.physics.world.setBounds(0, -600, W.width, 2400);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.layers = [];
    this.buildLayer(`w${W.n}-far`, PARALLAX.far, -100, false);
    this.buildLayer(`w${W.n}-mid`, PARALLAX.mid, -90, true);
    this.viewW = watchResize(this, (vw) => { this.viewW = vw; this.placeLayers(); });
    this.placeLayers();

    W.ground.forEach(([x0, x1]) => this.buildGround(x0, x1));
    W.platforms.forEach(([x, y, size]) => this.buildPlatform(x, y, size));
    this.buildExit();
    this.buildDecor();
    this.buildSigns();
    this.buildCheckpoints();
    this.buildItems();
    this.buildPlayer();

    this.dust = dustBurst(this, this.look.dust).setDepth(11);
    this.steps = stepDust(this, this.look.dust).setDepth(9);
    this.sparks = sparkBurst(this).setDepth(12);
    this.amb = ambient(this, W.ambient, this.reduced);
    if (this.amb.emitter) this.amb.emitter.setDepth(W.ambient === "leaves" ? 20 : -80);

    cam.startFollow(this.hero, false, CAMERA.lerp, 1);
    cam.fadeIn(this.reduced ? 150 : 450, 0, 0, 0);

    save.set({ world: W.n, checkpoint: this.cpIndex });
    hud.setWorld(W.n, W.name);
    hud.setCount(save.get().collected.length, TOTAL_ITEMS, false);
    hud.setHudVisible(true);
    hud.setPrompt(null);
    hud.hideBanner();
    if (this.cpIndex < 0) hud.showTitle(W.n, W.name);

    this.events.once("shutdown", () => {
      hud.setPrompt(null);
      this.game.services.input.setInteractVisible(false);
    });
  }

  // ------------------------------------------------------------ building
  buildLayer(key, factor, depth, bottomAnchored) {
    const src = this.textures.get(key).getSourceImage();
    const scale = bottomAnchored ? (VIEW_H * 0.9) / src.height : VIEW_H / src.height;
    const tw = src.width * scale;
    const span = this.W.width * factor + VIEW_H * 2.4 + tw;
    const n = Math.ceil(span / tw) + 1;
    const imgs = [];
    for (let i = 0; i < n; i++) {
      const img = this.add.image(0, bottomAnchored ? VIEW_H : 0, key)
        .setOrigin(0, bottomAnchored ? 1 : 0).setScale(scale)
        .setScrollFactor(factor, 1).setDepth(depth)
        .setFlipX(i % 2 === 1); // mirrored tiling: every other copy flipped, so seams match
      imgs.push(img);
    }
    this.layers.push({ imgs, factor, tw });
  }

  placeLayers() {
    const cam = this.cameras.main;
    this.layers.forEach(({ imgs, factor, tw }) => {
      const off = parallaxOffset(cam, factor);
      // copies overlap by half a unit so no hairline seam shows between them
      imgs.forEach((img, i) => img.setX(off - 1 + i * (tw - 0.5)));
    });
  }

  addSolid(x, y, w, h, oneWay) {
    const z = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(z, true);
    if (oneWay) {
      z.body.checkCollision.down = false;
      z.body.checkCollision.left = false;
      z.body.checkCollision.right = false;
    }
    this.solids.push(z);
    this.surfaces.push([x, x + w, y]);
  }

  buildGround(x0, x1) {
    const art = PLATFORM_ART[this.W.art];
    const w = x1 - x0;
    if (this.W.art === "pitch") {
      this.add.tileSprite(x0, GROUND_Y, w, 60, "pitch").setOrigin(0, 0).setDepth(0);
      this.add.rectangle(x0, GROUND_Y + 58, w, 200, art.fill).setOrigin(0, 0).setDepth(0);
    } else {
      const tex = this.textures.get(art.long);
      const s = art.scale;
      const fh = tex.get("mid").height * s;
      const capW = tex.get("capL").width * s;
      const top = GROUND_Y - art.inset;
      // cliff fill under the slab
      this.add.rectangle(x0 + 8, top + fh * 0.6, w - 16, 260, art.fill).setOrigin(0, 0).setDepth(-1);
      this.add.rectangle(x0 + 8, top + fh * 0.6 + 50, w - 16, 220, 0x000000, 0.25).setOrigin(0, 0).setDepth(-1);
      this.add.tileSprite(x0 + capW, top, w - 2 * capW, fh, art.long, "mid")
        .setOrigin(0, 0).setTileScale(s, s).setDepth(0);
      this.add.image(x0, top, art.long, "capL").setOrigin(0, 0).setScale(s).setDepth(0);
      this.add.image(x1, top, art.long, "capR").setOrigin(1, 0).setScale(s).setDepth(0);
    }
    this.addSolid(x0, GROUND_Y, w, 600, false);
  }

  buildPlatform(x, y, size) {
    const art = PLATFORM_ART[this.W.art];
    // "__BASE" = the whole image. Without it Phaser would use the first added frame (the
    // ground's left cap) for long platforms, drawing and colliding only 1/5 of them.
    const img = this.add.image(x, y - art.inset, art[size], "__BASE").setOrigin(0.5, 0).setScale(art.scale).setDepth(1);
    const w = img.displayWidth - 18;
    this.addSolid(x - w / 2, y, w, 18, true);
  }

  buildExit() {
    const x = this.W.exit;
    this.beam = this.add.image(x, GROUND_Y + 4, "px-beam").setOrigin(0.5, 1).setScale(1.7, 1.9)
      .setTint(this.look.beam).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.6).setDepth(2);
    this.tweens.add({ targets: this.beam, alpha: 0.3, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    if (this.W.n === 4) {
      // penalty box line on the pitch
      this.add.rectangle(x - 70, GROUND_Y + 7, 6, 52, 0xe9efe6).setOrigin(0.5, 0).setDepth(1);
    }
  }

  /** Static scenery (World 4: corner flags planted on the touchline). */
  buildDecor() {
    (this.W.decor || []).forEach(([key, x]) => {
      this.add.image(x, GROUND_Y + 9, key).setOrigin(0.5, 1).setScale(0.68).setDepth(2);
    });
  }

  buildSigns() {
    this.signs = this.W.signs.map(([id, x]) => {
      const img = this.add.image(x, GROUND_Y + 2, "sign").setOrigin(0.5, 1).setScale(0.55).setDepth(3);
      return { id, x, img };
    });
  }

  buildCheckpoints() {
    this.flags = this.W.checkpoints.map((x, i) => {
      const img = this.add.image(x, GROUND_Y + 2, "flag").setOrigin(0.15, 1).setScale(0.55).setDepth(3);
      const active = i <= this.cpIndex;
      if (!active) img.setTint(0x777777).setAlpha(0.85);
      return { x, i, img, active };
    });
  }

  buildItems() {
    const have = new Set(save.get().collected);
    this.items = this.W.items.map(([id, x, y]) => {
      const content = ITEMS[id];
      const got = have.has(id);
      const glow = this.add.image(x, y, "px-glow").setScale(0.75).setTint(COLORS.gold)
        .setBlendMode(Phaser.BlendModes.ADD).setAlpha(got ? 0 : 0.55).setDepth(5);
      const icon = this.add.image(x, y, content.icon).setScale(0.62).setDepth(6).setAlpha(got ? 0.28 : 1);
      if (!this.reduced) {
        this.tweens.add({ targets: [icon, glow], y: y - 7, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: (x % 500) });
        if (!got) this.tweens.add({ targets: glow, scale: 0.9, alpha: 0.35, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      return { id, x, y, icon, glow, got };
    });
  }

  buildPlayer() {
    const startX = this.cpIndex >= 0 ? this.W.checkpoints[this.cpIndex] + 30 : 120;
    this.spawnX = startX;
    const zone = this.add.zone(startX, GROUND_Y - PLAYER.bodyH / 2 - 1, PLAYER.bodyW, PLAYER.bodyH);
    this.physics.add.existing(zone);
    this.body = zone.body;
    this.body.setMaxVelocity(PLAYER.maxSpeed * 2, PLAYER.maxFall);
    this.body.setCollideWorldBounds(true);
    this.physics.add.collider(zone, this.solids);
    this.player = zone;

    this.shadow = this.add.image(startX, GROUND_Y, "px-dust").setTint(0x000000).setAlpha(0.35)
      .setScale(2.2, 0.45).setDepth(8);
    this.hero = this.add.sprite(startX, GROUND_Y, "hero", "idle").setOrigin(0.5, 1).setScale(PLAYER.scale).setDepth(10);
    this.sq = { x: 1, y: 1 };       // squash & stretch multipliers (tweened)
    this.facing = 1;
    this.lastGround = 0;
    this.jumping = false;     // rising from a jump whose button may still be held
    this.jumpReleased = false;
    this.jumpAt = 0;
    this.airVy = 0;
    this.wasGround = true;
    this.runPhase = 0;        // position in the run cycle, in frames
    this.runIndex = -1;
    this.landUntil = 0;       // landing squash owns the scale until then
    this.prevVx = 0;
    this.accelLean = 0;
  }

  // ------------------------------------------------------------ frame
  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const { input, hud } = this.game.services;
    const b = this.body;
    if (this.exiting) { this.syncVisual(time); return; }

    const ground = b.blocked.down || b.touching.down;
    const dir = (input.held("right") ? 1 : 0) - (input.held("left") ? 1 : 0);
    if (this.respawning) { b.setVelocityX(0); }
    else {
      const target = dir * PLAYER.maxSpeed;
      const accel = ground ? (dir ? PLAYER.accelGround : PLAYER.decelGround) : PLAYER.accelAir;
      b.setVelocityX(approach(b.velocity.x, target, accel * dt));
    }
    if (dir) this.facing = dir;

    if (ground) this.lastGround = time;
    if (!ground) this.airVy = b.velocity.y;

    // jump with coyote time and input buffering
    if (!this.respawning && time - this.lastGround <= PLAYER.coyoteMs && input.peek("jump", PLAYER.bufferMs)) {
      input.take("jump", PLAYER.bufferMs);
      b.setVelocityY(-PLAYER.jumpVelocity);
      this.lastGround = -1e9;
      this.jumping = true;
      this.jumpReleased = false;
      this.jumpAt = time;
      b.setGravityY(0);
      this.squash(0.86, 1.14, 160);
      audio.play("jump");
    }
    // variable height: after the button is up (and a minimum hold, so every tap is the same
    // height) gravity rises while still going up. No velocity cut, so the arc stays smooth.
    if (this.jumping && !this.jumpReleased && !input.held("jump") && time - this.jumpAt >= PLAYER.jumpMinHoldMs) {
      this.jumpReleased = true;
      b.setGravityY(PLAYER.gravity * (PLAYER.releaseGravityScale - 1));
    }
    if (this.jumping && (b.velocity.y >= 0 || ground) && time - this.jumpAt > 20) {
      this.jumping = false;
      b.setGravityY(0);
    }

    // landing
    if (ground && !this.wasGround) {
      if (this.airVy > 260) {
        const k = Math.min(1, this.airVy / 900);
        this.squash(1 + 0.2 * k, 1 - 0.2 * k, 180);
        this.landUntil = time + 200;
        this.dust.explode(this.reduced ? 3 : Math.round(6 + 8 * k), b.center.x, b.bottom);
        audio.play("land");
      }
    }
    this.wasGround = ground;

    // animation: the run cycle advances with distance travelled, so the frame rate follows
    // horizontal speed (slow while starting/stopping, ~11.5 fps at full speed)
    const speed = Math.abs(b.velocity.x);
    if (ground && speed > 25) {
      const fps = Phaser.Math.Clamp(speed / RUN.unitsPerFrame, RUN.minFps, RUN.maxFps);
      this.runPhase += fps * dt;
      const idx = Math.floor(this.runPhase) % RUN.order.length;
      if (idx !== this.runIndex) {
        this.runIndex = idx;
        const frame = RUN.order[idx];
        this.hero.setFrame(frame);
        if (RUN.contact[frame]) this.footContact(speed);
        if (RUN.down[frame]) this.footDown(time, speed);
      }
    } else {
      this.runPhase = 0;      // the next run starts on a contact frame
      this.runIndex = -1;
      this.hero.setFrame(ground ? "idle" : b.velocity.y < -60 ? "jump" : "fall");
    }
    // lean into acceleration a little (smoothed), on top of the speed lean
    const acc = (b.velocity.x - this.prevVx) / Math.max(dt, 1e-3);
    this.prevVx = b.velocity.x;
    this.accelLean += (Phaser.Math.Clamp(acc / 2600, -1, 1) * 0.035 - this.accelLean) * 0.15;

    this.syncVisual(time, ground);

    // camera look-ahead in the facing direction
    this.lookX += (this.facing * CAMERA.lookAhead - this.lookX) * CAMERA.lookLerp;
    this.cameras.main.setFollowOffset(-this.lookX, 0);

    this.amb.update(this.cameras.main);
    this.checkItems();
    this.checkSigns(input, hud);
    this.checkCheckpoints();

    if (!this.respawning && b.top > FALL_LIMIT) this.respawn();
    if (b.center.x >= this.W.exit) this.complete();
  }

  /** A foot strikes the ground (frames 1 and 4): small dust puff (not with reduced motion). */
  footContact(speed) {
    if (this.reduced) return;
    const k = Math.min(1, speed / PLAYER.maxSpeed);
    if (k > 0.35) this.steps.explode(k > 0.8 ? 3 : 2, this.body.center.x + this.facing * 12, this.body.bottom);
  }

  /** Weight comes down on the leg (frames 2 and 5): tiny squash (not with reduced motion). */
  footDown(time, speed) {
    if (this.reduced || time <= this.landUntil) return;
    const k = Math.min(1, speed / PLAYER.maxSpeed);
    this.squash(1 + 0.04 * k, 1 - 0.04 * k, 100);
  }

  syncVisual(time, ground = true) {
    const b = this.body;
    const speed = Math.abs(b.velocity.x);
    const running = ground && speed > 25;
    const k = Math.min(1, speed / PLAYER.maxSpeed);
    let bob = 0;
    let sway = 0;
    if (running && !this.reduced) {
      // height follows the frame being shown: lowest on the down frames (2, 5), highest on
      // the up frames (3, 6), eased between frames so the body never snaps
      const n = RUN.order.length;
      const i = Math.floor(this.runPhase) % n;
      const frac = this.runPhase - Math.floor(this.runPhase);
      const cur = RUN.bobProfile[RUN.order[i]];
      const next = RUN.bobProfile[RUN.order[(i + 1) % n]];
      const level = cur + (next - cur) * (0.5 - 0.5 * Math.cos(Math.PI * frac));
      bob = -RUN.bob * Math.max(0.35, k) * level;
      sway = RUN.sway * this.facing * Math.sin((2 * Math.PI * this.runPhase) / n);   // once per stride
    }
    const breathe = !running && ground ? 1 + Math.sin(time * 0.003) * 0.012 : 1;
    const lean = running
      ? (b.velocity.x / PLAYER.maxSpeed) * RUN.lean + this.accelLean
      : ground ? this.accelLean : (b.velocity.x / PLAYER.maxSpeed) * 0.05;
    // snap to device pixels so the bob/sway never blurs the sprite
    const z = this.cameras.main.zoom || 1;
    const snap = (v) => Math.round(v * z) / z;
    this.hero.setPosition(snap(b.center.x + sway), snap(b.bottom + 1.3 + bob));
    this.hero.setRotation(lean);
    this.hero.setFlipX(this.facing < 0);
    this.hero.setScale(PLAYER.scale * this.sq.x, PLAYER.scale * this.sq.y * breathe);

    // drop shadow on the surface below
    const s = this.surfaceBelow(b.center.x, b.bottom - 2);
    if (s == null) this.shadow.setVisible(false);
    else {
      const h = Math.max(0, s - b.bottom);
      const k = Math.max(0.25, 1 - h / 260);
      this.shadow.setVisible(true).setPosition(b.center.x, s + 1).setScale(2.2 * k, 0.45 * k).setAlpha(0.35 * k);
    }
  }

  surfaceBelow(x, y) {
    let best = null;
    for (const [x0, x1, top] of this.surfaces) {
      if (x >= x0 && x <= x1 && top >= y && (best == null || top < best)) best = top;
    }
    return best;
  }

  squash(x, y, ms) {
    if (this.reduced) return;
    this.tweens.killTweensOf(this.sq);
    this.sq.x = x;
    this.sq.y = y;
    this.tweens.add({ targets: this.sq, x: 1, y: 1, duration: ms, ease: "Back.easeOut" });
  }

  // ------------------------------------------------------------ interactions
  checkItems() {
    const b = this.body;
    for (const it of this.items) {
      if (it.got) continue;
      if (Math.abs(b.center.x - it.x) < 36 && Math.abs(b.center.y - it.y) < 64) this.collect(it);
    }
  }

  collect(it) {
    const { hud } = this.game.services;
    it.got = true;
    save.collect(it.id);
    audio.play("collect");
    this.sparks.explode(this.reduced ? 5 : 16, it.x, it.y);
    this.tweens.killTweensOf([it.icon, it.glow]);
    this.tweens.add({ targets: it.icon, scale: 0.95, y: it.y - 34, alpha: 0, duration: 380, ease: "Cubic.easeOut" });
    this.tweens.add({ targets: it.glow, scale: 1.6, alpha: 0, duration: 380, ease: "Cubic.easeOut" });
    hud.showCard(ITEMS[it.id], `World ${this.W.n} · ${this.W.name}`);
    hud.setCount(save.get().collected.length, TOTAL_ITEMS, true);
  }

  checkSigns(input, hud) {
    const b = this.body;
    const near = this.signs.find((s) => Math.abs(b.center.x - s.x) < 70);
    if (near !== this.nearSign) {
      this.nearSign = near;
      hud.setPrompt(near ? "<kbd>E</kbd> Read the sign" : null);
      input.setInteractVisible(!!near);
    }
    if (near && input.take("interact")) {
      hud.showCard(SIGNS[near.id], `World ${this.W.n}`, 7000);
      audio.play("ui");
    } else input.take("interact"); // drop stray presses
  }

  checkCheckpoints() {
    const x = this.body.center.x;
    for (const f of this.flags) {
      if (f.active || x < f.x) continue;
      f.active = true;
      this.cpIndex = Math.max(this.cpIndex, f.i);
      save.set({ checkpoint: this.cpIndex });
      f.img.clearTint().setAlpha(1);
      audio.play("checkpoint");
      this.sparks.explode(this.reduced ? 4 : 10, f.x + 20, GROUND_Y - 70);
      if (!this.reduced) {
        this.tweens.add({ targets: f.img, scaleX: 0.62, duration: 140, yoyo: true, repeat: 2, ease: "Sine.easeInOut" });
      }
    }
  }

  respawn() {
    this.respawning = true;
    const cam = this.cameras.main;
    cam.fadeOut(160, 0, 0, 0);
    cam.once("camerafadeoutcomplete", () => {
      const x = this.cpIndex >= 0 ? this.W.checkpoints[this.cpIndex] + 30 : this.spawnX;
      this.body.reset(x, GROUND_Y - PLAYER.bodyH / 2 - 1);
      this.body.setGravityY(0);
      this.jumping = false;
      this.player.setPosition(x, GROUND_Y - PLAYER.bodyH / 2 - 1);
      this.facing = 1;
      this.syncVisual(this.time.now);
      cam.fadeIn(220, 0, 0, 0);
      this.respawning = false;
      this.wasGround = true;
    });
  }

  complete() {
    if (this.exiting) return;
    this.exiting = true;
    const { hud } = this.game.services;
    hud.hideCard();
    hud.setPrompt(null);
    this.body.setVelocity(this.body.velocity.x * 0.4, this.body.velocity.y);
    const cam = this.cameras.main;
    cam.fadeOut(this.reduced ? 200 : 520, 0, 0, 0);
    cam.once("camerafadeoutcomplete", () => this.game.events.emit("world-exit", this.W.n));
  }
}
