import { Router } from 'express';

const createAIRoutes = (aiController) => {
  const router = Router();

  // AI suggestion route
  router.post('/ai-suggest', (req, res) =>
    aiController.generateRecipeSuggestion(req, res)
  );

  return router;
};

export { createAIRoutes };
