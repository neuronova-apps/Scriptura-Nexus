import test from 'node:test';
import assert from 'node:assert/strict';
import { navigationFor, navigationItems } from '../src/lib/navigation.ts';

test('la navegación conserva la base de Pages y marca la página actual', () => {
  const items = navigationFor('/Scriptura-Nexus/', '/Scriptura-Nexus/');
  assert.equal(items[0].href, '/Scriptura-Nexus/');
  assert.equal(items.filter(item => item.current).length, 1);
  assert.equal(items[0].current, true);
});

test('los módulos pendientes no producen enlaces rotos ni estados activos', () => {
  const items = navigationFor('/Scriptura-Nexus/', '/Scriptura-Nexus/fundamentos/');
  assert.equal(items.filter(item => item.current).length, 0);
  assert.ok(items.filter(item => !item.available).every(item => item.href === null));
  assert.equal(new Set(navigationItems.map(item => item.path)).size, navigationItems.length);
});

test('la guía y 404 no se identifican falsamente como inicio', () => {
  for (const path of ['design-system/', '404.html']) {
    assert.equal(navigationFor('/Scriptura-Nexus', '/Scriptura-Nexus/' + path).some(item => item.current), false);
  }
});
