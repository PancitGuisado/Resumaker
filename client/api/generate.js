// In-memory rate limit store (resets on cold starts, but provides server-side protection)
const rateLimitMap = new Map();
const DAILY_LIMIT = 2;

function getRateLimitKey(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  return `${ip}_${today}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Server-side rate limiting
  const rateLimitKey = getRateLimitKey(req);
  const currentCount = rateLimitMap.get(rateLimitKey) || 0;
  if (currentCount >= DAILY_LIMIT) {
    return res.status(429).json({ error: `Daily limit reached (${DAILY_LIMIT} resumes/day). Please try again tomorrow!` });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) : [];
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

  // Start with a random key to distribute load across edge invocations
  let currentKeyIndex = Math.floor(Math.random() * keys.length);
  let attempts = 0;
  const maxAttempts = keys.length;

  while (attempts < maxAttempts) {
    const key = keys[currentKeyIndex];
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.status === 429 || response.status >= 500 || response.status === 403) {
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        attempts++;
        continue;
      }

      if (!response.ok) {
        const errorData = await response.text();
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

      // Increment rate limit on success
      rateLimitMap.set(rateLimitKey, currentCount + 1);

      return res.status(200).json(parsedData);

    } catch (error) {
      currentKeyIndex = (currentKeyIndex + 1) % keys.length;
      attempts++;
    }
  }

  return res.status(503).json({ error: 'All API keys exhausted or failed.' });
}
