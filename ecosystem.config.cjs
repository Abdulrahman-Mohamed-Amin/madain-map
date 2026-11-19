// إعدادات PM2 لتشغيل نسخة الـ SSR على الـ VPS (CloudPanel)
// الاستخدام على السيرفر (من الفولدر اللي فيه browser و server):
//   pm2 start ecosystem.config.cjs
//   pm2 save
module.exports = {
  apps: [
    {
      name: 'madain',
      script: './server/server.mjs',
      env: {
        NODE_ENV: 'production',
        // لازم يطابق App Port في CloudPanel
        PORT: 4000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
