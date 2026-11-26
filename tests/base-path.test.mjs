import test from 'node:test';
import assert from 'node:assert/strict';
import { basePath } from '../src/lib/site.ts';
test('base Pages con barra final', () => assert.equal(basePath('/Scriptura-Nexus/'), '/Scriptura-Nexus/'));
test('ruta relativa', () => assert.equal(basePath('/Scriptura-Nexus', '/estudios/'), '/Scriptura-Nexus/estudios/'));
test('base raíz', () => assert.equal(basePath('/', 'estudios/'), '/estudios/'));
