// English (United States) translations
const translations_en = {
  // Header & Navigation
  title: "AI Recipe Manager",
  subtitle: "Discover delicious recipes with AI assistance",
  
  // Stats
  total_recipes: "Total Recipes",
  ai_suggestions: "AI Suggestions",
  ai_recipes: "AI Recipes",
  
  // AI Generator Section
  ai_generator: "AI Recipe Generator",
  ingredients_label: "What ingredients do you have?",
  ingredients_placeholder: "e.g., chicken, tomatoes, onions, garlic",
  generate_recipe: "Generate Recipe",
  generating: "Generating...",
  
  // Recipe Form
  add_new_recipe: "Add New Recipe",
  edit_recipe: "Edit Recipe",
  save_ai_recipe: "Save AI Recipe",
  recipe_title: "Recipe Title",
  recipe_title_placeholder: "Enter recipe title",
  ingredients: "Ingredients",
  ingredients_example: "e.g., 2 cups rice, 1 onion, 3 cloves garlic",
  instructions: "Instructions",
  instructions_placeholder: "Enter step-by-step cooking instructions",
  save_recipe: "Save Recipe",
  saving: "Saving...",
  cancel: "Cancel",
  
  // Recipe Collection
  recipe_collection: "My Recipe Collection",
  search_placeholder: "🔍 Search recipes by title or ingredients...",
  no_recipes: "No recipes yet",
  no_recipes_desc: "Generate your first recipe with AI or add one manually!",
  
  // Recipe Actions
  edit: "Edit",
  delete: "Delete",
  close: "Close",
  view_details: "View Details",
  
  // Recipe Details
  recipe_details: "Recipe Details",
  created: "Created",
  updated: "Updated",
  recipe_info: "Recipe Information",
  
  // Messages & Notifications
  please_enter_ingredients: "Please enter some ingredients",
  recipe_saved_success: "Recipe saved successfully!",
  recipe_updated_success: "Recipe updated successfully!",
  recipe_deleted_success: "Recipe deleted successfully!",
  recipe_save_failed: "Failed to save recipe. Please try again.",
  recipe_load_failed: "Failed to load recipe for editing.",
  recipe_delete_failed: "Failed to delete recipe. Please try again.",
  connection_error: "Please check your connection and try again.",
  
  // Confirmations
  delete_confirmation: "Are you sure you want to delete this recipe?",
  delete_warning: "This action cannot be undone.",
  
  // Form Validation
  title_required: "Please fill in both title and instructions",
  fill_required_fields: "Please fill in all required fields",
  
  // Loading States
  loading_recipes: "Loading recipes...",
  generating_recipe: "Generating your perfect recipe...",
  
  // Empty States
  no_results_found: "No recipes found",
  try_different_search: "Try another search term.",
  error_loading_recipes: "Error loading recipes",
  
  // Accessibility
  toggle_theme: "Toggle theme",
  close_modal: "Close modal",
  edit_recipe_button: "Edit Recipe",
  delete_recipe_button: "Delete Recipe",
  
  // Quick Actions
  quick_save: "Quick Save",
  use_this_recipe: "Use This Recipe"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = translations_en;
}
