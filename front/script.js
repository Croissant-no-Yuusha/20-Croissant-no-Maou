const API_URL = "http://127.0.0.1:3000";
let aiSuggestionCount =
  parseInt(localStorage.getItem("aiSuggestionCount")) || 0;

function updateStats() {
  document.getElementById("aiSuggestions").textContent = aiSuggestionCount;
}

async function loadRecipes() {
  try {
    const res = await fetch(`${API_URL}/recipes`);
    if (!res.ok) throw new Error("Failed to load recipes");

    const recipes = await res.json();
    const list = document.getElementById("recipesList");

    document.getElementById("totalRecipes").textContent = recipes.length;

    if (recipes.length === 0) {
      list.innerHTML = `
            <div class="empty-state">
              <h3>No recipes yet</h3>
              <p>Generate your first recipe with AI or add one manually!</p>
            </div>
          `;
      return;
    }

    const recipesGrid = document.createElement("div");
    recipesGrid.className = "recipes-grid";

    recipes.forEach((recipe) => {
      const recipeCard = document.createElement("div");
      recipeCard.className = "recipe-card fade-in";

      const createdDate = new Date(recipe.created_at).toLocaleDateString();
      const isUpdated = recipe.updated_at !== recipe.created_at;
      const updatedDate = isUpdated
        ? new Date(recipe.updated_at).toLocaleDateString()
        : null;

      recipeCard.innerHTML = `
            <div class="recipe-title">
              🍽️ ${recipe.title}
            </div>
            ${recipe.ingredients
          ? `
              <div class="recipe-ingredients">
                <strong>Ingredients:</strong> ${recipe.ingredients}
              </div>
            `
          : ""
        }
            <div class="recipe-instructions">${recipe.instructions.replace(
          /\n/g,
          "<br>"
        )}</div>
            <div class="recipe-meta">
              Created: ${createdDate}
              ${isUpdated ? `• Updated: ${updatedDate}` : ""}
            </div>
            <div class="recipe-buttons">
              <button class="btn btn-secondary btn-small" onclick="editRecipe(${recipe.id
        })">✏️ Edit</button>
              <button class="btn btn-danger btn-small" onclick="deleteRecipe(${recipe.id
        })">🗑️ Delete</button>
            </div>
          `;
      recipesGrid.appendChild(recipeCard);
    });

    list.innerHTML = "";
    list.appendChild(recipesGrid);
  } catch (error) {
    console.error("Error loading recipes:", error);
    document.getElementById("recipesList").innerHTML = `
          <div class="empty-state">
            <h3>Error loading recipes</h3>
            <p>Please check your connection and try again.</p>
          </div>
        `;
  }
}

document.getElementById("recipeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("recipeId").value;
  const title = document.getElementById("title").value.trim();
  const instructions = document.getElementById("instructions").value.trim();
  const ingredients = document.getElementById("recipeIngredients").value.trim();

  if (!title || !instructions) {
    alert("Please fill in both title and instructions");
    return;
  }

  try {
    const saveBtn = document.getElementById("saveBtn");
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    const url = id ? `${API_URL}/recipes/${id}` : `${API_URL}/recipes`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, instructions, ingredients }),
    });

    if (!res.ok) throw new Error("Failed to save recipe");

    document.getElementById("recipeId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("instructions").value = "";
    document.getElementById("recipeIngredients").value = "";

    document.getElementById("formTitle").textContent = "Add New Recipe";
    document.getElementById("cancelBtn").style.display = "none";

    await loadRecipes();

    const successMsg = id
      ? "Recipe updated successfully!"
      : "Recipe saved successfully!";
    alert(successMsg);
  } catch (error) {
    console.error("Error saving recipe:", error);
    alert("Failed to save recipe. Please try again.");
  } finally {
    const saveBtn = document.getElementById("saveBtn");
    saveBtn.textContent = "💾 Save Recipe";
    saveBtn.disabled = false;
  }
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("recipeId").value = "";
  document.getElementById("title").value = "";
  document.getElementById("instructions").value = "";
  document.getElementById("recipeIngredients").value = "";
  document.getElementById("formTitle").textContent = "Add New Recipe";
  document.getElementById("cancelBtn").style.display = "none";
});

