// إعدادات PM2 على الـ VPS (CloudPanel). الملف ده بيتحط مرة واحدة في فولدر كل موقع، جنب فولدر docs:
//   ~/htdocs/www.madain.sa/ecosystem.config.cjs   (PORT 4001)
//   ~/htdocs/new.madain.sa/ecosystem.config.cjs   (PORT 4000)
// الـ pipeline (deploy.yml) مش بيرفعه ولا بيغيّره — بيرفع docs بس ويعمل pm2 reload.
module.exports = {
  apps: [
    {
      name: 'madain',
      cwd: __dirname,
      script: 'docs/server/server.mjs',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      time: true,
      env: {
        NODE_ENV: 'production',
        // لازم يطابق App Port في CloudPanel
        PORT: 4000,
      },
    },
  ],
};
