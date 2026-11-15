/**
 * resume.js - Resume page: CV/game view switch, print, #game deep link
 *
 * Markup contract:
 *   .mode-toggle-btn[data-mode="conventional"]  shows the CV (#conventional-resume)
 *   .mode-toggle-btn[data-mode="neural-path"]   shows the game (#neural-path-foundation)
 *   #neural-path-foundation .game-frame[data-src][data-title]  where the game iframe goes
 *
 * The game (game/index.html) loads only when the game view opens, and its iframe is
 * removed when switching back to the CV: the game stops, and Space/arrow keys belong to
 * the page again. The game keeps its progress in localStorage, so reopening continues.
 * Its "View CV" links load resume-game.html in the top window (the CV view).
 *
 * Without JavaScript the CV is simply shown and the switch is hidden (resume.css).
 */

const GAME_HASH = "#game";

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".mode-toggle-btn[data-mode]");
  const cv = document.getElementById("conventional-resume");
  const game = document.getElementById("neural-path-foundation");
  const frame = game && game.querySelector(".game-frame");
  const printButton = document.getElementById("print-resume-btn");
  if (!cv || !game || !buttons.length) return;

  function mountGame() {
    if (!frame || frame.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.src = frame.dataset.src;
    iframe.title = frame.dataset.title;
    iframe.allow = "fullscreen; gamepad; autoplay";
    iframe.setAttribute("allowfullscreen", "");
    frame.append(iframe);
  }

  function unmountGame() {
    const iframe = frame && frame.querySelector("iframe");
    if (!iframe) return;
    iframe.src = "about:blank";   // stop the game loop and audio before removal
    iframe.remove();
  }

  function setMode(mode, { updateUrl = true } = {}) {
    const showGame = mode === "neural-path";
    buttons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.mode === mode)));
    cv.hidden = showGame;
    game.style.display = showGame ? "block" : "none";
    if (showGame) mountGame();
    else unmountGame();

    // Keep the address shareable without adding history entries
    if (updateUrl) {
      const url = location.pathname + location.search + (showGame ? GAME_HASH : "");
      if (location.hash !== (showGame ? GAME_HASH : "")) history.replaceState(history.state, "", url);
    }
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));

  // resume-game.html#game (linked from Home, About and Projects) opens the game view
  const syncFromHash = () => setMode(location.hash === GAME_HASH ? "neural-path" : "conventional", { updateUrl: false });
  syncFromHash();
  window.addEventListener("hashchange", syncFromHash);

  // Arriving on #game, the browser scrolls (smoothly, per reset.css) to the switch while
  // the web fonts are still swapping in, which changes the header height and can leave
  // the switch up to ~100px off. Once the page and fonts have settled, align it exactly,
  // unless the visitor has already scrolled, typed or tapped.
  if (location.hash === GAME_HASH) {
    const target = document.getElementById("game");
    let visitorMoved = false;
    const mark = () => { visitorMoved = true; };
    ["wheel", "touchstart", "pointerdown", "keydown"].forEach((type) =>
      window.addEventListener(type, mark, { once: true, passive: true }));
    const align = () => {
      if (visitorMoved || location.hash !== GAME_HASH || !target) return;
      target.scrollIntoView({ block: "start", behavior: "instant" });
    };
    const afterFonts = () =>
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(align));
    if (document.readyState === "complete") afterFonts();
    else window.addEventListener("load", afterFonts, { once: true });
  }

  // Print always prints the CV (print.css also forces it, for Ctrl+P from the game view)
  if (printButton) {
    printButton.addEventListener("click", () => {
      setMode("conventional");
      window.print();
    });
  }
});
