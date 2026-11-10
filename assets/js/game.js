/**
 * game.js - 2D Interactive Platformer Resume: Algorithm Odyssey
 * Original Gemini Canvas Game Implementation
 *
 * Mode: Production Integrated Engine
 * Target: Nurlan Aslanzade Portfolio
 */

(function () {
  'use strict';

  /* =====================================================================
     1. PROCEDURAL SOUND SYNTHESIS (Zero External Audio Dependencies)
     ===================================================================== */
  class ProceduralAudio {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playJump() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } catch (e) {}
    }

    playInteract() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25];
        notes.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.1, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.16);
        });
      } catch (e) {}
    }

    playPortal() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } catch (e) {}
    }

    playKick() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }

    playGoalCrowd() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Ref whistle
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.setValueAtTime(2600, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        // Fanfare chord (C5, E5, G5, C6)
        const chords = [523.25, 659.25, 783.99, 1046.50];
        chords.forEach((note, idx) => {
          const chordOsc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();
          chordOsc.type = 'triangle';
          chordOsc.frequency.setValueAtTime(note, now + 0.15 + (idx * 0.04));
          chordGain.gain.setValueAtTime(0.12, now + 0.15);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          chordOsc.connect(chordGain);
          chordGain.connect(this.ctx.destination);
          chordOsc.start(now + 0.15);
          chordOsc.stop(now + 1.3);
        });
      } catch (e) {}
    }
  }

  const audio = new ProceduralAudio();

  /* =====================================================================
     2. CANVAS & PHYSICS SETUP
     ===================================================================== */
  let canvas = null;
  let ctx = null;
  const VIEW_W = 960;
  const VIEW_H = 540;
  const GRAVITY = 0.54;
  const FRICTION = 0.85;

  // Control inputs
  const keys = {
    left: false,
    right: false,
    jump: false,
    jumpBuffered: false,
    interact: false
  };

  /* =====================================================================
     3. PORTFOLIO DATA ARCHITECTURE (4 WORLDS)
     ===================================================================== */
  let currentWorldIndex = 0;

  const WORLDS = [
    /* WORLD 1: ACADEMIC WORLD */
    {
      id: 0,
      name: "Academic World",
      theme: "academic",
      worldWidth: 2600,
      skyColor: ["#191530", "#3d2448", "#6a3455", "#e59871"],
      sunPos: { x: 800, y: 160 },
      platforms: [
        { x: 40, y: 440, w: 460, h: 180, type: "ruin_moss" },
        { x: 570, y: 380, w: 260, h: 220, type: "ruin_moss" },
        { x: 890, y: 310, w: 320, h: 290, type: "ruin_tower" },
        { x: 1280, y: 390, w: 280, h: 210, type: "ruin_moss" },
        { x: 1620, y: 330, w: 320, h: 270, type: "ruin_tower" },
        { x: 2000, y: 440, w: 550, h: 180, type: "ruin_moss" }
      ],
      landmarks: [
        {
          x: 220, y: 370,
          icon: "🏫",
          title: "Heydar Aliyev Lyceum",
          category: "High School Education",
          summary: "Rigorous secondary education foundation with continuous academic excellence.",
          details: [
            "Studied at the renowned Heydar Aliyev Lyceum in Baku, Azerbaijan.",
            "Awarded Two Certificates of Distinction for superior academic performance and discipline.",
            "Demonstrated strong early analytical and mathematical problem-solving skills."
          ]
        },
        {
          x: 700, y: 310,
          icon: "📊",
          title: "State Exam (DİM): 655 / 700",
          category: "National Examination",
          summary: "Top national percentile result across the country's university entrance examinations.",
          details: [
            "Score: 655 out of 700 points in the Republic of Azerbaijan State Examination Center (DİM).",
            "Demonstrates mastery in Advanced Mathematics, Physics, and analytical logic.",
            "Earned eligibility and placement for leading undergraduate engineering tracks."
          ]
        },
        {
          x: 1040, y: 240,
          icon: "🤖",
          title: "AI Academy (AZCON Holding)",
          category: "100% Full Scholarship",
          summary: "AI Engineering Program with full merit-based tuition coverage.",
          details: [
            "Selected for the competitive AI Engineering Program at AI Academy under AZCON Holding.",
            "Awarded a prestigious 100% Scholarship based on technical aptitude.",
            "Deep focus on deep learning frameworks, computer vision architectures, and practical machine learning pipelines."
          ]
        },
        {
          x: 1420, y: 320,
          icon: "💻",
          title: "Holberton School",
          category: "90% Merit Scholarship",
          summary: "Machine Learning Program intensive software curriculum.",
          details: [
            "Awarded 90% Scholarship for the Machine Learning specialization.",
            "Hands-on peer-to-peer engineering curriculum, Linux shell mastery, and robust software development practices."
          ]
        },
        {
          x: 1780, y: 260,
          icon: "🎓",
          title: "ADA University (2026–2030)",
          category: "BSc in Computer Science",
          summary: "Pursuing Bachelor of Science in Computer Science.",
          details: [
            "Bachelor of Science in Computer Science curriculum spanning 2026 to 2030.",
            "Core focus on data structures, algorithmic efficiency, systems programming, and artificial intelligence research."
          ]
        }
      ],
      portal: { x: 2360, y: 360, targetWorld: 1, label: "World 2: Skills Cavern →" }
    },

    /* WORLD 2: SKILLS WORLD */
    {
      id: 1,
      name: "Skills World",
      theme: "skills_cavern",
      worldWidth: 2700,
      skyColor: ["#050814", "#0a1128", "#0f1c3f", "#14224d"],
      platforms: [
        { x: 40, y: 440, w: 440, h: 180, type: "crystal_stone" },
        { x: 540, y: 370, w: 260, h: 230, type: "crystal_stone" },
        { x: 860, y: 310, w: 280, h: 290, type: "crystal_stone" },
        { x: 1200, y: 380, w: 320, h: 220, type: "crystal_stone" },
        { x: 1580, y: 320, w: 300, h: 280, type: "crystal_stone" },
        { x: 1940, y: 400, w: 240, h: 200, type: "crystal_stone" },
        { x: 2240, y: 440, w: 420, h: 180, type: "crystal_stone" }
      ],
      landmarks: [
        {
          x: 240, y: 370,
          icon: "⚡",
          title: "Programming Languages",
          category: "Core Tech Stack",
          summary: "Verified foundational engineering languages used across AI & systems.",
          details: [
            "• Python: Primary language for machine learning, deep neural nets, and data automation.",
            "• C++: High-performance computing, memory management, and competitive algorithmic programming.",
            "• SQL: Relational queries, schema design, subqueries, and database indexing."
          ]
        },
        {
          x: 670, y: 300,
          icon: "🧠",
          title: "Libraries & ML Frameworks",
          category: "Data Science & AI",
          summary: "Modern ecosystem for numerical operations and deep neural nets.",
          details: [
            "• NumPy & Pandas: Tabular wrangling, multidimensional tensor operations.",
            "• Matplotlib & Seaborn: Statistical distributions, exploratory data visualization.",
            "• Scikit-Learn: Supervised classifiers, regression algorithms, feature pipelines.",
            "• TensorFlow & Deep Learning: Neural architectures, training pipelines, loss tuning."
          ]
        },
        {
          x: 1000, y: 240,
          icon: "📐",
          title: "Computer Science & Mathematics",
          category: "Foundations",
          summary: "Theoretical bedrock underpinning modern algorithmic machine learning.",
          details: [
            "• Data Structures & Algorithms: Trees, graphs, dynamic programming, sorting & search.",
            "• Object-Oriented Programming (OOP): Clean encapsulation, inheritance, modular architecture.",
            "• Linear Algebra: Matrix decompositions, eigenvalues, vector spaces for ML.",
            "• Multivariable Calculus: Gradient descent optimization, chain rule, partial derivatives."
          ]
        },
        {
          x: 1360, y: 310,
          icon: "🛠️",
          title: "Tools, Shell & Databases",
          category: "Infrastructure",
          summary: "Development environments, version management, and storage engines.",
          details: [
            "• Git & GitHub: Collaborative branch workflows, code reviews, semantic versioning.",
            "• Linux Shell: CLI navigation, bash scripting, process management.",
            "• MySQL & MongoDB: Relational structures alongside document-based NoSQL stores."
          ]
        },
        {
          x: 1730, y: 250,
          icon: "🌐",
          title: "Languages & Communication",
          category: "Spoken Languages",
          summary: "Fluent bilingual technical and professional communication.",
          details: [
            "• Azerbaijani: Native proficiency.",
            "• English: B2 (Upper-Intermediate) technical documentation, research literacy, and global communication."
          ]
        }
      ],
      portal: { x: 2450, y: 360, targetWorld: 2, label: "World 3: Project Cliffs →" }
    },

    /* WORLD 3: PROJECT WORLD */
    {
      id: 2,
      name: "Project World",
      theme: "floating_cliffs",
      worldWidth: 2800,
      skyColor: ["#639bce", "#94bfe4", "#d3e3f5", "#fbece6"],
      platforms: [
        { x: 40, y: 440, w: 420, h: 180, type: "cliff_waterfall" },
        { x: 520, y: 360, w: 280, h: 240, type: "cliff_waterfall" },
        { x: 860, y: 300, w: 320, h: 300, type: "cliff_rainbow" },
        { x: 1240, y: 380, w: 300, h: 220, type: "cliff_waterfall" },
        { x: 1600, y: 310, w: 300, h: 290, type: "cliff_rainbow" },
        { x: 1960, y: 400, w: 260, h: 200, type: "cliff_waterfall" },
        { x: 2280, y: 440, w: 480, h: 180, type: "cliff_waterfall" }
      ],
      landmarks: [
        {
          x: 240, y: 370,
          icon: "🤟",
          title: "Azerbaijani Sign Language Recognition",
          category: "Computer Vision / AI Project",
          summary: "Experimental capstone classifying sign language hand gestures in real-time video.",
          details: [
            "• Technologies: Python, OpenCV, MediaPipe, Deep Learning.",
            "• Architecture: 21-point hand landmark tracking mapped into deep feature extractors.",
            "• Scope Note: Built as an experimental gesture prototype; accurately framed as ongoing research rather than a production-ready real-time translator."
          ]
        },
        {
          x: 660, y: 290,
          icon: "💳",
          title: "Loan Default Prediction",
          category: "Supervised Machine Learning",
          summary: "Predictive risk modeling on financial tabular data.",
          details: [
            "• Stack: Python, Pandas, NumPy, Scikit-Learn.",
            "• Workflow: Data cleaning, handling class imbalance, missing value imputation, and feature encoding.",
            "• Modeling: Supervised binary classification evaluated via ROC-AUC, precision-recall, and cross-validation."
          ]
        },
        {
          x: 1020, y: 230,
          icon: "🏡",
          title: "House Price Prediction",
          category: "Regression Modeling",
          summary: "Multivariable property valuation machine learning pipeline.",
          details: [
            "• Stack: Python, Scikit-Learn, Pandas, Matplotlib.",
            "• Techniques: Regularized regression models (Ridge/Lasso), outlier elimination, and correlated feature reduction."
          ]
        },
        {
          x: 1390, y: 310,
          icon: "📊",
          title: "Data Analysis & Visualization",
          category: "Exploratory Data Analysis",
          summary: "Comprehensive statistical insights leveraging the Python data ecosystem.",
          details: [
            "• Stack: Pandas, Matplotlib, Seaborn.",
            "• Extracted hidden trends, hypothesis distributions, and presented clear visual storytelling dashboards."
          ]
        },
        {
          x: 1750, y: 240,
          icon: "🔌",
          title: "SITE 1101 Coursework",
          category: "Hardware & Robotics",
          summary: "Logic gates engineering and introductory computer science coursework.",
          details: [
            "• Logic Gates Project: Physical breadboard construction and demonstration of NOT, AND, OR, and XOR circuits.",
            "• Hour of Code: Active coursework completed (documentation and media archive pending).",
            "• Robotics: Coursework completed (documentation and media archive pending)."
          ]
        }
      ],
      portal: { x: 2520, y: 360, targetWorld: 3, label: "World 4: Final Stadium ⚽ →" }
    },

    /* WORLD 4: FINAL STADIUM */
    {
      id: 3,
      name: "Final Stadium",
      theme: "stadium_arena",
      worldWidth: 960,
      skyColor: ["#020617", "#0a192f", "#112240", "#1e3a8a"],
      platforms: [
        { x: 20, y: 440, w: 920, h: 180, type: "stadium_turf" }
      ],
      landmarks: [],
      ball: {
        x: 440,
        y: 426,
        radius: 12,
        vx: 0,
        vy: 0,
        rot: 0,
        kicked: false,
        scored: false
      },
      goalPost: {
        x: 740,
        y: 330,
        w: 120,
        h: 110
      },
      keeper: {
        x: 720,
        y: 388,
        w: 26,
        h: 52,
        dived: false,
        diveY: 0
      }
    }
  ];

  /* =====================================================================
     4. PROTAGONIST CLASS: NURLAN (#10)
     ===================================================================== */
  class Protagonist {
    constructor() {
      this.w = 34;
      this.h = 62;
      this.reset(120, 360);
      this.speed = 0.59;
      this.maxSpeed = 4.08;
      this.jumpForce = -12.8;
    }

    reset(x, y) {
      this.x = x;
      this.y = y;
      this.prevY = y;
      this.vx = 0;
      this.vy = 0;
      this.facing = 1;
      this.isGrounded = false;
      this.state = 'idle';
      this.animTimer = 0;
      this.walkCycle = 0;
      this.kickAnim = 0;
    }

    update(currentWorld) {
      // Horizontal Movement
      if (keys.left) {
        this.vx -= this.speed;
        this.facing = -1;
      } else if (keys.right) {
        this.vx += this.speed;
        this.facing = 1;
      } else {
        this.vx *= FRICTION;
        if (Math.abs(this.vx) < 0.05) this.vx = 0;
      }

      // Clamp speed
      this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

      // Jump Handling - strictly upward action
      if (keys.jumpBuffered && this.isGrounded) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        keys.jumpBuffered = false;
        audio.playJump();
      }

      // Variable Jump Cut
      if (!keys.jump && this.vy < -4) {
        this.vy *= 0.65;
      }

      // Continuous Gravity
      this.vy += GRAVITY;
      if (this.vy > 14) this.vy = 14;

      // Position changes & platform collision
      this.x += this.vx;
      this.checkCollisionsX(currentWorld.platforms);

      // World 4 Goal Barrier: Prevent player from passing through or behind the goal
      if (currentWorld.id === 3 && currentWorld.goalPost) {
        const gp = currentWorld.goalPost;
        if (this.x + this.w > gp.x) {
          this.x = gp.x - this.w;
          this.vx = 0;
        }
      }

      this.prevY = this.y;
      this.y += this.vy;
      this.checkCollisionsY(currentWorld.platforms);

      // Fall reset protection: Respawn only when falling into the true abyss
      if (this.y > 750) {
        this.reset(100, 350);
      }

      // Animation state machine
      if (this.kickAnim > 0) {
        this.kickAnim -= 0.06;
        this.state = 'kicking';
      } else if (!this.isGrounded) {
        this.state = this.vy < 0 ? 'jumping' : 'falling';
      } else if (Math.abs(this.vx) > 0.4) {
        this.state = 'running';
        this.walkCycle += Math.abs(this.vx) * 0.065;
      } else {
        this.state = 'idle';
        this.animTimer += 0.05;
      }
    }

    checkCollisionsX(platforms) {
      for (const p of platforms) {
        if (
          this.x < p.x + p.w &&
          this.x + this.w > p.x &&
          this.y + this.h > p.y + 6 &&
          this.y < p.y + p.h
        ) {
          if (this.vx > 0) {
            this.x = p.x - this.w;
            this.vx = 0;
          } else if (this.vx < 0) {
            this.x = p.x + p.w;
            this.vx = 0;
          }
        }
      }
    }

    checkCollisionsY(platforms) {
      this.isGrounded = false;
      const playerFootPrev = this.prevY + this.h;
      const playerFootCurrent = this.y + this.h;
      const footMargin = 6;
      const footLeft = this.x + footMargin;
      const footRight = this.x + this.w - footMargin;

      for (const p of platforms) {
        if (footRight > p.x && footLeft < p.x + p.w) {
          if (this.vy >= 0) {
            if (playerFootPrev <= p.y + 6 && playerFootCurrent >= p.y) {
              this.y = p.y - this.h;
              this.vy = 0;
              this.isGrounded = true;
              break;
            }
          } else {
            if (this.prevY >= p.y + p.h - 6 && this.y <= p.y + p.h) {
              this.y = p.y + p.h;
              this.vy = 0;
            }
          }
        }
      }
    }

    draw(ctx, camX, camY) {
      ctx.save();
      const drawX = this.x - camX + this.w / 2;
      const drawY = this.y - camY + this.h;
      ctx.translate(drawX, drawY);
      ctx.scale(this.facing, 1);

      // Ground shadow
      ctx.beginPath();
      ctx.ellipse(0, -1, 16, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      let legL = 0, legR = 0, armL = 0, armR = 0, bob = 0;

      if (this.state === 'kicking') {
        legR = -1.1;
        legL = 0.2;
        armL = -0.8;
        armR = 0.8;
      } else if (this.state === 'running') {
        legL = Math.sin(this.walkCycle) * 0.65;
        legR = -Math.sin(this.walkCycle) * 0.65;
        armL = -Math.sin(this.walkCycle) * 0.65;
        armR = Math.sin(this.walkCycle) * 0.65;
        bob = Math.abs(Math.sin(this.walkCycle * 2)) * -2;
      } else if (this.state === 'jumping') {
        legL = 0.45;
        legR = -0.3;
        armL = -1.1;
        armR = -0.9;
      } else if (this.state === 'falling') {
        legL = -0.2;
        legR = 0.2;
        armL = -0.6;
        armR = 0.6;
      } else {
        bob = Math.sin(this.animTimer) * 1.5;
        legL = 0.05;
        legR = -0.05;
      }

      const hipY = -27 + bob;

      // 1. BACK LEG
      ctx.save();
      ctx.translate(-4, hipY);
      ctx.rotate(legL);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3.5, 0, 7, 12);
      ctx.fillStyle = '#831843';
      ctx.fillRect(-3, 12, 6, 11);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(-4, 21, 10, 5, 2);
      ctx.fill();
      ctx.restore();

      // 2. BACK ARM
      ctx.save();
      ctx.translate(2, hipY - 20);
      ctx.rotate(armL);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-3, 0, 6, 7);
      ctx.fillStyle = '#fbd5b5';
      ctx.fillRect(-2.5, 7, 5, 12);
      ctx.restore();

      // 3. TORSO (Blaugrana Striped Jersey)
      ctx.save();
      ctx.translate(0, hipY);

      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.roundRect(-9, -6, 18, 10, [0, 0, 3, 3]);
      ctx.fill();

      const jW = 18, jH = 19, jTop = -23;
      ctx.fillStyle = '#831843';
      ctx.beginPath();
      ctx.roundRect(-jW / 2, jTop, jW, jH, [4, 4, 1, 1]);
      ctx.fill();

      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-jW / 2 + 3, jTop, 3.5, jH);
      ctx.fillRect(jW / 2 - 6.5, jTop, 3.5, jH);

      ctx.fillStyle = '#fde047';
      ctx.font = '900 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('10', 0, jTop + 14);
      ctx.restore();

      // 4. HEAD & HAIR
      ctx.save();
      ctx.translate(0, hipY - 25);
      ctx.fillStyle = '#e8b896';
      ctx.fillRect(-3, -2, 6, 4);
      ctx.fillStyle = '#fbd5b5';
      ctx.beginPath();
      ctx.arc(0, -9, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2.5, -9.5, 2, 2.5);
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(0, -11, 8.8, Math.PI, Math.PI * 2);
      ctx.lineTo(8.5, -9);
      ctx.lineTo(5, -6);
      ctx.lineTo(-7, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-8.5, -12, 17, 2.5);
      ctx.restore();

      // 5. FRONT LEG
      ctx.save();
      ctx.translate(3, hipY);
      ctx.rotate(legR);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-3.5, 0, 7.5, 12);
      ctx.fillStyle = '#9f1239';
      ctx.fillRect(-3, 12, 6.5, 11);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-3, 14, 6.5, 1.8);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(-3.5, 21, 11, 5, 2);
      ctx.fill();
      ctx.restore();

      // 6. FRONT ARM
      ctx.save();
      ctx.translate(-2, hipY - 20);
      ctx.rotate(armR);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-3, 0, 6, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-3.2, 5.5, 6.4, 3.5);
      ctx.fillStyle = '#fbd5b5';
      ctx.fillRect(-2.5, 9, 5, 11);
      ctx.restore();

      ctx.restore();
    }
  }

  /* =====================================================================
     5. CAMERA & SCENERY RENDERER
     ===================================================================== */
  const player = new Protagonist();
  let cameraX = 0;
  let cameraY = 0;
  let victoryParticles = [];

  function renderWorldEnvironment(w) {
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    w.skyColor.forEach((col, i) => {
      grad.addColorStop(i / (w.skyColor.length - 1), col);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (w.theme === 'academic') {
      const sunX = w.sunPos.x - cameraX * 0.15;
      const sunY = w.sunPos.y;

      const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 120);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.7)');
      sunGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.25)');
      sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(40, 25, 55, 0.75)';
      for (let i = 0; i < 6; i++) {
        const bx = 100 + i * 400 - cameraX * 0.2;
        ctx.beginPath();
        ctx.moveTo(bx, 420);
        ctx.lineTo(bx + 40, 210);
        ctx.lineTo(bx + 60, 180);
        ctx.lineTo(bx + 80, 210);
        ctx.lineTo(bx + 120, 420);
        ctx.fill();
      }
    } else if (w.theme === 'skills_cavern') {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        const cx = 80 + i * 360 - cameraX * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 25, 80);
        ctx.lineTo(cx + 40, 0);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      for (let j = 0; j < 5; j++) {
        const nx = 150 + j * 450 - cameraX * 0.4;
        ctx.beginPath();
        ctx.arc(nx, 140 + Math.sin(Date.now() * 0.002 + j) * 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (w.theme === 'floating_cliffs') {
      const rbX = 400 - cameraX * 0.25;
      ctx.save();
      ctx.lineWidth = 12;
      const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'];
      colors.forEach((c, idx) => {
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(rbX + 500, 360, 260 + idx * 10, Math.PI, Math.PI * 1.85);
        ctx.stroke();
      });
      ctx.restore();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let c = 0; c < 8; c++) {
        const cx = 50 + c * 320 - cameraX * 0.2;
        ctx.beginPath();
        ctx.arc(cx, 240, 45, 0, Math.PI * 2);
        ctx.arc(cx + 35, 225, 55, 0, Math.PI * 2);
        ctx.arc(cx + 70, 240, 40, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (w.theme === 'stadium_arena') {
      const centerX = 960 - cameraX * 0.3;

      const beamGrad = ctx.createRadialGradient(centerX, 40, 10, centerX, 40, 400);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      beamGrad.addColorStop(0.3, 'rgba(253, 224, 71, 0.45)');
      beamGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.08)');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beamGrad;

      for (let r = -4; r <= 4; r++) {
        ctx.beginPath();
        ctx.moveTo(centerX, 30);
        ctx.lineTo(centerX + r * 140 - 40, 440);
        ctx.lineTo(centerX + r * 140 + 40, 440);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 280, VIEW_W, 160);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 30; col++) {
          const dotX = col * 35 + ((row % 2) * 15);
          const dotY = 300 + row * 24;
          ctx.fillStyle = (col + row) % 3 === 0 ? '#38bdf8' : ((col + row) % 2 === 0 ? '#fbbf24' : '#e2e8f0');
          ctx.globalAlpha = 0.35;
          ctx.fillRect(dotX, dotY, 4, 4);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Platforms
    w.platforms.forEach(p => {
      const sx = p.x - cameraX;
      const sy = p.y - cameraY;
      if (sx + p.w < -60 || sx > VIEW_W + 60) return;

      ctx.save();
      if (p.type === 'ruin_moss' || p.type === 'ruin_tower') {
        const rockGrad = ctx.createLinearGradient(sx, sy, sx, sy + p.h);
        rockGrad.addColorStop(0, '#334155');
        rockGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.roundRect(sx, sy, p.w, p.h, 6);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.roundRect(sx, sy, p.w, 14, [6, 6, 0, 0]);
        ctx.fill();

        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        for (let vx = sx + 25; vx < sx + p.w - 20; vx += 40) {
          ctx.beginPath();
          ctx.moveTo(vx, sy + 14);
          ctx.quadraticCurveTo(vx + 6, sy + 32, vx - 2, sy + 44);
          ctx.stroke();
        }
      } else if (p.type === 'crystal_stone') {
        const stoneGrad = ctx.createLinearGradient(sx, sy, sx, sy + p.h);
        stoneGrad.addColorStop(0, '#1e1b4b');
        stoneGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = stoneGrad;
        ctx.beginPath();
        ctx.roundRect(sx, sy, p.w, p.h, 4);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(sx, sy, p.w, 4);

        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(sx + 20, sy);
        ctx.lineTo(sx + 26, sy - 14);
        ctx.lineTo(sx + 32, sy);
        ctx.fill();
      } else if (p.type === 'cliff_waterfall' || p.type === 'cliff_rainbow') {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(sx, sy, p.w, p.h, 6);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.fillRect(sx, sy, p.w, 12);

        if (p.type === 'cliff_waterfall') {
          const wfGrad = ctx.createLinearGradient(sx + 50, sy, sx + 50, sy + p.h);
          wfGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
          wfGrad.addColorStop(1, 'rgba(125, 211, 252, 0.2)');
          ctx.fillStyle = wfGrad;
          ctx.fillRect(sx + 45, sy + 10, 22, p.h + 20);
        }
      } else if (p.type === 'stadium_turf') {
        const turfGrad = ctx.createLinearGradient(sx, sy, sx, sy + 30);
        turfGrad.addColorStop(0, '#16a34a');
        turfGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = turfGrad;
        ctx.fillRect(sx, sy, p.w, p.h);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        for (let m = sx; m < sx + p.w; m += 90) {
          ctx.fillRect(m, sy, 45, p.h);
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx, sy + 3);
        ctx.lineTo(sx + p.w, sy + 3);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Landmarks
    w.landmarks.forEach(lm => {
      const lx = lm.x - cameraX;
      const ly = lm.y - cameraY;

      ctx.save();
      ctx.translate(lx, ly);

      const floatY = Math.sin(Date.now() * 0.003 + lm.x) * 4;

      const halo = ctx.createRadialGradient(0, floatY, 4, 0, floatY, 32);
      halo.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
      halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, floatY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-22, 10, 44, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lm.icon, 0, floatY);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(-60, floatY - 32, 120, 18, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(lm.title.substring(0, 18), 0, floatY - 20);

      ctx.restore();
    });

    // Portals
    if (w.portal) {
      const px = w.portal.x - cameraX;
      const py = w.portal.y - cameraY;

      ctx.save();
      ctx.translate(px, py);

      const time = Date.now() * 0.004;
      const pGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.5, '#38bdf8');
      pGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 42 + Math.sin(time) * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.strokeRect(-24, -42, 48, 84);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-75, -64, 150, 18, 6);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(w.portal.label, 0, -52);

      ctx.restore();
    }

    // Stadium Goal and Football (World 4 Only)
    if (w.id === 3) {
      renderStadiumGoal(w);
      renderGoalkeeper(w);
      renderFootball(w);
    }
  }

  function renderStadiumGoal(w) {
    const g = w.goalPost;
    const gx = g.x - cameraX;
    const gy = g.y - cameraY;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(gx, gy + g.h, g.w + 10, 6);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.strokeRect(gx + 20, gy + 10, g.w - 20, g.h - 10);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(gx, gy, g.w, g.h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let x = gx + 10; x < gx + g.w; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + 10, gy + g.h);
      ctx.stroke();
    }
    for (let y = gy + 10; y < gy + g.h; y += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + g.w, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(gx + g.w + 6, gy + g.h - 26);
    ctx.lineTo(gx + g.w + 20, gy + g.h - 18);
    ctx.lineTo(gx + g.w + 6, gy + g.h - 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function renderGoalkeeper(w) {
    const k = w.keeper;
    const kx = k.x - cameraX;
    let ky = k.y - cameraY;

    ctx.save();
    const time = Date.now() * 0.005;
    const idleBob = Math.sin(time) * 1.5;

    if (k.dived) {
      ctx.translate(kx + 12, ky + 25);
      ctx.rotate(0.65);
      ctx.translate(-(kx + 12), -(ky + 25));
      ky += 8;
    } else {
      ky += idleBob;
    }

    ctx.beginPath();
    ctx.ellipse(kx + 13, ky + 51, 14, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.fillRect(kx + 4, ky + 14, 18, 20);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(kx + 5, ky + 34, 16, 10);

    ctx.fillStyle = '#eab308';
    ctx.fillRect(kx + 6, ky + 44, 5, 7);
    ctx.fillRect(kx + 15, ky + 44, 5, 7);

    ctx.fillStyle = '#000000';
    ctx.fillRect(kx + 5, ky + 49, 7, 3);
    ctx.fillRect(kx + 14, ky + 49, 7, 3);

    ctx.fillStyle = '#fbd5b5';
    ctx.beginPath();
    ctx.arc(kx + 13, ky + 7, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.fillRect(kx - 1, ky + 20, 6, 7);
    ctx.fillRect(kx + 21, ky + 20, 6, 7);

    ctx.restore();
  }

  function renderFootball(w) {
    const b = w.ball;
    const bx = b.x - cameraX;
    const by = b.y - cameraY;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(b.rot);

    ctx.beginPath();
    ctx.ellipse(0, b.radius - 1, b.radius * 0.9, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
      const ang = (i * Math.PI * 2) / 5;
      const px = Math.cos(ang) * (b.radius * 0.68);
      const py = Math.sin(ang) * (b.radius * 0.68);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* =====================================================================
     6. INTERACTION & OBJECTIVE SYSTEM
     ===================================================================== */
  let nearbyInteractable = null;

  function checkProximityAndInteractions() {
    const currentWorld = WORLDS[currentWorldIndex];
    nearbyInteractable = null;
    const pCenter = { x: player.x + player.w / 2, y: player.y + player.h / 2 };

    for (const lm of currentWorld.landmarks) {
      const dist = Math.hypot(pCenter.x - lm.x, pCenter.y - lm.y);
      if (dist < 64) {
        nearbyInteractable = { type: 'landmark', data: lm };
        break;
      }
    }

    if (!nearbyInteractable && currentWorld.portal) {
      const p = currentWorld.portal;
      const dist = Math.hypot(pCenter.x - p.x, pCenter.y - p.y);
      if (dist < 56) {
        nearbyInteractable = { type: 'portal', targetWorld: p.targetWorld, label: p.label };
      }
    }

    if (!nearbyInteractable && currentWorld.id === 3 && !currentWorld.ball.kicked) {
      const ball = currentWorld.ball;
      if (!ball.kicked) {
        ball.x = player.x + (player.facing === 1 ? 38 : -22);
        ball.y = 428;
      }
      const dist = Math.hypot(pCenter.x - ball.x, pCenter.y - ball.y);
      if (dist < 70) {
        nearbyInteractable = { type: 'ball', data: ball };
      }
    }

    const promptEl = document.getElementById('interactPrompt');
    const textEl = document.getElementById('interactText');

    if (promptEl && textEl) {
      if (nearbyInteractable) {
        promptEl.classList.add('prompt-visible');
        if (nearbyInteractable.type === 'landmark') {
          textEl.textContent = `[E] Inspect ${nearbyInteractable.data.title}`;
        } else if (nearbyInteractable.type === 'portal') {
          textEl.textContent = `[E] Enter ${nearbyInteractable.label}`;
        } else if (nearbyInteractable.type === 'ball') {
          textEl.textContent = `Press E or SPACE to Shoot! ⚽`;
        }
      } else {
        promptEl.classList.remove('prompt-visible');
      }
    }
  }

  function triggerInteraction() {
    audio.init();
    if (!nearbyInteractable) return;

    if (nearbyInteractable.type === 'landmark') {
      openInfoModal(nearbyInteractable.data);
    } else if (nearbyInteractable.type === 'portal') {
      audio.playPortal();
      switchWorld(nearbyInteractable.targetWorld);
    } else if (nearbyInteractable.type === 'ball') {
      shootFootball();
    }
  }

  function shootFootball() {
    const currentWorld = WORLDS[3];
    const ball = currentWorld.ball;
    if (ball.kicked) return;

    ball.kicked = true;
    currentWorld.keeper.dived = true;
    player.kickAnim = 1.0;
    audio.playKick();

    ball.x = player.x + (player.facing === 1 ? 32 : -16);
    ball.y = player.y + player.h - 14;
    ball.vx = 10.2;
    ball.vy = -7.2;
  }

  function updateFootballPhysics() {
    const currentWorld = WORLDS[currentWorldIndex];
    if (currentWorld.id !== 3) return;

    const ball = currentWorld.ball;
    if (!ball.kicked) return;

    ball.vy += 0.38;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.rot += ball.vx * 0.08;

    if (ball.y >= 428 && !ball.scored) {
      ball.y = 428;
      ball.vy = -ball.vy * 0.45;
      ball.vx *= 0.88;
    }

    const g = currentWorld.goalPost;
    if (!ball.scored && ball.x > (g.x + 12) && ball.y > g.y && ball.y < (g.y + g.h)) {
      ball.scored = true;
      ball.vx = 1.2;
      ball.vy = 2.0;
      celebrateGoal();
    }

    if (ball.x > g.x + g.w - 10) {
      ball.x = g.x + g.w - 10;
      ball.vx = 0;
    }
    if (ball.y > 428) {
      ball.y = 428;
      ball.vy = 0;
    }
  }

  function celebrateGoal() {
    audio.playGoalCrowd();

    victoryParticles = [];
    for (let i = 0; i < 110; i++) {
      victoryParticles.push({
        x: 790,
        y: 360,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 3,
        color: ['#fbbf24', '#38bdf8', '#ef4444', '#10b981', '#f43f5e', '#a855f7'][Math.floor(Math.random() * 6)],
        size: Math.random() * 6 + 3,
        life: 140
      });
    }

    setTimeout(() => {
      const modal = document.getElementById('victoryModal');
      if (modal) modal.classList.add('modal-active');
    }, 950);
  }

  function switchWorld(targetIndex) {
    if (targetIndex < 0 || targetIndex >= WORLDS.length) return;
    currentWorldIndex = targetIndex;
    player.reset(120, 360);

    if (currentWorldIndex === 3) {
      WORLDS[3].ball.kicked = false;
      WORLDS[3].ball.scored = false;
      WORLDS[3].ball.x = 160;
      WORLDS[3].ball.y = 428;
      WORLDS[3].ball.vx = 0;
      WORLDS[3].ball.vy = 0;
      WORLDS[3].keeper.dived = false;
    }

    const hudLoc = document.getElementById('hudLocation');
    if (hudLoc) {
      hudLoc.textContent = `World ${WORLDS[targetIndex].id + 1}: ${WORLDS[targetIndex].name}`;
    }

    for (let i = 0; i < 4; i++) {
      const tab = document.getElementById(`wTab${i}`);
      if (tab) {
        if (i === targetIndex) {
          tab.classList.add('active-world-tab');
        } else {
          tab.classList.remove('active-world-tab');
        }
      }
    }
  }

  /* =====================================================================
     7. MODALS & UI HANDLERS
     ===================================================================== */
  function openInfoModal(data) {
    audio.playInteract();
    const modalIconBox = document.getElementById('modalIconBox');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const infoModal = document.getElementById('infoModal');

    if (modalIconBox) modalIconBox.textContent = data.icon;
    if (modalCategory) modalCategory.textContent = data.category;
    if (modalTitle) modalTitle.textContent = data.title;

    let html = `<p class="modal-summary-text">${data.summary}</p>`;
    if (data.details && data.details.length) {
      html += `<div class="modal-details-box">`;
      data.details.forEach(line => {
        html += `<div class="modal-detail-line">${line}</div>`;
      });
      html += `</div>`;
    }

    if (modalContent) modalContent.innerHTML = html;
    if (infoModal) infoModal.classList.add('modal-active');
  }

  function closeInfoModal() {
    const infoModal = document.getElementById('infoModal');
    if (infoModal) infoModal.classList.remove('modal-active');
  }

  function openCvViewer() {
    audio.init();
    audio.playInteract();
    const cvModal = document.getElementById('cvModal');
    if (cvModal) cvModal.classList.add('modal-active');
  }

  function closeCvViewer() {
    const cvModal = document.getElementById('cvModal');
    if (cvModal) cvModal.classList.remove('modal-active');
  }

  function openContactModal() {
    openInfoModal({
      icon: "✉️",
      category: "Direct Contact",
      title: "Get in Touch with Nurlan",
      summary: "Available for AI, Machine Learning, and Computer Science opportunities.",
      details: [
        "• Institutional Email: naslanzada27244@ada.edu.az",
        "• ADA University, School of IT & Engineering",
        "• Baku, Azerbaijan",
        "• Verified Profiles: GitHub (github.com/NurlanAslnzade) & LinkedIn (linkedin.com/in/nurlanaslanzada)"
      ]
    });
  }

  /* =====================================================================
     8. 360 HZ COMPATIBLE FIXED TIMESTEP SIMULATION LOOP
     ===================================================================== */
  const FIXED_STEP = 1000 / 60; // 16.667ms per physics tick (target 60 Hz)
  let lastTime = 0;
  let accumulator = 0;

  function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    let dt = currentTime - lastTime;
    lastTime = currentTime;

    // Safety clamp to prevent spiral of death during background tab throttling
    if (dt > 100) dt = 100;
    accumulator += dt;

    const currentWorld = WORLDS[currentWorldIndex];

    // Physics runs at exactly 60 ticks/sec regardless of 60Hz, 144Hz, 240Hz, or 360Hz monitors
    while (accumulator >= FIXED_STEP) {
      player.update(currentWorld);

      const lead = player.facing * 50;
      const targetCamX = (player.x + lead) - VIEW_W / 2;
      const targetCamY = player.y - VIEW_H * 0.58;
      cameraX += (targetCamX - cameraX) * 0.08;
      cameraY += (targetCamY - cameraY) * 0.08;

      cameraX = Math.max(0, Math.min(currentWorld.worldWidth - VIEW_W, cameraX));
      cameraY = Math.max(-50, Math.min(200, cameraY));

      checkProximityAndInteractions();
      updateFootballPhysics();

      for (let i = victoryParticles.length - 1; i >= 0; i--) {
        const p = victoryParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life--;
        if (p.life <= 0) victoryParticles.splice(i, 1);
      }

      accumulator -= FIXED_STEP;
    }

    // Rendering runs smoothly on every native refresh frame
    if (ctx) {
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);
      renderWorldEnvironment(currentWorld);
      player.draw(ctx, cameraX, cameraY);

      for (let p of victoryParticles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - cameraX, p.y - cameraY, p.size, p.size);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  /* =====================================================================
     9. INPUT LISTENERS (Keyboard & Touch)
     ===================================================================== */
  function setupInput() {
    window.addEventListener('keydown', (e) => {
      audio.init();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;

      if (e.code === 'Space') {
        if (currentWorldIndex === 3 && nearbyInteractable && nearbyInteractable.type === 'ball' && !WORLDS[3].ball.kicked) {
          triggerInteraction();
          e.preventDefault();
          return;
        }
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!keys.jump) keys.jumpBuffered = true;
        keys.jump = true;
        e.preventDefault();
      }
      if (e.code === 'KeyE') {
        triggerInteraction();
      }
      if (e.code === 'Escape') {
        closeInfoModal();
        closeCvViewer();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        keys.jump = false;
        keys.jumpBuffered = false;
      }
    });

    const bindTouch = (id, key, isAction) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        audio.init();
        if (isAction) {
          triggerInteraction();
        } else if (key === 'jump') {
          if (currentWorldIndex === 3 && nearbyInteractable && nearbyInteractable.type === 'ball' && !WORLDS[3].ball.kicked) {
            triggerInteraction();
            return;
          }
          keys.jumpBuffered = true;
          keys.jump = true;
        } else {
          keys[key] = true;
        }
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (key === 'jump') {
          keys.jump = false;
          keys.jumpBuffered = false;
        } else if (!isAction) {
          keys[key] = false;
        }
      });
    };

    bindTouch('btnLeft', 'left', false);
    bindTouch('btnRight', 'right', false);
    bindTouch('btnJump', 'jump', false);
    bindTouch('btnAction', 'action', true);
  }

  function setupUI() {
    // World Switch Buttons
    for (let i = 0; i < 4; i++) {
      const tab = document.getElementById(`wTab${i}`);
      if (tab) {
        tab.addEventListener('click', () => switchWorld(i));
      }
    }

    // Modal close triggers
    const closeInfoBtn = document.getElementById('closeInfoBtn');
    if (closeInfoBtn) closeInfoBtn.addEventListener('click', closeInfoModal);

    const modalActionBtn = document.getElementById('modalActionBtn');
    if (modalActionBtn) modalActionBtn.addEventListener('click', closeInfoModal);

    // CV Viewer Triggers
    const openCvBtn = document.getElementById('openCvBtn');
    if (openCvBtn) openCvBtn.addEventListener('click', openCvViewer);

    const closeCvBtn = document.getElementById('closeCvBtn');
    if (closeCvBtn) closeCvBtn.addEventListener('click', closeCvViewer);

    const closeCvBtnFooter = document.getElementById('closeCvBtnFooter');
    if (closeCvBtnFooter) closeCvBtnFooter.addEventListener('click', closeCvViewer);

    // Scoreboard View CV Button: switches directly to conventional resume view
    const victoryViewCvBtn = document.getElementById('victoryViewCvBtn');
    if (victoryViewCvBtn) {
      victoryViewCvBtn.addEventListener('click', () => {
        const victoryModal = document.getElementById('victoryModal');
        if (victoryModal) victoryModal.classList.remove('modal-active');
        const conventionalBtn = document.querySelector('.mode-toggle-btn[data-mode="conventional"]');
        if (conventionalBtn) conventionalBtn.click();
      });
    }

    const victoryContactBtn = document.getElementById('victoryContactBtn');
    if (victoryContactBtn) victoryContactBtn.addEventListener('click', openContactModal);

    // Scoreboard Replay Button
    const victoryReplayBtn = document.getElementById('victoryReplayBtn');
    if (victoryReplayBtn) {
      victoryReplayBtn.addEventListener('click', () => {
        const victoryModal = document.getElementById('victoryModal');
        if (victoryModal) victoryModal.classList.remove('modal-active');
        switchWorld(0);
      });
    }

    // Restart World Button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        player.reset(120, 360);
        if (currentWorldIndex === 3) {
          WORLDS[3].ball.kicked = false;
          WORLDS[3].ball.scored = false;
          WORLDS[3].ball.x = 440;
          WORLDS[3].ball.y = 426;
          WORLDS[3].keeper.dived = false;
        }
      });
    }

    // Audio Toggle Button
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    if (soundToggle && soundIcon) {
      soundToggle.addEventListener('click', () => {
        audio.init();
        audio.muted = !audio.muted;
        soundIcon.textContent = audio.muted ? '🔇' : '🔊';
      });
    }
  }

  // Export game control functions to window for tests & external switches
  window.gameEngine = {
    audio,
    player,
    keys,
    WORLDS,
    get currentWorldIndex() { return currentWorldIndex; },
    switchWorld,
    shootFootball,
    celebrateGoal,
    openInfoModal,
    closeInfoModal,
    openCvViewer,
    closeCvViewer,
    openContactModal
  };

  // Initialization
  function init() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    setupInput();
    setupUI();
    requestAnimationFrame((t) => gameLoop(t));
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
