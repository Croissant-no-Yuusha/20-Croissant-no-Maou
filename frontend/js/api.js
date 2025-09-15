// API calls for recipes and AI suggest
export async function fetchRecipes(API_URL) {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) throw new Error('Failed to load recipes');
  return res.json();
}

export async function fetchRecipe(API_URL, id) {
  const res = await fetch(`${API_URL}/recipes/${id}`);
  if (!res.ok) throw new Error('Recipe not found');
  return res.json();
}

export async function saveRecipe(API_URL, id, data) {
  const url = `${API_URL}/recipes${id ? '/' + id : ''}`;
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

export async function deleteRecipe(API_URL, id) {
  const res = await fetch(`${API_URL}/recipes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete recipe');
  return res.json();
}

export async function aiSuggest(API_URL, ingredients, language) {
  const res = await fetch(`${API_URL}/ai-suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, language })
  });
  if (!res.ok) throw new Error('AI suggest failed');
  return res.json();
}
