# 🥐 Recipe Manager - Croissant no Maou

A modern web application for managing your favorite recipes with AI-powered recipe generation capabilities.

## ✨ Features

### Core Features
- **Recipe Management**: Full CRUD operations for recipes
- **AI Recipe Generation**: Generate recipes using AI models (Gemini, OpenAI, Claude)
- **Smart Search**: Advanced search through recipes by title, ingredients, and tags
- **Recipe Metadata**: Track difficulty level, prep/cook time, servings, and source
- **AI Badge**: Visual indicators for AI-generated content

### Technical Features
- **Dual Storage Support**: JSON files for development, MongoDB for production
- **Modern Architecture**: MVC pattern with service layers
- **Responsive UI**: Clean and modern interface that works on all devices
- **Multi-language Support**: Internationalization ready
- **Theme System**: Customizable UI themes
- **Real-time Notifications**: User feedback system

## 🏗️ Architecture

### Project Structure
```
20-Croissant-no-Maou/
├── backend/                  # Node.js REST API server
│   ├── config/              # Database and configuration
│   ├── controllers/         # Request handlers
│   ├── models/             # Data models and schemas
│   ├── routes/             # API endpoint definitions
│   ├── services/           # Business logic and external APIs
│   ├── utils/              # Utility functions
│   └── data/               # JSON storage (development)
├── frontend/               # Vanilla JavaScript client
│   ├── assets/            # Images and static resources
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   └── translations/      # Language files
└── docs/                  # Documentation
```

### Technology Stack
- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: JSON files (dev) / MongoDB (prod)
- **AI Integration**: Google Gemini API

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (optional, for production use)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Croissant-no-Yuusha/20-Croissant-no-Maou.git
cd 20-Croissant-no-Maou
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Create environment configuration:**
```bash
cp .env.example .env
```

4. **Configure your `.env` file:**
```env
# Server Configuration
PORT=3039

# AI API Configuration
API_KEY=your-gemini-api-key-here
MODEL=gemini-2.0-flash

# Storage Configuration
STORAGE_TYPE=json
RECIPES_FILE_PATH=./data/recipes.json

# Environment
NODE_ENV=development

# Database Configuration (for MongoDB migration)
MONGODB_URI=mongodb://localhost:27017/recipe-manager
MONGODB_DATABASE=recipe_manager
MONGODB_COLLECTION=recipes
```

5. **Start the development server:**
```bash
npm start
```

6. **Open your browser:**
Navigate to `http://localhost:3039`

### Development Mode

For backend development with auto-reload:
```bash
cd backend
npm run dev
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3039 |
| `API_KEY` | AI API key for recipe generation | Yes* | - |
| `MODEL` | AI model to use | No | gemini-2.0-flash |
| `STORAGE_TYPE` | Storage backend (`json` or `mongodb`) | No | json |
| `RECIPES_FILE_PATH` | Path for JSON storage | No | ./data/recipes.json |
| `MONGODB_URI` | MongoDB connection string | No** | - |
| `MONGODB_DATABASE` | MongoDB database name | No** | recipe_manager |
| `MONGODB_COLLECTION` | MongoDB collection name | No** | recipes |
| `NODE_ENV` | Environment mode | No | development |

*Required for AI features  
**Required when using MongoDB storage

### Supported AI Models

- **Gemini**: Google's Gemini models (primary)
- **OpenAI**: GPT models (planned)
- **Claude**: Anthropic's Claude models (planned)

## 📱 Usage Guide

### Creating Recipes Manually

1. Click the "Add Recipe" button in the interface
2. Fill in the recipe details:
   - **Title**: Name of your recipe
   - **Ingredients**: List of required ingredients
   - **Instructions**: Step-by-step cooking instructions
   - **Tags**: Categories for organization (optional)
   - **Difficulty**: Easy, Medium, or Hard
   - **Prep Time**: Preparation time in minutes
   - **Cook Time**: Cooking time in minutes
   - **Servings**: Number of people served

### AI Recipe Generation

1. Access the AI recipe generation feature
2. Provide input such as:
   - Available ingredients
   - Cuisine preferences
   - Dietary restrictions
   - Cooking time constraints
3. The AI will generate a complete recipe with all metadata
4. AI-generated recipes are marked with a 🤖 badge
5. Review and edit the generated recipe as needed

### Managing Recipes

- **Search**: Use the search bar to find recipes by title, ingredients, or tags
- **Filter**: Filter by difficulty, cooking time, or AI-generated status
- **Edit**: Click on any recipe to modify its details
- **Delete**: Remove recipes you no longer need
- **Export**: Save recipes for sharing or backup

## 🗄️ Data Storage

### Development: JSON Storage

Default storage uses JSON files for easy development:

```json
{
  "id": 1,
  "title": "Classic Chocolate Chip Cookies",
  "instructions": "1. Preheat oven to 375°F...",
  "ingredients": "2 cups flour, 1 cup butter, 3/4 cup sugar...",
  "created_at": "2025-09-16T10:30:00.000Z",
  "updated_at": "2025-09-16T10:30:00.000Z",
  "is_ai_generated": false,
  "source": "manual",
  "tags": ["dessert", "cookies", "baking"],
  "difficulty": "easy",
  "prep_time": 15,
  "cook_time": 12,
  "servings": 24
}
```

### Production: MongoDB Migration

For production deployment with better performance and search capabilities:

1. **Install MongoDB:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community
```

2. **Start MongoDB service:**
```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

3. **Update environment configuration:**
```env
STORAGE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/recipe-manager
MONGODB_DATABASE=recipe_manager
MONGODB_COLLECTION=recipes
```

4. **Run the migration:**
```bash
cd backend
npm run migrate
```

The migration will:
- Create proper database indexes
- Preserve all existing data
- Create a backup of JSON files
- Enable full-text search capabilities

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm start              # Start production server
npm run dev            # Development with auto-reload
npm run migrate        # Migrate JSON to MongoDB
npm run check          # Check code formatting
npm run format         # Format code with Prettier
npm test               # Run test suite
```

**Frontend:**
- Served statically by the backend server
- No build process required
- Direct file editing and refresh

### API Documentation

**Recipe Endpoints:**
- `GET /api/recipes` - Retrieve all recipes
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update existing recipe
- `DELETE /api/recipes/:id` - Delete recipe

**AI Integration:**
- `POST /api/ai/generate-recipe` - Generate recipe with AI
- `POST /api/ai/suggest-improvements` - AI recipe suggestions

## 📚 Documentation

- **Backend API**: See `backend/README.md`
- **Frontend Guide**: See `frontend/README.md`
- **Database Schema**: See `DATABASE.md`

## 🔧 Troubleshooting

**Common Issues:**

1. **Port already in use:**
   ```bash
   # Change PORT in .env file or kill process
   lsof -ti:3039 | xargs kill -9
   ```

2. **AI API not working:**
   - Verify API_KEY in .env file
   - Check internet connection
   - Confirm API quota/billing

3. **MongoDB connection failed:**
   - Ensure MongoDB is running
   - Check MONGODB_URI format
   - Verify database permissions

**Happy Cooking! 👨‍🍳👩‍🍳**
