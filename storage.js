/**
 * storage.js - LocalStorage data persistence, starter decks, and backup/restore
 */

const STORAGE_KEYS = {
  DECKS: 'studybuddy_decks',
  ACTIVE_DECK_ID: 'studybuddy_active_deck_id',
  QUIZZES: 'studybuddy_custom_quizzes',
  POMO_SETTINGS: 'studybuddy_pomo_settings',
  POMO_STATS: 'studybuddy_pomo_stats',
  APP_CONFIG: 'studybuddy_app_config'
};

const DEFAULT_DECKS = [
  {
    id: 'deck_webdev',
    title: '💻 Modern Web Dev',
    description: 'Core concepts in JavaScript, DOM, CSS, and modern web architecture.',
    icon: '💻',
    cards: [
      {
        id: 'c_wd_1',
        question: 'What is a Closure in JavaScript?',
        answer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. It gives an inner function access to an outer function’s scope even after the outer function has executed.',
        hint: 'Lexical scoping + preserved variables in inner functions.',
        status: 'learning' // 'learning' | 'mastered'
      },
      {
        id: 'c_wd_2',
        question: 'What is the Event Loop in JavaScript?',
        answer: 'A mechanism that constantly checks the Call Stack and the Task Queue / Microtask Queue. If the Call Stack is empty, it pushes the first pending callback into the Call Stack for execution.',
        hint: 'Call Stack + Callback Queue + Microtasks coordination.',
        status: 'learning'
      },
      {
        id: 'c_wd_3',
        question: 'What is the CSS Box Model composed of (from inside out)?',
        answer: 'Content -> Padding -> Border -> Margin.',
        hint: 'Starts with Content and ends with Margin.',
        status: 'learning'
      },
      {
        id: 'c_wd_4',
        question: 'What is the key difference between Debounce and Throttle?',
        answer: 'Debounce waits until a certain amount of time has elapsed since the last call before executing. Throttle limits the execution of a function to at most once per specified time interval.',
        hint: 'Debounce groups calls into one; Throttle ensures periodic execution at fixed intervals.',
        status: 'learning'
      },
      {
        id: 'c_wd_5',
        question: 'What does typeof null evaluate to in JavaScript, and why?',
        answer: 'It returns "object". This is a historic legacy bug from the very first implementation of JS where values were represented with type tags (objects had a 0 tag, and null was represented as a NULL pointer 0x00).',
        hint: 'Historical legacy type tag bug from 1995.',
        status: 'learning'
      },
      {
        id: 'c_wd_6',
        question: 'What are Microtasks vs Macrotasks in the browser?',
        answer: 'Microtasks (Promises, queueMicrotask, MutationObserver) have higher priority and run immediately after the current script before rendering. Macrotasks (setTimeout, setInterval, requestAnimationFrame, I/O) run on subsequent loop ticks.',
        hint: 'Promises run before setTimeout callbacks.',
        status: 'learning'
      }
    ]
  },
  {
    id: 'deck_bio',
    title: '🧬 Biology Essentials',
    description: 'Fundamental cellular biology and physiological concepts.',
    icon: '🧬',
    cards: [
      {
        id: 'c_bio_1',
        question: 'What is the primary function of the Mitochondria?',
        answer: 'Known as the "powerhouse of the cell", it generates most of the chemical energy needed to power the cell\'s biochemical reactions via cellular respiration (ATP production).',
        hint: 'ATP generation and cellular respiration.',
        status: 'learning'
      },
      {
        id: 'c_bio_2',
        question: 'What are the four nucleotide nitrogenous bases found in DNA?',
        answer: 'Adenine (A), Thymine (T), Cytosine (C), and Guanine (G). Adenine pairs with Thymine, and Cytosine pairs with Guanine.',
        hint: 'A, T, C, G.',
        status: 'learning'
      },
      {
        id: 'c_bio_3',
        question: 'What is Homeostasis in living organisms?',
        answer: 'The state of steady internal, physical, and chemical conditions maintained by living systems, such as body temperature, fluid balance, and blood pH.',
        hint: 'Internal balance and equilibrium.',
        status: 'learning'
      },
      {
        id: 'c_bio_4',
        question: 'Which protein in red blood cells is responsible for transporting oxygen throughout the body?',
        answer: 'Hemoglobin. It binds oxygen in the lungs and releases it into tissues while returning carbon dioxide to the lungs.',
        hint: 'Iron-containing metalloprotein.',
        status: 'learning'
      }
    ]
  },
  {
    id: 'deck_geog',
    title: '🌍 World Capitals & Geography',
    description: 'Test your knowledge of world geography and national capitals.',
    icon: '🌍',
    cards: [
      {
        id: 'c_geo_1',
        question: 'What is the capital city of Australia?',
        answer: 'Canberra (often mistakenly thought to be Sydney or Melbourne).',
        hint: 'Not Sydney or Melbourne!',
        status: 'learning'
      },
      {
        id: 'c_geo_2',
        question: 'What is the capital of Canada?',
        answer: 'Ottawa.',
        hint: 'Located in Ontario, bordering Quebec.',
        status: 'learning'
      },
      {
        id: 'c_geo_3',
        question: 'Which river is the longest in the world by general consensus?',
        answer: 'The Nile River (approximately 6,650 km / 4,132 miles long).',
        hint: 'Flows northwards through northeastern Africa.',
        status: 'learning'
      },
      {
        id: 'c_geo_4',
        question: 'What is the capital of Brazil?',
        answer: 'Brasília (planned city, inaugurated in 1960).',
        hint: 'Not Rio de Janeiro or São Paulo.',
        status: 'learning'
      }
    ]
  }
];

