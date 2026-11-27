import test from 'node:test';
import assert from 'node:assert/strict';
import {lexicalNotices,manuscriptNotices,hostingNotice} from '../scripts/lib/private-review-notices-p11484.mjs';
test('private lexical notices preserve distinct source and annotation licenses',()=>{
 for(const x of ['lc-candidate-rights','lc-candidate-privacy','21c9add13bc727d3a951361778e97e3ff7afd1ce','6a5db284c715c18b239422e57bb89684e6a19f00','736fdc76158950c3d04b949b7e013ca14305145a','aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d','CC BY-SA 3.0','CC BY 4.0','No se admite Dodson'])assert.ok(lexicalNotices.includes(x));
});
test('both notices recognize hosting limits and prevent referrer transfer',()=>{
 assert.match(hostingNotice,/no se garantiza anonimato/);
 for(const html of [lexicalNotices,manuscriptNotices]){
  assert.ok(html.includes(hostingNotice));assert.doesNotMatch(html,/<(?:script|img|iframe)\b/);
  for(const m of html.matchAll(/<a\b[^>]*>/g)){assert.match(m[0],/href="https:\/\//);assert.match(m[0],/rel="noreferrer noopener"/);assert.match(m[0],/referrerpolicy="no-referrer"/);}
 }
 assert.match(manuscriptNotices,/No se reproducen imágenes, transcripciones/);
});
