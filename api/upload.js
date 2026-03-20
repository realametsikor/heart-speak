// api/upload.js — Vercel serverless function
// Proxies image upload to file.io and returns a public URL for Shotstack

module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

try {
// Collect raw binary body
const chunks = [];
for await (const chunk of req) chunks.push(chunk);
const buffer = Buffer.concat(chunks);
const contentType = req.headers[‘content-type’] || ‘image/jpeg’;

```
// Build multipart form using native Node 18 globals
const form = new FormData();
form.append('file', new Blob([buffer], { type: contentType }), 'photo.jpg');

// POST to file.io — zero config, no account, public URL valid 1 day
const r = await fetch('https://file.io/?expires=1d', {
  method: 'POST',
  body: form,
});

const text = await r.text();
let json;
try { json = JSON.parse(text); } 
catch(e) { throw new Error('Unexpected response: ' + text.slice(0, 100)); }

if (!json.success) throw new Error(json.message || 'file.io error');

return res.status(200).json({ url: json.link });
```

} catch (err) {
console.error(’[upload]’, err.message);
return res.status(500).json({ error: err.message });
}
};

module.exports.config = {
api: {
bodyParser: false,
sizeLimit: ‘20mb’,
},
};