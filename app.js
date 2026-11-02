// cPanel/Passenger startup. Run npm run build before starting this app.
const http = require('node:http');
const next = require('next');
require('@next/env').loadEnvConfig(__dirname, false);
process.env.NODE_ENV = 'production';
for (const name of ['BACKEND_URL', 'BACKEND_PROXY_SECRET', 'SITE_URL']) {
  if (!process.env[name]) throw new Error(`Missing production setting: ${name}`);
}
if (!process.env.SITE_URL.startsWith('https://') || !process.env.BACKEND_URL.startsWith('https://')) throw new Error('Production URLs must use HTTPS');
if (process.env.BACKEND_PROXY_SECRET.length < 32) throw new Error('BACKEND_PROXY_SECRET is too short');
const app = next({ dev: false, dir: __dirname });
app.prepare().then(() => {
  const handler = app.getRequestHandler();
  http.createServer((req, res) => handler(req, res)).listen(process.env.PORT || 3000);
}).catch(error => { console.error('Application startup failed', error); process.exit(1); });
