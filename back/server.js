const express = require("express");
const fs = require("fs");
const path = require("path");

require('dotenv').config()

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../front')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const API_KEY = process.env.API_KEY;
const MODEL = process.env.MODEL;

const RECIPES_FILE = path.join(__dirname, 'recipes.json');


function readRecipes() {
  try {
    const data = fs.readFileSync(RECIPES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading recipes:", error);
    return [];
  }
}

function writeRecipes(recipes) {
  try {
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing recipes:", error);
    return false;
  }
}

function getNextId(recipes) {
  return recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1;
}

// ======================
// 📖 CRUD Recipes with JSON File
// ======================

// Create recipe
app.post("/recipes", (req, res) => {
  try {
    const { title, instructions, ingredients } = req.body;
    
    if (!title || !instructions) {
      return res.status(400).json({ error: "Title and instructions are required" });
    }

    const recipes = readRecipes();
    const recipe = {
      id: getNextId(recipes),
      title: title.trim(),
      instructions: instructions.trim(),
      ingredients: ingredients ? ingredients.trim() : "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    recipes.push(recipe);
    
    if (writeRecipes(recipes)) {
      res.json(recipe);
    } else {
      res.status(500).json({ error: "Failed to save recipe" });
    }
  } catch (error) {
    console.error("Create recipe error:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// Read all recipes
app.get("/recipes", (req, res) => {
  try {
    const recipes = readRecipes();
    recipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(recipes);
  } catch (error) {
    console.error("Read recipes error:", error);
    res.status(500).json({ error: "Failed to load recipes" });
  }
});

// Read single recipe
app.get("/recipes/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recipes = readRecipes();
    const recipe = recipes.find(r => r.id === id);
    
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error("Read recipe error:", error);
    res.status(500).json({ error: "Failed to load recipe" });
  }
});

// Update recipe
app.put("/recipes/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, instructions, ingredients } = req.body;
    
    if (!title || !instructions) {
      return res.status(400).json({ error: "Title and instructions are required" });
    }

    const recipes = readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    recipes[recipeIndex] = {
      ...recipes[recipeIndex],
      title: title.trim(),
      instructions: instructions.trim(),
      ingredients: ingredients ? ingredients.trim() : "",
      updated_at: new Date().toISOString()
    };

    if (writeRecipes(recipes)) {
      res.json(recipes[recipeIndex]);
    } else {
      res.status(500).json({ error: "Failed to update recipe" });
    }
  } catch (error) {
    console.error("Update recipe error:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// Delete recipe
app.delete("/recipes/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recipes = readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    recipes.splice(recipeIndex, 1);
    
    if (writeRecipes(recipes)) {
      res.json({ success: true, message: "Recipe deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// ======================
// 🤖 AI Suggestion using Google Gemini API
// ======================
app.post("/ai-suggest", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !ingredients.trim()) {
    return res.status(400).json({ 
      error: "Ingredients are required",
      suggestion: "Please provide some ingredients to generate a recipe suggestion."
    });
  }

  if (!API_KEY) {
    return res.status(500).json({ 
      error: "API key not configured",
      suggestion: "Please configure your Google Gemini API key in the environment variables."
    });
  }

  try {
    const https = require('https');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const postData = JSON.stringify({
      contents: [
        {
          parts: [
            { 
text: `คุณคือผู้ช่วยทำอาหารที่เป็นประโยชน์ สร้างสูตรอาหารอร่อยโดยใช้ส่วนผสมเหล่านี้: ${ingredients.trim()}

โปรดให้คำตอบของคุณในรูปแบบนี้เป๊ะ ๆ:

**ชื่อเมนู:** [ตั้งชื่อเมนูอย่างสร้างสรรค์]

**ส่วนผสม:**
- [รายการส่วนผสมทั้งหมดพร้อมปริมาณ]

**วิธีทำ:**
1. [ขั้นตอนที่ 1]
2. [ขั้นตอนที่ 2]
3. [ต่อด้วยขั้นตอนแบบมีหมายเลข]

**เวลาในการทำอาหาร:** [เวลาเตรียมและเวลาในการปรุง]

ทำให้สูตรนี้เป็นไปได้จริงและอร่อย หากส่วนผสมพื้นฐานบางอย่างหายไป (เช่น น้ำมัน เกลือ พริกไทย) สามารถใส่เพิ่มเติมได้`

            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const request = https.request(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          if (response.statusCode !== 200) {
            console.error(`API Error ${response.statusCode}:`, data);
            return res.status(500).json({ 
              error: "AI request failed", 
              suggestion: "Sorry, there was an error connecting to the AI service. Please try again later."
            });
          }

          const apiResponse = JSON.parse(data);
          console.log("Gemini API response received");

          let suggestion = "No suggestion returned";
          
          if (apiResponse.candidates && apiResponse.candidates.length > 0) {
            const candidate = apiResponse.candidates[0];
            
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              suggestion = candidate.content.parts
                .map(part => part.text || "")
                .join("\n")
                .trim();
            } else if (candidate.text) {
              suggestion = candidate.text.trim();
            }
          }

          if (!suggestion || suggestion === "No suggestion returned") {
            suggestion = "Sorry, I couldn't generate a recipe suggestion. Please try again with different ingredients.";
          }

          console.log("Recipe suggestion generated successfully");
          res.json({ suggestion });

        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          res.status(500).json({ 
            error: "Failed to parse AI response", 
            suggestion: "Sorry, there was an error processing the AI response. Please try again."
          });
        }
      });
    });

    request.on('error', (error) => {
      console.error("HTTPS request error:", error);
      res.status(500).json({ 
        error: "Network error", 
        suggestion: "Sorry, there was a network error. Please check your connection and try again."
      });
    });

    request.write(postData);
    request.end();

  } catch (error) {
    console.error("AI suggestion error:", error);
    res.status(500).json({ 
      error: "AI request failed", 
      details: error.message,
      suggestion: "Sorry, there was an error connecting to the AI service. Please try again later."
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT;


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("Google Gemini API Key loaded:", API_KEY && API_KEY !== 'your-api-key-here' ? "✅ Yes" : "❌ No - Please set GOOGLE_GEMINI_API_KEY environment variable");
  console.log("📁 Recipes stored in:", RECIPES_FILE);
});