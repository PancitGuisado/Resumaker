const https = require('https');

async function checkModels() {
    const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) : [];
    if (!keys.length) return console.log('No keys');
    const key = keys[0];
    
    https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                console.log(parsed.models.map(m => m.name).join('\n'));
            } else {
                console.log(parsed);
            }
        });
    });
}

checkModels();
