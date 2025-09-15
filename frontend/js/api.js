// Blank for same-origin requests
let API_URL = "";

// Function to get current API URL
export function getApiUrl() {
  return API_URL;
}

// Function to set API URL (for development/testing)
export function setApiUrl(url) {
  API_URL = url;
  console.log('API URL updated to:', getApiUrl());
}

// API calls for recipes and AI suggest
export async function fetchRecipes() {
  const apiUrl = getApiUrl();
  console.log('Fetching recipes from:', apiUrl);
  const res = await fetch(`${apiUrl}/recipes`);
  if (!res.ok) throw new Error('Failed to load recipes');
  return res.json();
}

export async function fetchRecipe(id) {
  const apiUrl = getApiUrl();
  console.log('Fetching recipe from:', apiUrl);
  const res = await fetch(`${apiUrl}/recipes/${id}`);
  if (!res.ok) throw new Error('Recipe not found');
  return res.json();
}

export async function saveRecipe(id, data) {
  const apiUrl = getApiUrl();
  console.log('Saving recipe to:', apiUrl);
  const url = `${apiUrl}/recipes${id ? '/' + id : ''}`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to save recipe');
  return result;
}

export async function deleteRecipe(id) {
  const apiUrl = getApiUrl();
  console.log('Deleting recipe from:', apiUrl);
  const res = await fetch(`${apiUrl}/recipes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete recipe');
  return res.json();
}

export async function aiSuggest(ingredients, language) {
  const apiUrl = getApiUrl();
  console.log('AI suggest request to:', apiUrl);
  const res = await fetch(`${apiUrl}/ai-suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, language })
  });
  if (!res.ok) throw new Error('AI suggest failed');
  return res.json();
}
