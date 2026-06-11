// Serverless proxy to the shared trip document. The web app can't call
// jsonblob.com directly (no CORS), so it talks to this same-origin
// endpoint instead and Vercel forwards the request.
const BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019eb6f0-7b35-7030-a7d2-121c8a972694';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const r = await fetch(BLOB_URL);
      if (!r.ok) return res.status(502).json({ error: 'store unavailable' });
      return res.status(200).json(await r.json());
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const r = await fetch(BLOB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
    }
    res.setHeader('Allow', 'GET, PUT, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(502).json({ error: 'store unreachable' });
  }
}
