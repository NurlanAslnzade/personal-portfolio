// DOM overlay: HUD chips, info card, prompts, menus, penalty controls, victory panel.
// Text lives in the DOM (crisp at any DPR, readable by screen readers); the canvas draws the world.
import { CONTACT, UI_TEXT, WORLDS } from "./content.js";
import { LINKS } from "./config.js";

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null) n.append(k.nodeType ? k : document.createTextNode(k));
  return n;
}

const PAUSE_ICON = '<svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1"/><rect x="9.5" y="2" width="3.5" height="12" rx="1"/></svg>';
const FS_ICON = '<svg viewBox="0 0 16 16"><path d="M2 2h5v2H4v3H2zm7 0h5v5h-2V4H9zM2 9h2v3h3v2H2zm10 0h2v5H9v-2h3z"/></svg>';

export class Hud {
  constructor(root, stage) {
    this.root = root;
    this.stage = stage;
    root.append(el("div", { class: "vignette" }));

    this.worldChip = el("span", { class: "chip hud-world" });
    this.count = el("span", { class: "chip hud-count", "aria-live": "polite" });
    this.pauseBtn = el("button", { type: "button", class: "icon-btn", "aria-label": "Pause (Esc)", title: "Pause (Esc)" });
    this.pauseBtn.innerHTML = PAUSE_ICON;
    const fsOk = !!(stage.requestFullscreen);
    this.fsBtn = fsOk ? el("button", { type: "button", class: "icon-btn", "aria-label": "Full screen", title: "Full screen",
      onclick: () => (document.fullscreenElement ? document.exitFullscreen() : stage.requestFullscreen().catch(() => {})) }) : null;
    if (this.fsBtn) this.fsBtn.innerHTML = FS_ICON;
    this.top = el("div", { class: "hud-top is-hidden" }, this.worldChip, this.count, el("span", { class: "spacer" }), this.fsBtn, this.pauseBtn);

    this.card = el("div", { class: "card", role: "status", "aria-live": "polite" });
    this.prompt = el("div", { class: "prompt", "aria-hidden": "true" });
    this.title = el("div", { class: "title-card", "aria-hidden": "true" });
    this.banner = el("div", { class: "banner", "aria-live": "assertive" });
    this.layer = el("div", { class: "layers" });
    root.append(this.top, this.card, this.prompt, this.title, this.banner, this.layer);
    this.overlay = null;
  }

  onPause(fn) { this.pauseBtn.addEventListener("click", fn); }

  setHudVisible(on) { this.top.classList.toggle("is-hidden", !on); }

  setWorld(n, name) {
    this.worldChip.replaceChildren(el("b", { text: `World ${n}` }), el("span", { class: "muted", text: name }));
  }

  setCount(c, total, bump) {
    this.count.replaceChildren(el("span", { class: "muted", text: "Resume" }), el("b", { text: `${c}/${total}` }));
    if (bump) {
      this.count.classList.remove("bump");
      void this.count.offsetWidth;
      this.count.classList.add("bump");
    }
  }

  showCard(item, kicker, ms = 5200) {
    clearTimeout(this.cardTimer);
    const kids = [
      el("img", { src: `assets/props/${item.icon}.webp`, alt: "" }),
      el("span", { class: "kicker", text: item.kicker || kicker }),
      el("p", { class: "title", text: item.title }),
    ];
    if (item.body) kids.push(el("p", { class: "body", text: item.body }));
    if (item.tags) kids.push(el("div", { class: "tags" }, item.tags.map((t) => el("span", { text: t }))));
    this.card.replaceChildren(...kids);
    this.card.classList.add("is-open");
    this.cardTimer = setTimeout(() => this.hideCard(), ms);
  }

  hideCard() { clearTimeout(this.cardTimer); this.card.classList.remove("is-open"); }

  setPrompt(html) {
    if (html) this.prompt.innerHTML = html;
    this.prompt.classList.toggle("is-on", !!html);
  }

  showTitle(n, name) {
    clearTimeout(this.titleTimer);
    this.title.replaceChildren(el("div", { class: "n", text: `World ${n}` }), el("div", { class: "t", text: name }));
    requestAnimationFrame(() => this.title.classList.add("is-on"));
    this.titleTimer = setTimeout(() => this.title.classList.remove("is-on"), 2200);
  }

  showBanner(text, small = false) {
    this.banner.textContent = text;
    this.banner.classList.toggle("small", small);
    requestAnimationFrame(() => this.banner.classList.add("is-on"));
  }

  hideBanner() { this.banner.classList.remove("is-on"); }

  // ------------------------------------------------------------ overlays
  openOverlay(panel, label) {
    this.closeOverlay();
    this.hideCard();
    this.setPrompt(null);
    this.overlay = el("div", { class: "overlay", role: "dialog", "aria-modal": "true", "aria-label": label }, panel);
    this.layer.append(this.overlay);
    const first = this.overlay.querySelector("[data-autofocus]") || this.overlay.querySelector("button, a");
    if (first) first.focus({ preventScroll: true });
    this.stage.dataset.overlay = "on";
  }

  closeOverlay() {
    if (this.overlay) this.overlay.remove();
    this.overlay = null;
    delete this.stage.dataset.overlay;
  }

  get overlayOpen() { return !!this.overlay; }

  showLoading() {
    this.loadingBar = el("i");
    this.openOverlay(el("div", { class: "panel" },
      el("p", { class: "eyebrow", text: "Loading" }),
      el("h2", { text: UI_TEXT.title }),
      el("p", { class: "sub", text: UI_TEXT.subtitle }),
      el("div", { class: "loading-bar", role: "progressbar", "aria-label": "Loading", "aria-valuemin": "0", "aria-valuemax": "100" }, this.loadingBar)), "Loading");
  }

