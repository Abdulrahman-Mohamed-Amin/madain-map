import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, sep } from 'node:path';
import bootstrap from './src/main.server';
import { SERVER_RESPONSE } from './src/app/core/server-response.token';
import { environment } from './src/environments/environment';
import { toSlug } from './src/app/core/utils/slug.util';

// File names that carry a build hash, e.g. main-PI2JRRMB.js, chunk-564FRZB7.js, media/hero-N57DTJIK.jpg.
// Their content never changes under the same name, so browsers and Cloudflare may keep them for a year.
const HASHED_FILE = /-[A-Z0-9]{8}\.[a-z0-9]+$/i;

const SITE = 'https://madain.sa';

// Pages listed in sitemap.xml besides the project pages
const STATIC_ROUTES: { path: string; priority: string }[] = [
  { path: '/', priority: '1.0' },
  { path: '/about', priority: '0.8' },
  { path: '/services', priority: '0.8' },
  { path: '/projects', priority: '0.9' },
  { path: '/projects/jeddah', priority: '0.8' },
  { path: '/projects/makkah', priority: '0.8' },
  { path: '/projects/madena', priority: '0.8' },
  { path: '/projects-map', priority: '0.6' },
  { path: '/news', priority: '0.7' },
  { path: '/contact', priority: '0.6' },
];

const SITEMAP_TTL_MS = 60 * 60 * 1000; // rebuild the sitemap from the API at most once an hour
let sitemapCache: { xml: string; at: number } | null = null;

async function buildSitemap(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const entry = (path: string, priority: string) =>
    `  <url>\n    <loc>${SITE}${path}</loc>\n    <priority>${priority}</priority>\n    <lastmod>${today}</lastmod>\n  </url>`;

  const entries = STATIC_ROUTES.map(r => entry(r.path, r.priority));

  const res = await fetch(`${environment.apiUrl}Project`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Project API responded ${res.status}`);
  const projects: { id?: number; enTitle?: string }[] = await res.json();
  for (const p of projects) {
    if (p?.id == null) continue;
    entries.push(entry(`/${toSlug(p.enTitle) || 'project'}/${p.id}`, '0.7'));
  }

  // News are optional: if that API fails, the sitemap still has the projects
  try {
    const newsRes = await fetch(`${environment.apiUrl}News`, { signal: AbortSignal.timeout(10_000) });
    if (!newsRes.ok) throw new Error(`News API responded ${newsRes.status}`);
    const news: { id?: number }[] = await newsRes.json();
    for (const n of news) {
      if (n?.id != null) entries.push(entry(`/news/${n.id}`, '0.6'));
    }
  } catch (err) {
    console.warn('[sitemap] news skipped:', err);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  // ورا Nginx (CloudPanel) على نفس السيرفر: خد البروتوكول الحقيقي (https) من X-Forwarded-*
  server.set('trust proxy', 'loopback');
  server.disable('x-powered-by');

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // sitemap.xml is generated live from the API (cached for an hour)
  server.get('/sitemap.xml', async (_req, res) => {
    try {
      if (!sitemapCache || Date.now() - sitemapCache.at > SITEMAP_TTL_MS) {
        sitemapCache = { xml: await buildSitemap(), at: Date.now() };
      }
    } catch (err) {
      console.error('[sitemap] could not refresh from API:', err);
      if (!sitemapCache) {
        res.status(503).set('Retry-After', '300').send('Sitemap temporarily unavailable');
        return;
      }
    }
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(sitemapCache!.xml);
  });

  // Static files from /browser.
  // - Hashed JS/CSS/media: cached for a year.
  // - Other files (images in assets/, translations, robots.txt...): short cache, since their names
  //   stay the same when their content changes.
  // - HTML is never served from here: every page goes through SSR below.
  server.get('**', express.static(browserDistFolder, {
    index: false,
    redirect: false,
    cacheControl: false,
    setHeaders: (res, filePath) => {
      const name = filePath.split(sep).pop() ?? '';
      if (HASHED_FILE.test(name)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (name.endsWith('.html') || name.endsWith('.json')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  }));

  // All regular routes use the Angular engine: live data on every request
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: SERVER_RESPONSE, useValue: res },
        ],
      })
      .then((html) => {
        // Pages are rendered fresh each time: browsers and Cloudflare must not keep an old copy
        res.setHeader('Cache-Control', 'no-cache');
        res.send(html);
      })
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
