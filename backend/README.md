# Recipe Manager Backend

## New Project Structure

# Backend - Recipe Manager API

A robust Node.js REST API server for the Recipe Manager application, featuring dual storage support, AI integration, and clean MVC architecture.

## 🏗️ Architecture

### Project Structure

```
backend/
├── config/
│   └── database.js           # Database connection configuration
├── controllers/
│   ├── RecipeController.js   # Recipe CRUD operations
│   └── AIController.js       # AI recipe generation endpoints
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
├── data/                     # JSON data storage (development mode)
│   └── recipes.json         # Recipe data file
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables template
└── .prettierrc               # Code formatting configuration
```

### MVC Architecture with Service Layer

**Design Principles:**

- **Models**: Data structures and validation (Mongoose schemas)
- **Views**: JSON API responses
- **Controllers**: Request/response handling and coordination
- **Services**: Business logic and external integrations

**Key Features:**

- **Storage Abstraction**: Seamless switching between JSON and MongoDB
- **Error Handling**: Centralized error management
- **Input Validation**: Multi-layer validation system
- **AI Integration**: Pluggable AI service architecture

### Component Details

#### Controllers (`controllers/`)

- Handle HTTP requests and responses
- Input validation and sanitization
- Service coordination
- Response formatting and status codes

#### Models (`models/`)

- MongoDB schema definitions (Mongoose)
- Data validation rules
- Default values and computed fields
- Database indexes for performance

#### Services (`services/`)

- **StorageService**: Data persistence abstraction
- **AIService**: External AI API integration
- Business logic implementation
- Data transformation and processing

#### Routes (`routes/`)

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
