// Language/translation logic
export const languageManager = {
  init() {
    this.setupLanguageSwitcher();
    this.loadSavedLanguage();
  },
  setupLanguageSwitcher() {
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
  },
  changeLanguage(lang) {
    localStorage.setItem('language', lang);
    this.updateTexts(lang);
  },
  loadSavedLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    document.getElementById('languageSelect').value = savedLang;
    this.updateTexts(savedLang);
  },
  updateTexts(lang) {
    const translations = this.getTranslations(lang);
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
      const key = element.getAttribute('data-translate-placeholder');
      if (translations[key]) {
        element.placeholder = translations[key];
      }
    });
    if (typeof window.loadRecipes === 'function') {
      window.loadRecipes();
    }
  },
  getTranslations(lang) {
    switch(lang) {
      case 'th':
        return typeof window.translations_th !== 'undefined' ? window.translations_th : {};
      case 'en':
      default:
        return typeof window.translations_en !== 'undefined' ? window.translations_en : {};
    }
  }
};
