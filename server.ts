import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { SERVER_RESPONSE } from './src/app/core/server-response.token';

// ملفات Angular اللي في اسمها hash (main-ABCD1234.js) بتتغير مع كل build، فينفع تتكاش سنة
const HASHED_FILE = /-[A-Z0-9]{8}\.(js|mjs|css)$/;

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);
  // ورا Nginx (CloudPanel): خد البروتوكول والدومين الحقيقيين من X-Forwarded-*
  server.set('trust proxy', true);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  // الـ HTML ما يتكاشش (عشان التحديثات تبان على طول)، ملفات الـ hash سنة، والباقي (صور/ترجمة) يوم
  server.get('**', express.static(browserDistFolder, {
    index: 'index.html',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (HASHED_FILE.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  }));

  // All regular routes use the Angular engine
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
