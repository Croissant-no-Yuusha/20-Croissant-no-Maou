// Utility functions

// Ingredient Formatting Helper Functions
export function formatIngredientsForCard(ingredients) {
  if (!ingredients) return '';
  
  // Convert any format to single line comma-separated for card view
  return ingredients
    .replace(/\n+/g, '\n')  // Normalize multiple line breaks to single
    .split('\n')
    .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())  // Remove bullets and trim
    .filter(line => line.length > 0)
    .join(', ');
}

export function formatIngredientsForModal(ingredients) {
  if (!ingredients) return '';
  
  // Split by line breaks first, then by bullet points within each line
  let allIngredients = [];
  
  const lines = ingredients.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Split by bullet points within the line
    const bulletParts = trimmed.split('•').map(part => part.trim()).filter(part => part.length > 0);
    
    bulletParts.forEach(part => {
      // Clean any remaining bullet symbols at the start
      const cleaned = part.replace(/^\s*[-*•]\s*/, '').trim();
      if (cleaned) allIngredients.push(cleaned);
    });
  });
  
  return allIngredients
    .map(ingredient => `<div class="ingredient-item">• ${ingredient}</div>`)
    .join('');
}

export function formatInstructionsForCard(instructions) {
  if (!instructions) return '';
  
  // Convert line breaks to spaces and truncate for card view
  const singleLine = instructions.replace(/\n+/g, ' ').trim();
  const truncated = singleLine.length > 150 
    ? singleLine.substring(0, 150) + '...' 
    : singleLine;
    
  return truncated;
}

export function formatInstructionsForModal(instructions) {
  if (!instructions) return '';
  
  // Preserve line breaks for modal view
  return instructions.replace(/\n/g, '<br>');
}

export function addLoadingStates() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', () => {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('loading');
      }
    });
  });
}

export function lazyLoadImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}
