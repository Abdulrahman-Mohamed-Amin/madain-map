// بعد الـ build: يحوّل صفحة 404 المُولّدة (docs/browser/404/index.html) لملف docs/browser/404.html
// عشان الاستضافة (Apache على هوستنجر) تقدر تستخدمه كـ ErrorDocument للروابط غير الموجودة،
// مع إبقاء الاستجابة HTTP status حقيقي 404 (مش صفحة الهوم بـ 200 زي قبل كده).
//
// وبعدين ينسخ محتوى docs/browser لـ docs نفسه عشان GitHub Pages بيعرض الموقع من فولدر docs مباشرة.
// (Angular مش بيسمح إن outputPath.browser يبقى فاضي مع الـ SSR، فبننسخ بعد الـ build.)
// النشر على هوستنجر لسه بيرفع من docs/browser زي ما هو.

import { existsSync, copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const browserDir = join(root, 'docs/browser');
const src = join(browserDir, '404/index.html');
const dest = join(browserDir, '404.html');

if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log('[seo] تم إنشاء docs/browser/404.html.');
} else {
  console.warn('[seo] لم يتم العثور على docs/browser/404/index.html — تأكد إن الـ build خلص بنجاح.');
}

// نسخ يدوي بدل cpSync لأنه بيكراش على ويندوز مع المسارات العربي
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const s = join(from, entry.name);
    const d = join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

if (existsSync(browserDir)) {
  copyDir(browserDir, join(root, 'docs'));
  // يمنع Jekyll في GitHub Pages من تجاهل أي ملفات
  writeFileSync(join(root, 'docs/.nojekyll'), '');
  console.log('[pages] تم نسخ docs/browser إلى docs.');
}
