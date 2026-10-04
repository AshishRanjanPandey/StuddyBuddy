/**
 * flashcards.js - Interactive 3D Flashcard Engine with Decks & Mastery Tracking
 */

class FlashcardEngine {
  constructor() {
    this.currentIndex = 0;
    this.isFlipped = false;
    this.cards = [];
    this.activeDeck = null;

    this.cacheDOM();
    this.init();
  }

  cacheDOM() {
    // Deck Selector & Top Bar
    this.deckSelect = document.getElementById('deck-select');
    this.btnCreateDeck = document.getElementById('btn-create-deck');
    this.btnManageDeck = document.getElementById('btn-manage-deck');
    this.btnAddCard = document.getElementById('btn-add-card');
    this.deckTotalCount = document.getElementById('deck-total-count');

    // Progress Bar & Counter
    this.deckCardCounter = document.getElementById('deck-card-counter');
    this.masteryPercentage = document.getElementById('deck-mastery-percentage');
    this.barMastered = document.getElementById('bar-mastered');
    this.barLearning = document.getElementById('bar-learning');

    // 3D Card Scene
    this.cardScene = document.getElementById('flashcard-scene');
    this.activeCard = document.getElementById('active-flashcard');
    this.questionText = document.getElementById('card-question-text');
    this.answerText = document.getElementById('card-answer-text');
    this.hintBtn = document.getElementById('card-hint-btn');
    this.hintText = document.getElementById('card-hint-text');
    this.statusPill = document.getElementById('card-status-pill');

    // Controls
    this.prevBtn = document.getElementById('fcard-prev-btn');
    this.nextBtn = document.getElementById('fcard-next-btn');
    this.assessRepeatBtn = document.getElementById('assess-repeat-btn');
    this.assessFlipBtn = document.getElementById('assess-flip-btn');
    this.assessMasteredBtn = document.getElementById('assess-mastered-btn');

    // Sub-tools
    this.shuffleBtn = document.getElementById('shuffle-deck-btn');
    this.resetMasteryBtn = document.getElementById('reset-mastery-btn');
    this.editCardBtn = document.getElementById('edit-current-card-btn');
    this.deleteCardBtn = document.getElementById('delete-current-card-btn');
    this.quizFromDeckBtn = document.getElementById('quiz-from-deck-btn');

    // Modals
    this.modalCard = document.getElementById('modal-card');
    this.modalCardTitle = document.getElementById('modal-card-title');
    this.formCard = document.getElementById('form-card');
    this.inputCardId = document.getElementById('card-edit-id');
    this.inputCardDeck = document.getElementById('input-card-deck');
    this.inputCardQuestion = document.getElementById('input-card-question');
    this.inputCardAnswer = document.getElementById('input-card-answer');
    this.inputCardHint = document.getElementById('input-card-hint');

    this.modalDeck = document.getElementById('modal-deck');
    this.formDeck = document.getElementById('form-deck');
    this.inputDeckName = document.getElementById('input-deck-name');
    this.inputDeckDesc = document.getElementById('input-deck-desc');
    this.inputDeckIcon = document.getElementById('input-deck-icon');

    this.modalDeckManager = document.getElementById('modal-deck-manager');
    this.managerDeckTitle = document.getElementById('manager-deck-title');
    this.managerSearchInput = document.getElementById('manager-search-input');
    this.managerCardList = document.getElementById('manager-card-list');
    this.managerAddCardBtn = document.getElementById('manager-add-card-btn');
    this.managerDeleteDeckBtn = document.getElementById('manager-delete-deck-btn');
  }

  init() {
    this.renderDeckSelectOptions();
    this.loadActiveDeck();
    this.bindEvents();
  }

  renderDeckSelectOptions() {
    const decks = window.storageManager.getDecks();
    const activeId = window.storageManager.getActiveDeckId();

    if (this.deckSelect) {
      this.deckSelect.innerHTML = decks.map(d => `
        <option value="${d.id}" ${d.id === activeId ? 'selected' : ''}>
          ${d.icon || '📚'} ${d.title} (${d.cards ? d.cards.length : 0})
        </option>
      `).join('');
    }

    if (this.inputCardDeck) {
      this.inputCardDeck.innerHTML = decks.map(d => `
        <option value="${d.id}" ${d.id === activeId ? 'selected' : ''}>
          ${d.title}
        </option>
      `).join('');
    }
  }

