// يجيب المشاريع الحية من الـ API ويولّد:
//  1) prerender-routes.txt  → قائمة روابط صفحات المشاريع عشان Angular يعمل لها prerender وقت الـ build
//  2) public/sitemap.xml    → sitemap محدّث بروابط حقيقية تطابق شكل الراوت الفعلي /:slug/:id
// يشتغل تلقائيًا قبل كل build عن طريق سكربت "prebuild" في package.json.

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SITE = 'https://madain.sa';

const envSrc = readFileSync(join(root, 'src/environments/environment.ts'), 'utf8');
const apiUrlMatch = envSrc.match(/apiUrl:\s*'([^']+)'/);
const apiUrl = apiUrlMatch ? apiUrlMatch[1] : 'https://madain.runasp.net/api/';

function toSlug(name) {
  if (!name) return '';
  return name.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

// ملاحظة: /home مش موجود في الـ sitemap عمدًا — هو نفس محتوى / (redirect)،
// وإدراجه بيسبب "Duplicate" في Google Search Console.
const STATIC_ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/about', priority: '0.8' },
  { path: '/services', priority: '0.8' },
  { path: '/projects', priority: '0.9' },
  { path: '/projects/jeddah', priority: '0.8' },
  { path: '/projects/makkah', priority: '0.8' },
  { path: '/projects/madena', priority: '0.8' },
  { path: '/projects-map', priority: '0.6' },
  { path: '/contact', priority: '0.6' },
];

// روابط بارامترات (city/slug) ما بيكتشفهاش الـ Angular builder تلقائيًا، فلازم تتضاف صراحة لملف الـ prerender
const STATIC_PARAM_ROUTES = ['/projects/jeddah', '/projects/makkah', '/projects/madena'];

async function main() {
  let projects = [];
  try {
    const res = await fetch(`${apiUrl}Project`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    projects = await res.json();
  } catch (err) {
    console.warn('[seo] تعذّر الوصول لـ API المشاريع، هيتم الإبقاء على sitemap.xml / prerender-routes.txt القديمين:', err.message);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const dynamicRoutes = projects
    .filter(p => p && p.id != null)
    .map(p => `/${toSlug(p.enTitle) || 'project'}/${p.id}`);

  const prerenderRoutes = [...STATIC_PARAM_ROUTES, ...dynamicRoutes];
  writeFileSync(join(root, 'prerender-routes.txt'), prerenderRoutes.join('\n') + '\n', 'utf8');

  const urlEntries = [
    ...STATIC_ROUTES.map(r =>
      `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <priority>${r.priority}</priority>\n    <lastmod>${today}</lastmod>\n  </url>`
    ),
    ...dynamicRoutes.map(p =>
      `  <url>\n    <loc>${SITE}${p}</loc>\n    <priority>0.7</priority>\n    <lastmod>${today}</lastmod>\n  </url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>\n`;
  writeFileSync(join(root, 'public/sitemap.xml'), xml, 'utf8');

  console.log(`[seo] تم توليد sitemap.xml و prerender-routes.txt — عدد صفحات المشاريع: ${dynamicRoutes.length}`);
}

main();
