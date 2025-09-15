// Theme management
export const themeManager = {
  init() {
    this.setupThemeToggle();
    this.loadSavedTheme();
  },
  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => this.toggleTheme());
  },
  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => { document.body.style.transition = ''; }, 300);
  },
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
  }
};
