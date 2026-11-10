/**
 * profile-data.js - Verified Personal & Academic Profile
 * Single Source of Truth for CV & Biography Information
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
  }
};
