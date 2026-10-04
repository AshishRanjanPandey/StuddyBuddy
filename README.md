# ⚡ StudyBuddy App

A modern, aesthetic, all-in-one study assistant featuring a **Customizable Pomodoro Clock**, **Interactive 3D Flashcards**, and a **Quiz Arena** with active recall feedback and procedural ambient focus soundscapes.

---

## 🌟 Key Features

### 1. ⏱️ Customizable Pomodoro Clock
- **Multiple Modes**: Focus Session, Short Break, and Long Break with smooth circular SVG progress countdown ring.
- **Customizable Intervals**: Adjust focus time, short break, and long break durations to match your study rhythm (e.g., Classic 25/5, Deep Work 50/10, or Sprint 15/3).
- **Auto-Cycle Option**: Automatically transition into breaks when sessions conclude.
- **Current Goal Tracker**: Set your specific study intention for the session.
- **Crystal Audio Chime**: Harmonic bell sound when timer finishes using the Web Audio API.
- **Session & Streak Tracker**: Track completed pomodoro counts, total focus minutes, and daily streaks.

### 2. 🗂️ Interactive 3D Flashcards
- **Multiple Decks**: Pre-loaded with starter decks (*Modern Web Dev*, *Biology Essentials*, *World Capitals & Geography*) or create your own custom decks.
- **3D Card Flip**: Realistic 3D rotation (`rotateY(180deg)`) on click, button press, or `Spacebar`.
- **Card Hint System**: Reveal hints without exposing the answer.
- **Mastery Tracking**: Mark cards as **"Need Practice"** or **"Mastered"** to see live progress bars and mastery percentage.
- **Deck Manager**: Search, add, edit, shuffle, or delete flashcards and decks.
- **Quick Quiz from Deck**: Automatically generate a 4-choice multiple choice quiz from any deck!

### 3. 🧠 Interactive Quiz Arena
- **Auto-Quiz from Flashcards**: Generates a 4-option multiple-choice quiz directly from any flashcard deck, pulling distractors automatically.
- **Custom Quiz Builder**: Create custom quizzes with custom question prompts, 4 options, correct answer selection, and explanations.
- **Instant Feedback**: Color-coded feedback (emerald green for correct, rose red for incorrect) with explanations and audio cues.
- **Results & Celebration**: S/A/B/C tier grading, celebratory confetti bursts, and detailed question-by-question review.

### 4. 🎧 Built-in Ambient Soundscapes (Zero External Files!)
- Procedurally generated soundscapes via the Web Audio API:
  - 🌧️ **Cozy Rain** (Filtered pink noise with gentle modulation)
  - 💨 **White Noise** (Soft broadband focus mask)
  - 🌊 **Deep Pink Noise** (1/f natural noise)
  - 🧘 **432Hz Alpha Focus Drone** (Binaural beats for deep study state)
- Dedicated volume control and mute toggle.

### 5. 🤖 Study Buddy Companion ("Nova")
- Cute, interactive avatar with animated facial expressions.
- Dynamic study tips, motivation, and congratulations on session completion or quiz achievements.
- Click the avatar any time for a quick motivation boost!

### 6. 🌓 Modern Aesthetics & Themes
- Dark Mode (Obsidian & Electric Violet) & Light Mode with instant toggle.
- Glassmorphism surfaces (`backdrop-filter: blur(16px)`).
- Complete LocalStorage persistence and **JSON Export / Import** backup support.

---

## ⌨️ Keyboard Shortcuts (Flashcards)

| Key | Action |
| --- | --- |
| `Space` | Flip Flashcard |
| `→` (Right Arrow) | Next Card |
| `←` (Left Arrow) | Previous Card |
| `1` | Mark as "Need Practice" |
| `2` | Mark as "Mastered" |
| `Esc` | Close any open modal |

---

## 🚀 How to Run Locally

### Option 1: Double-Click
Simply open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Python or Node)
```bash
# Using Python
python -m http.server 8080

# Using Node (npx)
npx serve
```
Then navigate to `http://localhost:8080` in your web browser.

---

## 📁 File Structure

```
Challenge1_Ashish/
├── index.html         # Semantic HTML5 layout and modal dialogs
├── css/
│   └── style.css      # Design system, glassmorphism, responsive styles & 3D transforms
├── js/
│   ├── audio.js       # Web Audio API synthesizer for SFX and ambient soundscapes
│   ├── storage.js     # LocalStorage state, starter decks, quizzes, and JSON backup
│   ├── timer.js       # Pomodoro clock logic, SVG progress ring, and stats
│   ├── flashcards.js  # 3D flashcard interaction, deck CRUD, and mastery tracker
│   ├── quiz.js        # Quiz arena runner, auto-quiz generator, and custom quiz builder
│   ├── buddy.js       # Study Buddy companion widget & ambient sound controller
│   └── app.js         # Navigation, keyboard shortcuts, theme toggle, and toasts
└── README.md          # Documentation and guide
```
