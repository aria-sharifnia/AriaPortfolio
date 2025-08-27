const STRAPI_URL = (process.env.VITE_STRAPI_URL || '').replace(/\/$/, '')
const TOKEN = process.env.STRAPI_MANIFEST_TOKEN

export default async function handler(req, res) {
  try {
    if (!STRAPI_URL || !TOKEN) {
      return res.status(500).json({ ok: false, error: 'Missing STRAPI env vars' })
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const bypass = url.searchParams.get('bypass') === '1'

    const upstream = await fetch(`${STRAPI_URL}/api/manifest`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    const text = await upstream.text()

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('x-manifest-proxy', '1')

    if (bypass) {
      res.setHeader('Cache-Control', 'no-store')
    } else {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    }

    return res.status(upstream.status).send(text)
  } catch (e) {
    console.error('[manifest-proxy] error:', e?.message || e)
    return res.status(500).json({ ok: false, error: 'proxy failed' })
  }
}
