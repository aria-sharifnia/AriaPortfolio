const STRAPI_URL = (process.env.VITE_STRAPI_URL || '').replace(/\/$/, '')
const TOKEN = process.env.STRAPI_MANIFEST_TOKEN

export default async function handler(req, res) {
  try {
    if (!STRAPI_URL || !TOKEN) {
      return res.status(500).json({ ok: false, error: 'Missing STRAPI env vars' })
    }

    const upstream = await fetch(`${STRAPI_URL}/api/manifest`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    const body = await upstream.text()

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('x-manifest-proxy', '1')
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    res.setHeader('CDN-Cache-Control', 's-maxage=600, stale-while-revalidate=300')
    res.setHeader('Surrogate-Control', 's-maxage=600, stale-while-revalidate=300')

    return res.status(upstream.status).send(body)
  } catch (e) {
    console.error('[manifest-proxy] error:', e?.message || e)
    return res.status(500).json({ ok: false, error: 'proxy failed' })
  }
}
