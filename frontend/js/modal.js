import { formatIngredientsForModal, formatInstructionsForModal } from './utils.js';
import { languageManager } from './language.js';

// Modal management
export const modalManager = {
  init() {
    this.setupModal();
  },

  setupModal() {
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.getElementById('closeModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Close modal events
    closeBtn.addEventListener('click', () => this.closeModal());
    modalCloseBtn.addEventListener('click', () => this.closeModal());
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        this.closeModal();
      }
    });
  },

  showModal(recipe) {
    const modal = document.getElementById('recipeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalRecipeContent');
    const editBtn = document.getElementById('modalEditBtn');
    const deleteBtn = document.getElementById('modalDeleteBtn');

    modalTitle.textContent = recipe.title;
    
    const createdDate = new Date(recipe.created_at).toLocaleDateString();
    const isUpdated = recipe.updated_at !== recipe.created_at;
    const updatedDate = isUpdated ? new Date(recipe.updated_at).toLocaleDateString() : null;

    const lang = localStorage.getItem('language') || 'en';
    const translations = languageManager.getTranslations(lang);
    
    modalContent.innerHTML = `
      <div class="modal-recipe-content">
        ${recipe.ingredients ? `
          <div class="modal-section">
            <h4>🥘 ${translations.ingredients || 'Ingredients'}</h4>
            <div class="modal-ingredients">${formatIngredientsForModal(recipe.ingredients)}</div>
          </div>
        ` : ''}
        
        <div class="modal-section">
          <h4>📝 ${translations.instructions || 'Instructions'}</h4>
          <div class="modal-instructions">${formatInstructionsForModal(recipe.instructions)}</div>
        </div>
        
        <div class="modal-section">
          <h4>📅 ${translations.recipe_info || 'Recipe Information'}</h4>
          <div class="modal-meta">
            <p><strong>${translations.created || 'Created'}:</strong> ${createdDate}</p>
            ${isUpdated ? `<p><strong>${translations.updated || 'Updated'}:</strong> ${updatedDate}</p>` : ''}
            ${recipe.is_ai_generated ? `<p><strong>🤖 ${translations.source || 'Source'}:</strong> AI Generated (${recipe.source || 'ai_gemini'})</p>` : ''}
            ${recipe.difficulty ? `<p><strong>📊 ${translations.difficulty || 'Difficulty'}:</strong> ${recipe.difficulty}</p>` : ''}
            ${recipe.prep_time || recipe.cook_time ? `<p><strong>⏱️ ${translations.time || 'Time'}:</strong> ${recipe.prep_time || 0}min prep, ${recipe.cook_time || 0}min cook</p>` : ''}
            ${recipe.servings ? `<p><strong>👥 ${translations.servings || 'Servings'}:</strong> ${recipe.servings}</p>` : ''}
            ${recipe.tags && recipe.tags.length > 0 ? `<p><strong>🏷️ ${translations.tags || 'Tags'}:</strong> ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</p>` : ''}
          </div>
        </div>
      </div>
    `;

    // Set up action buttons
    editBtn.onclick = () => {
      this.closeModal();
      window.editRecipe(recipe.id);
    };
    
    deleteBtn.onclick = () => {
      this.closeModal();
      window.deleteRecipe(recipe.id);
    };

    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);

    // Focus management for accessibility
    document.getElementById('closeModal').focus();
  },

  closeModal() {
    const modal = document.getElementById('recipeModal');
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
};

// Custom confirmation modal
export function showConfirmationModal(title, message) {
  return new Promise((resolve) => {
    const lang = localStorage.getItem('language') || 'en';
    const translations = languageManager.getTranslations(lang);
    
    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${translations.delete_confirmation || title}</h2>
        </div>
        <div class="modal-body">
          <p>${translations.delete_warning || message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger confirm-btn">${translations.delete || "Delete"}</button>
          <button class="btn btn-secondary cancel-btn">${translations.cancel || "Cancel"}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector('.confirm-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');

    const cleanup = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    };

    confirmBtn.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });

    cancelBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
        resolve(false);
      }
    });

    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);

    cancelBtn.focus();
  });
}
