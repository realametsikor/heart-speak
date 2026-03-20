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

    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const filename = 'photo.jpg';

    const preamble = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="source"; filename="${filename}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    );
    const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([preamble, imageBuffer, epilogue]);

    const freeimageKey = process.env.FREEIMAGE_API_KEY;
    if (!freeimageKey) {
      throw new Error('FREEIMAGE_API_KEY is not configured');
    }
    const url = `https://freeimage.host/api/1/upload?key=${freeimageKey}&format=json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: json.image.url }),
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
