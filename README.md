*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

# ⚡ Study Helper: The Distraction-Free Focus & Active Recall Companion

## What I Built

I built **Study Helper**—an aesthetic, all-in-one web application designed to help students, developers, and lifelong learners achieve deep work and master complex subjects through active recall.

### 👥 The Friend I Built It For & The Problem
I built this for my friend **Alex**, who is currently preparing for technical software engineering interviews and university exams. 

Whenever Alex studies, their browser ends up crammed with 20+ tabs:
1. One tab for a Pomodoro timer.
2. A paywalled flashcard website (e.g., Quizlet/Anki) filled with banner ads and subscription popups.
3. A YouTube tab streaming lo-fi study music or rain sounds—which frequently interrupted focus with loud advertisements.
4. A separate quiz website to test retention.

This friction shattered their concentration, drained laptop battery, and turned study sessions into an endless cycle of tab-switching.

**Study Helper solves this completely by consolidating everything into a single, cohesive, zero-distraction study sanctuary:**

- ⏱️ **Customizable Pomodoro Clock**: Choose from presets (*Classic 25/5*, *Deep Work 50/10*, *Sprint 15/3*) or customize your own session times. Features an SVG countdown progress ring, study intention goal tracker, and crystal bell chimes.
- 🗂️ **Interactive 3D Flashcards**: Flip cards with authentic 3D perspective animations (`rotateY(180deg)`), reveal hints, and track mastery ("Need Practice" vs "Mastered") with live visual progress bars.
- 🧠 **Interactive Quiz Arena**: Auto-generates a 4-choice multiple-choice quiz directly from any flashcard deck on the fly (or lets you build custom quizzes), complete with instant feedback, explanations, grading tiers (S/A/B/C), and celebratory confetti.
- 🎧 **Built-in Procedural Ambient Soundscapes**: 100% offline audio synthesis generated right in the browser using the Web Audio API (**Cozy Rain**, **White Noise**, **Deep Pink Noise**, and **432Hz Alpha Focus Drone**)—no external MP3 downloads, no ads, and zero buffering.
- 🤖 **Interactive Study Buddy ("Nova")**: A supportive floating companion that provides contextual encouragement, study tips, and cheers you on when you complete pomodoros or ace quizzes.
- 🌓 **Aesthetic & Accessible**: Sleek dark/light themes with glassmorphism surfaces, responsive layout, keyboard shortcuts (`Space` to flip, `Arrow keys` to navigate), and local-first data persistence with JSON export/import backup.

---

## Demo

- 🌐 **Live Demo**: [https://ashishranjanpandey.github.io/StuddyHelper/](https://ashishranjanpandey.github.io/StuddyHelper/)
- 🖥️ **Local Preview**: Simply open `index.html` in any browser, or run `python -m http.server 8080`.

### 📸 Highlights & Screenshots
*(You can embed screenshots or GIFs of the app here)*

- **Pomodoro Clock in Dark Mode**: Glowing SVG progress ring with active goal input and session stats.
- **3D Flip Flashcards**: Smooth card flip animations with hint toggles and mastery progress bars.
- **Quiz Arena**: Multiple-choice recall test with real-time feedback and results grading.
- **Study Buddy & Soundscape Player**: Procedural rain and alpha focus tones with dynamic cheer bubble.

---

## Code

The complete source code is open source and available on GitHub:

🔗 **GitHub Repository**: [https://github.com/AshishRanjanPandey/StuddyHelper](https://github.com/AshishRanjanPandey/StuddyHelper)

### Project Architecture

```
StuddyHelper/
├── index.html         # Semantic HTML5 layout and accessible modal dialogs
├── css/
│   └── style.css      # CSS custom properties, glassmorphism, responsive layout & 3D transforms
├── js/
│   ├── audio.js       # Web Audio API synthesizer for SFX and procedural ambient audio
│   ├── storage.js     # LocalStorage state management, starter decks, quizzes, and JSON backup
│   ├── timer.js       # Pomodoro clock engine, SVG progress ring, and streak tracking
│   ├── flashcards.js  # 3D flashcard interaction, deck CRUD, and mastery tracker
│   ├── quiz.js        # Quiz arena runner, auto-quiz generator, and custom quiz builder
│   ├── buddy.js       # Study Buddy companion widget & ambient sound controller
│   └── app.js         # Navigation, keyboard shortcuts, theme toggle, and toast alerts
└── README.md          # Project documentation and user guide
```

---

## How I Built It

Study Helper was engineered with a strict focus on **performance, resilience, zero bloat, and delightful UX**:

1. **Pure Vanilla Web Stack**:
   - **HTML5 & Vanilla CSS**: Crafted without heavy UI frameworks or external dependencies. Utilizes CSS variables for dynamic theming, `backdrop-filter: blur(16px)` for sleek glassmorphism, and CSS 3D transforms (`transform-style: preserve-3d; perspective: 1200px`) for physical card flips.
   - **Modular ES6+ JavaScript**: Clean separation of concerns with dedicated modules for audio synthesis, timer mechanics, deck state, quiz generation, and UI coordination.

2. **Procedural Web Audio API Synthesis**:
   - Instead of shipping bulky audio files that fail without a fast internet connection, Study Helper synthesizes audio on the fly:
     - **Cozy Rain**: Modulated biquad filter applied to procedural pink noise buffers with gentle low-frequency oscillation.
     - **432Hz Alpha Focus**: Dual-oscillator sine wave with a 10Hz binaural beat offset to promote flow state.
     - **Chimes & SFX**: Multi-oscillator harmonics with exponential volume decay.

3. **Dynamic Quiz Engine**:
   - Built an algorithm that parses any flashcard deck, extracts definitions, and generates contextual multiple-choice distractors on the fly so users can switch from passive review to active recall in one click.

4. **Agentic AI Coding Workflow**:
   - Built in collaboration with Google Antigravity / AI agentic pair programming tools to design the state architecture, fine-tune the procedural audio equations, and iterate rapidly on user feedback and accessibility.

---

## Why Does Open Innovation Matter?

Open innovation is essential because **learning tools should belong to everyone, not locked behind subscriptions and algorithms designed to maximize screen time.**

1. **Local-First & Privacy-Respecting**:
   Most modern study apps harvest user telemetry, require mandatory account sign-ups, and hold your study decks hostage behind paywalls. Study Helper stores everything locally in `localStorage`, offers instantaneous JSON import/export, and never tracks user data.

2. **Offline Accessibility**:
   Students in areas with limited or intermittent internet connectivity shouldn't be cut off from quality study tools. Because Study Helper relies on procedural Web Audio synthesis and self-contained web assets, it operates 100% offline once loaded.

3. **Hackable & Extensible**:
   Because the project is open source and framework-free, any student or developer can easily clone the repository, craft custom decks for their specific curriculum, add new ambient sounds, or integrate spaced repetition algorithms.

---

## My Agent Session

This project was developed through an interactive agentic pair-programming session using the Antigravity AI coding agent. The agent handled scaffold generation, procedural audio math, responsive styling, and comprehensive validation.

*(Link your DevRelay session or agent trajectory log here)*

---

## Prize Categories

- **Build for a Friend**
- **Best UI/UX & Aesthetics**
- **Most Useful Everyday Tool**

---

*Thank you to the DEV community and Hacktoberfest for inspiring open-source solutions that solve real everyday problems!*