const DEFAULT_QUIZZES = [
  {
    id: 'quiz_starter_1',
    title: 'Frontend & JS Mastery Exam',
    description: 'Test essential concepts in JavaScript mechanics and DOM.',
    questions: [
      {
        question: 'What is the output of `typeof null` in standard JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctIndex: 2,
        explanation: 'Due to a historical bug in JavaScript 1.0, null has a type tag of 0 which maps to "object".'
      },
      {
        question: 'Which queue has higher priority in the JavaScript Event Loop?',
        options: ['Macrotask Queue (setTimeout)', 'Microtask Queue (Promises)', 'Animation Queue', 'Network I/O Queue'],
        correctIndex: 1,
        explanation: 'All microtasks are drained completely before processing the next macrotask.'
      },
      {
        question: 'What order does the CSS Box Model follow from innermost to outermost?',
        options: [
          'Margin, Border, Padding, Content',
          'Content, Padding, Border, Margin',
          'Content, Border, Padding, Margin',
          'Padding, Content, Margin, Border'
        ],
        correctIndex: 1,
        explanation: 'The Box Model goes: Content -> Padding -> Border -> Margin.'
      },
      {
        question: 'Which method creates a shallow copy of an Array in JavaScript?',
        options: ['Array.prototype.slice()', 'Array.prototype.push()', 'Array.prototype.splice()', 'Array.prototype.indexOf()'],
        correctIndex: 0,
        explanation: 'arr.slice() or [...arr] creates a shallow clone without mutating the source array.'
      }
    ]
  }
];

const DEFAULT_POMO_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreaks: false,
  autoStartFocus: false
};

const DEFAULT_POMO_STATS = {
  pomosCompleted: 0,
  focusMinutes: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10)
};

