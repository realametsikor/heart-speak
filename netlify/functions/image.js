const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return { statusCode: 400, body: 'Missing id parameter' };
  }

  try {
    const store = getStore('uploads');
    const result = await store.getWithMetadata(id, { type: 'arrayBuffer' });

    if (!result) {
      return { statusCode: 404, body: 'Image not found' };
    }

    const contentType = result.metadata?.contentType || 'image/jpeg';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
      body: Buffer.from(result.data).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('[image]', err.message);
    return { statusCode: 500, body: 'Failed to retrieve image' };
  }
};
