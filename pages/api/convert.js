export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { recipeText, inputMode, imageData } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let finalRecipeText = recipeText;

    // Handle image input
    if (inputMode === 'image' && imageData) {
      const imageResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageData.type,
                  data: imageData.data
                }
              },
              {
                type: 'text',
                text: 'Extract the complete recipe from this image. Include the title, all ingredients with amounts, and all instructions. Return only the recipe text.'
              }
            ]
          }]
        })
      });

      const imageResult = await imageResponse.json();
      finalRecipeText = imageResult.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }

    // Convert recipe to gluten-free
    const conversionPrompt = `You are an expert in gluten-free cooking for celiac disease and Hashimoto's disease. Convert this recipe to gluten-free with intelligent, context-aware substitutions.

RECIPE:
${finalRecipeText}

CRITICAL RULES - TEXTURE AND CONTEXT MATTER:

1. MAINTAIN THE FUNDAMENTAL DISH TYPE:
   - Bao buns/steamed buns = fluffy, bread-like texture → Use GF flour blends ONLY. NEVER suggest rice paper (that's for dumplings/spring rolls)
   - Dumplings/potstickers/gyoza = thin, delicate wrappers → Rice paper IS acceptable here
   - Bread/pizza dough = chewy, structured → Need proper GF flour blends with binders
   - Noodles = specific bite/chew → Suggest GF noodle brands OR rice noodles (but acknowledge texture difference)
   - Pastries/croissants = flaky layers → Be honest if GF won't achieve same result
   - Cookies/cakes = specific crumb → Match texture type (crispy, chewy, tender, etc.)

2. BE BRUTALLY HONEST ABOUT FEASIBILITY:
   - If a recipe fundamentally relies on gluten (hand-pulled noodles, croissants, traditional baguettes), rate it "difficult" or "not-recommended"
   - Don't offer fake alternatives that completely change the dish
   - When homemade is too hard, suggest store-bought GF versions: "This is extremely difficult to replicate GF at home. Consider purchasing frozen GF [item] and focus on making the accompaniments."

3. ASIAN CUISINE INTELLIGENCE:
   - Bao buns vs dumplings are DIFFERENT things with different textures
   - Rice paper = dumpling wrappers, NOT bao buns
   - For noodle dishes: acknowledge GF noodles have different texture, suggest brands
   - Soy sauce → tamari or GF soy sauce (many contain wheat)
   - Hoisin, oyster sauce → many contain wheat, specify GF brands
   - Tempura batter → needs specific GF technique for crispiness

4. FLOUR SWAP REQUIREMENTS:
   - Provide 2-3 realistic options that create SIMILAR textures to the original
   - Each option must specify: exact substitution, expected texture, best use case, brand recommendations
   - Don't suggest shortcuts that fundamentally alter the dish type
   - For baked goods: always include xanthan gum or similar binder unless recipe already has eggs/other binders
   - For steamed buns: need tapioca starch + xanthan gum for structure

5. ONLY SHOW SWAPS WHEN NEEDED:
   - Ingredients that don't change: use "hasSwap": false and substitution: null
   - Don't restate ingredients in bold just to restate them
   - Focus on what actually changes

6. USE FOOTNOTE MARKERS STRATEGICALLY:
   - Mark ingredients/steps where GF technique differs from original
   - Explain in notes section WHY the change matters
   - Keep notes concise but informative

7. BRAND RECOMMENDATIONS:
   - Only include brands relevant to THIS specific recipe's swaps
   - Group by category (GF flour, soy sauce, xanthan gum, etc.)
   - Prioritize widely available brands (Bob's Red Mill, King Arthur, etc.)

8. HASHIMOTO'S CONSIDERATIONS:
   - Flag soy products (some people avoid due to inflammation)
   - Suggest coconut aminos as soy-free alternative when relevant
   - Avoid suggesting inflammatory ingredients when possible

Return ONLY this exact JSON structure with NO markdown formatting:
{
  "recipeTitle": "Recipe name",
  "recipeType": "Type of dish (be specific: bao buns, dumplings, cookies, bread, etc.)",
  "feasibility": "easy|moderate|difficult|not-recommended",
  "feasibilityNote": "Brief honest explanation of GF conversion difficulty",
  "ingredients": [
    {
      "original": "2 cups flour",
      "substitution": "1½ cups GF blend + ½ cup almond flour + 1 tsp xanthan gum",
      "hasSwap": true,
      "footnote": "*"
    },
    {
      "original": "2 tsp salt",
      "substitution": null,
      "hasSwap": false,
      "footnote": null
    }
  ],
  "swapOptions": [
    {
      "ingredient": "Flour",
      "options": [
        {
          "name": "GF All-Purpose Blend + Tapioca",
          "substitution": "1½ cups GF blend + ½ cup tapioca starch + 1 tsp xanthan gum",
          "texture": "Soft and pliable, closest to traditional texture",
          "bestFor": "Best results, most authentic texture",
          "notes": "Use Bob's Red Mill 1-to-1 or King Arthur Measure for Measure"
        }
      ]
    }
  ],
  "instructions": [
    "Mix GF flour blend*, tapioca starch, and xanthan gum with other dry ingredients",
    "Add wet ingredients and knead gently until smooth**"
  ],
  "notes": {
    "*": "GF flour needs xanthan gum for binding and tapioca for elasticity since there's no gluten",
    "**": "GF dough is more delicate than wheat dough, knead gently for 3-4 minutes only"
  },
  "brandRecommendations": [
    {
      "category": "GF All-Purpose Flour Blends",
      "brands": ["Bob's Red Mill 1-to-1 Baking Flour", "King Arthur Measure for Measure Flour", "Cup4Cup Multipurpose Flour"]
    },
    {
      "category": "Tapioca Starch",
      "brands": ["Bob's Red Mill Tapioca Flour", "Anthony's Tapioca Starch"]
    },
    {
      "category": "Xanthan Gum",
      "brands": ["Bob's Red Mill Xanthan Gum", "Anthony's Xanthan Gum"]
    }
  ],
  "additionalTips": "Important GF cooking tips specific to this recipe type"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: conversionPrompt }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const resultText = data.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');

    // Clean up any markdown formatting
    const cleanText = resultText.replace(/```json\n?|\n?```/g, '').trim();
    const convertedRecipe = JSON.parse(cleanText);

    res.status(200).json(convertedRecipe);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to convert recipe' 
    });
  }
}
