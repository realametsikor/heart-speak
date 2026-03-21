import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const imageBuffer = await req.arrayBuffer();
    const mimeType = req.headers.get('content-type') || 'image/jpeg';
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const key = crypto.randomUUID() + '.' + ext;

    const store = getStore('uploads');
    await store.set(key, imageBuffer, {
      metadata: { contentType: mimeType },
    });

    const siteUrl = Netlify.env.get('URL') || `https://${req.headers.get('host')}`;
    const imageUrl = `${siteUrl}/.netlify/functions/image?id=${key}`;

    return Response.json({ url: imageUrl }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('[upload]', err.message);
    return Response.json({ error: err.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
};
