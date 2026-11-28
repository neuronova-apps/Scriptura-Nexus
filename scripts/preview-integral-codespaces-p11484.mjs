import {execFileSync} from 'node:child_process';
import {createHash, randomBytes, timingSafeEqual} from 'node:crypto';
import {readdirSync, readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {createInterface} from 'node:readline/promises';
import {createIntegralPrivateOverlay, prefix, routes} from './lib/integral-private-overlay-p11472.mjs';

const port = 43173;
const name = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
const host = `${name}-${port}.${domain}`;
const origin = `https://${host}`;
const cookie = '__Host-sn-review';
const labels = ['Lector', 'Analizador', 'Léxicos y concordancias', 'Comparador', 'Manuscritos'];
const menu = '<nav aria-label="Módulos privados">' + Object.values(routes).map((path, index) =>
  `<a href="${path}">${labels[index]}</a>`).join(' · ') + '</nav>';
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
};
const html = 'text/html; charset=utf-8';

function send(response, status, body, type = 'text/plain; charset=utf-8', extra = {}) {
  response.writeHead(status, {...headers, 'Content-Type': type, ...extra});
  response.end(body);
}

function assertPrivatePort() {
  const options = {encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe']};
  const entries = JSON.parse(execFileSync('gh', [
    'codespace', 'ports', '-c', name, '--json', 'sourcePort,visibility,browseUrl'
  ], options));
  const entry = entries.find(row => row.sourcePort === port);
  if (entry?.visibility?.toLowerCase() !== 'private' || new URL(entry.browseUrl).origin !== origin) {
    throw new Error('El puerto 43173 debe figurar como privado en GitHub Codespaces.');
  }
}

function addStaticAssets(files) {
  files.set(prefix + 'favicon.svg', {body: readFileSync('dist/favicon.svg'), type: 'image/svg+xml'});
  for (const [folder, types] of [
    ['_astro', {css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8'}],
    ['brand', {svg: 'image/svg+xml'}]
  ]) {
    for (const entry of readdirSync(`dist/${folder}`, {withFileTypes: true, recursive: true})) {
      if (!entry.isFile()) continue;
      const type = types[entry.name.split('.').at(-1)];
      if (!type || !/^[\w.-]+$/.test(entry.name)) continue;
      const path = `${entry.parentPath}/${entry.name}`;
      files.set(prefix + path.slice('dist/'.length), {body: readFileSync(path), type});
    }
  }
}

function page(title, body) {
  return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><main><h1>${title}</h1>${body}</main></html>`;
}

async function start() {
  if (process.env.CODESPACES !== 'true' || !/^[a-z0-9-]+$/.test(name ?? '') || domain !== 'app.github.dev') {
    throw new Error('Esta tarea requiere un GitHub Codespace.');
  }

  const prompt = createInterface({input: process.stdin, output: process.stdout});
  try {
    console.log('En el panel Puertos, reenvíe el puerto 43173 con visibilidad Privada.');
    await prompt.question('Pulse Intro cuando el puerto figure como privado. ');
  } finally {
    prompt.close();
  }
  assertPrivatePort();
  const {files, summary} = await createIntegralPrivateOverlay();
  if (summary.modules !== 5 || summary.publicationAuthorized || summary.corpusPersisted || summary.upload) {
    throw new Error('El candidato no cumple el alcance de revisión privada.');
  }
  addStaticAssets(files);
  assertPrivatePort();

  const key = randomBytes(24).toString('base64url');
  const session = randomBytes(32).toString('base64url');
  const digest = value => createHash('sha256').update(value).digest();
  const matches = (value, expected) => timingSafeEqual(digest(value), digest(expected));
  const server = createServer(async (request, response) => {
    const {method, url, headers: incoming} = request;
    const landing = method === 'GET' && url === '/';
    const crossSite = ['cross-site', 'same-site'].includes(incoming['sec-fetch-site']);
    if (incoming.host !== host || (crossSite && !landing)) {
      return send(response, 403, 'Acceso denegado.');
    }

    if (method === 'POST' && url === '/') {
      if (incoming.origin !== origin || incoming['content-type'] !== 'application/x-www-form-urlencoded') {
        return send(response, 403, 'Acceso denegado.');
      }
      let body = '';
      try {
        for await (const chunk of request) {
          body += chunk.toString('utf8');
          if (body.length > 256) return send(response, 413, 'Solicitud demasiado extensa.');
        }
      } catch {
        response.destroy();
        return;
      }
      if (!matches(new URLSearchParams(body).get('key') ?? '', key)) {
        return send(response, 403, 'Clave de sesión incorrecta.');
      }
      return send(response, 303, '', html, {
        Location: '/',
        'Set-Cookie': `${cookie}=${session}; Secure; HttpOnly; SameSite=Strict; Path=/`
      });
    }

    if (method !== 'GET') return send(response, 405, 'Método no permitido.');
    const authenticated = !crossSite && (incoming.cookie ?? '').split(';').some(value => {
      const [name, token] = value.trim().split('=');
      return name === cookie && matches(token ?? '', session);
    });
    if (!authenticated) {
      if (url !== '/') return send(response, 403, 'Acceso denegado.');
      return send(response, 200, page('Revisión privada de Scriptura Nexus',
        '<form method="post"><label>Clave temporal <input name="key" type="password" autocomplete="off" required></label> <button>Entrar</button></form>'), html);
    }
    if (url === '/') return send(response, 200, page('Revisión privada de Scriptura Nexus',
      '<p>GitHub protege el puerto y puede registrar datos de conexión. La aplicación usa una cookie temporal de acceso y guarda las preferencias visuales en el navegador.</p>' + menu), html);
    const asset = files.get(url);
    if (!asset) return send(response, 404, 'Ruta no disponible.');
    if (Object.values(routes).includes(url)) {
      // Keep navigation inside the review and leave external references as readable text.
      const content = asset.body.toString('utf8').replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (link, attrs, label) => {
        const href = attrs.match(/\bhref=["']([^"']*)["']/i)?.[1];
        if (href?.startsWith('#') || Object.values(routes).includes(href)) return link;
        return /^https:\/\//.test(href ?? '') ? `<span>${label} (${href})</span>` : `<span>${label}</span>`;
      });
      return send(response, 200, content.replace(/<body\b[^>]*>/i, tag => tag + menu), asset.type);
    }
    return send(response, 200, asset.body, asset.type);
  });
  await new Promise((resolve, reject) => server.once('error', reject).listen(port, '127.0.0.1', resolve));
  const interval = setInterval(() => {
    try {
      assertPrivatePort();
    } catch {
      console.error('Terminó la sesión porque ya no se pudo verificar el puerto privado.');
      server.close();
      server.closeAllConnections();
    }
  }, 30000);
  const expires = setTimeout(() => {
    server.close();
    server.closeAllConnections();
  }, 60 * 60 * 1000);
  server.once('close', () => {
    clearInterval(interval);
    clearTimeout(expires);
  });
  console.log(`Revisión privada: ${origin}/\nClave temporal: ${key}\nLa sesión dura una hora. Pulse Ctrl+C para terminar antes.`);
}

start().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
