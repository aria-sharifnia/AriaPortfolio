import crypto from 'node:crypto'

const STRAPI_URL = (process.env.VITE_STRAPI_URL || '').replace(/\/$/, '')
const SECRET = process.env.STRAPI_WEBHOOK_SECRET
const TOKEN = process.env.STRAPI_MANIFEST_TOKEN

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex')

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
  if (data && typeof data === 'object' && !('attributes' in data)) {
    return data.updatedAt ?? null
  }
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
  return json?.data ?? null
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

function getModelFromBody(req) {
  try {
    const b = req.body || {}
    return b.model || b.modelUid || b?.event?.model || null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  try {
    if (!STRAPI_URL || !SECRET || !TOKEN) {
      console.error(
        '[manifest] missing envs VITE_STRAPI_URL/STRAPI_WEBHOOK_SECRET/STRAPI_MANIFEST_TOKEN'
      )
      return res.status(500).json({ ok: false, error: 'Missing required env vars' })
    }

    const incomingSecret = readIncomingSecret(req)
    if (incomingSecret !== SECRET) {
      return res.status(401).send('Unauthorized')
    }

    if (req.method === 'POST') {
      const model = getModelFromBody(req)
      if (typeof model === 'string' && model.includes('api::manifest')) {
        return res.status(200).json({ ok: true, ignored: 'manifest' })
      }
    }

    const [home, about, contact, skills, experience, testimonials] = await Promise.all([
      getUpdatedAt('home'),
      getUpdatedAt('about'),
      getUpdatedAt('contact'),
      getUpdatedAt('skill'),
      getUpdatedAt('experience'),
      getUpdatedAt('testimonial'),
    ])

    const current = await getManifest()
    const currentFields =
      current && !('attributes' in current) ? current : current?.attributes || {}

    const fields = {
      homeVersion: home ?? currentFields.homeVersion ?? null,
      aboutVersion: about ?? currentFields.aboutVersion ?? null,
      contactVersion: contact ?? currentFields.contactVersion ?? null,
      skillsVersion: skills ?? currentFields.skillsVersion ?? null,
      experienceVersion: experience ?? currentFields.experienceVersion ?? null,
      testimonialsVersion: testimonials ?? currentFields.testimonialsVersion ?? null,
    }

    const unchanged =
      fields.homeVersion === currentFields.homeVersion &&
      fields.aboutVersion === currentFields.aboutVersion &&
      fields.contactVersion === currentFields.contactVersion &&
      fields.skillsVersion === currentFields.skillsVersion &&
      fields.experienceVersion === currentFields.experienceVersion &&
      fields.testimonialsVersion === currentFields.testimonialsVersion

    if (unchanged) {
      return res.status(200).json({ ok: true, unchanged: true })
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
