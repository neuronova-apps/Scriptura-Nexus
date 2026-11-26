import test from 'node:test';
import assert from 'node:assert/strict';
import { perspectives, studySections, evidenceGrades, editorialStages } from '../src/lib/methodology.ts';
import { readFileSync } from 'node:fs';
const source = readFileSync('docs/P0/04-metodologia.md','utf8');
test('las 18 perspectivas y 20 secciones coinciden con P0.4', () => {
  assert.equal(perspectives.length,18);
  assert.equal(studySections.length,20);
  perspectives.forEach((p,i) => { assert.equal(p.id,'M'+String(i+1).padStart(2,'0')); assert.ok(source.includes('| '+p.id+' | '+p.name+' | '+p.question+' |')); });
  studySections.forEach((s,i) => assert.ok(source.includes('| '+String(i+1).padStart(2,'0')+' | '+s+' |')));
});
test('los grados de respaldo y flujo editorial coinciden con P0.4', () => {
  assert.equal(evidenceGrades.length,5);
  evidenceGrades.forEach(g=>assert.ok(source.includes('| '+g.name+' |')));
  assert.equal(editorialStages.length,5);
  assert.equal(editorialStages.at(-1),'Publicado');
});
test('el caso de tatuajes es un ejemplo planificado, no un resultado', () => {
  const page=readFileSync('src/pages/fundamentos/index.astro','utf8');
  const catalog=readFileSync('docs/P0/03-ejes.md','utf8');
  assert.ok(catalog.includes('| SN-001 | E09 | ¿Tatuarse es pecado? | Lv 19:28; Dt 14:1 |'));
  assert.ok(page.includes('SN-001 · E09 Conducta y vida cristiana · Planificado'));
  assert.ok(page.includes('pendiente de investigación'));
});
