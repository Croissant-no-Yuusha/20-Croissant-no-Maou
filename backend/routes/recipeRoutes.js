import { Router } from 'express';

const createRecipeRoutes = (recipeController) => {
  const router = Router();

  // Recipe CRUD routes
  router.post('/', (req, res) => recipeController.createRecipe(req, res));
  router.get('/', (req, res) => recipeController.getAllRecipes(req, res));
  router.get('/:id', (req, res) => recipeController.getRecipeById(req, res));
  router.put('/:id', (req, res) => recipeController.updateRecipe(req, res));
  router.delete('/:id', (req, res) => recipeController.deleteRecipe(req, res));

  return router;
};

export { createRecipeRoutes };