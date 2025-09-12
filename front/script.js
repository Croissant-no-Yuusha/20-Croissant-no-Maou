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

// Ingredient Formatting Helper Functions
function formatIngredientsForCard(ingredients) {
  if (!ingredients) return '';
  
  // Convert any format to single line comma-separated for card view
  return ingredients
    .replace(/\n+/g, '\n')  // Normalize multiple line breaks to single
    .split('\n')
    .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())  // Remove bullets and trim
    .filter(line => line.length > 0)
    .join(', ');
}

function formatIngredientsForModal(ingredients) {
  if (!ingredients) return '';
  
  // Split by line breaks first, then by bullet points within each line
  let allIngredients = [];
  
  const lines = ingredients.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Split by bullet points within the line
    const bulletParts = trimmed.split('•').map(part => part.trim()).filter(part => part.length > 0);
    
    bulletParts.forEach(part => {
      // Clean any remaining bullet symbols at the start
      const cleaned = part.replace(/^\s*[-*•]\s*/, '').trim();
      if (cleaned) allIngredients.push(cleaned);
    });
  });
  
  return allIngredients
    .map(ingredient => `<div class="ingredient-item">• ${ingredient}</div>`)
    .join('');
}

function formatInstructionsForCard(instructions) {
  if (!instructions) return '';
  
  // Convert line breaks to spaces and truncate for card view
  const singleLine = instructions.replace(/\n+/g, ' ').trim();
  const truncated = singleLine.length > 150 
    ? singleLine.substring(0, 150) + '...' 
    : singleLine;
    
  return truncated;
}

function formatInstructionsForModal(instructions) {
  if (!instructions) return '';
  
  // Preserve line breaks for modal view
  return instructions.replace(/\n/g, '<br>');
}

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

