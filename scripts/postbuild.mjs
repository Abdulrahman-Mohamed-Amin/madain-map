// بعد الـ build: يحوّل صفحة 404 المُولّدة (docs/browser/404/index.html) لملف docs/browser/404.html
// عشان الاستضافة (Apache على هوستنجر) تقدر تستخدمه كـ ErrorDocument للروابط غير الموجودة،
// مع إبقاء الاستجابة HTTP status حقيقي 404 (مش صفحة الهوم بـ 200 زي قبل كده).

import { existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'docs/browser/404/index.html');
const dest = join(root, 'docs/browser/404.html');

if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log('[seo] تم إنشاء docs/browser/404.html.');
} else {
  console.warn('[seo] لم يتم العثور على docs/browser/404/index.html — تأكد إن الـ build خلص بنجاح.');
}
