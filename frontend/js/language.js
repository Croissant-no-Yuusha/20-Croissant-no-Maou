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
    // Reload recipes to update dynamic content with new language
    if (typeof window.loadRecipes === 'function') {
      window.loadRecipes();
    }
  },
  getTranslations(lang) {
    console.log('Getting translations for language:', lang);
    console.log('Available translations_th:', typeof window.translations_th);
    console.log('Available translations_en:', typeof window.translations_en);
    
    switch(lang) {
      case 'th':
        const thTranslations = typeof window.translations_th !== 'undefined' ? window.translations_th : {};
        console.log('Thai translations keys:', Object.keys(thTranslations).length);
        return thTranslations;
      case 'en':
      default:
        const enTranslations = typeof window.translations_en !== 'undefined' ? window.translations_en : {};
        console.log('English translations keys:', Object.keys(enTranslations).length);
        return enTranslations;
    }
  }
};
