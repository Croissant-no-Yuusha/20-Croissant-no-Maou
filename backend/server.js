import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import configurations and services
import { connectToMongoDB } from './config/database.js';
import { StorageFactory } from './services/StorageService.js';
import { AIService } from './services/AIService.js';

// Import controllers
import { RecipeController } from './controllers/RecipeController.js';
import { AIController } from './controllers/AIController.js';

// Import routes
import { createRecipeRoutes } from './routes/recipeRoutes.js';
import { createAIRoutes } from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../frontend')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Environment variables
const API_KEY = process.env.API_KEY;
const MODEL = process.env.MODEL;
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'json';
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_manager';
const RECIPES_FILE = join(__dirname, 'data/recipes.json'); // Use recipes from new backend structure

// Initialize storage
let storage;
switch (STORAGE_TYPE) {
  case 'mongodb':
    // Connect to MongoDB on startup
    await connectToMongoDB(MONGODB_URI).then((connected) => {
      if (connected) {
        console.log('Storage Type : MongoDB');
        storage = StorageFactory.create('mongodb');
      } else {
        console.error('❌ MongoDB connection failed. Exiting server...');
        process.exit(1); // Exit the server with a failure code
      }
    });
    break;
  case 'json':
  default:
    console.log('Storage Type : JSON');
    storage = StorageFactory.create('json', {
      recipesFilePath: RECIPES_FILE
    });
    break;
}

// Initialize services
const aiService = new AIService(API_KEY, MODEL);

// Initialize controllers
const recipeController = new RecipeController(storage);
const aiController = new AIController(aiService);

// Setup routes
app.use('/recipes', createRecipeRoutes(recipeController));
app.use('/', createAIRoutes(aiController));

// Root route
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(
    'Google Gemini API Key loaded:',
    API_KEY && API_KEY !== 'your-api-key-here'
      ? '✅ Yes'
      : '❌ No - Please set API_KEY environment variable'
  );
  console.log('📁 Recipes stored in:', RECIPES_FILE);
});