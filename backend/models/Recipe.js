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
    }
  },
  {
    timestamps: true
  }
);

// Export the model
const Recipe = mongoose.model('Recipe', recipeSchema);

export { Recipe, recipeSchema };
