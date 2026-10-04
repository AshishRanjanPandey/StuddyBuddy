/**
 * app.js - Main Application Coordinator, Navigation, Theme, and Keyboard Shortcuts
 */

class App {
  constructor() {
    this.currentTab = 'pomodoro';
    this.cacheDOM();
    this.init();
  }

  cacheDOM() {
    // Navigation Tabs
    this.navTabs = document.querySelectorAll('.nav-tab');
    this.tabPanes = document.querySelectorAll('.tab-pane');

    // Theme Toggle
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.sunIcon = this.themeToggleBtn?.querySelector('.sun-icon');
    this.moonIcon = this.themeToggleBtn?.querySelector('.moon-icon');

    // Global Settings & Backup
    this.settingsToggleBtn = document.getElementById('settings-toggle-btn');
    this.modalAppSettings = document.getElementById('modal-app-settings');
    this.btnExportData = document.getElementById('btn-export-data');
    this.btnImportData = document.getElementById('btn-import-data');
    this.importFileInput = document.getElementById('import-file-input');
    this.btnResetDefaults = document.getElementById('btn-reset-defaults');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');
  }

  init() {
    this.setupTheme();
    this.bindEvents();
    this.setupModals();
    this.setupKeyboardShortcuts();
  }

  setupTheme() {
    const cfg = window.storageManager.getAppConfig();
    const isLight = cfg.theme === 'light';

    if (isLight) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      this.sunIcon?.classList.remove('hidden');
      this.moonIcon?.classList.add('hidden');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      this.sunIcon?.classList.add('hidden');
      this.moonIcon?.classList.remove('hidden');
    }
  }

  toggleTheme() {
    const isCurrentlyLight = document.body.classList.contains('light-theme');
    const newTheme = isCurrentlyLight ? 'dark' : 'light';

    if (newTheme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      this.sunIcon?.classList.remove('hidden');
      this.moonIcon?.classList.add('hidden');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      this.sunIcon?.classList.add('hidden');
      this.moonIcon?.classList.remove('hidden');
    }

    const cfg = window.storageManager.getAppConfig();
    cfg.theme = newTheme;
    window.storageManager.saveAppConfig(cfg);
    window.soundEngine.playClick();
  }

  bindEvents() {
    // Navigation Tabs
    this.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        this.switchTab(target);
        window.soundEngine.playClick();
      });
    });

    // Theme Toggle
    this.themeToggleBtn?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // App Settings Modal Open
    this.settingsToggleBtn?.addEventListener('click', () => {
      this.modalAppSettings?.classList.remove('hidden');
      window.soundEngine.playClick();
    });

    // Export Data JSON
    this.btnExportData?.addEventListener('click', () => {
      const data = window.storageManager.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studybuddy_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('StudyBuddy data exported successfully!', 'success');
    });

    // Import Data Trigger
    this.btnImportData?.addEventListener('click', () => {
      this.importFileInput?.click();
    });

    // Import File Selection
    this.importFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          window.storageManager.importData(parsed);
          this.showToast('Data restored successfully! Refreshing...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (err) {
          this.showToast('Failed to import JSON: Invalid file format', 'warning');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // Reset Defaults
    this.btnResetDefaults?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data back to the default sample decks and quizzes? This will clear custom items.')) {
        window.storageManager.resetToDefaults();
        this.showToast('Reset to default sample content! Reloading...', 'info');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    this.navTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    this.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${tabId}`);
    });

    // Specific tab refresh logic
    if (tabId === 'flashcards' && window.flashcardEngine) {
      window.flashcardEngine.loadActiveDeck();
    } else if (tabId === 'quiz' && window.quizArena) {
      window.quizArena.populateSetupDropdowns();
    }
  }

  setupModals() {
    // Universal close buttons with data-close
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        modal?.classList.add('hidden');
        window.soundEngine.playClick();
      });
    });

    // Click outside backdrop to close
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    // ESC key closes any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if user is typing in an input or textarea or modal is open
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const anyModalOpen = document.querySelector('.modal-backdrop:not(.hidden)');
      if (anyModalOpen) return;

      // Flashcards Tab Shortcuts
      if (this.currentTab === 'flashcards' && window.flashcardEngine) {
        if (e.code === 'Space') {
          e.preventDefault();
          window.flashcardEngine.toggleFlip();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          window.flashcardEngine.nextCard();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          window.flashcardEngine.prevCard();
        } else if (e.key === '1') {
          e.preventDefault();
          window.flashcardEngine.markMastery(false);
        } else if (e.key === '2') {
          e.preventDefault();
          window.flashcardEngine.markMastery(true);
        }
      }
    });
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconMap = {
      success: '✨',
      info: '💡',
      warning: '⚠️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || '⚡'}</span>
      <span class="toast-text">${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }
}

// Boot Application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
