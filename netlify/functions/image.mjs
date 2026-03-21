import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response('Missing id parameter', { status: 400 });
  }

  try {
    const store = getStore('uploads');
    const result = await store.getWithMetadata(id, { type: 'arrayBuffer' });

    if (!result) {
      return new Response('Image not found', { status: 404 });
    }

    const contentType = result.metadata?.contentType || 'image/jpeg';

    return new Response(result.data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[image]', err.message);
    return new Response('Failed to retrieve image', { status: 500 });
  }
};
