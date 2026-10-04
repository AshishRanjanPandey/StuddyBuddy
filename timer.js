/**
 * timer.js - Pomodoro Clock Engine with SVG Progress Ring and Stats
 */

class PomodoroTimer {
  constructor() {
    this.mode = 'focus'; // 'focus' | 'shortBreak' | 'longBreak'
    this.isRunning = false;
    this.timerId = null;
    this.timeRemaining = 25 * 60;
    this.totalTime = 25 * 60;
    this.sessionsCompletedInCycle = 0;
    this.circumference = 2 * Math.PI * 140; // r = 140 -> ~879.64

    this.cacheDOM();
    this.init();
  }

  cacheDOM() {
    // Mode Buttons
    this.btnFocus = document.getElementById('mode-focus');
    this.btnShort = document.getElementById('mode-short');
    this.btnLong = document.getElementById('mode-long');
    this.modeButtons = [this.btnFocus, this.btnShort, this.btnLong];

    // Badges
    this.focusBadge = document.getElementById('focus-dur-badge');
    this.shortBadge = document.getElementById('short-dur-badge');
    this.longBadge = document.getElementById('long-dur-badge');

    // Display & Progress
    this.timerDisplay = document.getElementById('timer-display');
    this.progressRing = document.getElementById('timer-progress-ring');
    this.currentModeTag = document.getElementById('timer-current-mode-tag');
    this.statusText = document.getElementById('timer-status-text');
    this.taskInput = document.getElementById('pomodoro-task-input');

    // Action Buttons
    this.toggleBtn = document.getElementById('pomo-toggle-btn');
    this.toggleText = document.getElementById('pomo-toggle-text');
    this.playIcon = this.toggleBtn?.querySelector('.play-icon');
    this.pauseIcon = this.toggleBtn?.querySelector('.pause-icon');
    this.resetBtn = document.getElementById('pomo-reset-btn');
    this.skipBtn = document.getElementById('pomo-skip-btn');

    // Stats Displays
    this.statPomosDone = document.getElementById('stats-pomos-completed');
    this.statFocusMins = document.getElementById('stats-focus-minutes');
    this.statStreak = document.getElementById('stats-streak-count');

    // Preset buttons
    this.presetBtns = document.querySelectorAll('.preset-btn');

    // Modal elements
    this.modalSettings = document.getElementById('modal-pomo-settings');
    this.formSettings = document.getElementById('form-pomo-settings');
    this.settingFocusMin = document.getElementById('setting-focus-min');
    this.settingShortMin = document.getElementById('setting-short-min');
    this.settingLongMin = document.getElementById('setting-long-min');
    this.settingAutoBreaks = document.getElementById('setting-auto-breaks');
    this.settingAutoFocus = document.getElementById('setting-auto-focus');
    this.openSettingsBtn = document.getElementById('open-pomo-settings-btn');
  }

  init() {
    if (!this.timerDisplay) return;

    this.setupProgressRing();
    this.loadSettings();
    this.renderStats();
    this.bindEvents();
    this.setMode('focus', false);
  }

  setupProgressRing() {
    if (!this.progressRing) return;
    this.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    this.progressRing.style.strokeDashoffset = '0';
  }

  loadSettings() {
    const s = window.storageManager.getPomoSettings();
    if (this.settingFocusMin) this.settingFocusMin.value = s.focusMinutes;
    if (this.settingShortMin) this.settingShortMin.value = s.shortBreakMinutes;
    if (this.settingLongMin) this.settingLongMin.value = s.longBreakMinutes;
    if (this.settingAutoBreaks) this.settingAutoBreaks.checked = s.autoStartBreaks;
    if (this.settingAutoFocus) this.settingAutoFocus.checked = s.autoStartFocus;

    if (this.focusBadge) this.focusBadge.textContent = `${s.focusMinutes}m`;
    if (this.shortBadge) this.shortBadge.textContent = `${s.shortBreakMinutes}m`;
    if (this.longBadge) this.longBadge.textContent = `${s.longBreakMinutes}m`;
  }

