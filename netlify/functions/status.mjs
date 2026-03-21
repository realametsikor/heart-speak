export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = Netlify.env.get('SHOTSTACK_API_KEY');
  if (!apiKey) {
    return Response.json({ error: 'SHOTSTACK_API_KEY is not configured' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  const url = new URL(req.url);
  const renderId = url.searchParams.get('id');
  if (!renderId) {
    return Response.json({ error: 'Missing render id' }, {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const res = await fetch(`https://api.shotstack.io/edit/stage/render/${encodeURIComponent(renderId)}`, {
      headers: { 'x-api-key': apiKey },
    });

    const json = await res.json();

    return Response.json(json, {
      status: res.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('[status]', err.message);
    return Response.json({ error: err.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
};
