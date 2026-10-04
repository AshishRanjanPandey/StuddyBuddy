/**
 * buddy.js - Interactive Study Buddy Assistant & Ambient Audio Controller
 */

class StudyBuddy {
  constructor() {
    this.quotes = [
      "Small daily improvements over time lead to stunning results. 🚀",
      "Focus is like a muscle: the more you train it, the stronger it gets. 💪",
      "Active recall is 300% more effective than passive re-reading! 🧠",
      "Drink some water, sit up straight, and let's get into flow state! 🥤",
      "The expert in anything was once a beginner. Keep pushing! ⭐",
      "Deep focus transforms hours into minutes and concepts into mastery. ⚡",
      "Take breaks when needed. Rest is where the brain consolidates learning! 🌴",
      "Consistency beats intensity every single time. 📈"
    ];

    this.cacheDOM();
    this.init();
  }

  cacheDOM() {
    // Buddy Widget
    this.bubble = document.getElementById('buddy-speech-bubble');
    this.quoteText = document.getElementById('buddy-quote');
    this.closeBubbleBtn = document.getElementById('buddy-bubble-close');
    this.avatar = document.getElementById('buddy-avatar');

    // Ambient Audio Controls
    this.ambientWidget = document.getElementById('ambient-widget');
    this.ambientToggleBtn = document.getElementById('ambient-toggle-btn');
    this.ambientMenu = document.getElementById('ambient-menu');
    this.ambientStatusLabel = document.getElementById('ambient-status-label');
    this.ambientVolume = document.getElementById('ambient-volume');
    this.ambientOptions = document.querySelectorAll('.ambient-option');

    // Sound FX Toggle
    this.sfxToggleBtn = document.getElementById('sfx-toggle-btn');
    this.sfxOnIcon = this.sfxToggleBtn?.querySelector('.sfx-on-icon');
    this.sfxOffIcon = this.sfxToggleBtn?.querySelector('.sfx-off-icon');
  }

  init() {
    this.bindEvents();
    this.setupInitialAudioState();
  }

  bindEvents() {
    // Click Avatar for instant motivational quote
    this.avatar?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.avatar.style.transform = 'scale(1.2) rotate(-8deg)';
      setTimeout(() => {
        this.avatar.style.transform = '';
      }, 300);
      this.sayRandomQuote();
    });

    // Dismiss bubble
    this.closeBubbleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideBubble();
    });

    // Ambient dropdown toggle
    this.ambientToggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.ambientMenu?.classList.toggle('hidden');
    });

    // Close ambient menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.ambientWidget?.contains(e.target)) {
        this.ambientMenu?.classList.add('hidden');
      }
    });

    // Ambient Option Clicks
    this.ambientOptions.forEach(btn => {
      btn.addEventListener('click', () => {
        const soundType = btn.dataset.sound;
        this.selectAmbientSound(soundType);
        this.ambientMenu?.classList.add('hidden');
      });
    });

    // Ambient Volume Slider
    this.ambientVolume?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      window.soundEngine.setAmbientVolume(vol);
      const cfg = window.storageManager.getAppConfig();
      cfg.ambientVolume = vol;
      window.storageManager.saveAppConfig(cfg);
    });

    // SFX Mute/Unmute
    this.sfxToggleBtn?.addEventListener('click', () => {
      window.soundEngine.sfxEnabled = !window.soundEngine.sfxEnabled;
      const enabled = window.soundEngine.sfxEnabled;

      this.sfxOnIcon?.classList.toggle('hidden', !enabled);
      this.sfxOffIcon?.classList.toggle('hidden', enabled);

      const cfg = window.storageManager.getAppConfig();
      cfg.sfx = enabled;
      window.storageManager.saveAppConfig(cfg);

      window.app?.showToast(enabled ? 'Sound Effects Enabled 🔊' : 'Sound Effects Muted 🔇', 'info');
      if (enabled) window.soundEngine.playClick();
    });
  }

  setupInitialAudioState() {
    const cfg = window.storageManager.getAppConfig();
    window.soundEngine.sfxEnabled = cfg.sfx !== false;
    this.sfxOnIcon?.classList.toggle('hidden', !window.soundEngine.sfxEnabled);
    this.sfxOffIcon?.classList.toggle('hidden', window.soundEngine.sfxEnabled);

    if (this.ambientVolume) {
      this.ambientVolume.value = cfg.ambientVolume !== undefined ? cfg.ambientVolume : 0.5;
      window.soundEngine.setAmbientVolume(parseFloat(this.ambientVolume.value));
    }
  }

  selectAmbientSound(type) {
    this.ambientOptions.forEach(b => {
      b.classList.toggle('active', b.dataset.sound === type);
    });

    const labels = {
      none: 'Ambient Off',
      rain: 'Rain 🌧️',
      white: 'White Noise 💨',
      pink: 'Pink Noise 🌊',
      alpha: '432Hz Focus 🧘'
    };

    if (this.ambientStatusLabel) {
      this.ambientStatusLabel.textContent = labels[type] || 'Ambient Off';
    }

    if (type === 'none') {
      this.ambientWidget?.classList.remove('playing');
      window.soundEngine.stopAmbient();
    } else {
      this.ambientWidget?.classList.add('playing');
      window.soundEngine.playAmbient(type);
      window.app?.showToast(`Ambient audio playing: ${labels[type]}`, 'info');
    }
  }

  say(message, autoDismissMs = 6000) {
    if (!this.quoteText || !this.bubble) return;
    this.quoteText.textContent = message;
    this.bubble.classList.remove('hidden');

    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }

    if (autoDismissMs > 0) {
      this.dismissTimeout = setTimeout(() => {
        this.hideBubble();
      }, autoDismissMs);
    }
  }

  hideBubble() {
    this.bubble?.classList.add('hidden');
  }

  sayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    this.say(this.quotes[randomIndex]);
  }

  reactToPomoComplete(focusMins) {
    this.say(`🔥 Outstanding focus session! You crushed ${focusMins} minutes. Stretch, hydrate, and breathe!`, 8000);
  }

  reactToCardMastered() {
    const cheer = [
      "Boom! Card mastered! Your synapses are firing. 🧠⚡",
      "That's how it's done! Locked into long-term memory. 🌟",
      "One more card in the bag. Keep that momentum going! 🎯"
    ];
    this.say(cheer[Math.floor(Math.random() * cheer.length)], 4000);
  }

  reactToQuizScore(pct) {
    if (pct === 100) {
      this.say("👑 S-Tier Legend! 100% on the quiz! Absolutely flawless retention!", 8000);
    } else if (pct >= 80) {
      this.say("🌟 Great performance! Over 80% correct! You're really mastering this subject.", 6000);
    } else if (pct >= 60) {
      this.say("👍 Solid run! Flip through the flashcards once more and you'll nail a 100%.", 6000);
    } else {
      this.say("💪 Good effort! Practice makes permanent. Let's do a quick flashcard review!", 6000);
    }
  }
}

// Global Study Buddy Instance
window.studyBuddy = new StudyBuddy();
