    const API_URL = "http://localhost:3039";
let aiSuggestionCount = parseInt(localStorage.getItem('aiSuggestionCount')) || 0;

// Theme and Language Management
const themeManager = {
  init() {
    this.setupThemeToggle();
    this.setupLanguageSwitcher();
    this.loadSavedTheme();
    this.loadSavedLanguage();
  },

  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => this.toggleTheme());
  },

  setupLanguageSwitcher() {
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
  },

  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    
    // Add transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  },

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
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
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
      const key = element.getAttribute('data-translate-placeholder');
      if (translations[key]) {
        element.placeholder = translations[key];
      }
    });

    // Reload recipes to update dynamic content with new language
    if (typeof loadRecipes === 'function') {
      loadRecipes();
    }
  },

  getTranslations(lang) {
    // Use external translation files
    switch(lang) {
      case 'th':
        return typeof translations_th !== 'undefined' ? translations_th : {};
      case 'en':
      default:
        return typeof translations_en !== 'undefined' ? translations_en : {};
    }
  }
};

// Modal Management
const modalManager = {
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
    const translations = this.getTranslations(lang);
    
    modalContent.innerHTML = `
      <div class="modal-recipe-content">
        ${recipe.ingredients ? `
          <div class="modal-section">
            <h4>🥘 ${translations.ingredients || 'Ingredients'}</h4>
            <div class="modal-ingredients">${recipe.ingredients}</div>
          </div>
        ` : ''}
        
        <div class="modal-section">
          <h4>📝 ${translations.instructions || 'Instructions'}</h4>
          <div class="modal-instructions">${recipe.instructions.replace(/\n/g, '<br>')}</div>
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
            ${recipe.tags && recipe.tags.length > 0 ? `<p><strong>🏷️ ${translations.tags || 'Tags'}:</strong> ${recipe.tags.join(', ')}</p>` : ''}
          </div>
        </div>
      </div>
    `;

    // Set up action buttons
    editBtn.onclick = () => {
      this.closeModal();
      editRecipe(recipe.id);
    };
    
    deleteBtn.onclick = () => {
      this.closeModal();
      deleteRecipe(recipe.id);
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
  },

  getTranslations(lang) {
    // Use external translation files
    switch(lang) {
      case 'th':
        return typeof translations_th !== 'undefined' ? translations_th : {};
      case 'en':
      default:
        return typeof translations_en !== 'undefined' ? translations_en : {};
    }
  }
};

// Notification System
const notificationManager = {
  show(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => this.remove(notification), 5000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.remove(notification);
    });
  },

  remove(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
};

