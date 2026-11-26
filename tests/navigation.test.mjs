import test from 'node:test';
import assert from 'node:assert/strict';
import { navigationFor, navigationItems } from '../src/lib/navigation.ts';

test('la navegación conserva la base de Pages y marca la página actual', () => {
  const items = navigationFor('/Scriptura-Nexus/', '/Scriptura-Nexus/');
  assert.equal(items[0].href, '/Scriptura-Nexus/');
  assert.equal(items.filter(item => item.current).length, 1);
  assert.equal(items[0].current, true);
});

test('las siete rutas iniciales están habilitadas y marcan su página actual', () => {
  for (const item of navigationItems) {
    const path = '/Scriptura-Nexus/' + item.path;
    const items = navigationFor('/Scriptura-Nexus/', path);
    assert.equal(items.filter(i => i.current).length, 1);
    assert.equal(items.find(i => i.current).href, path);
  }
  assert.equal(new Set(navigationItems.map(i => i.path)).size, navigationItems.length);
});

test('la guía y 404 no se identifican falsamente como inicio', () => {
  for (const path of ['design-system/', '404.html']) {
    assert.equal(navigationFor('/Scriptura-Nexus', '/Scriptura-Nexus/' + path).some(item => item.current), false);
  }
});
