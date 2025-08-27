const STRAPI_URL = (process.env.VITE_STRAPI_URL || '').replace(/\/$/, '')
const TOKEN = process.env.STRAPI_MANIFEST_TOKEN

export default async function handler(req, res) {
  try {
    const r = await fetch(`${STRAPI_URL}/api/manifest`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    const text = await r.text()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(r.status).send(text)
  } catch (e) {
    console.error('[manifest-proxy] error:', e?.message || e)
    return res.status(500).json({ ok: false, error: 'proxy failed' })
  }
}
