/**
 * contour.js - Shared Contour behaviour (classic script, loaded with `defer`)
 *
 * 1 profile photo fallback · 2 contour plots · 3 hero once per visit
 * 4 scroll reveal · 5 click-to-load video
 *
 * Each part only acts on elements that exist, so pages adopt them as they
 * migrate (M4–M7). Theme and menu live in theme.js and nav.js.
 * Nothing here touches the résumé game.
 */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* 1. Profile photo: fall back to initials until assets/images/profile.jpg exists */
  document.querySelectorAll("img[data-photo]").forEach(function (img) {
    function hide() { img.remove(); }
    if (img.complete && img.naturalWidth === 0) hide(); else img.addEventListener("error", hide);
  });

  /* 2. Contour plots: Rosenbrock function, marching squares, gradient descent */
  var X0 = -2.4, X1 = 2.4, Y0 = -0.9, Y1 = 3.0, W = 1200, H = 700;
  function f(x, y) { return (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x); }
  function sx(x) { return (x - X0) / (X1 - X0) * W; }
  function sy(y) { return H - (y - Y0) / (Y1 - Y0) * H; }
  var cache = {};
  function contourPath(nx, ny) {
    var key = nx + "x" + ny;
    if (cache[key]) return cache[key];
    var g = [], i, j, d = "", levels = [];
    for (var n = 0; n < 15; n++) levels.push(-2.2 + n * 0.62);
    for (j = 0; j <= ny; j++) {
      g[j] = [];
      for (i = 0; i <= nx; i++) g[j][i] = Math.log(f(X0 + (X1 - X0) * i / nx, Y0 + (Y1 - Y0) * j / ny) + 0.05);
    }
    var cw = W / nx, ch = H / ny;
    levels.forEach(function (L) {
      for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
        var a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], e = g[j + 1][i], pts = [];
        var px = i * cw, py = H - j * ch, qy = H - (j + 1) * ch;
        function edge(v1, v2, x1, y1, x2, y2) {
          if ((v1 < L) !== (v2 < L)) { var t = (L - v1) / (v2 - v1); pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); }
        }
        edge(a, b, px, py, px + cw, py);
        edge(b, c, px + cw, py, px + cw, qy);
        edge(c, e, px + cw, qy, px, qy);
        edge(e, a, px, qy, px, py);
        for (var m = 0; m + 1 < pts.length; m += 2) {
          d += "M" + pts[m][0].toFixed(1) + " " + pts[m][1].toFixed(1) + "L" + pts[m + 1][0].toFixed(1) + " " + pts[m + 1][1].toFixed(1);
        }
      }
    });
    return (cache[key] = d);
  }
  function descentPath() {
    var x = -1.7, y = 2.6, pts = [[x, y]];
    for (var n = 0; n < 30000; n++) {
      var gx = -2 * (1 - x) - 400 * x * (y - x * x), gy = 200 * (y - x * x);
      x -= 0.0004 * gx; y -= 0.0004 * gy;
      if (n % 120 === 0) pts.push([x, y]);
      if (Math.abs(x - 1) < 0.004 && Math.abs(y - 1) < 0.004) break;
    }
    pts.push([1, 1]);
    return pts.map(function (p, i) { return (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1); }).join("");
  }
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs) { var e = document.createElementNS(NS, name); for (var a in attrs) e.setAttribute(a, attrs[a]); return e; }
  document.querySelectorAll("svg[data-contour]").forEach(function (svg) {
    var fine = svg.getAttribute("data-contour") === "fine";
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.appendChild(el("path", { d: contourPath(fine ? 150 : 90, fine ? 90 : 54), "class": "c-lines" }));
    if (svg.hasAttribute("data-descent")) {
      svg.appendChild(el("path", { d: descentPath(), "class": "c-descent", pathLength: 1 }));
      svg.appendChild(el("circle", { cx: sx(-1.7), cy: sy(2.6), r: 6, "class": "c-start" }));
    }
  });

  /* 3. The hero draws once per visit; later visits to Home show it finished */
  if (document.querySelector(".hero .c-descent")) {
    try { sessionStorage.setItem("contour-hero-seen", "1"); } catch (e) { /* storage blocked */ }
  }

  /* 4. Scroll reveal: fade + 12px rise, once, light stagger within a batch.
     Content stays visible if JS fails, IntersectionObserver is missing, or
     motion is reduced. Elements already on screen at load never animate. */
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var GROUPS = ".path, .rows, .ml-grid, .kit";
    var SINGLES = ".split > div:first-child, .group-head, .feature, .course-feature, .soon-line, .band .wrap, .contact";
    var DELAYS = [0, 50, 90, 120, 145, 165, 180];
    var REVEAL_MS = 520;
    var items = [];
    document.querySelectorAll(GROUPS).forEach(function (g) {
      if (g.closest("#neural-path-foundation")) return;
      Array.prototype.forEach.call(g.children, function (c) { c.setAttribute("data-reveal", ""); items.push(c); });
    });
    document.querySelectorAll(SINGLES).forEach(function (node) {
      if (node.closest("[data-reveal], .hero, .page-head, #neural-path-foundation")) return;
      node.setAttribute("data-reveal", ""); items.push(node);
    });

    if (items.length) {
      var settle = function (node) {   /* hand the element back to its normal transitions */
        node.removeAttribute("data-reveal"); node.classList.remove("is-in"); node.style.removeProperty("--d");
      };
      var limit = window.innerHeight * 0.92;
      var pending = items.filter(function (node) {
        if (node.getBoundingClientRect().top < limit) { settle(node); return false; }
        return true;
      });
      /* Apply the hidden starting state without animating into it */
      root.classList.add("reveal-on", "reveal-init");
      void document.body.offsetHeight;
      root.classList.remove("reveal-init");

      var io = new IntersectionObserver(function (entries) {
        var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
        batch.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
        batch.forEach(function (node, i) {
          var d = DELAYS[Math.min(i, DELAYS.length - 1)];
          node.style.setProperty("--d", d + "ms");
          node.classList.add("is-in");
          io.unobserve(node);
          setTimeout(function () { settle(node); }, REVEAL_MS + d + 40);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
      pending.forEach(function (node) { io.observe(node); });
    }
  }

  /* 5. Video: load the YouTube player only when asked (no third-party cookies until then) */
  document.querySelectorAll("[data-video]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var slot = btn.closest(".video-slot");
      if (!slot) return;
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(btn.getAttribute("data-video")) + "?autoplay=1&rel=0";
      frame.title = btn.getAttribute("data-title") || "Video";
      frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      slot.innerHTML = "";
      slot.appendChild(frame);
      frame.focus();
    });
  });
})();
