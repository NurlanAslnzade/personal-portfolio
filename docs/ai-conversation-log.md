# AI Development & Pair-Programming Conversation Log

**Student:** Nurlan Aslanzade  
**Degree:** BSc in Computer Science, ADA University (2026–2030)  
**Course:** SITE 1101  
**Project:** Personal Portfolio & Gamified Resume  

---

## Purpose of this Document
In compliance with academic integrity guidelines and modern engineering practices, this document preserves the trajectory of architectural planning, content verification, and code implementation developed in collaboration with the AI assistant (Google Antigravity / Gemini).

---

## Phase 1: Initial Planning & Architecture (v1)
* **User Request:** Initial assignment requirements for a multi-page personal portfolio (Home, About, Projects, and Gamified Resume targeting a 10% university bonus).
* **AI Proposal:**
  - Proposed Multi-Page Architecture (MPA) using vanilla HTML, CSS, and JavaScript.
  - Introduced the "Neural Path" concept as a training loop metaphor.
  - Outlined milestone roadmap from scaffolding to GitHub Pages deployment.
* **Architectural Decisions:**
  - Rejected heavy frameworks (React/Vue) and game engines (Phaser/Three.js) in favor of standard-compliant vanilla web technologies.
  - Enforced strict relative asset paths (`./assets/...`) to ensure compatibility with GitHub Pages subpath hosting.

---

## Phase 2: Refinements & Grounded Content Mandate (v2)
* **User Guidance:**
  - Mandatory requirement: Portfolio must feel authentic, avoiding generic AI developer templates.
  - Three mandatory SITE 1101 projects specified: *Project 1*, *Hour of Code*, *Robotics*.
  - Strict mandate: Do not fabricate ML accuracy, metrics, or capabilities.
  - Added non-destructive Git strategy, documentation requirements, and full AI conversation preservation.
* **Architectural Adjustments:**
  - Removed simulated loss/accuracy figures from the game resume.
  - Replaced game simulation claims with genuine milestone progression indicators.
  - Formalized placeholder conventions for unverified coursework items.

---

## Phase 3: Verified CV Integration & Separation Strategy (v3)
* **User Input:** Provided verified CV details:
  - Name: Nurlan Aslanzade (ADA University CS student).
  - Education: ADA University, AI Academy (100% Scholarship), Holberton School (90% Scholarship), Heydar Aliyev Lyceum (DİM 655/700, two Certificates of Distinction).
  - Skills: Python, C++, SQL, NumPy, Pandas, Scikit-Learn, TensorFlow, etc.
  - Projects: Sign Language Computer Vision, Loan Default Prediction, House Price Prediction, Data Analysis Explorations.
  - Explicit rule: Projects 2 and 3 are not completed and must not have fake placeholder cards.
* **Architectural Adjustments:**
  - Designed the data separation model: `assets/js/data/profile-data.js` and `assets/js/data/projects-data.js`.

---

## Phase 4: Factual Rigor & Conservative Publication (v4 - Approved)
* **User Guidance & Corrections:**
  - Keep all SITE 1101 coursework entries (`Project 1`, `Hour of Code`, `Robotics`, `Project 2`, `Project 3`) hidden (`public: false`) until verified details and media are supplied.
  - Do not use general GitHub profile URL as repository links; keep `repoUrl: null` unless verified.
  - Remove unsupported ranking statements regarding the DİM score.
  - Explicitly classify "Production ML Deployment" as an aspirational career goal, not a completed milestone.
  - Avoid mixing unverified technologies or real-time claims for the Sign Language CV project.
* **Outcome:** v4 Architecture and Content Plan approved for Milestone 1 implementation.

---

## Phase 5: Milestone 1 Implementation (Current)
* **Deliverables Implemented:**
  1. Standard directory structure (`assets/css/`, `assets/js/`, `assets/images/`, `docs/`).
  2. Complete CSS design token architecture (`variables.css`, `reset.css`, `global.css`, `components.css`, `responsive.css`, `print.css`).
  3. Externalized data modules (`profile-data.js`, `projects-data.js`) with zero fabricated metrics, SITE 1101 projects set to `public: false`, and project repository links kept `null`.
  4. Core JavaScript utilities (`theme.js`, `nav.js`, `main.js`, `projects.js`, `resume.js`).
  5. Semantic HTML pages (`index.html`, `about.html`, `projects.html`, `resume-game.html`).
  6. Dual-mode resume foundation (conventional printable resume + accessible Neural Path milestone stepper).
  7. `.gitignore`, comprehensive `README.md`, and this conversation log.
