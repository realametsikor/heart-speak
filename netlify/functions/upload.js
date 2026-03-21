const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*' }, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const imageBuffer = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body);

    const mimeType = event.headers['content-type'] || 'image/jpeg';
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const key = crypto.randomUUID() + '.' + ext;

    const store = getStore('uploads');
    await store.set(key, imageBuffer, {
      metadata: { contentType: mimeType },
    });

    // Build a public URL to the image-serving function
    const siteUrl = process.env.URL || `https://${event.headers.host}`;
    const imageUrl = `${siteUrl}/.netlify/functions/image?id=${key}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: imageUrl }),
    };
  } catch (err) {
    console.error('[upload]', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
