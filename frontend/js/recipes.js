import { fetchRecipes, fetchRecipe, saveRecipe, deleteRecipe as apiDeleteRecipe } from './api.js';
import { languageManager } from './language.js';
import { modalManager, showConfirmationModal } from './modal.js';
import { notificationManager } from './notification.js';

// Global variables
let API_URL = "";
let aiSuggestionCount = parseInt(localStorage.getItem('aiSuggestionCount')) || 0;

// Ingredient Formatting Helper Functions
export function formatIngredientsForCard(ingredients) {
  if (!ingredients) return '';
  
  // Convert any format to single line comma-separated for card view
  return ingredients
    .replace(/\n+/g, '\n')  // Normalize multiple line breaks to single
    .split('\n')
    .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())  // Remove bullets and trim
    .filter(line => line.length > 0)
    .join(', ');
}

export function formatIngredientsForModal(ingredients) {
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

export function formatInstructionsForCard(instructions) {
  if (!instructions) return '';
  
  // Convert line breaks to spaces and truncate for card view
  const singleLine = instructions.replace(/\n+/g, ' ').trim();
  const truncated = singleLine.length > 150 
    ? singleLine.substring(0, 150) + '...' 
    : singleLine;
    
  return truncated;
}

export function formatInstructionsForModal(instructions) {
  if (!instructions) return '';
  
  // Preserve line breaks for modal view
  return instructions.replace(/\n/g, '<br>');
}

// Helper function to reset the recipe form completely
export function resetRecipeForm() {
  try {
    // Clear all form fields
    document.getElementById("recipeId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("instructions").value = "";
    document.getElementById("recipeIngredients").value = "";
    
    // Get current language translations
    const lang = localStorage.getItem('language') || 'en';
    const translations = languageManager.getTranslations(lang);
    
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
      saveBtn.innerHTML = `<img src="assets/download.png" alt="icon" class="icon-btn" loading="lazy"><span>${translations.save_recipe || "Save Recipe"}</span>`;
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

export async function loadRecipes() {
  try {
    const recipes = await fetchRecipes(API_URL);
    const list = document.getElementById("recipesList");
    
    // Update counters
    document.getElementById('totalRecipes').textContent = recipes.length;
    
    // Count AI-generated recipes
    const aiRecipes = recipes.filter(recipe => recipe.is_ai_generated).length;
    document.getElementById('aiSuggestions').textContent = aiRecipes;
    
    if (recipes.length === 0) {
      const lang = localStorage.getItem('language') || 'en';
      const translations = languageManager.getTranslations(lang);
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
      const translations = languageManager.getTranslations(lang);
      
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
    const translations = languageManager.getTranslations(lang);
    document.getElementById("recipesList").innerHTML = `
      <div class="empty-state">
        <h3>${translations.error_loading_recipes || 'Error loading recipes'}</h3>
        <p>${translations.connection_error || 'Please check your connection and try again.'}</p>
      </div>
    `;
  }
}

export async function editRecipe(id) {
  try {
    const recipe = await fetchRecipe(API_URL, id);
    
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
    const translations = languageManager.getTranslations(lang);
    document.getElementById("formTitle").textContent = translations.edit_recipe || "Edit Recipe";
    document.getElementById("cancelBtn").style.display = "inline-block";
    
    // Update save button text for editing mode
    const saveBtn = document.getElementById("saveBtn");
    saveBtn.innerHTML = `<img src="assets/download.png" alt="icon" class="icon-btn" loading="lazy"><span>${translations.update_recipe || "Update Recipe"}</span>`;
    saveBtn.disabled = false;
    
    document.getElementById("recipeForm").scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error loading recipe for edit:', error);
    notificationManager.show('Failed to load recipe for editing.', 'error');
  }
}

export async function deleteRecipe(id) {
  // Create custom confirmation modal
  const confirmed = await showConfirmationModal();
  if (!confirmed) return;
  
  try {
    await apiDeleteRecipe(API_URL, id);
    await loadRecipes();
    const lang = localStorage.getItem('language') || 'en';
    const translations = languageManager.getTranslations(lang);
    notificationManager.show(translations.recipe_deleted_success || 'Recipe deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting recipe:', error);
    const lang = localStorage.getItem('language') || 'en';
    const translations = languageManager.getTranslations(lang);
    notificationManager.show(translations.recipe_delete_failed || 'Failed to delete recipe. Please try again.', 'error');
  }
}

export function quickSaveRecipe(suggestion, originalIngredients) {
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
  const translations = languageManager.getTranslations(lang);
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

// Initialize search functionality
export function initializeSearch() {
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
        const translations = languageManager.getTranslations(lang);
        const div = document.createElement("div");
        div.className = "empty-state no-results";
        div.innerHTML = `<h3>${translations.no_results_found || 'No recipes found'}</h3><p>${translations.try_different_search || 'Try another search term.'}</p>`;
        list.appendChild(div);
      }
    } else if (noResults) {
      noResults.remove();
    }
  });
}

// Set API URL
export function setApiUrl(url) {
  API_URL = url;
}

// Export updateStats for compatibility
export function updateStats() {
  // Stats are now updated by loadRecipes() function
  // This function kept for compatibility but loadRecipes() handles the counts
}
