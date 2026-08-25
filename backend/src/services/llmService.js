const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const toPositiveIntOrDefault = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeExtractedComponents = (parsed) => {
  let rawList = [];

  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.components)) {
      rawList = parsed.components;
    } else if (Array.isArray(parsed.items)) {
      rawList = parsed.items;
    } else if (Array.isArray(parsed.data)) {
      rawList = parsed.data;
    } else if (typeof parsed.name === 'string') {
      rawList = [parsed];
    }
  }

  return rawList
    .map((item) => {
      if (typeof item === 'string') {
        const name = item.trim();
        return name ? { name, quantity: 1 } : null;
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      const rawName = item.name || item.partNumber || item.part_number || item.mpn;
      const name = typeof rawName === 'string' ? rawName.trim() : '';

      if (!name) {
        return null;
      }

      return {
        name,
        quantity: toPositiveIntOrDefault(item.quantity, 1)
      };
    })
    .filter(Boolean);
};

const extractComponentsFromText = async (userInputText) => {
    const prompt = `
    You are a data extraction assistant. The user will provide text containing a list of electronic components (often in Ukrainian or Russian).
    Your job is to extract the core 'partNumber' and the 'quantity'.
    - Remove manufacturer names (like 'TE Connectivity', 'NINIGI') from the part number.
    - If no quantity is specified, default to 1.
    - Respond ONLY with valid JSON in this exact format:
    [
      { "name": "5750913-7", "quantity": 3 },
      { "name": "TSM102A1", "quantity": 10 }
    ]
    Do not include markdown blocks, explanations, or any other text. Just the JSON array.

    Here are the examples of the input text and the expected output:
    Input Text:
    1. З ’єднувач DEUTZ 04222059 – 2 шт.
    2. З’єднувач DTM06-12S Deutsch – 4 
    3. З’єднувач SUB-D9 pin – 2
    4. Корпус 1-967325-2 TYCO – 2
    5. Контакт розетки 962981-1 TYCO – 6
    6. Ущільнювач для одинарного дроту 828920-1 TYCO – 6
    7. Кутовий кожух із змінною фіксацією 965576-1 TYCO – 2
    8. Розетка 0422-6828 – 2
    9. З’єднувач DIN 43650 – 6
    10. Резистор С2-23-0,25-120Ом +/-5% - 2
    11. Корпус р/n 282080-1 – 2
    12. Контакт p/n 282110-1 – 4
    13. Втулка p/n 828905-1 – 4
    Output JSON:
    [
      { "name": "04222059", "quantity": 2 },
      { "name": "DTM06-12S", "quantity": 4 },
      { "name": "SUB-D9", "quantity": 2 },
      { "name": "1-967325-2", "quantity": 2 },
      { "name": "962981-1", "quantity": 6 },
      { "name": "828920-1", "quantity": 6 },
      { "name": "965576-1", "quantity": 2 },
      { "name": "0422-6828", "quantity": 2 },
      { "name": "DIN 43650", "quantity": 6 },
      { "name": "С2-23-0,25-120", "quantity": 2 },
      { "name": "282080-1", "quantity": 2 },
      { "name": "282110-1", "quantity": 4 },
      { "name": "828905-1", "quantity": 4 }
    ]

    Input Text:
    14011213102000
    Output JSON:
    [
      { "name": "14011213102000", "quantity": 1 }
    ]
      
    User Text:
    ${userInputText}
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-120b',
          temperature: 0
        });

        let jsonString = chatCompletion.choices[0]?.message?.content;

        if (!jsonString || typeof jsonString !== 'string') {
          throw new Error('LLM returned an empty response.');
        }
        
        // Safety parsing in case the LLM returned markdown wrapped JSON
        jsonString = jsonString.trim();
        if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonString);
        const normalized = normalizeExtractedComponents(parsed);
        console.log('Parsed Components:', normalized);
        return normalized;

    } catch (error) {
        console.error("LLM Extraction Error:", error);
        throw new Error("Failed to parse component text using LLM.");
    }
};

module.exports = { extractComponentsFromText };
