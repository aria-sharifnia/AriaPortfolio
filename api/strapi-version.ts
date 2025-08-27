import crypto from 'node:crypto'

const STRAPI_URL = (process.env.VITE_STRAPI_URL || '').replace(/\/$/, '')
const SECRET = process.env.STRAPI_WEBHOOK_SECRET || ''
const MANIFEST_TOKEN = process.env.STRAPI_MANIFEST_TOKEN || ''

const hash = (s: string) => crypto.createHash('sha1').update(s).digest('hex')

type ManifestFields = {
  globalVersion: string
  homeVersion: string | null
  aboutVersion: string | null
  contactVersion: string | null
  skillsVersion: string | null
  experienceVersion: string | null
  testimonialsVersion: string | null
}

type StrapiWebhook = {
  model?: string
  contentType?: string
  uid?: string
  event?: string
  entry?: { updatedAt?: string }
}

type ReqLike = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

type ResLike = {
  status: (code: number) => ResLike
  send: (body: unknown) => void
  json: (body: unknown) => void
}

const MODEL_TO_FIELD: Record<string, keyof ManifestFields> = {
  'api::home.home': 'homeVersion',
  'api::about.about': 'aboutVersion',
  'api::contact.contact': 'contactVersion',
  'api::skill.skill': 'skillsVersion',
  'api::testimonial.testimonial': 'testimonialsVersion',
  'api::experience.experience': 'experienceVersion',
}

async function getManifest(): Promise<ManifestFields> {
  const res = await fetch(
    `${STRAPI_URL}/api/manifest?fields=globalVersion,homeVersion,aboutVersion,contactVersion,skillsVersion,experienceVersion,testimonialsVersion`
  )
  if (!res.ok) throw new Error(`getManifest failed ${res.status}`)
  const json = (await res.json()) as {
    data?: { attributes?: Partial<ManifestFields> }
  }
  const a = json?.data?.attributes ?? {}
  return {
    globalVersion: a.globalVersion ?? '',
    homeVersion: a.homeVersion ?? null,
    aboutVersion: a.aboutVersion ?? null,
    contactVersion: a.contactVersion ?? null,
    skillsVersion: a.skillsVersion ?? null,
    experienceVersion: a.experienceVersion ?? null,
    testimonialsVersion: a.testimonialsVersion ?? null,
  }
}

async function setManifest(fields: Partial<ManifestFields>) {
  const res = await fetch(`${STRAPI_URL}/api/manifest`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MANIFEST_TOKEN}`,
    },
    body: JSON.stringify({ data: fields }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`setManifest failed ${res.status} ${t}`)
  }
}

export default async function handler(req: ReqLike, res: ResLike) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed')
    if (!SECRET || req.headers['x-secret'] !== SECRET) return res.status(401).send('Unauthorized')

    const body: StrapiWebhook =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as StrapiWebhook) || {}

    const model = body.model || body.contentType || body.uid
    if (!model || !(model in MODEL_TO_FIELD)) {
      return res.status(200).json({ ok: true, skipped: 'model not mapped', model, body })
    }

    const manifest = await getManifest()
    const field = MODEL_TO_FIELD[model]
    const newSectionVersion = body.entry?.updatedAt || new Date().toISOString()

    if (manifest[field] === newSectionVersion) {
      return res.status(200).json({ ok: true, unchanged: field })
    }

    const next: ManifestFields = { ...manifest, [field]: newSectionVersion, globalVersion: '' }

    const concat = [
      next.homeVersion,
      next.aboutVersion,
      next.contactVersion,
      next.skillsVersion,
      next.experienceVersion,
      next.testimonialsVersion,
    ].join('|')

    next.globalVersion = hash(concat) + '-' + new Date().toISOString()

    await setManifest({ [field]: next[field], globalVersion: next.globalVersion })

    return res.status(200).json({ ok: true, updated: field, globalVersion: next.globalVersion })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    console.error(e)
    return res.status(500).json({ ok: false, error: msg })
  }
}