function updateStats() {
  // Stats are now updated by loadRecipes() function
  // This function kept for compatibility but loadRecipes() handles the counts
}

    const searchInput = document.getElementById("searchRecipes");

    searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    const recipeCards = document.querySelectorAll(".recipe-card");
    let anyMatch = false;

    recipeCards.forEach(card => {
      const title = card.querySelector(".recipe-title").textContent.toLowerCase();
      const ingredients = card.querySelector(".recipe-ingredients")?.textContent.toLowerCase() || "";

    if (title.includes(query) || ingredients.includes(query)) {
      card.style.display = "block";
      card.classList.add("highlight");
      anyMatch = true;
    } else {
      card.style.display = "none";
      card.classList.remove("highlight");
    }
  });

  // Show "no results" message
  const list = document.getElementById("recipesList");
  let noResults = list.querySelector(".no-results");
  if (!anyMatch) {
    if (!noResults) {
      const lang = localStorage.getItem('language') || 'en';
      const translations = themeManager.getTranslations(lang);
      const div = document.createElement("div");
      div.className = "empty-state no-results";
      div.innerHTML = `<h3>${translations.no_results_found || 'No recipes found'}</h3><p>${translations.try_different_search || 'Try another search term.'}</p>`;
      list.appendChild(div);
    }
  } else if (noResults) {
    noResults.remove();
  }
});


    async function loadRecipes() {
      try {
        const res = await fetch(`${API_URL}/recipes`);
        if (!res.ok) throw new Error('Failed to load recipes');
        
        const recipes = await res.json();
        const list = document.getElementById("recipesList");
        
        // Update counters
        document.getElementById('totalRecipes').textContent = recipes.length;
        
        // Count AI-generated recipes
        const aiRecipes = recipes.filter(recipe => recipe.is_ai_generated).length;
        document.getElementById('aiSuggestions').textContent = aiRecipes;
        
        if (recipes.length === 0) {
          const lang = localStorage.getItem('language') || 'en';
          const translations = themeManager.getTranslations(lang);
          list.innerHTML = `
            <div class="empty-state">
              <h3>${translations.no_recipes || 'No recipes yet'}</h3>
              <p>${translations.no_recipes_desc || 'Generate your first recipe with AI or add one manually!'}</p>
            </div>
          `;
          return;
        }

        const recipesGrid = document.createElement('div');
        recipesGrid.className = 'recipes-grid';

        recipes.forEach((recipe, index) => {
          const recipeCard = document.createElement("div");
          recipeCard.className = "recipe-card fade-in";
          recipeCard.style.animationDelay = `${index * 0.08}s`;
          
          const createdDate = new Date(recipe.created_at).toLocaleDateString();
          const isUpdated = recipe.updated_at !== recipe.created_at;
          const updatedDate = isUpdated ? new Date(recipe.updated_at).toLocaleDateString() : null;
          
          // Get current language translations
          const lang = localStorage.getItem('language') || 'en';
          const translations = themeManager.getTranslations(lang);
          
          // Truncate instructions for card view
          const truncatedInstructions = recipe.instructions.length > 150 
            ? recipe.instructions.substring(0, 150) + '...' 
            : recipe.instructions;
          
          recipeCard.innerHTML = `
            <div class="recipe-title">
              🍽️ ${recipe.title}
              ${recipe.is_ai_generated ? '<span class="ai-badge">🤖 AI</span>' : ''}
            </div>
            ${recipe.ingredients ? `
              <div class="recipe-ingredients">
                <strong>🥘 ${translations.ingredients || 'Ingredients'}:</strong> ${recipe.ingredients}
              </div>
            ` : ''}
            <div class="recipe-instructions">${truncatedInstructions.replace(/\n/g, '<br>')}</div>
            <div class="recipe-meta">
              📅 ${translations.created || 'Created'}: ${createdDate}
              ${isUpdated ? `• ${translations.updated || 'Updated'}: ${updatedDate}` : ''}
            </div>
            <div class="recipe-buttons">
              <button class="btn btn-secondary btn-small" onclick="editRecipe(${recipe.id})" title="${translations.edit_recipe_button || 'Edit Recipe'}">
                ✏️ ${translations.edit || 'Edit'}
              </button>
              <button class="btn btn-danger btn-small" onclick="deleteRecipe(${recipe.id})" title="${translations.delete_recipe_button || 'Delete Recipe'}">
                🗑️ ${translations.delete || 'Delete'}
              </button>
            </div>
          `;

          // Add click event to show modal (except when clicking buttons)
          recipeCard.addEventListener('click', (e) => {
            if (!e.target.closest('.recipe-buttons')) {
              modalManager.showModal(recipe);
            }
          });

          // Add hover effect
          recipeCard.addEventListener('mouseenter', () => {
            recipeCard.style.transform = 'translateY(-8px)';
          });

          recipeCard.addEventListener('mouseleave', () => {
            if (!recipeCard.classList.contains('highlight')) {
              recipeCard.style.transform = '';
            }
          });

          recipesGrid.appendChild(recipeCard);
        });

        list.innerHTML = '';
        list.appendChild(recipesGrid);
      } catch (error) {
        console.error('Error loading recipes:', error);
        const lang = localStorage.getItem('language') || 'en';
        const translations = themeManager.getTranslations(lang);
        document.getElementById("recipesList").innerHTML = `
          <div class="empty-state">
            <h3>${translations.error_loading_recipes || 'Error loading recipes'}</h3>
            <p>${translations.connection_error || 'Please check your connection and try again.'}</p>
          </div>
        `;
      }
    }

    document.getElementById("recipeForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const id = document.getElementById("recipeId").value;
      const title = document.getElementById("title").value.trim();
      const instructions = document.getElementById("instructions").value.trim();
      const ingredients = document.getElementById("recipeIngredients").value.trim();

      if (!title || !instructions) {
        const lang = localStorage.getItem('language') || 'en';
        const trans = themeManager.getTranslations(lang);
        notificationManager.show(trans.title_required || "Please fill in both title and instructions", 'warning');
        return;
      }

      try {
        const saveBtn = document.getElementById("saveBtn");
        const lang1 = localStorage.getItem('language') || 'en';
        const trans1 = themeManager.getTranslations(lang1);
        saveBtn.textContent = trans1.saving || "Saving...";
        saveBtn.disabled = true;

        const url = id ? `${API_URL}/recipes/${id}` : `${API_URL}/recipes`;
        const method = id ? "PUT" : "POST";

        // Prepare request body - include AI flags for both new and edited recipes
        const requestBody = { 
          title, 
          instructions, 
          ingredients
        };

        // If editing, preserve or allow updating AI status
        if (id) {
          // For editing, check if user wants to change AI status
          const isAiCheckbox = document.getElementById("isAiGenerated");
          if (isAiCheckbox) {
            requestBody.is_ai_generated = isAiCheckbox.checked;
            requestBody.source = isAiCheckbox.checked ? 'ai_gemini' : 'manual';
          }
        } else {
          // For new recipes, check if it's from AI generation
          const formTitle = document.getElementById("formTitle").textContent;
          const isAiGenerated = formTitle.includes("AI") || formTitle.includes("ai");
          if (isAiGenerated) {
            requestBody.is_ai_generated = true;
            requestBody.source = 'ai_gemini';
            requestBody.tags = ['ai-generated'];
          }
        }

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });

        if (!res.ok) throw new Error('Failed to save recipe');

        document.getElementById("recipeId").value = "";
        document.getElementById("title").value = "";
        document.getElementById("instructions").value = "";
        document.getElementById("recipeIngredients").value = "";
        
        const langReset = localStorage.getItem('language') || 'en';
        const transReset = themeManager.getTranslations(langReset);
        document.getElementById("formTitle").textContent = transReset.add_new_recipe || "Add New Recipe";
        document.getElementById("cancelBtn").style.display = "none";
        
        await loadRecipes();
        
        const lang2 = localStorage.getItem('language') || 'en';
        const trans2 = themeManager.getTranslations(lang2);
        const successMsg = id 
          ? (trans2.recipe_updated_success || "Recipe updated successfully!")
          : (trans2.recipe_saved_success || "Recipe saved successfully!");
        notificationManager.show(successMsg, 'success');

      } catch (error) {
        console.error('Error saving recipe:', error);
        const lang3 = localStorage.getItem('language') || 'en';
        const trans3 = themeManager.getTranslations(lang3);
        notificationManager.show(trans3.recipe_save_failed || 'Failed to save recipe. Please try again.', 'error');
      } finally {
        const saveBtn = document.getElementById("saveBtn");
        const lang4 = localStorage.getItem('language') || 'en';
        const trans4 = themeManager.getTranslations(lang4);
        saveBtn.innerHTML = `<img src="photos/download.png" alt="icon" class="icon-btn" loading="lazy"><span>${trans4.save_recipe || "Save Recipe"}</span>`;
        saveBtn.disabled = false;
      }
    });

    document.getElementById("cancelBtn").addEventListener("click", () => {
      document.getElementById("recipeId").value = "";
      document.getElementById("title").value = "";
      document.getElementById("instructions").value = "";
      document.getElementById("recipeIngredients").value = "";
      
      // Hide AI status checkbox
      const aiStatusGroup = document.getElementById("aiStatusGroup");
      if (aiStatusGroup) {
        aiStatusGroup.style.display = "none";
        document.getElementById("isAiGenerated").checked = false;
      }
      
      const lang = localStorage.getItem('language') || 'en';
      const translations = themeManager.getTranslations(lang);
      document.getElementById("formTitle").textContent = translations.add_new_recipe || "Add New Recipe";
      document.getElementById("cancelBtn").style.display = "none";
    });

    async function editRecipe(id) {
      try {
        const res = await fetch(`${API_URL}/recipes/${id}`);
        if (!res.ok) throw new Error('Recipe not found');
        
        const recipe = await res.json();
        
        document.getElementById("recipeId").value = recipe.id;
        document.getElementById("title").value = recipe.title;
        document.getElementById("instructions").value = recipe.instructions;
        document.getElementById("recipeIngredients").value = recipe.ingredients || "";
        
        // Show and set AI status checkbox
        const aiStatusGroup = document.getElementById("aiStatusGroup");
        const isAiCheckbox = document.getElementById("isAiGenerated");
        if (aiStatusGroup && isAiCheckbox) {
          aiStatusGroup.style.display = "block";
          isAiCheckbox.checked = recipe.is_ai_generated || false;
        }
        
        const lang = localStorage.getItem('language') || 'en';
        const translations = themeManager.getTranslations(lang);
        document.getElementById("formTitle").textContent = translations.edit_recipe || "Edit Recipe";
        document.getElementById("cancelBtn").style.display = "inline-block";
        
        document.getElementById("recipeForm").scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.error('Error loading recipe for edit:', error);
        notificationManager.show('Failed to load recipe for editing.', 'error');
      }
    }

    async function deleteRecipe(id) {
      // Create custom confirmation modal
      const confirmed = await showConfirmationModal();
      if (!confirmed) return;
      
      try {
        const res = await fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error('Failed to delete recipe');
        
        await loadRecipes();
        const lang9 = localStorage.getItem('language') || 'en';
        const trans9 = themeManager.getTranslations(lang9);
        notificationManager.show(trans9.recipe_deleted_success || 'Recipe deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        const lang10 = localStorage.getItem('language') || 'en';
        const trans10 = themeManager.getTranslations(lang10);
        notificationManager.show(trans10.recipe_delete_failed || 'Failed to delete recipe. Please try again.', 'error');
      }
    }

    // Custom confirmation modal
    function showConfirmationModal(title, message) {
      return new Promise((resolve) => {
        const lang8 = localStorage.getItem('language') || 'en';
        const trans8 = themeManager.getTranslations(lang8);
        
        const modal = document.createElement('div');
        modal.className = 'modal confirmation-modal';
        modal.innerHTML = `
          <div class="modal-content">
            <div class="modal-header">
              <h2>${trans8.delete_confirmation || title}</h2>
            </div>
            <div class="modal-body">
              <p>${trans8.delete_warning || message}</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-danger confirm-btn">${trans8.delete || "Delete"}</button>
              <button class="btn btn-secondary cancel-btn">${trans8.cancel || "Cancel"}</button>
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

    document.getElementById("generateBtn").addEventListener("click", async () => {
  const ingredients = document.getElementById("ingredients").value.trim();
  if (!ingredients) {
    const lang7 = localStorage.getItem('language') || 'en';
    const trans7 = themeManager.getTranslations(lang7);
    notificationManager.show(trans7.please_enter_ingredients || "Please enter some ingredients", 'warning');
    return;
  }

  const outputElement = document.getElementById("aiOutput");
  const generateBtn = document.getElementById("generateBtn");

  const lang6 = localStorage.getItem('language') || 'en';
  const trans6 = themeManager.getTranslations(lang6);
  outputElement.innerHTML = `<div class="loading">${trans6.generating_recipe || 'Generating your perfect recipe...'}</div>`;
  outputElement.style.display = "block";
  outputElement.className = "ai-output show";

  const lang5 = localStorage.getItem('language') || 'en';
  const trans5 = themeManager.getTranslations(lang5);
  generateBtn.innerHTML = `<span>${trans5.generating || "Generating..."}</span>`;
  generateBtn.disabled = true;
  generateBtn.classList.add('loading');

  try {
    const res = await fetch(`${API_URL}/ai-suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients })
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    let suggestion = data.suggestion || "No recipe suggestion received from the server.";

    // Show raw AI output with better formatting
    const lang8 = localStorage.getItem('language') || 'en';
    const trans8 = themeManager.getTranslations(lang8);
    outputElement.innerHTML = `
      <div class="ai-recipe-result">
        <div class="ai-suggestion-text">${suggestion}</div>
        <div class="ai-actions" style="margin-top: 1rem; display: flex; gap: 0.75rem;">
          <button class="btn btn-primary btn-small" onclick="quickSaveRecipe(\`${suggestion.replace(/`/g, '\\`')}\`, \`${ingredients}\`)">
            ${trans8.quick_save || 'Quick Save'}
          </button>
        </div>
      </div>
    `;
    outputElement.className = "ai-output has-content show";
    outputElement.scrollIntoView({ behavior: 'smooth' });

    // --- Parse the structured recipe ---
    let title = "AI Generated Recipe";
    let parsedIngredients = ingredients;
    let instructions = suggestion;

    const titleMatch = suggestion.match(/(?:Recipe Title:|Title:)\s*(.+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    const ingredientsMatch = suggestion.match(/Ingredients:\s*([\s\S]*?)(?=Instructions:|$)/i);
    if (ingredientsMatch) {
      parsedIngredients = ingredientsMatch[1]
        .split('\n')
        .map(line => line.replace(/[-*•]/g, '').trim())
        .filter(line => line.length > 0)
        .join(', ');
    }

    const instructionsMatch = suggestion.match(/Instructions:\s*([\s\S]*)/i);
    if (instructionsMatch) {
      instructions = instructionsMatch[1]
        .trim()
        .replace(/\n{2,}/g, '\n'); // clean double newlines
    }

    // --- Auto-fill Add New Recipe form ---
    document.getElementById("title").value = title;
    document.getElementById("instructions").value = instructions;
    document.getElementById("recipeIngredients").value = parsedIngredients;
    
    const langForm = localStorage.getItem('language') || 'en';
    const transForm = themeManager.getTranslations(langForm);
    document.getElementById("formTitle").textContent = transForm.save_ai_recipe || "Save AI Recipe";

    // Highlight the form
    document.getElementById("recipeForm").scrollIntoView({ behavior: 'smooth' });
    const formCard = document.querySelector('#recipeForm').closest('.card');
    formCard.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
    setTimeout(() => formCard.style.boxShadow = '', 2000);

    // Stats will be updated when recipes are loaded from database

  } catch (error) {
    console.error("AI generation error:", error);
    outputElement.innerHTML = `❌ Error: ${error.message}<br><br>Please check your connection and try again.`;
    outputElement.className = "ai-output";
  } finally {
    const lang6 = localStorage.getItem('language') || 'en';
    const trans6 = themeManager.getTranslations(lang6);
    generateBtn.innerHTML = `<img src="photos/gearwithcircle.png" alt="icon" class="icon-btn" loading="lazy"><span>${trans6.generate_recipe || "Generate Recipe"}</span>`;
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading');
  }
});


    function quickSaveRecipe(suggestion, originalIngredients) {
      const lines = suggestion.split('\n');
      let title = "AI Generated Recipe";
      let instructions = suggestion;
      
      for (let line of lines) {
        if (line.includes('Recipe Title:') || line.includes('**Recipe Title:**')) {
          title = line.replace(/\*\*Recipe Title:\*\*|\*\*|\*|Recipe Title:/g, '').trim();
          break;
        }
        if (line.includes('Title:')) {
          title = line.replace(/Title:/g, '').trim();
          break;
        }
      }
      
      document.getElementById("title").value = title;
      document.getElementById("instructions").value = instructions;
      document.getElementById("recipeIngredients").value = originalIngredients;
      
      const lang = localStorage.getItem('language') || 'en';
      const translations = themeManager.getTranslations(lang);
      document.getElementById("formTitle").textContent = translations.save_ai_recipe || "Save AI Recipe";
      
      document.getElementById("recipeForm").scrollIntoView({ behavior: 'smooth' });
      
      const formCard = document.querySelector('#recipeForm').closest('.card');
      formCard.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
      setTimeout(() => {
        formCard.style.boxShadow = '';
      }, 2000);
    }

    document.getElementById("ingredients").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("generateBtn").click();
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      // Initialize all managers
      themeManager.init();
      modalManager.init();
      
      // Load initial data
      loadRecipes();
      updateStats();
      
      // Add smooth animations and interactions
      setTimeout(() => {
        document.querySelector('.container').style.opacity = '1';
      }, 100);

      // Add keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          document.getElementById('searchRecipes').focus();
        }
        
        // Ctrl/Cmd + N for new recipe
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          e.preventDefault();
          document.getElementById('title').focus();
        }
      });

      // Add loading indicators for better UX
      addLoadingStates();
      
      // Optimize images loading
      lazyLoadImages();
    });

    // Add loading states to forms and buttons
    function addLoadingStates() {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', () => {
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.classList.add('loading');
          }
        });
      });
    }

    // Lazy load images for better performance
    function lazyLoadImages() {
      const images = document.querySelectorAll('img[loading="lazy"]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src || img.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          });
        });

        images.forEach(img => imageObserver.observe(img));
      }
    }

    window.editRecipe = editRecipe;
    window.deleteRecipe = deleteRecipe;