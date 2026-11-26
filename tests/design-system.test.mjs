import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrastRatio } from '../src/lib/contrast.ts';

const tokens = readFileSync('src/styles/design-tokens.css', 'utf8');

test('tokens principales de identidad están definidos', () => {
  for (const token of ['--sn-navy:', '--sn-gold:', '--sn-paper:', '--sn-surface:', '--sn-ink:', '--sn-muted:', '--sn-space-4:', '--sn-radius-md:', '--sn-font-display:']) {
    assert.ok(tokens.includes(token), `Falta el token ${token}`);
  }
});

test('colores de texto y controles cumplen contraste AA para texto normal', () => {
  const combinations = [
    ['#142B3C', '#FFFDF9'],
    ['#202A32', '#F6F1E7'],
    ['#58636C', '#FFFDF9'],
    ['#164A80', '#FFFDF9'],
    ['#FFFFFF', '#142B3C'],
    ['#805D29', '#F6F1E7'],
    ['#20523B', '#E7F1EA'],
    ['#6A4614', '#F6EBD2'],
    ['#214A66', '#EAF0F4'],
    ['#263F52', '#E9EEF1'],
  ];
  for (const [foreground, background] of combinations) {
    assert.ok(contrastRatio(foreground, background) >= 4.5, `Contraste insuficiente: ${foreground} sobre ${background}`);
  }
});

test('el cálculo de contraste rechaza colores hexadecimales inválidos', () => {
  assert.throws(() => contrastRatio('#12', '#FFFFFF'), /inválido/);
});