  setLoading(p) {
    if (!this.loadingBar) return;
    this.loadingBar.style.width = `${Math.round(p * 100)}%`;
    this.loadingBar.parentElement.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  }

  showStart({ canContinue, world }, { onContinue, onNew }) {
    const legend = el("p", { class: "legend" });
    legend.innerHTML = "<kbd>←</kbd><kbd>→</kbd> run · <kbd>Space</kbd> jump · <kbd>E</kbd> read · <kbd>Esc</kbd> pause";
    this.openOverlay(el("div", { class: "panel" },
      el("p", { class: "eyebrow", text: "Resume game" }),
      el("h2", { text: UI_TEXT.title }),
      el("p", { class: "sub", text: UI_TEXT.intro }),
      el("div", { class: "stack" },
        canContinue ? el("button", { type: "button", class: "btn primary", "data-autofocus": true, onclick: onContinue },
          "Continue", el("span", { class: "hint", text: `World ${world}` })) : null,
        el("button", { type: "button", class: canContinue ? "btn" : "btn primary", onclick: onNew, "data-autofocus": !canContinue }, canContinue ? "New game" : "Play"),
        el("a", { class: "btn", href: LINKS.cv, target: LINKS.cvTarget, text: "Skip to CV" })),
      legend), "Start");
  }

  showPause({ world, maxWorld, sound }, h) {
    const worlds = WORLDS.map((w) => el("button", {
      type: "button", class: "btn", disabled: w.n > maxWorld, "aria-current": w.n === world ? "true" : null,
      title: w.name, "aria-label": `World ${w.n}: ${w.name}${w.n > maxWorld ? " (locked)" : ""}`,
      onclick: () => h.onWorld(w.n),
    }, String(w.n)));
    this.openOverlay(el("div", { class: "panel" },
      el("p", { class: "eyebrow", text: "Paused" }),
      el("h2", { text: `World ${world}` }),
      el("div", { class: "stack" },
        el("button", { type: "button", class: "btn primary", "data-autofocus": true, onclick: h.onResume }, "Resume", el("span", { class: "hint", text: "Esc" })),
        el("button", { type: "button", class: "btn", onclick: h.onRestart, text: "Restart world" }),
        el("p", { class: "label", text: "World select" }),
        el("div", { class: "worlds" }, worlds),
        el("button", { type: "button", class: "btn", "aria-pressed": sound ? "true" : "false", onclick: h.onSound, text: `Sound: ${sound ? "on" : "off"}` }),
        el("a", { class: "btn", href: LINKS.cv, target: LINKS.cvTarget, text: "Skip to CV" }))), "Pause menu");
  }

  // ------------------------------------------------------------ penalty
  showPenalty(h) {
    this.pMsg = el("p", { class: "msg", "aria-live": "polite" });
    this.pAim = ["left", "center", "right"].map((d) => el("button", {
      type: "button", "aria-pressed": "false", onclick: () => h.onAim(d), text: d[0].toUpperCase() + d.slice(1),
    }));
    this.pShoot = el("button", { type: "button", class: "shoot", onclick: h.onShoot, text: "Shoot" });
    this.pMeter = el("i");
    this.penalty = el("div", { class: "penalty-ui" },
      this.pMsg, el("div", { class: "aim" }, this.pAim, this.pShoot),
      el("div", { class: "meter", "aria-hidden": "true" }, this.pMeter));
    this.root.append(this.penalty);
  }

  setPenalty({ msg, aim, power, locked, shootLabel }) {
    if (!this.penalty) return;
    if (msg != null) this.pMsg.textContent = msg;
    if (aim) this.pAim.forEach((b) => b.setAttribute("aria-pressed", b.textContent.toLowerCase() === aim ? "true" : "false"));
    if (power != null) this.pMeter.style.width = `${Math.round(power * 100)}%`;
    if (locked != null) this.penalty.classList.toggle("locked", locked);
    if (shootLabel) this.pShoot.textContent = shootLabel;
  }

  hidePenalty() { if (this.penalty) this.penalty.remove(); this.penalty = null; }

  // ------------------------------------------------------------ victory
  showVictory({ collected, total }, { onReplay }) {
    this.openOverlay(el("div", { class: "panel" },
      el("p", { class: "eyebrow", text: "Goal" }),
      el("h2", { text: UI_TEXT.victoryTitle }),
      el("p", { class: "sub", text: collected >= total ? UI_TEXT.victorySubAll : UI_TEXT.victorySubSome }),
      el("div", { class: "stats" },
        el("div", {}, el("b", { text: `${collected}/${total}` }), el("span", { text: "resume items" })),
        el("div", {}, el("b", { text: "4/4" }), el("span", { text: "worlds" }))),
      el("div", { class: "stack" },
        el("a", { class: "btn primary", href: LINKS.cv, target: LINKS.cvTarget, "data-autofocus": true, text: "View CV" }),
        el("p", { class: "label", text: "Contact" }),
        el("div", { class: "row" }, CONTACT.map((c) => el("a", {
          class: "btn", href: c.href, target: "_blank", rel: "noopener noreferrer",
          "aria-label": `${c.label} (opens in a new tab)`, text: c.label,
        }))),
        el("button", { type: "button", class: "btn", onclick: onReplay, text: "Replay" }))), "Victory");
  }
}
