import test from 'node:test';
import assert from 'node:assert/strict';
import { homeModules } from '../src/lib/home.ts';
import { navigationItems } from '../src/lib/navigation.ts';
test('la portada representa exactamente las siete áreas del menú', () => {
  const modules = homeModules('/Scriptura-Nexus/');
  assert.equal(modules.length, 7);
  assert.deepEqual(modules.map(m => m.path), navigationItems.filter(m => m.path).map(m => m.path));
  assert.ok(modules.every(m => m.description && m.phase && m.label));
});
test('la portada no enlaza módulos pendientes', () => {
  assert.ok(homeModules('/Scriptura-Nexus/').every(m => m.available ? m.href?.startsWith('/Scriptura-Nexus/') : m.href === null));
});
