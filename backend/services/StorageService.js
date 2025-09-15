import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Recipe } from '../models/Recipe.js';

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

  getAllRecipes() {
    return this.Recipe.find({})
      .sort({ createdAt: -1 })
      .then(
        (recipes) => {
          return recipes.map((recipe) => this.#transformMongoToRecipe(recipe));
        },
        (error) => {
          console.error('MongoDB read error:', error);
          return [];
        }
      );
  }

  getRecipeById(id) {
    return this.Recipe.findById(id).then(
      (recipe) => {
        if (!recipe) return null;
        return this.#transformMongoToRecipe(recipe);
      },
      (error) => {
        console.error('MongoDB findById error:', error);
        return null;
      }
    );
  }

  createRecipe(recipeData) {
    const recipe = new this.Recipe(recipeData);
    return recipe.save().then(
      (saved) => {
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
      },
      (error) => {
        console.error('MongoDB create error:', error);
        throw error;
      }
    );
  }

  updateRecipe(id, updateData) {
    return this.Recipe.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).then(
      (updated) => {
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
      },
      (error) => {
        console.error('MongoDB update error:', error);
        throw error;
      }
    );
  }

  deleteRecipe(id) {
    return this.Recipe.findByIdAndDelete(id).then(
      (deleted) => {
        return deleted !== null;
      },
      (error) => {
        console.error('MongoDB delete error:', error);
        throw error;
      }
    );
  }
}

// JSON File Storage Implementation
class JSONStorage extends Storage {
  constructor(recipesFilePath) {
    super();
    this.recipesFile = recipesFilePath || join(process.cwd(), 'backend', 'data', 'recipes.json');
  }

  #readRecipes() {
    try {
      const data = readFileSync(this.recipesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading recipes:', error);
      return [];
    }
  }

  #writeRecipes(recipes) {
    try {
      writeFileSync(this.recipesFile, JSON.stringify(recipes, null, 2));
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

export {
  Storage,
  MongoDBStorage,
  JSONStorage,
  StorageFactory
};