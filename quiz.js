/**
 * quiz.js - Quiz Arena Engine (Auto-Quiz from Flashcards + Custom Quizzes)
 */

class QuizArena {
  constructor() {
    this.currentQuiz = null; // { title, questions: [ { question, options, correctIndex, explanation } ] }
    this.currentQuestionIndex = 0;
    this.userScore = 0;
    this.userAnswers = []; // records { question, options, selectedIndex, correctIndex, isCorrect }

    this.cacheDOM();
    this.init();
  }

  cacheDOM() {
    // Views
    this.setupView = document.getElementById('quiz-setup-view');
    this.runnerView = document.getElementById('quiz-runner-view');
    this.resultsView = document.getElementById('quiz-results-view');

    // Setup View Elements
    this.quizDeckSelect = document.getElementById('quiz-deck-select');
    this.quizLengthSelect = document.getElementById('quiz-length-select');
    this.btnStartDeckQuiz = document.getElementById('btn-start-deck-quiz');
    this.customQuizSelect = document.getElementById('custom-quiz-select');
    this.btnStartCustomQuiz = document.getElementById('btn-start-custom-quiz');
    this.btnCreateCustomQuiz = document.getElementById('btn-create-custom-quiz');

    // Runner View Elements
    this.runnerTitle = document.getElementById('runner-quiz-title');
    this.runnerCounterTag = document.getElementById('runner-counter-tag');
    this.runnerLiveScore = document.getElementById('runner-live-score');
    this.runnerQuitBtn = document.getElementById('runner-quit-btn');
    this.runnerProgressFill = document.getElementById('runner-progress-fill');
    this.runnerQuestionText = document.getElementById('runner-question-text');
    this.runnerOptionsContainer = document.getElementById('runner-options-container');

    // Runner Feedback Banner
    this.feedbackBanner = document.getElementById('runner-feedback-banner');
    this.feedbackIcon = document.getElementById('feedback-icon');
    this.feedbackStatus = document.getElementById('feedback-status');
    this.feedbackExplanation = document.getElementById('feedback-explanation');
    this.runnerNextBtn = document.getElementById('runner-next-btn');

    // Results View Elements
    this.resultsHeadline = document.getElementById('results-headline');
    this.resultsSubtext = document.getElementById('results-subtext');
    this.resultsIcon = document.getElementById('results-icon');
    this.resultsPercentage = document.getElementById('results-percentage');
    this.resultsFraction = document.getElementById('results-fraction');
    this.resultsGradeBadge = document.getElementById('results-grade-badge');
    this.resultsBreakdownList = document.getElementById('results-breakdown-list');
    this.resultsBackBtn = document.getElementById('results-back-btn');
    this.resultsRetryBtn = document.getElementById('results-retry-btn');

    // Custom Quiz Builder Modal
    this.modalCustomQuiz = document.getElementById('modal-custom-quiz');
    this.formCustomQuiz = document.getElementById('form-custom-quiz');
    this.inputQuizTitle = document.getElementById('custom-quiz-title-input');
    this.builderContainer = document.getElementById('custom-quiz-questions-builder');
    this.btnAddQuestionRow = document.getElementById('btn-add-quiz-question-row');
  }

  init() {
    this.populateSetupDropdowns();
    this.bindEvents();
  }

  populateSetupDropdowns() {
    // Populate flashcard decks
    const decks = window.storageManager.getDecks();
    if (this.quizDeckSelect) {
      this.quizDeckSelect.innerHTML = decks.map(d => `
        <option value="${d.id}">
          ${d.icon || '📚'} ${d.title} (${d.cards ? d.cards.length : 0} cards)
        </option>
      `).join('');
    }

    // Populate custom quizzes
    const quizzes = window.storageManager.getQuizzes();
    if (this.customQuizSelect) {
      this.customQuizSelect.innerHTML = quizzes.map(q => `
        <option value="${q.id}">
          🎯 ${q.title} (${q.questions.length} questions)
        </option>
      `).join('');
    }
  }