const DEFAULT_APP_CONFIG = {
  theme: 'dark',
  sfx: true,
  ambientVolume: 0.5
};

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.DECKS)) {
      this.saveDecks(DEFAULT_DECKS);
      this.setActiveDeckId(DEFAULT_DECKS[0].id);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUIZZES)) {
      this.saveQuizzes(DEFAULT_QUIZZES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.POMO_SETTINGS)) {
      this.savePomoSettings(DEFAULT_POMO_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.POMO_STATS)) {
      this.savePomoStats(DEFAULT_POMO_STATS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APP_CONFIG)) {
      this.saveAppConfig(DEFAULT_APP_CONFIG);
    }
    this._checkStreak();
  }

  // --- Decks ---
  getDecks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DECKS);
      return data ? JSON.parse(data) : DEFAULT_DECKS;
    } catch (e) {
      return DEFAULT_DECKS;
    }
  }

  saveDecks(decks) {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  }

  getActiveDeckId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DECK_ID) || (this.getDecks()[0] ? this.getDecks()[0].id : null);
  }

  setActiveDeckId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DECK_ID, id);
  }

  getActiveDeck() {
    const decks = this.getDecks();
    const activeId = this.getActiveDeckId();
    return decks.find(d => d.id === activeId) || decks[0] || null;
  }

  addDeck(title, description = '', icon = '📚') {
    const decks = this.getDecks();
    const newDeck = {
      id: 'deck_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      icon: icon || '📚',
      cards: []
    };
    decks.push(newDeck);
    this.saveDecks(decks);
    this.setActiveDeckId(newDeck.id);
    return newDeck;
  }

  deleteDeck(deckId) {
    let decks = this.getDecks();
    decks = decks.filter(d => d.id !== deckId);
    if (decks.length === 0) {
      // Re-create default deck if all deleted
      decks = DEFAULT_DECKS;
    }
    this.saveDecks(decks);
    this.setActiveDeckId(decks[0].id);
    return decks;
  }

  // --- Cards in Active Deck ---
  addCard(deckId, question, answer, hint = '') {
    const decks = this.getDecks();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return null;

    const newCard = {
      id: 'card_' + Date.now(),
      question: question.trim(),
      answer: answer.trim(),
      hint: hint.trim(),
      status: 'learning'
    };
    deck.cards.push(newCard);
    this.saveDecks(decks);
    return newCard;
  }

  updateCard(deckId, cardId, fields) {
    const decks = this.getDecks();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return false;

    const card = deck.cards.find(c => c.id === cardId);
    if (!card) return false;

    Object.assign(card, fields);
    this.saveDecks(decks);
    return true;
  }

  deleteCard(deckId, cardId) {
    const decks = this.getDecks();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return false;

    deck.cards = deck.cards.filter(c => c.id !== cardId);
    this.saveDecks(decks);
    return true;
  }

  setCardMastery(deckId, cardId, isMastered) {
    return this.updateCard(deckId, cardId, {
      status: isMastered ? 'mastered' : 'learning'
    });
  }

  resetDeckMastery(deckId) {
    const decks = this.getDecks();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return false;

    deck.cards.forEach(c => c.status = 'learning');
    this.saveDecks(decks);
    return true;
  }

  // --- Quizzes ---
  getQuizzes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      return data ? JSON.parse(data) : DEFAULT_QUIZZES;
    } catch (e) {
      return DEFAULT_QUIZZES;
    }
  }

  saveQuizzes(quizzes) {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  }

  addCustomQuiz(title, questions) {
    const quizzes = this.getQuizzes();
    const newQuiz = {
      id: 'quiz_' + Date.now(),
      title: title.trim(),
      questions: questions
    };
    quizzes.push(newQuiz);
    this.saveQuizzes(quizzes);
    return newQuiz;
  }

  // --- Pomodoro Settings & Stats ---
  getPomoSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POMO_SETTINGS);
      return data ? { ...DEFAULT_POMO_SETTINGS, ...JSON.parse(data) } : DEFAULT_POMO_SETTINGS;
    } catch (e) {
      return DEFAULT_POMO_SETTINGS;
    }
  }

  savePomoSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.POMO_SETTINGS, JSON.stringify(settings));
  }

  getPomoStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POMO_STATS);
      return data ? { ...DEFAULT_POMO_STATS, ...JSON.parse(data) } : DEFAULT_POMO_STATS;
    } catch (e) {
      return DEFAULT_POMO_STATS;
    }
  }

  savePomoStats(stats) {
    localStorage.setItem(STORAGE_KEYS.POMO_STATS, JSON.stringify(stats));
  }

  recordPomoCompleted(focusMinutes) {
    const stats = this.getPomoStats();
    stats.pomosCompleted = (stats.pomosCompleted || 0) + 1;
    stats.focusMinutes = (stats.focusMinutes || 0) + focusMinutes;
    this._checkStreak(stats);
    this.savePomoStats(stats);
    return stats;
  }

  _checkStreak(statsObj) {
    const stats = statsObj || this.getPomoStats();
    const today = new Date().toISOString().slice(0, 10);
    if (!stats.lastActiveDate) {
      stats.lastActiveDate = today;
      stats.streak = 1;
    } else if (stats.lastActiveDate !== today) {
      const last = new Date(stats.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        stats.streak = (stats.streak || 1) + 1;
      } else if (diffDays > 1) {
        stats.streak = 1;
      }
      stats.lastActiveDate = today;
    }
    if (!statsObj) {
      this.savePomoStats(stats);
    }
  }

  // --- App Config (Theme, SFX, etc.) ---
  getAppConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APP_CONFIG);
      return data ? { ...DEFAULT_APP_CONFIG, ...JSON.parse(data) } : DEFAULT_APP_CONFIG;
    } catch (e) {
      return DEFAULT_APP_CONFIG;
    }
  }

  saveAppConfig(cfg) {
    localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(cfg));
  }

  // --- Backup & Restore ---
  exportAllData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      decks: this.getDecks(),
      quizzes: this.getQuizzes(),
      pomoSettings: this.getPomoSettings(),
      pomoStats: this.getPomoStats(),
      appConfig: this.getAppConfig()
    };
  }

  importData(importedData) {
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('Invalid JSON format');
    }
    if (Array.isArray(importedData.decks)) {
      this.saveDecks(importedData.decks);
      if (importedData.decks.length > 0) {
        this.setActiveDeckId(importedData.decks[0].id);
      }
    }
    if (Array.isArray(importedData.quizzes)) {
      this.saveQuizzes(importedData.quizzes);
    }
    if (importedData.pomoSettings) {
      this.savePomoSettings(importedData.pomoSettings);
    }
    if (importedData.pomoStats) {
      this.savePomoStats(importedData.pomoStats);
    }
    return true;
  }

  resetToDefaults() {
    localStorage.clear();
    this.init();
  }
}

// Global Storage Instance
window.storageManager = new StorageManager();
