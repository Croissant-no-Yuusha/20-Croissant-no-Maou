# Frontend - Recipe Manager

A modern vanilla JavaScript frontend for the Recipe Manager application with responsive design and internationalization support.

## 🎨 Features

### User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI Components**: Clean and intuitive interface elements
- **Theme System**: Customizable visual themes
- **Modal Dialogs**: Recipe details and form modals
- **Real-time Notifications**: User feedback system
- **Loading States**: Visual indicators for async operations

### Functionality
- **Recipe CRUD**: Complete recipe management interface
- **AI Recipe Generation**: Integration with AI recipe generation
- **Advanced Search**: Search by title, ingredients, tags, and metadata
- **Recipe Filtering**: Filter by difficulty, cooking time, source
- **Tag Management**: Visual tag system for recipe organization
- **Recipe Cards**: Beautiful recipe preview cards with metadata
- **Responsive Navigation**: Mobile-friendly navigation system

### Internationalization
- **Multi-language Support**: English and Thai language support
- **Dynamic Language Switching**: Runtime language changes
- **Localized Content**: All UI text is translatable

## 📁 Project Structure

```
frontend/
├── index.html              # Main application entry point
├── assets/                 # Static assets and images
│   ├── icons/             # UI icons and graphics
│   └── images/            # Background images and textures
├── css/
│   └── style.css          # Main stylesheet with responsive design
├── js/                    # JavaScript modules
│   ├── main.js           # Application initialization and main logic
│   ├── api.js            # Backend API communication
│   ├── recipes.js        # Recipe management functionality
│   ├── modal.js          # Modal dialog handling
│   ├── notification.js   # Notification system
│   ├── theme.js          # Theme management
│   ├── language.js       # Internationalization logic
│   └── utils.js          # Utility functions
└── translations/         # Language files
    ├── en-US.js         # English translations
    └── th-TH.js         # Thai translations
```

## 🚀 Getting Started

### Prerequisites
- The backend server must be running
- Modern web browser with JavaScript enabled

### Setup
1. Ensure the backend server is running on `http://localhost:3039`
2. Open `index.html` in a web browser, or
3. Access via the backend server at `http://localhost:3039`

### Development
Since this is a vanilla JavaScript application, no build process is required:

1. **Edit files directly**: Make changes to HTML, CSS, or JS files
2. **Refresh browser**: Changes are immediately visible
3. **Use browser dev tools**: For debugging and testing

## 🏗️ Architecture

### Module System
The frontend uses ES6 modules with a modular architecture:

```javascript
// main.js - Application entry point
import { RecipeManager } from './recipes.js';
import { ApiClient } from './api.js';
import { ModalManager } from './modal.js';
// ... other imports
```

### Component Structure
- **RecipeManager**: Core recipe management logic
- **ApiClient**: HTTP client for backend communication
- **ModalManager**: Dialog and popup management
- **NotificationSystem**: User feedback and alerts
- **ThemeManager**: UI theme switching
- **LanguageManager**: Internationalization handling

### State Management
Simple state management using:
- Local storage for preferences (theme, language)
- In-memory state for current recipes and UI state
- Event-driven updates between components

## 🎨 Styling

### CSS Architecture
- **Responsive Design**: Mobile-first approach with breakpoints
- **CSS Custom Properties**: Theme-able color schemes
- **Flexbox & Grid**: Modern layout techniques
- **Component-based**: Modular CSS classes

### Theme System
```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --background-color: #ecf0f1;
  --text-color: #2c3e50;
  /* ... more theme variables */
}
```

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🌐 Internationalization

### Adding New Languages

1. **Create translation file:**
```javascript
// translations/new-language.js
export const translations = {
  'app.title': 'Recipe Manager',
  'recipe.title': 'Title',
  // ... more translations
};
```

2. **Register in language manager:**
```javascript
// js/language.js
import { translations as newLang } from '../translations/new-language.js';
// Add to available languages
```

3. **Update language selector in UI**

### Translation Keys
All UI text uses translation keys:
```javascript
// Usage in JavaScript
const title = t('recipe.title');

// HTML with data attributes
<span data-i18n="recipe.title">Title</span>
```

## 📱 Components

### Recipe Card Component
Displays recipe information in a card format:
- Recipe title and description
- Cooking time, difficulty, servings
- Tags and AI generation badge
- Action buttons (edit, delete, view)

### Modal System
Reusable modal dialogs:
- Recipe detail modal
- Recipe form modal (create/edit)
- Confirmation dialogs
- Settings modal

### Search Interface
Advanced search functionality:
- Real-time search as you type
- Filter by multiple criteria
- Search history
- Clear and reset options

### Notification System
User feedback notifications:
- Success messages
- Error handling
- Loading states
- Auto-dismiss timers

## 🔧 Configuration

### API Configuration
Backend API endpoint configuration in `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3039/api';
```

### Default Settings
User preferences with defaults:
- **Theme**: Light theme
- **Language**: English (en-US)
- **Items per page**: 12 recipes
- **Default view**: Card view

## 🧪 Testing

### Manual Testing Checklist
- [ ] Recipe CRUD operations
- [ ] Search and filtering
- [ ] Responsive design on different screen sizes
- [ ] Theme switching
- [ ] Language switching
- [ ] AI recipe generation
- [ ] Modal dialogs
- [ ] Notifications
- [ ] Error handling

### Browser Testing
Tested and supported browsers:
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Development Tools
Recommended browser extensions:
- Vue.js devtools (for debugging)
- Web Developer
- Lighthouse (for performance)

## 🚀 Performance

### Optimization Features
- **Lazy Loading**: Images loaded on demand
- **Efficient DOM Updates**: Minimal DOM manipulation
- **Local Storage**: Caching user preferences
- **Debounced Search**: Optimized search input handling
- **Image Optimization**: Compressed assets

### Bundle Size
No build process means:
- No bundling overhead
- Direct file serving
- Cache-friendly individual modules
- Fast development iteration

## 🔧 Browser Support

### Modern Features Used
- ES6+ JavaScript (modules, async/await, destructuring)
- CSS Grid and Flexbox
- CSS Custom Properties
- Fetch API
- Local Storage
- Event delegation

### Polyfills
Not currently included, but may be added for:
- Older browser support
- Missing Fetch API
- CSS Custom Properties fallback

## 🤝 Contributing

### Frontend Development Guidelines
1. **Code Style**: Use consistent indentation and naming
2. **Modularity**: Keep components small and focused
3. **Accessibility**: Include ARIA labels and semantic HTML
4. **Performance**: Minimize DOM manipulation
5. **Testing**: Test across different browsers and devices

### Adding New Features
1. Create new module in `js/` directory
2. Import and initialize in `main.js`
3. Add corresponding CSS styles
4. Update translations if needed
5. Test functionality thoroughly

### File Organization
- **Components**: One file per major component
- **Utilities**: Shared functions in `utils.js`
- **Styles**: Component styles in main CSS file
- **Assets**: Organize by type (icons, images, etc.)

---

*Happy Frontend Development! 🎨*