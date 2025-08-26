import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'https://aria.binarybridges.ca').replace(/\/+$/, '');

const routes = [
  '/',
];

(async () => {
  const outPath = resolve('public', 'sitemap.xml');
  const stream = new SitemapStream({ hostname: SITE_URL });
  stream.pipe(createWriteStream(outPath));

  routes.forEach((url) => {
    stream.write({
      url,
      changefreq: 'monthly',
      priority: url === '/' ? 1.0 : 0.7,
      lastmodISO: new Date().toISOString(),
    });
  });

  stream.end();
  await streamToPromise(stream);
  console.log('✅ sitemap.xml written to', outPath, 'with base', SITE_URL);
})();