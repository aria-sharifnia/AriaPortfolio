import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const vercelUrl =
  process.env.VERCEL_URL && process.env.VERCEL_URL.startsWith('http')
    ? process.env.VERCEL_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null

const TARGET_URL = process.env.OG_URL || vercelUrl || 'https://aria.binarybridges.ca/?og=1'

const OUT_DIR = existsSync('dist') ? 'dist' : 'public'

async function run() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' })

  await page.addStyleTag({
    content: `
      * { animation: none !important; transition: none !important; }
      video, canvas, .noise, .cursor { display: none !important; }
      html, body { background: #0b2945 !important; }
    `,
  })

  await page.waitForSelector('#home', { timeout: 3000 }).catch(() => {})

  await page.screenshot({
    path: `${OUT_DIR}/og.jpg`,
    type: 'jpeg',
    quality: 90,
  })

  await browser.close()
  console.log('✅ Saved social image →', `${OUT_DIR}/og.jpg`)
}

run().catch((e) => {
  console.error('❌ OG generation failed:', e)
  process.exit(1)
})
