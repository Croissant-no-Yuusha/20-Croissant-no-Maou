import https from 'https';

class AIService {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateRecipeSuggestion(ingredients, language = 'en') {
    if (!ingredients || !ingredients.trim()) {
      throw new Error('Ingredients are required');
    }

    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

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

Make this recipe realistic and delicious. If some basic ingredients are missing (like oil, salt, pepper), you can add them as needed.`
    };

    const selectedPrompt = prompts[language] || prompts['en'];
    console.log(
      `📝 Selected prompt language: ${language}, Using: ${language === 'th' ? 'Thai' : 'English'} prompt`
    );

    const postData = JSON.stringify({
      contents: [
        {
          parts: [{ text: selectedPrompt }]
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

    return new Promise((resolve, reject) => {
      const request = https.request(url, options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode !== 200) {
            console.error(`API Error ${response.statusCode}:`, data);
            reject(
              new Error(`API request failed with status ${response.statusCode}`)
            );
            return;
          }

          try {
            const apiResponse = JSON.parse(data);
            console.log('Gemini API response received');

            let suggestion = 'No suggestion returned';

            if (apiResponse.candidates && apiResponse.candidates.length > 0) {
              const candidate = apiResponse.candidates[0];

              if (
                candidate.content &&
                candidate.content.parts &&
                candidate.content.parts.length > 0
              ) {
                suggestion = candidate.content.parts
                  .map((part) => part.text || '')
                  .join('\n')
                  .trim();
              } else if (candidate.text) {
                suggestion = candidate.text.trim();
              }
            }

            if (!suggestion || suggestion === 'No suggestion returned') {
              suggestion =
                "Sorry, I couldn't generate a recipe suggestion. Please try again with different ingredients.";
            }

            console.log('Recipe suggestion generated successfully');
            resolve({
              suggestion,
              metadata: {
                is_ai_generated: true,
                source: 'ai_gemini',
                generated_at: new Date().toISOString()
              }
            });
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            reject(new Error('Failed to parse AI response'));
          }
        });
      });

      request.on('error', (error) => {
        console.error('HTTPS request error:', error);
        reject(error);
      });

      request.write(postData);
      request.end();
    });
  }
}

export { AIService };