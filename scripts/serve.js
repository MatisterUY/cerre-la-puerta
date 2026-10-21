import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT ?? 8080);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json', '.json':'application/json' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
    const full = resolve(root, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
    if (full !== root && !full.startsWith(root + sep)) { response.writeHead(403).end('Forbidden'); return; }
    if (!(await stat(full)).isFile()) { response.writeHead(404).end('Not found'); return; }
    const data = await readFile(full);
    response.writeHead(200, { 'Content-Type':mime[extname(full)] ?? 'application/octet-stream', 'Cache-Control':'no-cache' }); response.end(data);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Serving at http://127.0.0.1:${port}`));
