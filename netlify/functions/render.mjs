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

  const apiKey = Netlify.env.get('SHOTSTACK_API_KEY');
  if (!apiKey) {
    return Response.json({ error: 'SHOTSTACK_API_KEY is not configured' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const res = await fetch('https://api.shotstack.io/edit/stage/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: await req.text(),
    });

    const json = await res.json();

    return Response.json(json, {
      status: res.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('[render]', err.message);
    return Response.json({ error: err.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
};
