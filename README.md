# Personal Portfolio & Gamified Resume

**Author:** Nurlan Aslanzade  
**Academic Affiliation:** BSc in Computer Science, ADA University (2026–2030)  
**Course:** SITE 1101 Introduction to Information Systems  
**Live Demo:** GitHub Pages *(Deployment planned in Milestone 5)*  

---

## 1. Project Overview

This repository contains the source code for my personal portfolio website, engineered to fulfill the requirements of the **SITE 1101** university course, including a gamified resume feature ("Neural Path") targeting the optional 10% bonus criterion.

The website is architected according to modern frontend standards:
- **Zero build steps or third-party dependencies:** 100% vanilla HTML5, modern CSS3, and ES6+ JavaScript.
- **Strict separation of concerns:** Biographical and project data are managed independently in modular data files (`assets/js/data/`), cleanly decoupled from the presentation layer.
- **Accessibility & Dual-Mode Viewing:** Features an accessible conventional printable CV with print stylesheet optimization, alongside an interactive milestone explorer.
- **Strict Factual Accuracy:** Contains only verified academic records, scholarship distinctions, and genuine project descriptions without fabricated metrics or inflated claims.

---

## 2. Repository Directory Structure

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
│   │   │   ├── profile-data.js  # Verified personal, academic, and skills data
│   │   │   └── projects-data.js # Modular project catalog (SITE 1101 items kept modular)
│   │   ├── main.js              # Global app orchestrator
│   │   ├── projects.js          # Dynamic projects gallery renderer & category filter
│   │   └── resume.js            # Dual-mode resume switcher & milestone inspector
│   │
│   └── images/
│       ├── icons/               # SVG vector icons
│       ├── projects/            # Project screenshots (to be added)
│       └── placeholders/        # SVG fallback graphics
│
├── docs/
│   └── ai-conversation-log.md   # AI pair-programming audit trail for university submission
│
├── .gitignore                   # Standard OS & editor exclusions
└── README.md                    # Project documentation & assignment rubric mapping
```

---

## 3. Assignment Criteria Mapping

| Rubric Requirement | Implementation Location | Status |
| :--- | :--- | :--- |
| **Multi-Page Architecture** | `index.html`, `about.html`, `projects.html`, `resume-game.html` | ✅ Scaffolded |
| **Responsive Design** | `assets/css/responsive.css` (Mobile drawer, fluid clamp typography, CSS Grid) | ✅ Active |
| **Design Tokens & Theme** | `assets/css/variables.css` & `assets/js/core/theme.js` (Dark & Light mode) | ✅ Active |
| **SITE 1101 Coursework** | `assets/js/data/projects-data.js` (Modular entries; hidden until verified) | ⏳ Modular (Pending user details) |
| **Gamified Resume (10% Bonus)** | `resume-game.html` & `assets/js/resume.js` ("Neural Path" milestone foundation) | 🟡 Foundation Ready (Interactive polish in M4) |
| **Accessible Conventional CV** | `resume-game.html` & `assets/css/print.css` (Print-ready, screen-reader semantic) | ✅ Fully Available |
| **AI Transparency & Audit** | `docs/ai-conversation-log.md` | ✅ Maintained |

---

## 4. Local Development & Preview Instructions

Because this project is built entirely with vanilla web standards and native ES6 modules, no build tools or package installations (`npm`, `yarn`) are required.

To run locally with any static web server:

### Option A: VS Code Live Server
1. Open this repository folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Option B: Python Built-in HTTP Server
Run the following command in the project root:
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

---

## 5. Development Roadmap

- [x] **Milestone 1:** Architecture setup, design tokens, responsive navigation shell, data separation modules, and conventional resume foundation.
- [ ] **Milestone 2:** Semantic content page enrichment, verified media integration, and accessibility checks.
- [ ] **Milestone 3:** Projects gallery enhancements, modal previews, and SITE 1101 coursework verification.
- [ ] **Milestone 4:** Neural Path interactive experience polish (keyboard traversal, visual connectors, progression tracker).
- [ ] **Milestone 5:** Cross-device testing, accessibility audits, and GitHub Pages deployment.
