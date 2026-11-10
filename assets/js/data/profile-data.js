/**
 * profile-data.js - Verified Personal & Academic Profile
 * Single Source of Truth for CV, Biography, and Neural Path Milestones
 */

export const profileData = {
  personal: {
    fullName: "Nurlan Aslanzade",
    title: "CS Student · Aspiring AI & Machine Learning Engineer",
    institution: "ADA University",
    email: "naslanzada27244@ada.edu.az",
    githubProfile: "https://github.com/NurlanAslnzade",
    linkedinProfile: "https://linkedin.com/in/nurlanaslanzada/",
    summary: "Motivated Computer Science student at ADA University with a deep focus on Artificial Intelligence and Machine Learning. Experienced in Python-based development, core data structures, algorithms, and mathematical problem-solving. Committed to establishing a rigorous theoretical foundation and deploying production-level machine learning models."
  },

  education: [
    {
      institution: "ADA University",
      degree: "BSc in Computer Science",
      period: "2026–2030",
      description: "Undergraduate curriculum centered on computer science fundamentals, discrete mathematics, and algorithms."
    },
    {
      institution: "AI Academy (AZCON Holding)",
      program: "AI Engineering Program",
      award: "100% Scholarship",
      topics: [
        "Mathematics for AI: Linear algebra and multivariable calculus",
        "Machine learning algorithms",
        "Practical application of deep learning architectures"
      ]
    },
    {
      institution: "Holberton School",
      program: "Machine Learning Program",
      award: "90% Scholarship",
      topics: [
        "Problem-solving and teamwork",
        "Project-based learning",
        "Industry coding standards"
      ]
    },
    {
      institution: "Heydar Aliyev Lyceum",
      location: "Baku, Azerbaijan",
      distinctions: [
        "DİM score: 655/700",
        "Graduated with two Certificates of Distinction"
      ]
    }
  ],

  honorsAndAwards: [
    {
      title: "100% Scholarship",
      organization: "AI Academy (AZCON Holding)",
      details: "Full merit scholarship for the AI Engineering Program"
    },
    {
      title: "90% Scholarship",
      organization: "Holberton School",
      details: "Merit scholarship for the Machine Learning Program"
    },
    {
      title: "High Academic Distinction",
      organization: "Heydar Aliyev Lyceum / DİM",
      details: "DİM score: 655/700 and two Certificates of Distinction"
    }
  ],

  skills: {
    languages: ["Python", "C++", "SQL"],
    aiAndDataScience: [
      "NumPy",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Scikit-Learn",
      "TensorFlow",
      "Deep Learning"
    ],
    csFundamentals: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming (OOP)",
      "Linear Algebra",
      "Multivariable Calculus"
    ],
    toolsAndDatabases: [
      "Git",
      "GitHub",
      "Linux Shell",
      "MySQL",
      "MongoDB"
    ],
    spokenLanguages: [
      { name: "Azerbaijani", level: "Native" },
      { name: "English", level: "B2 / Upper-Intermediate" }
    ]
  },

  neuralPathMilestones: [
    {
      id: "node-1",
      number: "01",
      badge: "Verified Foundation",
      badgeClass: "badge-accent",
      title: "Lyceum & DİM 655",
      fullTitle: "Heydar Aliyev Lyceum (Academic Foundation)",
      type: "Verified Academic Milestone",
      details: "Graduated from Heydar Aliyev Lyceum in Baku, Azerbaijan with two Certificates of Distinction and a DİM score of 655/700.",
      isGoal: false
    },
    {
      id: "node-2",
      number: "02",
      badge: "100% & 90% Merit Awards",
      badgeClass: "badge-success",
      title: "Scholarship Programs",
      fullTitle: "AI Academy & Holberton School (Scholarships)",
      type: "Verified Competitive Training",
      details: "Earned a 100% Scholarship at AI Academy (AZCON Holding) studying linear algebra, multivariable calculus, and deep learning, alongside a 90% Scholarship at Holberton School for machine learning software engineering.",
      isGoal: false
    },
    {
      id: "node-3",
      number: "03",
      badge: "BSc Computer Science",
      badgeClass: "badge-cyan",
      title: "ADA University",
      fullTitle: "ADA University (Undergraduate Studies)",
      type: "Current Academic Journey (2026–2030)",
      details: "BSc in Computer Science at ADA University focusing on core data structures, algorithms, mathematical problem-solving, and theoretical foundations.",
      isGoal: false
    },
    {
      id: "node-4",
      number: "04",
      badge: "Tabular & Statistical ML",
      badgeClass: "badge",
      title: "Applied ML Models",
      fullTitle: "Applied Machine Learning & Data Explorations",
      type: "Verified Practical Experience",
      details: "Developed predictive models including Loan Default Prediction and House Price Prediction, alongside structured exploratory data analysis workflows in Python.",
      isGoal: false
    },
    {
      id: "node-5",
      number: "05",
      badge: "Computer Vision",
      badgeClass: "badge",
      title: "Sign Language CV",
      fullTitle: "Sign Language Computer Vision",
      type: "Domain Exploration",
      details: "Computer vision project addressing sign language gesture recognition using Python.",
      isGoal: false
    },
    {
      id: "node-6",
      number: "06",
      badge: "Career Objective",
      badgeClass: "badge-warning",
      title: "Production ML Deploy",
      fullTitle: "Target: Production-Grade ML Engineering",
      type: "Career Aspiration / Target Goal",
      details: "Committed to establishing a rigorous theoretical foundation and deploying production-level machine learning models. Note: This is an aspirational career target, not a completed milestone.",
      isGoal: true
    }
  ]
};
