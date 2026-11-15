// All words the game shows, and the layout of each world.
// CONTENT RULE: every fact below is taken from index.html, about.html or projects.html.
// Do not add claims that are not on those pages.

export const PROFILE = {
  name: "NURLAN",
  fullName: "Nurlan Aslanzade",
  tagline:
    "Computer Science student focused on artificial intelligence and machine learning, building toward a career as an ML engineer.",
};

// Same links as the site footer (email intentionally left out).
export const CONTACT = [
  { label: "GitHub", href: "https://github.com/NurlanAslnzade" },
  { label: "LinkedIn", href: "https://linkedin.com/in/nurlanaslanzada/" },
  { label: "Source code of this site", href: "https://github.com/NurlanAslnzade/personal-portfolio" },
];

// Resume items (collectibles) and signs, keyed by id.
export const ITEMS = {
  // World 1 - Heydar Aliyev Lyceum
  lyceum: {
    icon: "icon-book",
    title: "Heydar Aliyev Lyceum",
    body: "Secondary education, Baku, Azerbaijan.",
  },
  distinction: {
    icon: "icon-medal",
    title: "Two Certificates of Distinction",
    body: "Graduated from Heydar Aliyev Lyceum with two Certificates of Distinction.",
  },

  // World 2 - ADA University
  bsc: {
    icon: "icon-cap",
    title: "BSc in Computer Science",
    body: "ADA University, 2026–2030.",
  },
  dim: {
    icon: "icon-diploma",
    title: "DİM score 655 / 700",
    body: "Part of the path from Heydar Aliyev Lyceum to ADA University.",
  },
  aiAcademy: {
    icon: "icon-medal",
    title: "AI Academy scholarship, 100%",
    body: "AI Engineering Program at AI Academy (AZCON Holding): mathematics for AI, machine learning algorithms and deep learning.",
  },
  holberton: {
    icon: "icon-star",
    title: "Holberton School scholarship, 90%",
    body: "Machine Learning Program: project-based learning following industry coding standards, problem-solving and teamwork in engineering groups.",
  },

  // World 3 - AI & ML Lab: projects
  project1: {
    icon: "icon-chip",
    kicker: "SITE 1101 Project 1 · Team 41",
    title: "How does hardware work?",
    body: "For SITE 1101: Principles of Information Systems, we built NOT, AND, OR and XOR logic gates from physical electronic components.",
    tags: ["Digital logic", "Logic gates", "Hardware principles"],
  },
  signLanguage: {
    icon: "icon-robot",
    kicker: "Project · Computer vision",
    title: "Sign Language Computer Vision",
    body: "Explores computer vision techniques for detecting and recognising sign language gestures.",
    tags: ["Python", "Computer vision"],
  },
  loanDefault: {
    icon: "icon-robot",
    kicker: "Project · Supervised learning",
    title: "Loan Default Prediction",
    body: "Data preprocessing, exploratory analysis and supervised learning algorithms to evaluate borrower credit risk on tabular data.",
    tags: ["Python", "Scikit-Learn", "Pandas", "NumPy"],
  },
  housePrice: {
    icon: "icon-robot",
    kicker: "Project · Regression",
    title: "House Price Prediction",
    body: "Feature analysis, data cleaning and a regression model to estimate property prices from real-estate characteristics.",
    tags: ["Python", "Scikit-Learn", "Pandas", "Matplotlib"],
  },
  dataViz: {
    icon: "icon-robot",
    kicker: "Project · Exploratory analysis",
    title: "Data Analysis and Visualization",
    body: "Data inspection, distribution analysis and correlation visualisations on real-world datasets with Python's scientific stack.",
    tags: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
  },

  // World 3 - skills (exactly as on about.html)
  skillLanguages: {
    icon: "icon-star",
    kicker: "Skills",
    title: "Programming languages",
    tags: ["Python", "C++", "SQL"],
  },
  skillML: {
    icon: "icon-star",
    kicker: "Skills",
    title: "Machine learning and data",
    tags: ["NumPy", "Pandas", "Matplotlib", "Seaborn", "Scikit-Learn", "TensorFlow", "Deep learning"],
  },
  skillFoundations: {
    icon: "icon-book",
    kicker: "Skills",
    title: "Foundations",
    tags: ["Data structures and algorithms", "Object-oriented programming", "Linear algebra", "Multivariable calculus"],
  },
  skillTools: {
    icon: "icon-star",
    kicker: "Skills",
    title: "Tools and databases",
    tags: ["Git", "GitHub", "Linux shell", "MySQL", "MongoDB"],
  },
  skillSpoken: {
    icon: "icon-star",
    kicker: "Skills",
    title: "Spoken languages",
    tags: ["Azerbaijani, native", "English, B2 upper-intermediate"],
  },
};

