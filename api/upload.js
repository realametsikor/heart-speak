// api/upload.js
// Vercel serverless function — proxies image upload to file.io
// Deploy this file to your Vercel project at: /api/upload.js

export default async function handler(req, res) {
// Allow CORS from your own domain
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

try {
// Read raw body (the image file sent as binary)
const chunks = [];
for await (const chunk of req) chunks.push(chunk);
const buffer = Buffer.concat(chunks);

```
// Get content type from request
const contentType = req.headers['content-type'] || 'image/jpeg';

// Upload to file.io — no account needed, returns a public URL
const { FormData, Blob, fetch } = await import('node-fetch');

const form = new FormData();
form.append('file', new Blob([buffer], { type: contentType }), 'photo.jpg');
form.append('expires', '1d');  // URL valid for 1 day — enough for Shotstack

const response = await fetch('https://file.io', {
  method: 'POST',
  body: form,
});

const json = await response.json();

if (!json.success) {
  throw new Error(json.message || 'Upload failed');
}

return res.status(200).json({ url: json.link });
```

} catch (err) {
console.error(‘Upload error:’, err);
return res.status(500).json({ error: err.message });
}
}

export const config = {
api: {
bodyParser: false,  // We read raw binary body ourselves
},
};