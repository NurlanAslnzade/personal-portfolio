/**
 * main.js - Global App Orchestrator
 */

import { initTheme } from "./core/theme.js";
import { initNav } from "./core/nav.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();

  // Dynamic copyright year
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
