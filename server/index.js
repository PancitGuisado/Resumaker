require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Set up rate limiter: maximum of 3 requests per day per IP
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // Limit each IP to 3 requests per `window` (here, per day)
    message: { error: 'You have exceeded the 3 resumes per day limit. Please try again tomorrow.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors({
    exposedHeaders: ['RateLimit-Remaining']
}));
app.use(express.json());
// TEMPORARILY DISABLED FOR DEVELOPMENT
// app.use('/api/generate', limiter); // Apply to the generate endpoint


const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) : [];
let currentKeyIndex = 0;

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (keys.length === 0) {
        return res.status(500).json({ error: 'No API keys configured on server.' });
    }

    const systemInstruction = `You are a professional resume writer. The user will provide their background information. Extract and format the information into a JSON object with the following structure:
{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "" },
  "summary": "",
  "experience": [ { "company": "", "role": "", "startDate": "", "endDate": "", "description": [""] } ],
  "education": [ { "institution": "", "degree": "", "year": "" } ],
  "skills": [""]
}
If any information is missing, leave the field empty or omit it. Try to infer the job title if not explicitly provided but the experience suggests one.
Only output the raw JSON object. Do not include markdown formatting like \`\`\`json.`;

    let attempts = 0;
    const maxAttempts = keys.length;

    while (attempts < maxAttempts) {
        const key = keys[currentKeyIndex];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            if (response.status === 429) {
                console.log(`Key ${currentKeyIndex} hit rate limit. Rotating...`);
                currentKeyIndex = (currentKeyIndex + 1) % keys.length;
                attempts++;
                continue; 
            }

            if (!response.ok) {
                const errorData = await response.text();
                console.error(`API Error with key ${currentKeyIndex}:`, response.status, errorData);
                // Rotate on 500s or 403s just in case it's a key issue
                if (response.status >= 500 || response.status === 403) {
                     currentKeyIndex = (currentKeyIndex + 1) % keys.length;
                     attempts++;
                     continue;
                }
                return res.status(response.status).json({ error: 'API Error', details: errorData });
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;
            
            let parsedData;
            try {
                parsedData = JSON.parse(textResponse);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse JSON from AI', raw: textResponse });
            }

            return res.json(parsedData);

        } catch (error) {
            console.error(`Network or fetch error with key ${currentKeyIndex}:`, error);
            currentKeyIndex = (currentKeyIndex + 1) % keys.length;
            attempts++;
        }
    }

    res.status(503).json({ error: 'All API keys exhausted or failed.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
