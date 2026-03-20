// api/upload.js
const https = require(‘https’);
const http = require(‘http’);

module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ’*’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

try {
// Collect raw image bytes from request body
const chunks = [];
for await (const chunk of req) chunks.push(chunk);
const imageBuffer = Buffer.concat(chunks);
const mimeType = req.headers[‘content-type’] || ‘image/jpeg’;

```
// Build multipart/form-data body manually
const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
const filename = 'photo.jpg';

const preamble = Buffer.from(
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="source"; filename="${filename}"\r\n` +
  `Content-Type: ${mimeType}\r\n\r\n`
);
const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
const body = Buffer.concat([preamble, imageBuffer, epilogue]);

// Upload to freeimage.host with API key
const url = 'https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5&format=json';

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': body.length,
  },
  body,
});

const text = await response.text();

let json;
try { json = JSON.parse(text); }
catch (e) { throw new Error('Bad JSON: ' + text.slice(0, 120)); }

if (json.status_code !== 200) {
  throw new Error(json.error?.message || 'Upload failed: ' + text.slice(0, 120));
}

return res.status(200).json({ url: json.image.url });
```

} catch (err) {
console.error(’[upload]’, err.message);
return res.status(500).json({ error: err.message });
}
};

module.exports.config = {
api: { bodyParser: false, sizeLimit: ‘20mb’ },
};