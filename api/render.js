const SHOTSTACK_KEY = 'i8FplAvNvxVHWZsBXv8QarvMnvg1pRRGUrUfEtw8';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const r = await fetch('https://api.shotstack.io/edit/stage/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_KEY,
      },
      body: JSON.stringify(req.body),
    });
    const json = await r.json();
    console.log('[render] Shotstack response:', JSON.stringify(json).slice(0, 300));
    return res.status(r.status).json(json);
  } catch (err) {
    console.error('[render]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
