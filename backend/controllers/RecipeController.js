class RecipeController {
  constructor(storage) {
    this.storage = storage;
  }

  // Create recipe
  async createRecipe(req, res) {
    try {
      const {
        title,
        instructions,
        ingredients,
        is_ai_generated = false,
        source = 'manual',
        tags = [],
        difficulty = 'easy',
        prep_time = 0,
        cook_time = 0,
        servings = 1
      } = req.body;

      if (!title || !instructions) {
        return res
          .status(400)
          .json({ error: 'Title and instructions are required' });
      }

      const recipeData = {
        title: title.trim(),
        instructions: instructions.trim(),
        ingredients: ingredients ? ingredients.trim() : '',
        is_ai_generated: Boolean(is_ai_generated),
        source: source.trim(),
        tags: Array.isArray(tags) ? tags : [],
        difficulty: difficulty.trim(),
        prep_time: Number(prep_time) || 0,
        cook_time: Number(cook_time) || 0,
        servings: Number(servings) || 1
      };

      const recipe = await this.storage.createRecipe(recipeData);
      res.json(recipe);
    } catch (error) {
      console.error('Create recipe error:', error);
      res.status(500).json({ error: 'Failed to create recipe' });
    }
  }

  // Read all recipes
  async getAllRecipes(req, res) {
    try {
      const recipes = await this.storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error('Read recipes error:', error);
      res.status(500).json({ error: 'Failed to load recipes' });
    }
  }

  // Read single recipe
  async getRecipeById(req, res) {
    try {
      const id = req.params.id;
      const recipe = await this.storage.getRecipeById(id);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Read recipe error:', error);
      res.status(500).json({ error: 'Failed to load recipe' });
    }
  }

  // Update recipe
  async updateRecipe(req, res) {
    try {
      const id = req.params.id;
      const {
        title,
        instructions,
        ingredients,
        is_ai_generated,
        source,
        tags,
        difficulty,
        prep_time,
        cook_time,
        servings
      } = req.body;

      if (!title || !instructions) {
        return res
          .status(400)
          .json({ error: 'Title and instructions are required' });
      }

      const updateData = {
        title: title.trim(),
        instructions: instructions.trim(),
        ingredients: ingredients ? ingredients.trim() : ''
      };

      // Add optional fields if provided
      if (is_ai_generated !== undefined)
        updateData.is_ai_generated = Boolean(is_ai_generated);
      if (source !== undefined) updateData.source = source.trim();
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
      if (difficulty !== undefined) updateData.difficulty = difficulty.trim();
      if (prep_time !== undefined) updateData.prep_time = Number(prep_time) || 0;
      if (cook_time !== undefined) updateData.cook_time = Number(cook_time) || 0;
      if (servings !== undefined) updateData.servings = Number(servings) || 1;

      const recipe = await this.storage.updateRecipe(id, updateData);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Update recipe error:', error);
      res.status(500).json({ error: 'Failed to update recipe' });
    }
  }

  // Delete recipe
  async deleteRecipe(req, res) {
    try {
      const id = req.params.id;
      const success = await this.storage.deleteRecipe(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      
      res.json({ success: true, message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Delete recipe error:', error);
      res.status(500).json({ error: 'Failed to delete recipe' });
    }
  }
}

export { RecipeController };