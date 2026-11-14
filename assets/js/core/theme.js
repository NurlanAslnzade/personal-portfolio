/**
 * theme.js - Theme toggle (light default, dark on request)
 *
 * The initial theme is applied by the inline script in each page's <head>,
 * before first paint, from the same localStorage key used here. That removes
 * the brief light flash returning dark-theme visitors used to see.
 * New visitors get Light regardless of OS preference (Milestone 1 decision).
 */

const THEME_STORAGE_KEY = "portfolio_theme_preference";
const COLOR_FADE_MS = 280; // slightly longer than --color (240ms) so the fade completes

const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

export function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");

  // Fallback in case the <head> script did not run
  if (!root.getAttribute("data-theme")) {
    let stored = null;
    try { stored = localStorage.getItem(THEME_STORAGE_KEY); } catch (e) { /* storage blocked */ }
    root.setAttribute("data-theme", stored === "dark" ? "dark" : "light");
  }

  paint(toggle);
  if (!toggle) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let fadeTimer;

  toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

    // Colours cross-fade for the length of the change only (motion.css §8)
    root.classList.add("theme-anim");
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove("theme-anim"), COLOR_FADE_MS);

    root.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch (e) { /* storage blocked */ }
    paint(toggle);

    // Icon swap: small rotate + fade in (opacity only under reduced motion)
    const icon = toggle.querySelector("svg");
    if (icon && icon.animate) {
      icon.animate(
        reduceMotion.matches
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [{ opacity: 0, transform: "rotate(-40deg) scale(0.9)" }, { opacity: 1, transform: "none" }],
        { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      );
    }
  });
}

function paint(toggle) {
  if (!toggle) return;
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  toggle.innerHTML = dark ? ICON_SUN : ICON_MOON;
  toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  toggle.setAttribute("title", dark ? "Switch to light theme" : "Switch to dark theme");
}
