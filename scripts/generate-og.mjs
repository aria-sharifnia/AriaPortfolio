import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const TARGET_URL = process.env.OG_URL || 'https://aria.binarybridges.ca/?og=1'

const api = `https://api.microlink.io/?url=${encodeURIComponent(
  TARGET_URL
)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1200&viewport.height=630&screenshot.type=jpeg&waitUntil=networkidle`

const OUT_DIR = existsSync('dist') ? 'dist' : 'public'
const OUT_PATH = `${OUT_DIR}/og.jpg`

async function run() {
  console.log('➡️  Requesting screenshot for', TARGET_URL)
  const res = await fetch(api)
  if (!res.ok) throw new Error(`Microlink API error: ${res.status}`)
  const json = await res.json()
  const shotUrl = json?.data?.screenshot?.url
  if (!shotUrl) throw new Error('No screenshot URL in response')

  const img = await fetch(shotUrl)
  if (!img.ok) throw new Error(`Image fetch failed: ${img.status}`)
  const buf = Buffer.from(await img.arrayBuffer())

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(OUT_PATH, buf)
  console.log('✅ Saved social image →', OUT_PATH)
}

run().catch((e) => {
  console.error('❌ OG generation failed:', e)
  process.exit(1)
})