async function editRecipe(id) {
  try {
    const res = await fetch(`${API_URL}/recipes/${id}`);
    if (!res.ok) throw new Error("Recipe not found");

    const recipe = await res.json();

    document.getElementById("recipeId").value = recipe.id;
    document.getElementById("title").value = recipe.title;
    document.getElementById("instructions").value = recipe.instructions;
    document.getElementById("recipeIngredients").value =
      recipe.ingredients || "";
    document.getElementById("formTitle").textContent = "Edit Recipe";
    document.getElementById("cancelBtn").style.display = "inline-block";

    document
      .getElementById("recipeForm")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error loading recipe for edit:", error);
    alert("Failed to load recipe for editing.");
  }
}

async function deleteRecipe(id) {
  if (!confirm("Are you sure you want to delete this recipe?")) return;

  try {
    const res = await fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete recipe");

    await loadRecipes();
    alert("Recipe deleted successfully!");
  } catch (error) {
    console.error("Error deleting recipe:", error);
    alert("Failed to delete recipe. Please try again.");
  }
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  const ingredients = document.getElementById("ingredients").value.trim();
  if (!ingredients) {
    alert("Please enter some ingredients");
    return;
  }

  const outputElement = document.getElementById("aiOutput");
  const generateBtn = document.getElementById("generateBtn");

  outputElement.innerHTML =
    '<div class="loading">Generating your perfect recipe...</div>';
  outputElement.style.display = "block";
  outputElement.className = "ai-output";

  generateBtn.textContent = "Generating...";
  generateBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/ai-suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    let suggestion = "";

    if (data.error) {
      suggestion = data.suggestion || `Error: ${data.error}`;
    } else if (data.suggestion) {
      suggestion = data.suggestion;
      aiSuggestionCount++;
      localStorage.setItem("aiSuggestionCount", aiSuggestionCount.toString());
      updateStats();
    } else {
      suggestion = "No recipe suggestion received from the server.";
    }

    outputElement.innerHTML = suggestion;
    outputElement.className = "ai-output has-content";

    outputElement.scrollIntoView({ behavior: "smooth" });

    const quickSaveBtn = document.createElement("button");
    quickSaveBtn.className = "btn btn-secondary";
    quickSaveBtn.style.marginTop = "15px";
    quickSaveBtn.innerHTML = "💾 Quick Save This Recipe";
    quickSaveBtn.onclick = () => quickSaveRecipe(suggestion, ingredients);

    outputElement.appendChild(quickSaveBtn);
  } catch (error) {
    console.error("AI generation error:", error);
    outputElement.innerHTML = `❌ Error: ${error.message}<br><br>Please check your connection and try again.`;
    outputElement.className = "ai-output";
  } finally {
    generateBtn.textContent = "🎲 Generate Recipe";
    generateBtn.disabled = false;
  }
});

function quickSaveRecipe(suggestion, originalIngredients) {
  const lines = suggestion.split("\n");
  let title = "AI Generated Recipe";
  let instructions = suggestion;

  for (let line of lines) {
    if (line.includes("Recipe Title:") || line.includes("**Recipe Title:**")) {
      title = line
        .replace(/\*\*Recipe Title:\*\*|\*\*|\*|Recipe Title:/g, "")
        .trim();
      break;
    }
    if (line.includes("Title:")) {
      title = line.replace(/Title:/g, "").trim();
      break;
    }
  }

  document.getElementById("title").value = title;
  document.getElementById("instructions").value = instructions;
  document.getElementById("recipeIngredients").value = originalIngredients;
  document.getElementById("formTitle").textContent = "Save AI Recipe";

  document.getElementById("recipeForm").scrollIntoView({ behavior: "smooth" });

  const formCard = document.querySelector("#recipeForm").closest(".card");
  formCard.style.boxShadow = "0 0 20px rgba(102, 126, 234, 0.5)";
  setTimeout(() => {
    formCard.style.boxShadow = "";
  }, 2000);
}

document.getElementById("ingredients").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("generateBtn").click();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();
  updateStats();

  setTimeout(() => {
    document.querySelector(".container").style.opacity = "1";
  }, 100);
});

window.editRecipe = editRecipe;
window.deleteRecipe = deleteRecipe;
