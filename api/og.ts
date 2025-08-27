import type { VercelRequest, VercelResponse } from '@vercel/node'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import type { Browser } from 'puppeteer-core'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let browser: Browser | null = null

  try {
    const path = typeof req.query.path === 'string' ? req.query.path : '/'
    const hostHeader = (req.headers['x-forwarded-host'] || req.headers.host) as string
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
    const targetUrl = `${proto}://${hostHeader}${path}`

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
      executablePath: (await chromium.executablePath()) ?? undefined,
      headless: true,
    })

    const page = await browser.newPage()

    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30_000 })

    try {
      await page.evaluate(() => {
        const d = document as Document & { fonts?: { ready?: Promise<void> } }
        return d.fonts?.ready ?? null
      })
    } catch (err: unknown) {
      console.warn('fonts.ready not available or failed:', err)
    }

    const png = await page.screenshot({ type: 'png' })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(png)
  } catch (e: unknown) {
    console.error('OG error', e)
    res.status(500).json({ error: 'OG generation failed' })
  } finally {
    try {
      await browser?.close()
    } catch (err: unknown) {
      console.warn('Failed to close browser:', err)
    }
  }
}
