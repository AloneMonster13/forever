// Local runner: `npm start` → http://localhost:3000 (Vercel ignores this file)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local / .env (no extra packages needed)
for (const f of ['.env.local', '.env']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (!process.env.MONGODB_URI) console.warn('⚠️  MONGODB_URI missing — add it to .env.local');

const { default: booking } = await import('./api/booking.js');
const { default: comments } = await import('./api/comments.js');
const routes = { '/api/booking': booking, '/api/comments': comments };

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const handler = routes[url.pathname];

  if (handler) {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    // Vercel-style helpers
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    return handler(req, res);
  }

  const pub = path.join(root, 'public');
  let file = path.normalize(path.join(pub, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(pub) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(pub, 'index.html');
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

// Uses 3000, or the next free port if it's busy
let port = Number(process.env.PORT) || 3000;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && port < 3020) {
    console.log(`Port ${port} is busy, trying ${port + 1}…`);
    server.listen(++port);
  } else {
    throw err;
  }
});
server.on('listening', () => console.log(`\n💖 Forever Us running → http://localhost:${port}\n`));
server.listen(port);