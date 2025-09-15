# Recipe Manager Backend

## New Project Structure

```
backend/
├── config/
│   └── database.js           # Database connection configuration
├── controllers/
│   ├── RecipeController.js   # Recipe CRUD operations
│   └── AIController.js       # AI recipe generation
├── models/
│   └── Recipe.js             # Recipe data model (Mongoose schema)
├── routes/
│   ├── recipeRoutes.js       # Recipe API routes
│   └── aiRoutes.js           # AI API routes
├── services/
│   ├── StorageService.js     # Storage abstraction (JSON/MongoDB)
│   └── AIService.js          # AI integration service
├── utils/
│   └── test-connection.js    # MongoDB connection test utility
├── data/                     # JSON data storage (if using JSON mode)
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── .env.example              # Environment variables template
└── .prettierrc               # Code formatting configuration
```

## Architecture Overview

This backend follows the **MVC (Model-View-Controller)** pattern with additional service layers:

### Controllers (`controllers/`)
- Handle HTTP requests and responses
- Validate input data
- Call appropriate services
- Return formatted responses

### Models (`models/`)
- Define data structures and schemas
- Handle data validation
- Database model definitions (for MongoDB)

### Services (`services/`)
- Business logic implementation
- External API integrations
- Storage abstraction layer

### Routes (`routes/`)
- Define API endpoints
- Connect HTTP routes to controllers
- Middleware configuration per route

### Config (`config/`)
- Database connections
- Environment-specific configurations
- Third-party service configurations

## API Endpoints

### Recipes
- `GET /recipes` - Get all recipes
- `GET /recipes/:id` - Get specific recipe
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe

### AI Integration
- `POST /ai-suggest` - Generate recipe suggestions using AI

## Environment Variables

```bash
# Database Configuration
STORAGE_TYPE=json              # 'json' or 'mongodb'
MONGODB_URI=mongodb://localhost:27017/recipe_manager

# AI Service Configuration
API_KEY=your-gemini-api-key
MODEL=gemini-1.5-flash

# Server Configuration
PORT=3000
```

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Migrate from JSON to MongoDB
npm run check      # Check code formatting
npm run format     # Format code with Prettier
```