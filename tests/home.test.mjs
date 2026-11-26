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
test('la portada enlaza las siete rutas iniciales', () => {
  assert.ok(homeModules('/Scriptura-Nexus/').every(m => m.available && m.href === '/Scriptura-Nexus/' + m.path));
});

import { moduleDetails } from '../src/lib/module-details.ts';
test('cada módulo declara recursos previstos y un estado vacío explícito', () => {
  assert.equal(Object.keys(moduleDetails).length, 7);
  for (const item of homeModules('/Scriptura-Nexus/')) {
    const details = moduleDetails[item.path.replace(/\/$/, '')];
    assert.ok(details.empty && details.planned.length === 3);
  }
});
