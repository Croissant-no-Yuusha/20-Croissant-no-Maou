class AIController {
  constructor(aiService) {
    this.aiService = aiService;
  }

  async generateRecipeSuggestion(req, res) {
    try {
      const { ingredients, language = 'en' } = req.body;

      // Debug logging to see what language is being received
      console.log(
        `🔍 AI Request - Language: ${language}, Ingredients: ${ingredients?.trim()}`
      );

      if (!ingredients || !ingredients.trim()) {
        return res.status(400).json({
          error: 'Ingredients are required',
          suggestion:
            'Please provide some ingredients to generate a recipe suggestion.'
        });
      }

      const result = await this.aiService.generateRecipeSuggestion(
        ingredients,
        language
      );
      res.json(result);
    } catch (error) {
      console.error('AI suggestion error:', error);

      if (error.message === 'API key not configured') {
        return res.status(500).json({
          error: 'API key not configured',
          suggestion:
            'Please configure your Google Gemini API key in the environment variables.'
        });
      }

      res.status(500).json({
        error: 'AI request failed',
        details: error.message,
        suggestion:
          'Sorry, there was an error connecting to the AI service. Please try again later.'
      });
    }
  }
}

export { AIController };
