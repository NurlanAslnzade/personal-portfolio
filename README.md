# Personal Portfolio & Gamified Resume

**Author:** Nurlan Aslanzade  
**Academic Affiliation:** BSc in Computer Science, ADA University (2026–2030)  
**Course:** SITE 1101 Introduction to Information Systems  
**Live Demo:** GitHub Pages *(Deployment planned in Milestone 5)*  

---

## 1. Project Overview

This repository contains the source code for my personal portfolio website, engineered to fulfill the requirements of the **SITE 1101** university course, including an interactive gamified resume feature ("Neural Path") targeting the optional 10% bonus criterion.

The website is architected according to modern frontend standards:
- **Zero build steps or third-party dependencies:** 100% vanilla HTML5, modern CSS3, and ES6+ JavaScript.
- **Hybrid Data Architecture:** Accessible static HTML baseline coupled with modular ES6 data stores (`assets/js/data/`).
- **Accessibility & Dual-Mode Viewing:** Features an accessible conventional printable CV with print stylesheet optimization, alongside an interactive milestone explorer.
- **Strict Factual Accuracy:** Contains only verified academic records, scholarship distinctions, and genuine project descriptions without fabricated metrics or inflated claims.

---

## 2. Hybrid Data Architecture & Consistency Protocol

To balance academic grading requirements, search accessibility, and interactive extensibility, this project implements a **Hybrid Data Architecture**:

1. **Static HTML as the Accessible Baseline:**
   - Core biographical, educational, and honor records are embedded directly in semantic HTML across `index.html`, `about.html`, and `resume-game.html`.
   - This ensures instant first contentful paint (FCP), zero hydration lag, full search engine indexability, and 100% readability even if JavaScript is disabled or blocked.

2. **Canonical Data Stores (`profile-data.js` and `projects-data.js`):**
   - `assets/js/data/profile-data.js` acts as the single source of truth for structured profile metadata, education, verified skills, and interactive Neural Path milestone nodes.
   - It is actively consumed by `assets/js/resume.js` to hydrate and inspect milestones in the Neural Path engine.
   - `assets/js/data/projects-data.js` is dynamically consumed by `assets/js/projects.js` to render and filter project cards.

3. **Consistency Maintenance Protocol:**
   - Any future modifications to personal credentials, contact endpoints, or educational milestones must originate in `profile-data.js`.
   - The static HTML views mirror these canonical fields. In testing phases, automated DOM consistency checks verify that static text nodes align with the canonical data store.

---

## 3. Repository Directory Structure

```text
personal-portfolio/
├── index.html                   # Home page (Hero, academic overview, focus areas)
├── about.html                   # About page (Education, scholarships, honors, skills)
├── projects.html                # Projects gallery (Category filtering, modular cards)
├── resume-game.html             # Resume page (Conventional printable CV + Neural Path foundation)
│
├── assets/
│   ├── css/
│   │   ├── variables.css        # Design tokens: palette, fluid typography, spacing
│   │   ├── reset.css            # Modern CSS reset and baseline resets
│   │   ├── global.css           # Layout shell, header, nav, footer, skip link
│   │   ├── components.css       # Buttons, cards, badges, section headers, notices
│   │   ├── responsive.css       # Responsive breakpoints, media queries, mobile drawer
│   │   └── print.css            # Print stylesheet for CV / PDF export
│   │
│   ├── js/
│   │   ├── core/
│   │   │   ├── nav.js           # Mobile drawer navigation & active link detection
│   │   │   └── theme.js         # Dark/light theme engine with localStorage sync
│   │   ├── data/
│   │   │   ├── profile-data.js  # Canonical data store for personal, academic, & Neural Path data
│   │   │   └── projects-data.js # Modular project catalog (SITE 1101 items kept modular/hidden)
│   │   ├── main.js              # Global app orchestrator
│   │   ├── projects.js          # Dynamic projects gallery renderer & category filter
│   │   └── resume.js            # Dual-mode resume switcher & milestone inspector
│   │
│   └── images/
│       ├── icons/               # Directory for SVG icons
│       ├── projects/            # Directory for screenshots
│       └── placeholders/        # Directory for fallback graphics
│
├── docs/
│   └── ai-conversation-log.md   # Chronological AI pair-programming transcripts for university audit
│
├── .gitignore                   # Standard OS & editor exclusions
└── README.md                    # Project documentation & assignment rubric mapping
```

---

## 4. Assignment Criteria Mapping

| Rubric Requirement | Implementation Location | Status |
| :--- | :--- | :--- |
| **Multi-Page Architecture** | `index.html`, `about.html`, `projects.html`, `resume-game.html` | ✅ Scaffolded |
| **Responsive Design** | `assets/css/responsive.css` (Mobile drawer, fluid clamp typography, CSS Grid) | ✅ Active |
| **Design Tokens & Theme** | `assets/css/variables.css` & `assets/js/core/theme.js` (Dark & Light mode) | ✅ Active |
| **SITE 1101 Coursework** | `assets/js/data/projects-data.js` (Modular entries; hidden until verified) | ⏳ Modular (Pending user details) |
| **Gamified Resume (10% Bonus)** | `resume-game.html` & `assets/js/resume.js` ("Neural Path" milestone foundation) | 🟡 Foundation Ready (Interactive polish in M4) |
| **Accessible Conventional CV** | `resume-game.html` & `assets/css/print.css` (Print-ready, screen-reader semantic) | ✅ Fully Available |
| **AI Transparency & Audit** | `docs/ai-conversation-log.md` (Verbatim transcript of planning & review) | ✅ Maintained |

---

## 5. Local Development & Preview Instructions

Because this project is built entirely with vanilla web standards and native ES6 modules, no build tools or package installations (`npm`, `yarn`) are required.

To run locally with any static web server:

### Option A: Python Built-in HTTP Server (Recommended)
Run the following command in the project root:
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

### Option B: VS Code Live Server
1. Open this repository folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

---

## 6. Development Roadmap

- [x] **Milestone 1:** Architecture setup, design tokens, responsive navigation shell, hybrid data modules, and conventional resume foundation.
- [ ] **Milestone 2:** Semantic content page enrichment, verified media integration, and accessibility checks.
- [ ] **Milestone 3:** Projects gallery enhancements, modal previews, and SITE 1101 coursework verification.
- [ ] **Milestone 4:** Neural Path interactive experience polish (keyboard traversal, visual connectors, progression tracker).
- [ ] **Milestone 5:** Cross-device testing, accessibility audits, and GitHub Pages deployment.
