export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const cache = global._imgCache;
  if (!cache || !cache.has(id)) return res.status(404).json({ error: 'Image not found' });

  const { buffer, mimeType } = cache.get(id);
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(buffer);
}
