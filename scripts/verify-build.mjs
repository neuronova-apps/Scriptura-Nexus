import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const home = readFileSync('dist/index.html', 'utf8');
const missing = readFileSync('dist/404.html', 'utf8');
assert.match(home, /<html[^>]*lang="es"/);
assert.match(home, /<h1[^>]*>Scriptura Nexus<\/h1>/);
assert.match(missing, /href="\/Scriptura-Nexus\/"/);
assert.doesNotMatch(home, /(?:href|src)="\/(?:_astro|assets)\//);
console.log('HTML inicial, 404 y base de Pages: conformes.');
