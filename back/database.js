import mongoose from 'mongoose';

// Recipe Schema for MongoDB
const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      required: true
    },
    ingredients: {
      type: String,
      default: ''
    },
    is_ai_generated: {
      type: Boolean,
      default: false
    },
    source: {
      type: String,
      enum: ['manual', 'ai_gemini', 'ai_openai', 'ai_claude'],
      default: 'manual'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    },
    prep_time: {
      type: Number,
      min: 0,
      default: 0
    },
    cook_time: {
      type: Number,
      min: 0,
      default: 0
    },
    servings: {
      type: Number,
      min: 1,
      default: 1
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // This will automatically handle created_at and updated_at
  }
);

// Create indexes for better search performance
recipeSchema.index({ title: 'text', ingredients: 'text', tags: 'text' });
recipeSchema.index({ is_ai_generated: 1 });
recipeSchema.index({ source: 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ created_at: -1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

// Database connection function
async function connectToMongoDB() {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_manager';

    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
}

// Migration function to move from JSON to MongoDB
async function migrateJsonToMongoDB(jsonFilePath) {
  try {
    const fs = require('fs');
    const path = require('path');

    // Read existing JSON data
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    // Clear existing data in MongoDB (optional)
    await Recipe.deleteMany({});
    console.log('Cleared existing MongoDB data');

    // Insert JSON data into MongoDB
    const recipes = jsonData.map((recipe) => ({
      ...recipe,
      _id: undefined, // Let MongoDB generate new ObjectId
      created_at: new Date(recipe.created_at),
      updated_at: new Date(recipe.updated_at)
    }));

    await Recipe.insertMany(recipes);
    console.log(`✅ Migrated ${recipes.length} recipes to MongoDB`);

    // Backup original JSON file
    const backupPath = jsonFilePath + '.backup.' + Date.now();
    fs.copyFileSync(jsonFilePath, backupPath);
    console.log(`📁 Backed up original JSON to: ${backupPath}`);

    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

export { Recipe, connectToMongoDB, migrateJsonToMongoDB };
