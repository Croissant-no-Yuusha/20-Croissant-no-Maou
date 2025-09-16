# Database Documentation - Recipe Manager

Comprehensive database documentation covering schema design, storage options, and migration procedures for the Recipe Manager application.

## 🗄️ Storage Architecture

The Recipe Manager supports dual storage systems to accommodate both development and production environments:

### Development: JSON File Storage
- **File-based storage** for rapid development
- **Easy debugging** and data inspection
- **No database setup** required
- **Version control friendly**
- **Perfect for testing** and local development

### Production: MongoDB Storage
- **Scalable document database**
- **Advanced querying capabilities**
- **Full-text search support**
- **ACID transactions**
- **Horizontal scaling**

## 📊 Data Schema

### Recipe Document Structure

```json
{
  "id": 1,
  "title": "Classic Chocolate Chip Cookies",
  "instructions": "1. Preheat oven to 375°F. 2. Mix dry ingredients...",
  "ingredients": "2 cups all-purpose flour, 1 cup butter, 3/4 cup brown sugar, 1/2 cup white sugar, 2 large eggs, 2 tsp vanilla extract, 1 tsp baking soda, 1 tsp salt, 2 cups chocolate chips",
  "created_at": "2025-09-16T10:30:00.000Z",
  "updated_at": "2025-09-16T10:30:00.000Z",
  "is_ai_generated": false,
  "source": "manual",
  "tags": ["dessert", "cookies", "baking", "chocolate"],
  "difficulty": "easy",
  "prep_time": 15,
  "cook_time": 12,
  "servings": 24
}
```

### Field Specifications

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | Number | Yes | Unique identifier | Auto-generated, positive integer |
| `title` | String | Yes | Recipe name | 1-200 characters, non-empty |
| `instructions` | String | Yes | Cooking steps | 10-5000 characters, non-empty |
| `ingredients` | String | Yes | Ingredient list | 5-2000 characters, non-empty |
| `created_at` | Date | Yes | Creation timestamp | ISO 8601 format, auto-generated |
| `updated_at` | Date | Yes | Last modification | ISO 8601 format, auto-updated |
| `is_ai_generated` | Boolean | Yes | AI generation flag | true/false, default: false |
| `source` | String | Yes | Recipe source | Enum: manual, ai_gemini, ai_openai, ai_claude |
| `tags` | Array | No | Category tags | Array of strings, max 10 tags |
| `difficulty` | String | No | Cooking difficulty | Enum: easy, medium, hard |
| `prep_time` | Number | No | Preparation time (minutes) | Positive integer, 0-300 |
| `cook_time` | Number | No | Cooking time (minutes) | Positive integer, 0-600 |
| `servings` | Number | No | Number of servings | Positive integer, 1-50 |

### Data Types and Constraints

#### String Fields
- **title**: Required, 1-200 characters, trimmed
- **instructions**: Required, 10-5000 characters, preserves formatting
- **ingredients**: Required, 5-2000 characters, preserves line breaks
- **source**: Required, predefined enum values
- **difficulty**: Optional, predefined enum values
- **tags**: Optional array, each tag 1-50 characters

#### Numeric Fields
- **id**: Auto-incrementing positive integer
- **prep_time**: Optional, 0-300 minutes (5 hours max)
- **cook_time**: Optional, 0-600 minutes (10 hours max) 
- **servings**: Optional, 1-50 people

#### Date Fields
- **created_at**: Auto-generated UTC timestamp
- **updated_at**: Auto-updated on modifications

#### Boolean Fields
- **is_ai_generated**: Default false, set true for AI recipes

## 🔧 JSON Storage Implementation

### File Structure
```bash
backend/data/recipes.json
```

### Data Format
```json
[
  {
    "id": 1,
    "title": "Recipe 1",
    "instructions": "...",
    "ingredients": "...",
    "created_at": "2025-09-16T10:30:00.000Z",
    "updated_at": "2025-09-16T10:30:00.000Z",
    "is_ai_generated": false,
    "source": "manual",
    "tags": ["tag1", "tag2"],
    "difficulty": "easy",
    "prep_time": 15,
    "cook_time": 30,
    "servings": 4
  }
]
```

### Advantages
- **Zero Configuration**: No database setup required
- **Transparent Data**: Easy to inspect and debug
- **Version Control**: Changes tracked in git
- **Backup Simple**: Copy file for backup
- **Development Speed**: Instant read/write operations

### Limitations
- **Single User**: No concurrent access protection
- **Memory Usage**: Full dataset loaded in memory
- **No Complex Queries**: Limited search capabilities
- **Scalability**: Not suitable for large datasets
- **No Relationships**: Flat document structure only

## 🍃 MongoDB Implementation

### Database Structure
```
Database: recipe_manager
Collection: recipes
```

### Mongoose Schema
```javascript
const recipeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  instructions: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000
  },
  ingredients: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 2000
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
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  prep_time: {
    type: Number,
    min: 0,
    max: 300
  },
  cook_time: {
    type: Number,
    min: 0,
    max: 600
  },
  servings: {
    type: Number,
    min: 1,
    max: 50
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
```