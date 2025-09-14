# 🥐 Recipe Manager - Croissant no Maou

A modern web application for managing your favorite recipes with AI-powered recipe generation capabilities.

## ✨ Features

- **Recipe Management**: Create, read, update, and delete recipes
- **AI Recipe Generation**: Generate recipes using AI (Gemini, OpenAI, Claude)
- **Smart Search**: Search through recipes by title, ingredients, and tags
- **Recipe Metadata**: Track difficulty, prep/cook time, servings, and source
- **Dual Storage**: Support for both JSON files and MongoDB
- **Modern UI**: Clean and responsive interface
- **Recipe Tags**: Organize recipes with custom tags
- **AI Badge**: Visual indicators for AI-generated content

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (optional, for production use)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 20-Croissant-no-Maou
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3039

# AI API Configuration
API_KEY=your-gemini-api-key-here
MODEL=gemini-2.0-flash

# Storage Configuration
STORAGE_TYPE=json
RECIPES_FILE_PATH=./recipes.json

# Environment
NODE_ENV=development
```

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3039`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3039 |
| `API_KEY` | AI API key for recipe generation | Yes* | - |
| `MODEL` | AI model to use | Yes | gemini-2.0-flash |
| `STORAGE_TYPE` | Storage backend (`json` or `mongodb`) | Yes | json |
| `RECIPES_FILE_PATH` | Path for JSON storage | No | ./recipes.json |
| `MONGODB_URI` | MongoDB connection string | No** | - |
| `MONGODB_DATABASE` | MongoDB database name | No** | recipe_manager |
| `MONGODB_COLLECTION` | MongoDB collection name | No** | recipes |

*Required for AI features  
**Required when using MongoDB storage

### AI Models Supported

- **Gemini**: Google's Gemini models
- **OpenAI**: GPT models (coming soon)
- **Claude**: Anthropic's Claude models (coming soon)

## 📱 Usage

### Creating Recipes

1. Click the "Add Recipe" button
2. Fill in the recipe details:
   - Title
   - Ingredients
   - Instructions
   - Tags (optional)
   - Difficulty level
   - Prep and cook times
   - Number of servings

### AI Recipe Generation

1. Use the AI recipe generation feature
2. Provide ingredients or recipe ideas
3. The AI will generate a complete recipe
4. AI-generated recipes are marked with a 🤖 badge

### Searching Recipes

- Use the search bar to find recipes by title, ingredients, or tags
- Search works across all recipe fields for comprehensive results

## 🗄️ Database

### JSON Storage (Default)

Recipes are stored in a JSON file with the following structure:

```json
{
  "id": 1,
  "title": "Recipe Title",
  "instructions": "Step-by-step instructions",
  "ingredients": "List of ingredients",
  "created_at": "2025-09-07T15:08:55.479Z",
  "updated_at": "2025-09-07T15:08:55.479Z",
  "is_ai_generated": false,
  "source": "manual",
  "tags": ["tag1", "tag2"],
  "difficulty": "easy",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4
}
```

### MongoDB Migration

To migrate to MongoDB for production use:

1. Install and start MongoDB
2. Update your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/recipe-manager
MONGODB_DATABASE=recipe_manager
MONGODB_COLLECTION=recipes
STORAGE_TYPE=mongodb
```
3. Run the migration:
```bash
npm run migrate
```

## 🛠️ Development

### Project Structure

```
20-Croissant-no-Maou/
├── public/           # Static files
├── src/             # Source code
├── recipes.json     # JSON storage file
├── server.js        # Main server file
├── package.json     # Dependencies
├── .env             # Environment variables
└── README.md        # This file
```

### Available Scripts

- `npm start` - Start the development server
- `npm run migrate` - Migrate from JSON to MongoDB
- `npm test` - Run tests (if available)

### API Endpoints

- `GET /recipes` - Get all recipes
- `POST /recipes` - Create a new recipe
- `GET /recipes/:id` - Get a specific recipe
- `PUT /recipes/:id` - Update a recipe
- `DELETE /recipes/:id` - Delete a recipe
- `POST /generate-recipe` - Generate recipe with AI

**Happy Cooking! 👨‍🍳👩‍🍳**
