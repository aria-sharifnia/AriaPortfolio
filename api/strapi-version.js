import crypto from 'node:crypto'

const STRAPI_URL = (process.env.VITE_STRAPI_URL || '').replace(/\/$/, '')
const SECRET = process.env.STRAPI_WEBHOOK_SECRET
const TOKEN = process.env.STRAPI_MANIFEST_TOKEN

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex')

// get single-type updatedAt (supports Strapi v5 + v4 shapes)
async function getUpdatedAt(type) {
  const res = await fetch(`${STRAPI_URL}/api/${type}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) {
    console.error(`[manifest] failed GET /api/${type}:`, res.status)
    return null
  }
  const json = await res.json()
  const data = json?.data
  if (!data) return null
  // v5 single types -> data.* fields directly
  if (data && typeof data === 'object' && !('attributes' in data)) {
    return data.updatedAt ?? null
  }
  // v4 single types -> data.attributes.*
  return data?.attributes?.updatedAt ?? null
}

async function getManifest() {
  const res = await fetch(`${STRAPI_URL}/api/manifest`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) {
    console.error('[manifest] failed GET /api/manifest:', res.status)
    return null
  }
  const json = await res.json()
  return json?.data ?? null // v5: data.* ; v4 would be data.attributes
}

async function setManifest(fields) {
  const res = await fetch(`${STRAPI_URL}/api/manifest`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ data: fields }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`setManifest failed ${res.status} ${t}`)
  }
}

// parse secret from header OR querystring (works for webhook & manual)
function readIncomingSecret(req) {
  const headerSecret = req.headers['x-secret']
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const qsSecret = url.searchParams.get('secret')
    return headerSecret || qsSecret
  } catch {
    return headerSecret
  }
}

export default async function handler(req, res) {
  try {
    if (!STRAPI_URL || !SECRET || !TOKEN) {
      console.error('[manifest] missing envs VITE_STRAPI_URL/STRAPI_WEBHOOK_SECRET/STRAPI_MANIFEST_TOKEN')
      return res.status(500).json({ ok: false, error: 'Missing required env vars' })
    }

    // authorize
    const incomingSecret = readIncomingSecret(req)
    if (incomingSecret !== SECRET) {
      return res.status(401).send('Unauthorized')
    }

    // recompute ALL versions directly from Strapi (robust, dashboard-only)
    const [home, about, contact, skills, experience, testimonials] = await Promise.all([
      getUpdatedAt('home'),
      getUpdatedAt('about'),
      getUpdatedAt('contact'),
      getUpdatedAt('skill'),
      getUpdatedAt('experience'),
      getUpdatedAt('testimonial'),
    ])

    // precaution: load current manifest so we never overwrite with nulls on transient errors
    const current = await getManifest()
    const currentFields =
      current && !('attributes' in current) // v5
        ? current
        : current?.attributes || {}

    const fields = {
      homeVersion: home ?? currentFields.homeVersion ?? null,
      aboutVersion: about ?? currentFields.aboutVersion ?? null,
      contactVersion: contact ?? currentFields.contactVersion ?? null,
      skillsVersion: skills ?? currentFields.skillsVersion ?? null,
      experienceVersion: experience ?? currentFields.experienceVersion ?? null,
      testimonialsVersion: testimonials ?? currentFields.testimonialsVersion ?? null,
    }

    const concat = [
      fields.homeVersion,
      fields.aboutVersion,
      fields.contactVersion,
      fields.skillsVersion,
      fields.experienceVersion,
      fields.testimonialsVersion,
    ].join('|')

    const globalVersion = `${hash(concat)}-${new Date().toISOString()}`

    await setManifest({ ...fields, globalVersion })

    return res.status(200).json({ ok: true, updated: fields, globalVersion })
  } catch (e) {
    console.error('[manifest] error:', e?.message || e)
    return res.status(500).json({ ok: false, error: e?.message || 'unknown error' })
  }
}