  loadActiveDeck() {
    this.activeDeck = window.storageManager.getActiveDeck();
    if (!this.activeDeck) return;

    this.cards = this.activeDeck.cards || [];
    if (this.currentIndex >= this.cards.length) {
      this.currentIndex = Math.max(0, this.cards.length - 1);
    }
    this.resetCardFlip();
    this.renderCard();
    this.updateProgress();

    if (this.deckTotalCount) {
      this.deckTotalCount.textContent = this.cards.length;
    }
  }

  bindEvents() {
    // Deck switch
    this.deckSelect?.addEventListener('change', (e) => {
      window.storageManager.setActiveDeckId(e.target.value);
      this.currentIndex = 0;
      this.loadActiveDeck();
      window.soundEngine.playClick();
    });

    // Flip card on card click
    this.activeCard?.addEventListener('click', (e) => {
      // Don't flip if user clicked the hint button
      if (e.target.closest('#card-hint-btn')) return;
      this.toggleFlip();
    });

    // Flip card button
    this.assessFlipBtn?.addEventListener('click', () => {
      this.toggleFlip();
    });

    // Hint toggle
    this.hintBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.soundEngine.playClick();
      this.hintText?.classList.toggle('hidden');
    });

    // Prev / Next Card
    this.prevBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.prevCard();
    });

    this.nextBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.nextCard();
    });

    // Assess Need Practice
    this.assessRepeatBtn?.addEventListener('click', () => {
      this.markMastery(false);
    });

    // Assess Mastered
    this.assessMasteredBtn?.addEventListener('click', () => {
      this.markMastery(true);
    });

    // Shuffle Deck
    this.shuffleBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.shuffleCards();
    });

    // Reset Mastery
    this.resetMasteryBtn?.addEventListener('click', () => {
      if (confirm('Reset mastery status for all cards in this deck?')) {
        window.storageManager.resetDeckMastery(this.activeDeck.id);
        this.loadActiveDeck();
        window.app?.showToast('Deck progress reset to learning!', 'info');
      }
    });

    // Edit Card Button
    this.editCardBtn?.addEventListener('click', () => {
      this.openEditCurrentCardModal();
    });

    // Delete Card Button
    this.deleteCardBtn?.addEventListener('click', () => {
      this.deleteCurrentCard();
    });

    // Quiz this deck shortcut
    this.quizFromDeckBtn?.addEventListener('click', () => {
      if (window.quizArena) {
        window.quizArena.startQuizFromDeck(this.activeDeck.id);
        // Switch to Quiz tab
        window.app?.switchTab('quiz');
      }
    });

    // Add Card Modal Open
    this.btnAddCard?.addEventListener('click', () => {
      this.openAddCardModal();
    });

    // Save Card Form Submit
    this.formCard?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveCard();
    });

    // Create Deck Modal Open
    this.btnCreateDeck?.addEventListener('click', () => {
      this.modalDeck?.classList.remove('hidden');
      this.inputDeckName?.focus();
    });

    // Create Deck Form Submit
    this.formDeck?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.inputDeckName.value.trim();
      const desc = this.inputDeckDesc.value.trim();
      const icon = this.inputDeckIcon.value.trim() || '📚';

      if (!title) return;
      const newDeck = window.storageManager.addDeck(title, desc, icon);
      this.renderDeckSelectOptions();
      this.loadActiveDeck();
      this.modalDeck?.classList.add('hidden');
      this.formDeck.reset();
      window.app?.showToast(`Deck "${title}" created!`, 'success');
    });

    // Open Deck Card List Manager
    this.btnManageDeck?.addEventListener('click', () => {
      this.openDeckManagerModal();
    });

    // Deck Manager search filter
    this.managerSearchInput?.addEventListener('input', (e) => {
      this.renderManagerCardList(e.target.value);
    });

    // Deck Manager Add Card
    this.managerAddCardBtn?.addEventListener('click', () => {
      this.modalDeckManager?.classList.add('hidden');
      this.openAddCardModal();
    });

    // Deck Manager Delete Deck
    this.managerDeleteDeckBtn?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete deck "${this.activeDeck.title}"?`)) {
        window.storageManager.deleteDeck(this.activeDeck.id);
        this.modalDeckManager?.classList.add('hidden');
        this.renderDeckSelectOptions();
        this.loadActiveDeck();
        window.app?.showToast('Deck deleted', 'info');
      }
    });
  }

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
    this.activeCard?.classList.toggle('is-flipped', this.isFlipped);
    window.soundEngine.playCardFlip();
  }

  resetCardFlip() {
    this.isFlipped = false;
    this.activeCard?.classList.remove('is-flipped');
    this.hintText?.classList.add('hidden');
  }

  renderCard() {
    if (this.cards.length === 0) {
      this.questionText.textContent = 'This deck is empty!';
      this.answerText.textContent = 'Click "Add Card" to add your first study prompt.';
      this.hintBtn?.classList.add('hidden');
      this.hintText?.classList.add('hidden');
      this.deckCardCounter.textContent = '0 / 0';
      this.statusPill.textContent = 'Empty';
      this.statusPill.className = 'card-status-pill';
      return;
    }

    const currentCard = this.cards[this.currentIndex];
    this.questionText.textContent = currentCard.question;
    this.answerText.textContent = currentCard.answer;

    if (currentCard.hint && currentCard.hint.trim() !== '') {
      this.hintBtn?.classList.remove('hidden');
      this.hintText.textContent = currentCard.hint;
    } else {
      this.hintBtn?.classList.add('hidden');
      this.hintText.textContent = '';
    }

    // Status pill on back of card
    const isMastered = currentCard.status === 'mastered';
    this.statusPill.textContent = isMastered ? 'Mastered ✨' : 'Still Learning';
    this.statusPill.className = `card-status-pill ${isMastered ? 'status-mastered' : ''}`;

    this.deckCardCounter.textContent = `Card ${this.currentIndex + 1} of ${this.cards.length}`;
  }

  updateProgress() {
    if (this.cards.length === 0) {
      this.masteryPercentage.textContent = '0% Mastered';
      this.barMastered.style.width = '0%';
      this.barLearning.style.width = '0%';
      return;
    }

    const masteredCount = this.cards.filter(c => c.status === 'mastered').length;
    const learningCount = this.cards.length - masteredCount;
    const masteredPct = Math.round((masteredCount / this.cards.length) * 100);
    const learningPct = 100 - masteredPct;

    this.masteryPercentage.textContent = `${masteredPct}% Mastered`;
    this.barMastered.style.width = `${masteredPct}%`;
    this.barLearning.style.width = `${learningPct}%`;
  }

  nextCard() {
    if (this.cards.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.resetCardFlip();
    this.renderCard();
  }

  prevCard() {
    if (this.cards.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.resetCardFlip();
    this.renderCard();
  }

  markMastery(isMastered) {
    if (this.cards.length === 0) return;
    const currentCard = this.cards[this.currentIndex];

    window.storageManager.setCardMastery(this.activeDeck.id, currentCard.id, isMastered);
    currentCard.status = isMastered ? 'mastered' : 'learning';

    if (isMastered) {
      window.soundEngine.playCorrect();
      window.app?.showToast('Card marked as Mastered! 🌟', 'success');
      window.studyBuddy?.reactToCardMastered();
    } else {
      window.soundEngine.playClick();
      window.app?.showToast('Card saved for more practice', 'info');
    }

    this.updateProgress();

    // Auto flip to front and go to next card
    setTimeout(() => {
      this.nextCard();
    }, 250);
  }

  shuffleCards() {
    if (this.cards.length <= 1) return;
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.currentIndex = 0;
    this.resetCardFlip();
    this.renderCard();
    window.app?.showToast('Deck shuffled! 🔀', 'info');
  }

  openAddCardModal() {
    this.modalCardTitle.textContent = 'Add New Flashcard';
    this.inputCardId.value = '';
    this.inputCardDeck.value = this.activeDeck.id;
    this.inputCardQuestion.value = '';
    this.inputCardAnswer.value = '';
    this.inputCardHint.value = '';
    this.modalCard?.classList.remove('hidden');
    this.inputCardQuestion.focus();
  }

  openEditCurrentCardModal() {
    if (this.cards.length === 0) return;
    const card = this.cards[this.currentIndex];
    this.modalCardTitle.textContent = 'Edit Flashcard';
    this.inputCardId.value = card.id;
    this.inputCardDeck.value = this.activeDeck.id;
    this.inputCardQuestion.value = card.question;
    this.inputCardAnswer.value = card.answer;
    this.inputCardHint.value = card.hint || '';
    this.modalCard?.classList.remove('hidden');
    this.inputCardQuestion.focus();
  }

  handleSaveCard() {
    const cardId = this.inputCardId.value;
    const targetDeckId = this.inputCardDeck.value;
    const q = this.inputCardQuestion.value.trim();
    const a = this.inputCardAnswer.value.trim();
    const h = this.inputCardHint.value.trim();

    if (!q || !a) return;

    if (cardId) {
      // Editing existing card
      window.storageManager.updateCard(targetDeckId, cardId, {
        question: q,
        answer: a,
        hint: h
      });
      window.app?.showToast('Flashcard updated!', 'success');
    } else {
      // Adding new card
      window.storageManager.addCard(targetDeckId, q, a, h);
      window.app?.showToast('Flashcard added to deck!', 'success');
    }

    this.modalCard?.classList.add('hidden');
    this.renderDeckSelectOptions();
    this.loadActiveDeck();
  }

  deleteCurrentCard() {
    if (this.cards.length === 0) return;
    const card = this.cards[this.currentIndex];
    if (confirm('Delete this flashcard?')) {
      window.storageManager.deleteCard(this.activeDeck.id, card.id);
      this.loadActiveDeck();
      this.renderDeckSelectOptions();
      window.app?.showToast('Flashcard deleted', 'info');
    }
  }

  openDeckManagerModal() {
    this.managerDeckTitle.textContent = `${this.activeDeck.icon || '📚'} ${this.activeDeck.title} - Cards`;
    this.managerSearchInput.value = '';
    this.renderManagerCardList('');
    this.modalDeckManager?.classList.remove('hidden');
  }

  renderManagerCardList(query = '') {
    const qLower = query.toLowerCase().trim();
    const filtered = this.cards.filter(c => 
      c.question.toLowerCase().includes(qLower) || 
      c.answer.toLowerCase().includes(qLower)
    );

    if (filtered.length === 0) {
      this.managerCardList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No cards found matching your query.
        </div>
      `;
      return;
    }

    this.managerCardList.innerHTML = filtered.map(c => `
      <div class="manager-card-item">
        <div class="manager-card-text">
          <div class="manager-card-q">${c.question}</div>
          <div class="manager-card-a">${c.answer}</div>
        </div>
        <div class="manager-item-actions">
          <button class="btn btn-sm btn-secondary manager-edit-btn" data-id="${c.id}">✏️ Edit</button>
          <button class="btn btn-sm btn-danger manager-del-btn" data-id="${c.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    // Attach listeners
    this.managerCardList.querySelectorAll('.manager-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.dataset.id;
        const target = this.cards.find(c => c.id === cId);
        if (target) {
          this.modalDeckManager?.classList.add('hidden');
          this.modalCardTitle.textContent = 'Edit Flashcard';
          this.inputCardId.value = target.id;
          this.inputCardDeck.value = this.activeDeck.id;
          this.inputCardQuestion.value = target.question;
          this.inputCardAnswer.value = target.answer;
          this.inputCardHint.value = target.hint || '';
          this.modalCard?.classList.remove('hidden');
        }
      });
    });

    this.managerCardList.querySelectorAll('.manager-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.dataset.id;
        if (confirm('Delete this card?')) {
          window.storageManager.deleteCard(this.activeDeck.id, cId);
          this.loadActiveDeck();
          this.renderManagerCardList(this.managerSearchInput.value);
        }
      });
    });
  }
}

// Global Flashcard Engine Instance
window.flashcardEngine = new FlashcardEngine();
