/**
 * nav.js - Mobile menu (disclosure pattern) and current-page marking
 *
 * Without JavaScript the links simply stay visible (responsive.css, A1).
 * With it, on narrow screens they collapse behind #nav-toggle:
 * opening moves focus to the first link; Esc closes and returns focus;
 * clicking outside or tabbing away closes the menu.
 */

export function initNav() {
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  highlightActiveLink(document.querySelectorAll(".nav-list a"));

  if (!navToggle || !siteNav) return;

  const isOpen = () => siteNav.classList.contains("is-open");

  function setMenu(open, returnFocus) {
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      const first = siteNav.querySelector("a");
      if (first) first.focus();
    } else if (returnFocus) {
      navToggle.focus();
    }
  }

  navToggle.addEventListener("click", () => setMenu(!isOpen(), false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) setMenu(false, true);
  });

  document.addEventListener("click", (e) => {
    if (isOpen() && !siteNav.contains(e.target) && !navToggle.contains(e.target)) setMenu(false, false);
  });

  siteNav.addEventListener("focusout", (e) => {
    if (isOpen() && e.relatedTarget && !siteNav.contains(e.relatedTarget) && e.relatedTarget !== navToggle) {
      setMenu(false, false);
    }
  });
}

/* aria-current is also written into each page's markup (works without JS);
   this keeps it correct if a page is served under another path, e.g. "/". */
function highlightActiveLink(navLinks) {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkFile = href.substring(href.lastIndexOf("/") + 1) || "index.html";
    if (linkFile === currentFile) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
