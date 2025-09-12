const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Base Storage class defining the interface
class Storage {
  constructor() {
    if (this.constructor === Storage) {
      throw new Error(
        'Storage is an abstract class and cannot be instantiated directly'
      );
    }
  }

  async getAllRecipes() {
    throw new Error('getAllRecipes() must be implemented by subclass');
  }

  async getRecipeById(id) {
    throw new Error('getRecipeById() must be implemented by subclass');
  }

  async createRecipe(recipeData) {
    throw new Error('createRecipe() must be implemented by subclass');
  }

  async updateRecipe(id, updateData) {
    throw new Error('updateRecipe() must be implemented by subclass');
  }

  async deleteRecipe(id) {
    throw new Error('deleteRecipe() must be implemented by subclass');
  }
}

// MongoDB Storage Implementation
class MongoDBStorage extends Storage {
  constructor(Recipe) {
    super();
    this.Recipe = Recipe;
  }

  #transformMongoToRecipe(recipe) {
    return {
      id: recipe._id.toString(),
      title: recipe.title,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients,
      created_at: recipe.createdAt || recipe.created_at,
      updated_at: recipe.updatedAt || recipe.updated_at,
      is_ai_generated: recipe.is_ai_generated,
      source: recipe.source,
      tags: recipe.tags,
      difficulty: recipe.difficulty,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings
    };
  }

  async getAllRecipes() {
    try {
      const recipes = await this.Recipe.find({}).sort({ createdAt: -1 });
      return recipes.map((recipe) => this.#transformMongoToRecipe(recipe));
    } catch (error) {
      console.error('MongoDB read error:', error);
      return [];
    }
  }

  async getRecipeById(id) {
    try {
      const recipe = await this.Recipe.findById(id);
      if (!recipe) return null;

      return this.#transformMongoToRecipe(recipe);
    } catch (error) {
      console.error('MongoDB findById error:', error);
      return null;
    }
  }

  async createRecipe(recipeData) {
    try {
      const recipe = new this.Recipe(recipeData);
      const saved = await recipe.save();

      return {
        id: saved._id.toString(),
        title: saved.title,
        instructions: saved.instructions,
        ingredients: saved.ingredients,
        created_at: saved.createdAt,
        updated_at: saved.updatedAt,
        is_ai_generated: saved.is_ai_generated,
        source: saved.source,
        tags: saved.tags,
        difficulty: saved.difficulty,
        prep_time: saved.prep_time,
        cook_time: saved.cook_time,
        servings: saved.servings
      };
    } catch (error) {
      console.error('MongoDB create error:', error);
      throw error;
    }
  }

  async updateRecipe(id, updateData) {
    try {
      const updated = await this.Recipe.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updated) return null;

      return {
        id: updated._id.toString(),
        title: updated.title,
        instructions: updated.instructions,
        ingredients: updated.ingredients,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
        is_ai_generated: updated.is_ai_generated,
        source: updated.source,
        tags: updated.tags,
        difficulty: updated.difficulty,
        prep_time: updated.prep_time,
        cook_time: updated.cook_time,
        servings: updated.servings
      };
    } catch (error) {
      console.error('MongoDB update error:', error);
      throw error;
    }
  }

  async deleteRecipe(id) {
    try {
      const deleted = await this.Recipe.findByIdAndDelete(id);
      return deleted !== null;
    } catch (error) {
      console.error('MongoDB delete error:', error);
      throw error;
    }
  }
}

// JSON File Storage Implementation
class JSONStorage extends Storage {
  constructor(recipesFilePath) {
    super();
    this.recipesFile = recipesFilePath || path.join(__dirname, 'recipes.json');
  }

  #readRecipes() {
    try {
      const data = fs.readFileSync(this.recipesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading recipes:', error);
      return [];
    }
  }

  #writeRecipes(recipes) {
    try {
      fs.writeFileSync(this.recipesFile, JSON.stringify(recipes, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing recipes:', error);
      return false;
    }
  }

  #getNextId(recipes) {
    return recipes.length > 0 ? Math.max(...recipes.map((r) => r.id)) + 1 : 1;
  }

  async getAllRecipes() {
    return this.#readRecipes();
  }

  async getRecipeById(id) {
    const recipes = this.#readRecipes();
    return recipes.find((r) => r.id === parseInt(id)) || null;
  }

  async createRecipe(recipeData) {
    const recipes = this.#readRecipes();
    const recipe = {
      ...recipeData,
      id: this.#getNextId(recipes),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    recipes.push(recipe);
    if (this.#writeRecipes(recipes)) {
      return recipe;
    } else {
      throw new Error('Failed to save recipe to JSON file');
    }
  }

  async updateRecipe(id, updateData) {
    const recipes = this.#readRecipes();
    const recipeIndex = recipes.findIndex((r) => r.id === parseInt(id));

    if (recipeIndex === -1) return null;

    recipes[recipeIndex] = {
      ...recipes[recipeIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (this.#writeRecipes(recipes)) {
      return recipes[recipeIndex];
    } else {
      throw new Error('Failed to update recipe in JSON file');
    }
  }

  async deleteRecipe(id) {
    const recipes = this.#readRecipes();
    const recipeIndex = recipes.findIndex((r) => r.id === parseInt(id));

    if (recipeIndex === -1) return false;

    recipes.splice(recipeIndex, 1);
    return this.#writeRecipes(recipes);
  }
}

// MongoDB connection and schema
let recipeSchema;
let Recipe;

const connectToMongoDB = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-app';

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected successfully');

    // Define the recipe schema if it doesn't exist yet
    if (!recipeSchema) {
      recipeSchema = new mongoose.Schema(
        {
          title: { type: String, required: true },
          instructions: { type: String, required: true },
          ingredients: { type: String, default: '' },
          is_ai_generated: { type: Boolean, default: false },
          source: { type: String, default: 'manual' },
          tags: { type: [String], default: [] },
          difficulty: { type: String, default: 'easy' },
          prep_time: { type: Number, default: 0 },
          cook_time: { type: Number, default: 0 },
          servings: { type: Number, default: 1 }
        },
        { timestamps: true }
      );

      // Create the model if it doesn't exist
      Recipe = mongoose.model('Recipe', recipeSchema);
    }

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Storage Factory to create the appropriate storage instance
class StorageFactory {
  static create(storageType, options = {}) {
    switch (storageType) {
      case 'mongodb':
        if (!options.Recipe && !Recipe) {
          throw new Error('Recipe model is required for MongoDB storage');
        }
        return new MongoDBStorage(options.Recipe || Recipe);

      case 'json':
        return new JSONStorage(options.recipesFilePath);

      default:
        throw new Error(`Invalid storage backend: ${storageType}`);
    }
  }
}

module.exports = {
  Storage,
  MongoDBStorage,
  JSONStorage,
  StorageFactory,
  connectToMongoDB,
  Recipe
};
