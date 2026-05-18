const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

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
    
    User Text:
    ${userInputText}
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            response_format: { type: 'json_object' }
        });

        let jsonString = chatCompletion.choices[0]?.message?.content;
        
        // Safety parsing in case the LLM returned markdown wrapped JSON
        if (jsonString.startsWith('\`\`\`json')) {
            jsonString = jsonString.replace(/\`\`\`json\n?/, '').replace(/\`\`\`$/, '');
        }

        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : (parsed.components || Object.values(parsed)[0] || []);

    } catch (error) {
        console.error("LLM Extraction Error:", error);
        throw new Error("Failed to parse component text using LLM.");
    }
};

module.exports = { extractComponentsFromText };