export const SIGNS = {
  intro: {
    icon: "sign",
    kicker: "Meet",
    title: "Nurlan Aslanzade",
    body: PROFILE.tagline,
  },
  ada: {
    icon: "sign",
    kicker: "ADA University",
    title: "BSc in Computer Science, 2026–2030",
    body: "Core data structures, algorithms, mathematical problem-solving and computer science fundamentals.",
  },
  lab: {
    icon: "sign",
    kicker: "AI & ML Lab",
    title: "Coursework, then independent work",
    body: "Coursework for SITE 1101: Principles of Information Systems, then independent machine learning projects.",
  },
  direction: {
    icon: "sign",
    kicker: "Next",
    title: "Machine learning engineering",
    body: "The direction, not yet the title.",
  },
};

// Layout. x/y are world units; platform y is its walkable top; item y is its centre.
// ground: [x0, x1] runs of solid ground. platforms: [x, y, "short"|"long"].
export const WORLDS = [
  {
    n: 1,
    name: "Heydar Aliyev Lyceum",
    art: "grass",
    ambient: "leaves",
    width: 3400,
    ground: [[0, 980], [1140, 2000], [2150, 3400]],
    platforms: [[700, 360, "short"], [1060, 360, "short"], [1450, 360, "long"], [1720, 268, "short"],
      [2420, 360, "short"], [2680, 268, "long"]],
    items: [["lyceum", 700, 305], ["distinction", 1720, 213]],
    signs: [["intro", 260]],
    checkpoints: [1220, 2240],
    exit: 3290,
  },
  {
    n: 2,
    name: "ADA University",
    art: "glass",
    ambient: "motes",
    width: 3800,
    ground: [[0, 900], [1060, 1715], [1865, 2600], [2760, 3800]],
    platforms: [[520, 360, "short"], [980, 360, "short"], [1300, 360, "long"], [1560, 268, "short"],
      [2020, 360, "short"], [2260, 268, "long"], [1790, 360, "short"], [2920, 360, "long"], [3170, 268, "short"]],
    items: [["bsc", 520, 305], ["dim", 1560, 213], ["aiAcademy", 2260, 213], ["holberton", 3170, 213]],
    signs: [["ada", 240]],
    checkpoints: [1120, 1940, 2820],
    exit: 3690,
  },
  {
    n: 3,
    name: "AI & ML Lab",
    art: "tech",
    ambient: "data",
    width: 5200,
    ground: [[0, 800], [960, 1615], [1765, 2515], [2665, 3415], [3565, 4300], [4460, 5200]],
    platforms: [[460, 360, "short"], [880, 360, "short"], [1150, 360, "long"], [1400, 268, "short"],
      [1690, 360, "short"], [1920, 360, "short"], [2160, 268, "long"], [2410, 178, "short"], [2590, 360, "short"],
      [2820, 360, "long"], [3070, 268, "short"], [3320, 360, "short"], [3490, 360, "short"], [3720, 360, "long"],
      [3970, 268, "short"], [4200, 360, "short"], [4380, 360, "short"], [4620, 360, "long"], [4870, 268, "short"]],
    items: [["project1", 460, 305], ["signLanguage", 1150, 305], ["loanDefault", 1400, 213],
      ["housePrice", 2160, 213], ["dataViz", 2410, 123], ["skillLanguages", 2820, 305], ["skillML", 3070, 213],
      ["skillFoundations", 3720, 305], ["skillTools", 3970, 213], ["skillSpoken", 4870, 213]],
    signs: [["lab", 220]],
    checkpoints: [1020, 1840, 2740, 3640, 4520],
    exit: 5090,
  },
  {
    n: 4,
    name: "Stadium",
    art: "pitch",
    ambient: "flashes",
    width: 2400,
    ground: [[0, 2400]],
    platforms: [],
    items: [],
    signs: [["direction", 520]],
    decor: [["corner-flag", 60], ["corner-flag", 2330]],   // pitch corners, either end
    checkpoints: [1150],
    exit: 2150,      // the penalty box
  },
];

export const TOTAL_ITEMS = WORLDS.reduce((n, w) => n + w.items.length, 0);

export const UI_TEXT = {
  title: "NURLAN",
  subtitle: "A resume in four worlds",
  intro: "Run through school, university and the lab collecting the resume, then take the penalty.",
  penaltyAim: "Choose a corner: ← → or tap, then Shoot.",
  penaltyPower: "Stop the power bar: Space or tap Shoot.",
  saved: ["Saved! He guessed right. Go again.", "Saved again. Last one, take your time."],
  soft: "Too soft, he gathered it. Go again.",
  victoryTitle: "Full time",
  victorySubAll: "Every resume item collected. The conventional CV has them all on one page.",
  victorySubSome: "The conventional CV has every item on one page, including any you ran past.",
};