  bindEvents() {
    // Mode switcher buttons
    this.modeButtons.forEach(btn => {
      btn?.addEventListener('click', () => {
        window.soundEngine.playClick();
        const mode = btn.dataset.mode;
        this.setMode(mode, false);
      });
    });

    // Toggle Play / Pause
    this.toggleBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.toggleTimer();
    });

    // Reset button
    this.resetBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.resetTimer();
    });

    // Skip button
    this.skipBtn?.addEventListener('click', () => {
      window.soundEngine.playClick();
      this.skipToNextMode();
    });

    // Presets (Classic, Deep Work, Sprint)
    this.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        window.soundEngine.playClick();
        this.presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const preset = btn.dataset.preset;
        const s = window.storageManager.getPomoSettings();
        if (preset === 'classic') {
          s.focusMinutes = 25;
          s.shortBreakMinutes = 5;
          s.longBreakMinutes = 15;
        } else if (preset === 'extended') {
          s.focusMinutes = 50;
          s.shortBreakMinutes = 10;
          s.longBreakMinutes = 20;
        } else if (preset === 'quick') {
          s.focusMinutes = 15;
          s.shortBreakMinutes = 3;
          s.longBreakMinutes = 10;
        }
        window.storageManager.savePomoSettings(s);
        this.loadSettings();
        this.setMode(this.mode, false);
        window.app?.showToast(`Timer preset updated: ${btn.textContent.trim()}`, 'info');
      });
    });

    // Open Settings Modal
    this.openSettingsBtn?.addEventListener('click', () => {
      this.loadSettings();
      this.modalSettings?.classList.remove('hidden');
    });

    // Save Settings Form
    this.formSettings?.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = {
        focusMinutes: Math.max(1, parseInt(this.settingFocusMin.value) || 25),
        shortBreakMinutes: Math.max(1, parseInt(this.settingShortMin.value) || 5),
        longBreakMinutes: Math.max(1, parseInt(this.settingLongMin.value) || 15),
        autoStartBreaks: this.settingAutoBreaks.checked,
        autoStartFocus: this.settingAutoFocus.checked
      };
      window.storageManager.savePomoSettings(s);
      this.loadSettings();
      this.setMode(this.mode, false);
      this.modalSettings?.classList.add('hidden');
      window.app?.showToast('Pomodoro settings saved!', 'success');
    });
  }

  getModeDuration(mode) {
    const s = window.storageManager.getPomoSettings();
    if (mode === 'shortBreak') return s.shortBreakMinutes * 60;
    if (mode === 'longBreak') return s.longBreakMinutes * 60;
    return s.focusMinutes * 60;
  }

  setMode(mode, autoStart = false) {
    this.pauseTimer();
    this.mode = mode;
    this.totalTime = this.getModeDuration(mode);
    this.timeRemaining = this.totalTime;

    // Highlight current mode button
    this.modeButtons.forEach(btn => {
      btn?.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Visual tags & colors
    if (mode === 'focus') {
      this.currentModeTag.textContent = 'FOCUS SESSION';
      this.statusText.textContent = this.taskInput?.value ? `Focusing: ${this.taskInput.value}` : 'Ready to focus';
      this.progressRing.style.stroke = 'var(--primary-light)';
    } else if (mode === 'shortBreak') {
      this.currentModeTag.textContent = 'SHORT BREAK';
      this.statusText.textContent = 'Relax, stretch and hydrate 🥤';
      this.progressRing.style.stroke = 'var(--accent-emerald)';
    } else if (mode === 'longBreak') {
      this.currentModeTag.textContent = 'LONG BREAK';
      this.statusText.textContent = 'Great work! Take a deep breath 🌴';
      this.progressRing.style.stroke = 'var(--accent-cyan)';
    }

    this.updateDisplay();

    if (autoStart) {
      this.startTimer();
    }
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Update UI toggle button
    this.playIcon?.classList.add('hidden');
    this.pauseIcon?.classList.remove('hidden');
    this.toggleText.textContent = 'Pause';
    this.statusText.textContent = this.mode === 'focus' ? 'Session in progress...' : 'Resting in progress...';

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pauseTimer() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.playIcon?.classList.remove('hidden');
    this.pauseIcon?.classList.add('hidden');
    this.toggleText.textContent = 'Resume';
    this.statusText.textContent = 'Paused';
  }

  resetTimer() {
    this.pauseTimer();
    this.toggleText.textContent = this.mode === 'focus' ? 'Start Focus' : 'Start Break';
    this.timeRemaining = this.totalTime;
    this.updateDisplay();
    this.statusText.textContent = 'Timer reset';
  }

  tick() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;
      this.updateDisplay();
    } else {
      this.onTimerComplete();
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    this.timerDisplay.textContent = formatted;

    // SVG Progress ring update
    const fraction = this.totalTime > 0 ? (this.totalTime - this.timeRemaining) / this.totalTime : 0;
    const offset = this.circumference * (1 - fraction);
    this.progressRing.style.strokeDashoffset = offset;

    // Browser tab title update
    const modeLabel = this.mode === 'focus' ? 'Focus' : 'Break';
    document.title = `(${formatted}) ${modeLabel} - StudyBuddy`;
  }

  onTimerComplete() {
    this.pauseTimer();
    window.soundEngine.playTimerChime();

    const s = window.storageManager.getPomoSettings();

    if (this.mode === 'focus') {
      const focusMins = Math.round(this.totalTime / 60);
      window.storageManager.recordPomoCompleted(focusMins);
      this.renderStats();
      this.sessionsCompletedInCycle++;

      // Trigger Confetti!
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      window.app?.showToast(`🎉 Focus session complete! Logged ${focusMins} mins.`, 'success');
      window.studyBuddy?.reactToPomoComplete(focusMins);

      // Determine next break: Long break after 4 sessions, else short break
      if (this.sessionsCompletedInCycle % 4 === 0) {
        this.setMode('longBreak', s.autoStartBreaks);
      } else {
        this.setMode('shortBreak', s.autoStartBreaks);
      }
    } else {
      // Break is complete -> Back to focus!
      window.app?.showToast('☕ Break over! Time to get back in the zone.', 'info');
      window.studyBuddy?.say('Ready for another productive sprint? You got this!');
      this.setMode('focus', s.autoStartFocus);
    }
  }

  skipToNextMode() {
    const s = window.storageManager.getPomoSettings();
    if (this.mode === 'focus') {
      this.setMode('shortBreak', false);
    } else {
      this.setMode('focus', false);
    }
  }

  renderStats() {
    const stats = window.storageManager.getPomoStats();
    if (this.statPomosDone) this.statPomosDone.textContent = stats.pomosCompleted || 0;
    if (this.statFocusMins) this.statFocusMins.textContent = `${stats.focusMinutes || 0}m`;
    if (this.statStreak) this.statStreak.textContent = `${stats.streak || 1}🔥`;
  }
}

// Global Pomodoro Timer Instance
window.pomodoroTimer = new PomodoroTimer();
