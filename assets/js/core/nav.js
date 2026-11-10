/**
 * nav.js - Mobile Drawer Navigation & Active Route Highlighting
 */

export function initNav() {
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const navLinks = document.querySelectorAll(".nav-link");

  // Highlight current active route
  highlightActiveLink(navLinks);

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      toggleNav(!isExpanded);
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
        toggleNav(false);
        navToggle.focus();
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (
        siteNav.classList.contains("is-open") &&
        !siteNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        toggleNav(false);
      }
    });
  }

  function toggleNav(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      siteNav.classList.add("is-open");
    } else {
      siteNav.classList.remove("is-open");
    }
  }
}

function highlightActiveLink(navLinks) {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkFile = href.substring(href.lastIndexOf("/") + 1) || "index.html";

    if (linkFile === currentFile) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
