# موقع مدائن العقارية (madain.sa)

Angular 18 مع SSR حقيقي: كل صفحة بتتعمل على السيرفر ببيانات حيّة من الـ API مع كل طلب.

## التشغيل محلياً

```bash
npm ci
npm start                          # وضع التطوير على http://localhost:4200
npm run build                      # build للإنتاج في فولدر docs/
PORT=4000 node docs/server/server.mjs   # تشغيل نسخة الإنتاج محلياً
```

## النشر (أوتوماتيك)

| الـ branch | بيتنشر على | يوزر السيرفر | البورت |
|---|---|---|---|
| `staging` | https://new.madain.sa (للتجربة) | `madain-new` | 4000 |
| `main` | https://www.madain.sa (الأساسي) | `madain` | 4001 |

أي push على الـ branch بيشغّل `.github/workflows/deploy.yml`، ودي الخطوات اللي بيعملها:
build، ورفع `docs` على السيرفر، و`pm2 reload`. ولو الموقع ما ردّش بعد التحديث، بيرجع للنسخة اللي قبلها لوحده.

طريقة الشغل:
1. اشتغل على `staging` واعمل push، وجرّب على `new.madain.sa`.
2. لو تمام، اعمل Pull Request من `staging` لـ `main` واعمل Merge.

الـ Secrets المطلوبة في GitHub (Settings ← Secrets and variables ← Actions):
- `SSH_HOST`: الـ IP بتاع الـ VPS
- `SSH_PRIVATE_KEY`: المفتاح الخاص بتاع النشر

ملف `ecosystem.config.cjs` موجود على السيرفر في فولدر كل موقع، وهو اللي بيحدد البورت. الـ pipeline مش بيلمسه.

## ملاحظات
- فولدر `docs/` ناتج build، ومش بيترفع على Git.
- `sitemap.xml` بيتعمل لايف من الـ API في `server.ts`، ومتكاش ساعة.
- صفحة 404 بترجع HTTP status 404 حقيقي، وكمان أي مشروع مش موجود.