// Helper function to reset the recipe form completely
function resetRecipeForm() {
  try {
    // Clear all form fields
    document.getElementById("recipeId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("instructions").value = "";
    document.getElementById("recipeIngredients").value = "";
    
    // Get current language translations
    const lang = localStorage.getItem('language') || 'en';
    const translations = themeManager.getTranslations(lang);
    
    // Reset form title
    document.getElementById("formTitle").textContent = translations.add_new_recipe || "Add New Recipe";
    
    // Hide cancel button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.style.display = "none";
    }
    
    // Hide and reset AI status checkbox if it exists
    const aiStatusGroup = document.getElementById("aiStatusGroup");
    if (aiStatusGroup) {
      aiStatusGroup.style.display = "none";
    }
    
    const isAiCheckbox = document.getElementById("isAiGenerated");
    if (isAiCheckbox) {
      isAiCheckbox.checked = false;
    }
    
    // Reset save button to default state
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
      saveBtn.innerHTML = `<img src="photos/download.png" alt="icon" class="icon-btn" loading="lazy"><span>${translations.save_recipe || "Save Recipe"}</span>`;
      saveBtn.disabled = false;
      saveBtn.classList.remove('loading'); // Remove any loading classes
    }
    
    // Reset form state
    const form = document.getElementById("recipeForm");
    if (form) {
      form.classList.remove('editing-mode');
      form.classList.remove('loading'); // Remove any loading classes
    }
    
    console.log('Form reset successfully');
  } catch (error) {
    console.error('Error resetting form:', error);
  }
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
          
          recipeCard.innerHTML = `
            <div class="recipe-title">
              🍽️ ${recipe.title}
              ${recipe.is_ai_generated ? '<span class="ai-badge">🤖 AI</span>' : ''}
            </div>
            ${recipe.ingredients ? `
              <div class="recipe-ingredients">
                <strong>🥘 ${translations.ingredients || 'Ingredients'}:</strong> ${formatIngredientsForCard(recipe.ingredients)}
              </div>
            ` : ''}
            <div class="recipe-instructions">${formatInstructionsForCard(recipe.instructions)}</div>
            <div class="recipe-meta">
              📅 ${translations.created || 'Created'}: ${createdDate}
              ${isUpdated ? `• ${translations.updated || 'Updated'}: ${updatedDate}` : ''}
            </div>
            <div class="recipe-buttons">
              <button class="btn btn-secondary btn-small edit-btn" data-recipe-id="${recipe.id}" title="${translations.edit_recipe_button || 'Edit Recipe'}">
                ✏️ ${translations.edit || 'Edit'}
              </button>
              <button class="btn btn-danger btn-small delete-btn" data-recipe-id="${recipe.id}" title="${translations.delete_recipe_button || 'Delete Recipe'}">
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

          // Add event listeners for edit and delete buttons
          const editBtn = recipeCard.querySelector('.edit-btn');
          const deleteBtn = recipeCard.querySelector('.delete-btn');
          
          if (editBtn) {
            editBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              editRecipe(recipe.id);
            });
          }
          
          if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              deleteRecipe(recipe.id);
            });
          }

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
      console.log('Form submission started');
      
      const id = document.getElementById("recipeId").value;
      const title = document.getElementById("title").value.trim();
      const instructions = document.getElementById("instructions").value.trim();
      const ingredients = document.getElementById("recipeIngredients").value.trim();
      
      console.log('Form data:', { id, title: title.substring(0, 20), hasInstructions: !!instructions });

      if (!title || !instructions) {
        const lang = localStorage.getItem('language') || 'en';
        const trans = themeManager.getTranslations(lang);
        notificationManager.show(trans.title_required || "Please fill in both title and instructions", 'warning');
        return;
      }

      const saveBtn = document.getElementById("saveBtn");
      let isEditing = !!id;

      try {
        const lang1 = localStorage.getItem('language') || 'en';
        const trans1 = themeManager.getTranslations(lang1);
        
        // Set loading state
        saveBtn.innerHTML = `<span>${isEditing ? (trans1.updating || "Updating...") : (trans1.saving || "Saving...")}</span>`;
        saveBtn.disabled = true;

        const url = `${API_URL}/recipes${id ? '/' + id : ''}`;
        const method = id ? "PUT" : "POST";

        // Prepare request body
        const requestBody = { 
          title, 
          instructions, 
          ingredients
        };

        // Handle AI status for editing
        if (id) {
          // For editing, check if user wants to change AI status
          const isAiCheckbox = document.getElementById("isAiGenerated");
          if (isAiCheckbox && isAiCheckbox.parentElement.style.display !== 'none') {
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

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Failed to save recipe');
        }

        // Show success message first
        const lang2 = localStorage.getItem('language') || 'en';
        const trans2 = themeManager.getTranslations(lang2);
        const successMsg = isEditing 
          ? (trans2.recipe_updated_success || "Recipe updated successfully!")
          : (trans2.recipe_saved_success || "Recipe saved successfully!");
        notificationManager.show(successMsg, 'success');

        // Reset form completely (this will also reset the button)
        resetRecipeForm();
        
        // Reload recipes
        await loadRecipes();

      } catch (error) {
        console.error('Error saving recipe:', error);
        const lang3 = localStorage.getItem('language') || 'en';
        const trans3 = themeManager.getTranslations(lang3);
        const errorMsg = error.message || trans3.recipe_save_failed || 'Failed to save recipe. Please try again.';
        notificationManager.show(errorMsg, 'error');
        
        // On error, restore button state manually
        const lang = localStorage.getItem('language') || 'en';
        const translations = themeManager.getTranslations(lang);
        saveBtn.innerHTML = `<img src="photos/download.png" alt="icon" class="icon-btn" loading="lazy"><span>${isEditing ? (translations.update_recipe || "Update Recipe") : (translations.save_recipe || "Save Recipe")}</span>`;
        saveBtn.disabled = false;
      }
    });

    document.getElementById("cancelBtn").addEventListener("click", () => {
      resetRecipeForm();
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
        
        // Update save button text for editing mode
        const saveBtn = document.getElementById("saveBtn");
        saveBtn.innerHTML = `<img src="photos/download.png" alt="icon" class="icon-btn" loading="lazy"><span>${translations.update_recipe || "Update Recipe"}</span>`;
        saveBtn.disabled = false;
        
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
    const currentLang = localStorage.getItem('language') || 'en';
    console.log(`🌐 Frontend sending language: ${currentLang}`);
    const res = await fetch(`${API_URL}/ai-suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, language: currentLang })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Server error: ${res.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await res.json();
    console.log('🎯 AI Response received:', { hasData: !!data, hasSuggestion: !!data.suggestion });
    
    let suggestion = data.suggestion || "No recipe suggestion received from the server.";

    // Hide AI output section since we don't need to show the response
    outputElement.style.display = "none";
    outputElement.className = "ai-output";

    // Show success notification
    const langSuccess = localStorage.getItem('language') || 'en';
    const transSuccess = themeManager.getTranslations(langSuccess);
    notificationManager.show(transSuccess.ai_recipe_generated || 'AI recipe generated successfully!', 'success');

    // --- Parse the structured recipe ---
    let title = "AI Generated Recipe";
    let parsedIngredients = ingredients;
    let instructions = suggestion;

    // Try parsing for both languages
    // English patterns
    let titleMatch = suggestion.match(/(?:\*\*Menu Name:\*\*|\*\*Recipe Title:\*\*|Recipe Title:|Title:|Menu Name:)\s*(.+)/i);
    // Thai patterns  
    if (!titleMatch) {
      titleMatch = suggestion.match(/(?:\*\*ชื่อเมนู:\*\*|ชื่อเมนู:)\s*(.+)/i);
    }
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // English ingredients patterns
    let ingredientsMatch = suggestion.match(/(?:\*\*Ingredients:\*\*|Ingredients:)\s*([\s\S]*?)(?=\*\*Instructions:|\*\*วิธีทำ:|Instructions:|วิธีทำ:|$)/i);
    // Thai ingredients patterns
    if (!ingredientsMatch) {
      ingredientsMatch = suggestion.match(/(?:\*\*ส่วนผสม:\*\*|ส่วนผสม:)\s*([\s\S]*?)(?=\*\*วิธีทำ:|\*\*Instructions:|วิธีทำ:|Instructions:|$)/i);
    }
    if (ingredientsMatch) {
      parsedIngredients = ingredientsMatch[1]
        .split('\n')
        .map(line => {
          const cleanLine = line.replace(/^\s*[-*•]\s*/, '').trim(); // Remove existing bullets
          return cleanLine ? `• ${cleanLine}` : ''; // Add consistent bullet points
        })
        .filter(line => line.length > 0)
        .join('\n');
    }

    // English instructions patterns
    let instructionsMatch = suggestion.match(/(?:\*\*Instructions:\*\*|Instructions:)\s*([\s\S]*)/i);
    // Thai instructions patterns
    if (!instructionsMatch) {
      instructionsMatch = suggestion.match(/(?:\*\*วิธีทำ:\*\*|วิธีทำ:)\s*([\s\S]*)/i);
    }
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
    const recipeForm = document.getElementById("recipeForm");
    if (recipeForm) {
      recipeForm.scrollIntoView({ behavior: 'smooth' });
      const formCard = recipeForm.closest('.card');
      if (formCard) {
        formCard.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
        setTimeout(() => formCard.style.boxShadow = '', 2000);
      }
    }

    // Stats will be updated when recipes are loaded from database

  } catch (error) {
    console.error("❌ AI generation error:", error);
    
    // Show error notification
    const langError = localStorage.getItem('language') || 'en';
    const transError = themeManager.getTranslations(langError);
    notificationManager.show(transError.ai_generation_failed || 'AI generation failed. Please try again.', 'error');
    
    // Update output element with error
    outputElement.innerHTML = `
      <div class="ai-error">
        <h4>❌ ${transError.generation_error || 'Generation Error'}</h4>
        <p>${error.message}</p>
        <p>${transError.try_again_message || 'Please check your connection and try again.'}</p>
      </div>
    `;
    outputElement.className = "ai-output error show";
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
        // English patterns
        if (line.includes('Recipe Title:') || line.includes('**Recipe Title:**') || line.includes('**Menu Name:**') || line.includes('Menu Name:')) {
          title = line.replace(/\*\*Recipe Title:\*\*|\*\*Menu Name:\*\*|\*\*|\*|Recipe Title:|Menu Name:/g, '').trim();
          break;
        }
        // Thai patterns
        if (line.includes('ชื่อเมนู:') || line.includes('**ชื่อเมนู:**')) {
          title = line.replace(/\*\*ชื่อเมนู:\*\*|\*\*|\*|ชื่อเมนู:/g, '').trim();
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
      
      const recipeForm = document.getElementById("recipeForm");
      if (recipeForm) {
        recipeForm.scrollIntoView({ behavior: 'smooth' });
        
        const formCard = recipeForm.closest('.card');
        if (formCard) {
          formCard.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
          setTimeout(() => {
            formCard.style.boxShadow = '';
          }, 2000);
        }
      }
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