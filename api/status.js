const SHOTSTACK_KEY = 'i8FplAvNvxVHWZsBXv8QarvMnvg1pRRGUrUfEtw8';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const r = await fetch(`https://api.shotstack.io/edit/sandbox/render/${encodeURIComponent(id)}`, {
      headers: { 'x-api-key': SHOTSTACK_KEY },
    });
    const json = await r.json();
    return res.status(r.status).json(json);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
