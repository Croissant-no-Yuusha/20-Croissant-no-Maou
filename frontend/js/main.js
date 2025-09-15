import { themeManager } from './theme.js';
import { languageManager } from './language.js';
import { modalManager } from './modal.js';
import { notificationManager } from './notification.js';
import { 
  loadRecipes, 
  editRecipe, 
  deleteRecipe, 
  resetRecipeForm,
  initializeSearch
} from './recipes.js';
import { aiSuggest, saveRecipe, getApiUrl, setApiUrl } from './api.js';
import { addLoadingStates, lazyLoadImages } from './utils.js';

// Global configuration - Set to empty string for same-origin requests
// If you need to use a different URL, uncomment and modify the line below:
// setApiUrl("https://recipe.aimlxv.me");

// Log current API URL for debugging
console.log('Current API URL:', getApiUrl());

// Make functions available globally for HTML onclick handlers
window.editRecipe = editRecipe;
window.deleteRecipe = deleteRecipe;
window.loadRecipes = loadRecipes;

// Form submission handler
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
    const trans = languageManager.getTranslations(lang);
    notificationManager.show(trans.title_required || "Please fill in both title and instructions", 'warning');
    return;
  }

  const saveBtn = document.getElementById("saveBtn");
  let isEditing = !!id;

  try {
    const lang1 = localStorage.getItem('language') || 'en';
    const trans1 = languageManager.getTranslations(lang1);
    
    // Set loading state
    saveBtn.innerHTML = `<span>${isEditing ? (trans1.updating || "Updating...") : (trans1.saving || "Saving...")}</span>`;
    saveBtn.disabled = true;

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

    const result = await saveRecipe(id, requestBody);

    // Show success message first
    const lang2 = localStorage.getItem('language') || 'en';
    const trans2 = languageManager.getTranslations(lang2);
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
    const trans3 = languageManager.getTranslations(lang3);
    const errorMsg = error.message || trans3.recipe_save_failed || 'Failed to save recipe. Please try again.';
    notificationManager.show(errorMsg, 'error');
    
    // On error, restore button state manually
    const lang = localStorage.getItem('language') || 'en';
    const translations = languageManager.getTranslations(lang);
    saveBtn.innerHTML = `<img src="assets/download.png" alt="icon" class="icon-btn" loading="lazy"><span>${isEditing ? (translations.update_recipe || "Update Recipe") : (translations.save_recipe || "Save Recipe")}</span>`;
    saveBtn.disabled = false;
  }
});

// Cancel button handler
document.getElementById("cancelBtn").addEventListener("click", () => {
  resetRecipeForm();
});

// AI Recipe Generation
document.getElementById("generateBtn").addEventListener("click", async () => {
  const ingredients = document.getElementById("ingredients").value.trim();
  if (!ingredients) {
    const lang = localStorage.getItem('language') || 'en';
    const trans = languageManager.getTranslations(lang);
    notificationManager.show(trans.please_enter_ingredients || "Please enter some ingredients", 'warning');
    return;
  }

  const outputElement = document.getElementById("aiOutput");
  const generateBtn = document.getElementById("generateBtn");

  const lang = localStorage.getItem('language') || 'en';
  const trans = languageManager.getTranslations(lang);
  outputElement.innerHTML = `<div class="loading">${trans.generating_recipe || 'Generating your perfect recipe...'}</div>`;
  outputElement.style.display = "block";
  outputElement.className = "ai-output show";

  generateBtn.innerHTML = `<span>${trans.generating || "Generating..."}</span>`;
  generateBtn.disabled = true;
  generateBtn.classList.add('loading');

  try {
    const currentLang = localStorage.getItem('language') || 'en';
    console.log(`🌐 Frontend sending language: ${currentLang}`);
    
    const data = await aiSuggest(ingredients, currentLang);
    console.log('🎯 AI Response received:', { hasData: !!data, hasSuggestion: !!data.suggestion });
    
    let suggestion = data.suggestion || "No recipe suggestion received from the server.";

    // Hide AI output section since we don't need to show the response
    outputElement.style.display = "none";
    outputElement.className = "ai-output";

    // Show success notification
    const langSuccess = localStorage.getItem('language') || 'en';
    const transSuccess = languageManager.getTranslations(langSuccess);
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
    const transForm = languageManager.getTranslations(langForm);
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

  } catch (error) {
    console.error("❌ AI generation error:", error);
    
    // Show error notification
    const langError = localStorage.getItem('language') || 'en';
    const transError = languageManager.getTranslations(langError);
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
    const lang = localStorage.getItem('language') || 'en';
    const trans = languageManager.getTranslations(lang);
    generateBtn.innerHTML = `<img src="assets/gearwithcircle.png" alt="icon" class="icon-btn" loading="lazy"><span>${trans.generate_recipe || "Generate Recipe"}</span>`;
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading');
  }
});

// Enter key handler for ingredients input
document.getElementById("ingredients").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("generateBtn").click();
  }
});

// DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  themeManager.init();
  languageManager.init();
  modalManager.init();
  
  // Initialize search functionality
  initializeSearch();
  
  // Load initial data
  loadRecipes();
  
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