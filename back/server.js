const express = require("express");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const { StorageFactory, connectToMongoDB, Recipe } = require("./storage");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../front")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const API_KEY = process.env.API_KEY;
const MODEL = process.env.MODEL;
const STORAGE_TYPE = process.env.STORAGE_TYPE || "json";

const RECIPES_FILE = path.join(__dirname, "recipes.json");

// Initialize storage
let storage;
switch (STORAGE_TYPE) {
  case "mongodb":
    // Connect to MongoDB on startup
    connectToMongoDB().then((connected) => {
      if (connected) {
        console.log("Storage Type : MongoDB");
        storage = StorageFactory.create("mongodb", { Recipe });
      } else {
        console.error("❌ MongoDB connection failed. Exiting server...");
        process.exit(1); // Exit the server with a failure code
      }
    });
    break;
  case "json":
  default:
    console.log("Storage Type : JSON");
    storage = StorageFactory.create("json", { recipesFilePath: RECIPES_FILE });
    break;
}

// ======================
// 📖 CRUD Recipes with JSON File
// ======================

// Create recipe
app.post("/recipes", async (req, res) => {
  try {
    const {
      title,
      instructions,
      ingredients,
      is_ai_generated = false,
      source = "manual",
      tags = [],
      difficulty = "easy",
      prep_time = 0,
      cook_time = 0,
      servings = 1,
    } = req.body;

    if (!title || !instructions) {
      return res
        .status(400)
        .json({ error: "Title and instructions are required" });
    }

    const recipeData = {
      title: title.trim(),
      instructions: instructions.trim(),
      ingredients: ingredients ? ingredients.trim() : "",
      is_ai_generated: Boolean(is_ai_generated),
      source: source.trim(),
      tags: Array.isArray(tags) ? tags : [],
      difficulty: difficulty.trim(),
      prep_time: Number(prep_time) || 0,
      cook_time: Number(cook_time) || 0,
      servings: Number(servings) || 1,
    };

    const recipe = await storage.createRecipe(recipeData);
    res.json(recipe);
  } catch (error) {
    console.error("Create recipe error:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// Read all recipes
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await storage.getAllRecipes();
    res.json(recipes);
  } catch (error) {
    console.error("Read recipes error:", error);
    res.status(500).json({ error: "Failed to load recipes" });
  }
});

// Read single recipe
app.get("/recipes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const recipe = await storage.getRecipeById(id);

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
app.put("/recipes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      instructions,
      ingredients,
      is_ai_generated,
      source,
      tags,
      difficulty,
      prep_time,
      cook_time,
      servings,
    } = req.body;

    if (!title || !instructions) {
      return res
        .status(400)
        .json({ error: "Title and instructions are required" });
    }

    const updateData = {
      title: title.trim(),
      instructions: instructions.trim(),
      ingredients: ingredients ? ingredients.trim() : "",
    };

    // Add optional fields if provided
    if (is_ai_generated !== undefined)
      updateData.is_ai_generated = Boolean(is_ai_generated);
    if (source !== undefined) updateData.source = source.trim();
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (difficulty !== undefined) updateData.difficulty = difficulty.trim();
    if (prep_time !== undefined) updateData.prep_time = Number(prep_time) || 0;
    if (cook_time !== undefined) updateData.cook_time = Number(cook_time) || 0;
    if (servings !== undefined) updateData.servings = Number(servings) || 1;

    const recipe = await storage.updateRecipe(id, updateData);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Update recipe error:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// Delete recipe
app.delete("/recipes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const success = await storage.deleteRecipe(id);

    if (!success) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// ======================
// 🤖 AI Suggestion using Google Gemini API
// ======================
app.post("/ai-suggest", async (req, res) => {
  const { ingredients, language = "en" } = req.body;

  // Debug logging to see what language is being received
  console.log(
    `🔍 AI Request - Language: ${language}, Ingredients: ${ingredients?.trim()}`,
  );

  if (!ingredients || !ingredients.trim()) {
    return res.status(400).json({
      error: "Ingredients are required",
      suggestion:
        "Please provide some ingredients to generate a recipe suggestion.",
    });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: "API key not configured",
      suggestion:
        "Please configure your Google Gemini API key in the environment variables.",
    });
  }

  try {
    const https = require("https");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    // Create language-specific prompts
    const prompts = {
      th: `คุณคือผู้ช่วยทำอาหารที่เป็นประโยชน์ สร้างสูตรอาหารอร่อยโดยใช้ส่วนผสมเหล่านี้: ${ingredients.trim()}

โปรดให้คำตอบของคุณในรูปแบบนี้เป๊ะ ๆ:

**ชื่อเมนู:** [ตั้งชื่อเมนูอย่างสร้างสรรค์]

**ส่วนผสม:**
- [รายการส่วนผสมทั้งหมดพร้อมปริมาณ]

**วิธีทำ:**
1. [ขั้นตอนที่ 1]
2. [ขั้นตอนที่ 2]
3. [ต่อด้วยขั้นตอนแบบมีหมายเลข]

**เวลาในการทำอาหาร:** [เวลาเตรียมและเวลาในการปรุง]

ทำให้สูตรนี้เป็นไปได้จริงและอร่อย หากส่วนผสมพื้นฐานบางอย่างหายไป (เช่น น้ำมัน เกลือ พริกไทย) สามารถใส่เพิ่มเติมได้`,

      en: `You are a helpful cooking assistant. Create a delicious recipe using these ingredients: ${ingredients.trim()}

Please format your response exactly like this:

**Menu Name:** [Create a creative dish name]

**Ingredients:**
- [List all ingredients with quantities]

**Instructions:**
1. [Step 1]
2. [Step 2]
3. [Continue with numbered steps]

**Cooking Time:** [Prep time and cooking time]

Make this recipe realistic and delicious. If some basic ingredients are missing (like oil, salt, pepper), you can add them as needed.`,
    };

    const selectedPrompt = prompts[language] || prompts["en"];
    console.log(
      `📝 Selected prompt language: ${language}, Using: ${language === "th" ? "Thai" : "English"} prompt`,
    );

    const postData = JSON.stringify({
      contents: [
        {
          parts: [{ text: selectedPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const request = https.request(url, options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          if (response.statusCode !== 200) {
            console.error(`API Error ${response.statusCode}:`, data);
            return res.status(500).json({
              error: "AI request failed",
              suggestion:
                "Sorry, there was an error connecting to the AI service. Please try again later.",
            });
          }

          const apiResponse = JSON.parse(data);
          console.log("Gemini API response received");

          let suggestion = "No suggestion returned";

          if (apiResponse.candidates && apiResponse.candidates.length > 0) {
            const candidate = apiResponse.candidates[0];

            if (
              candidate.content &&
              candidate.content.parts &&
              candidate.content.parts.length > 0
            ) {
              suggestion = candidate.content.parts
                .map((part) => part.text || "")
                .join("\n")
                .trim();
            } else if (candidate.text) {
              suggestion = candidate.text.trim();
            }
          }

          if (!suggestion || suggestion === "No suggestion returned") {
            suggestion =
              "Sorry, I couldn't generate a recipe suggestion. Please try again with different ingredients.";
          }

          console.log("Recipe suggestion generated successfully");
          res.json({
            suggestion,
            metadata: {
              is_ai_generated: true,
              source: "ai_gemini",
              generated_at: new Date().toISOString(),
            },
          });
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          res.status(500).json({
            error: "Failed to parse AI response",
            suggestion:
              "Sorry, there was an error processing the AI response. Please try again.",
          });
        }
      });
    });

    request.on("error", (error) => {
      console.error("HTTPS request error:", error);
      res.status(500).json({
        error: "Network error",
        suggestion:
          "Sorry, there was a network error. Please check your connection and try again.",
      });
    });

    request.write(postData);
    request.end();
  } catch (error) {
    console.error("AI suggestion error:", error);
    res.status(500).json({
      error: "AI request failed",
      details: error.message,
      suggestion:
        "Sorry, there was an error connecting to the AI service. Please try again later.",
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT | 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(
    'Google Gemini API Key loaded:',
    API_KEY && API_KEY !== 'your-api-key-here'
      ? '✅ Yes'
      : '❌ No - Please set API_KEY environment variable'
  );
  console.log("📁 Recipes stored in:", RECIPES_FILE);
});
