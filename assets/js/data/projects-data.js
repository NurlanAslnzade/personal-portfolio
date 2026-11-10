/**
 * projects-data.js - Modular Projects Catalog
 *
 * NOTE:
 * 1. SITE 1101 projects remain public: false until verified details are provided.
 * 2. Repository and demo URLs are kept null unless a specific verified URL is provided.
 * 3. No fabricated metrics, accuracy scores, or deployment claims are included.
 */

export const projectsData = [
  // --- VERIFIED CV PROJECTS (VISIBLE) ---
  {
    id: "sign-language-cv",
    title: "Sign Language Computer Vision",
    category: "ai-ml",
    categoryLabel: "AI & Machine Learning",
    public: true,
    statusLabel: "Computer Vision",
    summary: "Computer vision project exploring sign language gesture recognition.",
    description: "Explores computer vision techniques for sign language gesture detection and recognition. Specific framework details and dataset documentation will be updated upon repository verification.",
    technologies: ["Python", "Computer Vision"],
    repoUrl: null,
    demoUrl: null,
    featured: true
  },
  {
    id: "loan-default-prediction",
    title: "Loan Default Prediction",
    category: "ai-ml",
    categoryLabel: "AI & Machine Learning",
    public: true,
    statusLabel: "Supervised Learning",
    summary: "Predictive machine learning model addressing loan default classification on tabular data.",
    description: "Applies data preprocessing, exploratory analysis, and supervised machine learning algorithms to evaluate borrower credit risk.",
    technologies: ["Python", "Scikit-Learn", "Pandas", "NumPy"],
    repoUrl: null,
    demoUrl: null,
    featured: true
  },
  {
    id: "house-price-prediction",
    title: "House Price Prediction",
    category: "ai-ml",
    categoryLabel: "AI & Machine Learning",
    public: true,
    statusLabel: "Regression Analysis",
    summary: "Regression modeling project analyzing real estate characteristics to predict property values.",
    description: "Performs feature analysis, data cleaning, and regression model implementation to estimate continuous property price targets.",
    technologies: ["Python", "Scikit-Learn", "Pandas", "Matplotlib"],
    repoUrl: null,
    demoUrl: null,
    featured: false
  },
  {
    id: "data-analysis-explorations",
    title: "Data Analysis & Visualization Explorations",
    category: "data-science",
    categoryLabel: "Data Science & Analytics",
    public: true,
    statusLabel: "Exploratory Analysis",
    summary: "Collection of statistical data analyses and visual reporting on real-world datasets.",
    description: "Conducts data inspection, distribution analysis, and correlation visualizations using Python's scientific data stack.",
    technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
    repoUrl: null,
    demoUrl: null,
    featured: false
  },

  // --- SITE 1101 COURSEWORK (MODULAR - HIDDEN UNTIL DETAILS VERIFIED) ---
  {
    id: "site1101-project1",
    title: "SITE 1101: Project 1",
    category: "site1101",
    categoryLabel: "SITE 1101 Coursework",
    public: false, // Hidden until details confirmed
    statusLabel: "Pending Details",
    summary: "",
    description: "",
    technologies: [],
    repoUrl: null,
    demoUrl: null,
    featured: false
  },
  {
    id: "site1101-hour-of-code",
    title: "SITE 1101: Hour of Code",
    category: "site1101",
    categoryLabel: "SITE 1101 Coursework",
    public: false, // Hidden until details confirmed
    statusLabel: "Pending Details",
    summary: "",
    description: "",
    technologies: [],
    repoUrl: null,
    demoUrl: null,
    featured: false
  },
  {
    id: "site1101-robotics",
    title: "SITE 1101: Robotics",
    category: "site1101",
    categoryLabel: "SITE 1101 Coursework",
    public: false, // Hidden until details confirmed
    statusLabel: "Pending Details",
    summary: "",
    description: "",
    technologies: [],
    repoUrl: null,
    demoUrl: null,
    featured: false
  },
  {
    id: "site1101-project2",
    title: "SITE 1101: Project 2",
    category: "site1101",
    categoryLabel: "SITE 1101 Coursework",
    public: false, // Incomplete / Hidden
    statusLabel: "Incomplete",
    summary: "",
    description: "",
    technologies: [],
    repoUrl: null,
    demoUrl: null,
    featured: false
  },
  {
    id: "site1101-project3",
    title: "SITE 1101: Project 3",
    category: "site1101",
    categoryLabel: "SITE 1101 Coursework",
    public: false, // Incomplete / Hidden
    statusLabel: "Incomplete",
    summary: "",
    description: "",
    technologies: [],
    repoUrl: null,
    demoUrl: null,
    featured: false
  }
];