  bindEvents() {
    // Start Auto-Quiz from Deck
    this.btnStartDeckQuiz?.addEventListener('click', () => {
      window.soundEngine.playClick();
      const deckId = this.quizDeckSelect.value;
      const countVal = this.quizLengthSelect.value;
      this.startQuizFromDeck(deckId, countVal);
    });

    // Start Custom Quiz
    this.btnStartCustomQuiz?.addEventListener('click', () => {
      window.soundEngine.playClick();
      const quizId = this.customQuizSelect.value;
      const quizzes = window.storageManager.getQuizzes();
      const quiz = quizzes.find(q => q.id === quizId);
      if (quiz) {
        this.launchQuiz(quiz);
      }
    });

    // Quit / Exit Quiz
    this.runnerQuitBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to exit the quiz? Your progress will not be saved.')) {
        this.showSetupView();
      }
    });

    // Next Question Button
    this.runnerNextBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.advanceQuestion();
    });

    // Results screen buttons
    this.resultsBackBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.showSetupView();
    });

    this.resultsRetryBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      if (this.currentQuiz) {
        this.launchQuiz(this.currentQuiz);
      }
    });

    // Open Custom Quiz Builder
    this.btnCreateCustomQuiz?.addEventListener('click', () => {
      this.openQuizBuilder();
    });

    // Add Question Row in Builder
    this.btnAddQuestionRow?.addEventListener('click', () => {
      this.addQuestionToBuilder();
    });

    // Save Custom Quiz
    this.formCustomQuiz?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveCustomQuiz();
    });
  }

  showSetupView() {
    this.setupView?.classList.remove('hidden');
    this.runnerView?.classList.add('hidden');
    this.resultsView?.classList.add('hidden');
    this.populateSetupDropdowns();
  }

  // Generate a quiz from a flashcard deck
  startQuizFromDeck(deckId, countSetting = '10') {
    const decks = window.storageManager.getDecks();
    const deck = decks.find(d => d.id === deckId);

    if (!deck || !deck.cards || deck.cards.length === 0) {
      window.app?.showToast('This deck has no cards to quiz!', 'warning');
      return;
    }

    if (deck.cards.length < 2) {
      window.app?.showToast('Add at least 2 cards to this deck for quiz mode!', 'warning');
      return;
    }

    // Shuffle cards copy
    const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5);
    const maxQ = countSetting === 'all' ? shuffledCards.length : Math.min(parseInt(countSetting), shuffledCards.length);
    const selectedCards = shuffledCards.slice(0, maxQ);

    const questions = selectedCards.map((card) => {
      // Pick 3 distractors from remaining cards
      const otherAnswers = deck.cards
        .filter(c => c.id !== card.id)
        .map(c => c.answer);
      
      // Shuffle distractors
      const shuffledOthers = otherAnswers.sort(() => Math.random() - 0.5);
      const distractors = shuffledOthers.slice(0, 3);

      // If not enough unique distractors, pad with dummy choices
      while (distractors.length < 3) {
        distractors.push(`Option ${distractors.length + 2}`);
      }

      // Build options array with correct answer placed randomly
      const options = [...distractors];
      const correctIndex = Math.floor(Math.random() * (options.length + 1));
      options.splice(correctIndex, 0, card.answer);

      return {
        question: card.question,
        options: options,
        correctIndex: correctIndex,
        explanation: card.hint ? `Hint/Note: ${card.hint}` : `Definition: ${card.answer}`
      };
    });

    const generatedQuiz = {
      title: `${deck.icon || '📚'} Quiz: ${deck.title}`,
      questions: questions
    };

    this.launchQuiz(generatedQuiz);
  }

  launchQuiz(quiz) {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;

    this.currentQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.userScore = 0;
    this.userAnswers = [];

    this.setupView?.classList.add('hidden');
    this.resultsView?.classList.add('hidden');
    this.runnerView?.classList.remove('hidden');

    this.runnerTitle.textContent = quiz.title;
    this.runnerLiveScore.textContent = '0';

    this.renderCurrentQuestion();
  }

  renderCurrentQuestion() {
    const q = this.currentQuiz.questions[this.currentQuestionIndex];
    const total = this.currentQuiz.questions.length;

    // Reset feedback banner
    this.feedbackBanner?.classList.add('hidden');
    this.runnerCounterTag.textContent = `Question ${this.currentQuestionIndex + 1} of ${total}`;
    this.runnerProgressFill.style.width = `${((this.currentQuestionIndex) / total) * 100}%`;
    this.runnerQuestionText.textContent = q.question;

    const letters = ['A', 'B', 'C', 'D'];
    this.runnerOptionsContainer.innerHTML = q.options.map((opt, i) => `
      <button class="quiz-option-btn" data-index="${i}">
        <span class="opt-letter">${letters[i] || i + 1}</span>
        <span class="opt-text">${opt}</span>
      </button>
    `).join('');

    // Attach click listeners to option buttons
    this.runnerOptionsContainer.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.dataset.index);
        this.handleAnswerSelection(selectedIdx);
      });
    });
  }

  handleAnswerSelection(selectedIndex) {
    const q = this.currentQuiz.questions[this.currentQuestionIndex];
    const isCorrect = selectedIndex === q.correctIndex;

    // Disable all option buttons
    const buttons = this.runnerOptionsContainer.querySelectorAll('.quiz-option-btn');
    buttons.forEach(b => b.disabled = true);

    const chosenBtn = buttons[selectedIndex];
    const correctBtn = buttons[q.correctIndex];

    if (isCorrect) {
      this.userScore++;
      this.runnerLiveScore.textContent = this.userScore;
      chosenBtn.classList.add('selected-correct');
      window.soundEngine.playCorrect();

      this.feedbackBanner.className = 'quiz-feedback-banner correct';
      this.feedbackIcon.textContent = '✅';
      this.feedbackStatus.textContent = 'Correct! Outstanding work!';
    } else {
      chosenBtn.classList.add('selected-wrong');
      correctBtn.classList.add('reveal-correct');
      window.soundEngine.playWrong();

      this.feedbackBanner.className = 'quiz-feedback-banner incorrect';
      this.feedbackIcon.textContent = '❌';
      this.feedbackStatus.textContent = `Incorrect! The correct answer was (${['A','B','C','D'][q.correctIndex]}).`;
    }

    this.feedbackExplanation.textContent = q.explanation || '';
    this.feedbackBanner.classList.remove('hidden');

    // Save record for breakdown
    this.userAnswers.push({
      question: q.question,
      options: q.options,
      selectedIndex: selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect: isCorrect
    });
  }

  advanceQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.currentQuiz.questions.length) {
      this.renderCurrentQuestion();
    } else {
      this.showQuizResults();
    }
  }

  showQuizResults() {
    this.runnerView?.classList.add('hidden');
    this.resultsView?.classList.remove('hidden');

    const total = this.currentQuiz.questions.length;
    const pct = Math.round((this.userScore / total) * 100);

    this.resultsPercentage.textContent = `${pct}%`;
    this.resultsFraction.textContent = `${this.userScore} / ${total} Correct`;

    let grade = '';
    let headline = '';
    let subtext = '';
    let trophy = '🏆';

    if (pct === 100) {
      grade = 'Grade: S Tier 🔥 Flawless!';
      headline = 'Perfection Achieved!';
      subtext = 'You got every single question right! Incredible retention.';
      trophy = '👑';
    } else if (pct >= 80) {
      grade = 'Grade: A Tier 🌟 Excellent!';
      headline = 'Outstanding Job!';
      subtext = 'You have mastered most of this material.';
      trophy = '🏆';
    } else if (pct >= 60) {
      grade = 'Grade: B Tier 👍 Solid Effort!';
      headline = 'Good Work!';
      subtext = 'Review the missed concepts in flashcards to reach 100%.';
      trophy = '🎖️';
    } else {
      grade = 'Grade: C Tier 📚 Needs Revision';
      headline = 'Keep Practicing!';
      subtext = 'A little more review with the flashcards and you will ace it!';
      trophy = '💡';
    }

    this.resultsGradeBadge.textContent = grade;
    this.resultsHeadline.textContent = headline;
    this.resultsSubtext.textContent = subtext;
    this.resultsIcon.textContent = trophy;

    // Trigger celebration if high score
    if (pct >= 75 && typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Study buddy feedback
    window.studyBuddy?.reactToQuizScore(pct);

    // Populate question breakdown review
    this.resultsBreakdownList.innerHTML = this.userAnswers.map((item, idx) => `
      <div class="breakdown-item ${item.isCorrect ? 'correct' : ''}">
        <div class="breakdown-item-q">${idx + 1}. ${item.question}</div>
        <div class="breakdown-item-ans">
          ${item.isCorrect 
            ? `✅ Your answer: <strong>${item.options[item.selectedIndex]}</strong>`
            : `❌ Your answer: <em>${item.options[item.selectedIndex]}</em> &bull; Correct: <strong>${item.options[item.correctIndex]}</strong>`
          }
        </div>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // Custom Quiz Builder
  // --------------------------------------------------------------------------

  openQuizBuilder() {
    this.inputQuizTitle.value = '';
    this.builderContainer.innerHTML = '';
    // Add two default blank questions
    this.addQuestionToBuilder();
    this.addQuestionToBuilder();
    this.modalCustomQuiz?.classList.remove('hidden');
    this.inputQuizTitle.focus();
  }

  addQuestionToBuilder() {
    const qIndex = this.builderContainer.children.length;
    const div = document.createElement('div');
    div.className = 'builder-question-card';
    div.innerHTML = `
      <div class="builder-q-header">
        <span>Question ${qIndex + 1}</span>
        ${qIndex > 0 ? '<button type="button" class="text-btn btn-remove-q" style="color:var(--accent-rose);">&times; Remove</button>' : ''}
      </div>
      <input type="text" class="b-q-text" placeholder="Enter question..." required>
      <div class="builder-options-grid">
        <div class="builder-opt-row">
          <input type="radio" name="correct_opt_${qIndex}" value="0" checked>
          <input type="text" class="b-opt-0" placeholder="Option A (Correct default)" required>
        </div>
        <div class="builder-opt-row">
          <input type="radio" name="correct_opt_${qIndex}" value="1">
          <input type="text" class="b-opt-1" placeholder="Option B" required>
        </div>
        <div class="builder-opt-row">
          <input type="radio" name="correct_opt_${qIndex}" value="2">
          <input type="text" class="b-opt-2" placeholder="Option C" required>
        </div>
        <div class="builder-opt-row">
          <input type="radio" name="correct_opt_${qIndex}" value="3">
          <input type="text" class="b-opt-3" placeholder="Option D" required>
        </div>
      </div>
    `;

    div.querySelector('.btn-remove-q')?.addEventListener('click', () => {
      div.remove();
      this._renumberBuilderQuestions();
    });

    this.builderContainer.appendChild(div);
  }

  _renumberBuilderQuestions() {
    Array.from(this.builderContainer.children).forEach((card, idx) => {
      const header = card.querySelector('.builder-q-header span');
      if (header) header.textContent = `Question ${idx + 1}`;
      const radios = card.querySelectorAll('input[type="radio"]');
      radios.forEach(r => r.name = `correct_opt_${idx}`);
    });
  }

  handleSaveCustomQuiz() {
    const title = this.inputQuizTitle.value.trim();
    if (!title) return;

    const cards = Array.from(this.builderContainer.querySelectorAll('.builder-question-card'));
    if (cards.length === 0) {
      window.app?.showToast('Please add at least 1 question!', 'warning');
      return;
    }

    const questions = [];
    for (let card of cards) {
      const qText = card.querySelector('.b-q-text').value.trim();
      const opt0 = card.querySelector('.b-opt-0').value.trim();
      const opt1 = card.querySelector('.b-opt-1').value.trim();
      const opt2 = card.querySelector('.b-opt-2').value.trim();
      const opt3 = card.querySelector('.b-opt-3').value.trim();
      const correctRadio = card.querySelector('input[type="radio"]:checked');
      const correctIdx = correctRadio ? parseInt(correctRadio.value) : 0;

      if (!qText || !opt0 || !opt1 || !opt2 || !opt3) {
        window.app?.showToast('Please fill out all question prompts and all 4 options.', 'warning');
        return;
      }

      questions.push({
        question: qText,
        options: [opt0, opt1, opt2, opt3],
        correctIndex: correctIdx,
        explanation: `Correct answer: ${[opt0, opt1, opt2, opt3][correctIdx]}`
      });
    }

    const newQuiz = window.storageManager.addCustomQuiz(title, questions);
    this.modalCustomQuiz?.classList.add('hidden');
    this.populateSetupDropdowns();
    window.app?.showToast(`Quiz "${title}" created! Starting now...`, 'success');

    // Immediately launch
    this.launchQuiz(newQuiz);
  }
}

// Global Quiz Arena Instance
window.quizArena = new QuizArena();
