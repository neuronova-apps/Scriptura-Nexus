import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE_PREFERENCES,
  normalizeAppearancePreferences,
  readAppearancePreferences,
  saveAppearancePreferences,
  clearAppearancePreferences,
  applyAppearancePreferences,
  initializeAppearance,
} from '../src/lib/appearance.ts';
import { contrastRatio } from '../src/lib/contrast.ts';

const css = readFileSync('src/styles/design-tokens.css', 'utf8');

function readThemeTokens(selector) {
  const escaped = selector.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const block = css.match(new RegExp(escaped + '\\s*\\{([^}]+)\\}'));
  assert.ok(block, 'No se encontró el bloque ' + selector);
  return Object.fromEntries(
    [...block[1].matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)].map((match) => [match[1], match[2].trim()]),
  );
}

function resolveToken(tokens, name, depth = 0) {
  assert.ok(depth < 5, 'Referencia circular en ' + name);
  const value = tokens[name];
  assert.ok(value, 'Falta el token ' + name);
  const reference = value.match(/^var\((--[a-z0-9-]+)\)$/i);
  return reference ? resolveToken(tokens, reference[1], depth + 1) : value;
}

const themes = [
  [':root', 'modo claro'],
  [':root[data-theme="dark"]', 'modo oscuro'],
  [':root[data-theme="contrast-light"]', 'alto contraste claro'],
  [':root[data-theme="contrast-dark"]', 'alto contraste oscuro'],
];

test('las preferencias predeterminadas son claras y de tamaño estándar', () => {
  assert.deepEqual(DEFAULT_APPEARANCE_PREFERENCES, { theme: 'light', fontScale: '100' });
});

test('la normalización admite solo los cuatro temas y tres tamaños previstos', () => {
  assert.deepEqual(normalizeAppearancePreferences({ theme: 'dark', fontScale: 115 }), { theme: 'dark', fontScale: '115' });
  assert.deepEqual(normalizeAppearancePreferences({ theme: 'unknown', fontScale: '200' }), { theme: 'light', fontScale: '100' });
  assert.deepEqual(normalizeAppearancePreferences(null), { theme: 'light', fontScale: '100' });
});

test('las preferencias se guardan, recuperan y restablecen con una clave versionada', () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };

  const preferences = { theme: 'contrast-dark', fontScale: '130' };
  assert.equal(saveAppearancePreferences(storage, preferences), true);
  assert.deepEqual(readAppearancePreferences(storage), preferences);
  assert.ok(data.has(APPEARANCE_STORAGE_KEY));
  assert.equal(clearAppearancePreferences(storage), true);
  assert.deepEqual(readAppearancePreferences(storage), { theme: 'light', fontScale: '100' });
});

test('el almacenamiento no disponible no interrumpe la aplicación', () => {
  assert.deepEqual(readAppearancePreferences(null), { theme: 'light', fontScale: '100' });
  assert.equal(saveAppearancePreferences(null, { theme: 'dark', fontScale: '115' }), false);
  assert.equal(clearAppearancePreferences(null), false);
});

test('la aplicación actualiza los atributos globales del documento', () => {
  const root = { dataset: {} };
  applyAppearancePreferences(root, { theme: 'dark', fontScale: '115' });
  assert.deepEqual(root.dataset, { theme: 'dark', fontScale: '115' });
});

test('los cuatro modos mantienen contraste AA en textos, enlaces y controles', () => {
  for (const [selector, label] of themes) {
    const tokens = readThemeTokens(selector);
    const pairs = [
      ['--sn-ink', '--sn-surface'],
      ['--sn-muted', '--sn-paper'],
      ['--sn-navy', '--sn-surface'],
      ['--sn-gold-dark', '--sn-paper'],
      ['--sn-button-primary-text', '--sn-button-primary-bg'],
      ['--sn-button-secondary-text', '--sn-button-secondary-bg'],
    ];

    for (const [foreground, background] of pairs) {
      const fg = resolveToken(tokens, foreground);
      const bg = resolveToken(tokens, background);
      assert.ok(
        contrastRatio(fg, bg) >= 4.5,
        label + ': contraste insuficiente de ' + foreground + ' sobre ' + background + ' (' + fg + ' sobre ' + bg + ')',
      );
    }
  }
});

test('la hoja de estilos contempla los tres tamaños de texto', () => {
  const styles = readFileSync('src/styles/brand.css', 'utf8');
  assert.match(styles, /data-font-scale="115"/);
  assert.match(styles, /data-font-scale="130"/);
});

test('el layout ofrece controles accesibles y restablecimiento', () => {
  const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
  assert.match(layout, /data-appearance-theme/);
  assert.match(layout, /data-appearance-font-scale/);
  assert.match(layout, /data-appearance-reset/);
  assert.match(layout, /aria-live="polite"/);
  assert.match(layout, /localStorage/);
});

test('bordes y foco alcanzan contraste no textual de 3:1 en los cuatro temas', () => {
  for (const [selector, label] of themes) {
    const tokens = readThemeTokens(selector);
    for (const foreground of ['--sn-control-border', '--sn-focus']) {
      for (const background of ['--sn-paper', '--sn-surface']) {
        assert.ok(contrastRatio(resolveToken(tokens, foreground), resolveToken(tokens, background)) >= 3, label + ': ' + foreground);
      }
    }
    for (const tone of ['info', 'success', 'warning', 'neutral']) {
      assert.ok(contrastRatio(resolveToken(tokens, '--sn-' + tone + '-ink'), resolveToken(tokens, '--sn-' + tone + '-bg')) >= 4.5, label + ': ' + tone);
    }
  }
});

test('los cambios, el restablecimiento y Escape actualizan los controles', () => {
  const node = () => Object.assign(new EventTarget(), { value: '', textContent: '', hidden: true, open: true });
  const theme = node(), scale = node(), reset = node(), status = node(), panel = node();
  let focused = false;
  panel.querySelector = () => ({ focus: () => { focused = true; } });
  const root = { dataset: {} };
  const nodes = {
    '[data-appearance-theme]': theme,
    '[data-appearance-font-scale]': scale,
    '[data-appearance-reset]': reset,
    '[data-appearance-status]': status,
    '[data-appearance-panel]': panel,
  };
  const doc = { documentElement: root, querySelector: (selector) => nodes[selector] };
  const data = new Map();
  const storage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k) };
  initializeAppearance(doc, storage);
  assert.equal(panel.hidden, false);
  theme.value = 'dark';
  theme.dispatchEvent(new Event('change'));
  scale.value = '130';
  scale.dispatchEvent(new Event('change'));
  assert.deepEqual(root.dataset, { theme: 'dark', fontScale: '130' });
  assert.deepEqual(readAppearancePreferences(storage), { theme: 'dark', fontScale: '130' });
  const escape = new Event('keydown', { cancelable: true });
  Object.defineProperty(escape, 'key', { value: 'Escape' });
  panel.dispatchEvent(escape);
  assert.equal(panel.open, false);
  assert.equal(focused, true);
  reset.dispatchEvent(new Event('click'));
  assert.deepEqual(root.dataset, { theme: 'light', fontScale: '100' });
  assert.equal(data.has(APPEARANCE_STORAGE_KEY), false);
});

test('las reglas de reflow y colores forzados permanecen presentes', () => {
  const styles = readFileSync('src/styles/brand.css', 'utf8');
  assert.match(styles, /@media \(max-width: 720px\)/);
  assert.match(styles, /appearance-settings__panel \{ position: static; width: 100%/);
  assert.match(styles, /@media \(forced-colors: active\)/);
  assert.doesNotMatch(styles, /min-width: 320px/);
});
