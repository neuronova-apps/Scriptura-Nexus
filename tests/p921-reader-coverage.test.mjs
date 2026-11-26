import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildReaderCoverage,lookupReaderBook} from '../src/lib/reader-coverage.ts';

const report=JSON.parse(readFileSync(new URL('../docs/P9/proyeccion-ediciones-p913.json',import.meta.url),'utf8'));
const rv='TXT-RV1909',gr='TXT-SBLGNT-V1-2';
test('P9.2.1 reads both real verified manifests and preserves source inventory',()=>{
 const result=buildReaderCoverage(report);
 assert.equal(result.editions.length,2);
 for (const [id,books,units,empty] of [[rv,66,31102,18],[gr,27,7939,0]]) {
  const e=result.editions.find(x=>x.editionId===id);
  assert.equal(e.books.length,books);
  assert.equal(e.unitCount,units);
  assert.equal(e.emptyUnitCount,empty);
  assert.deepEqual(e.books.map(b=>b.bookId),report.editions.find(x=>x.id===id).coverageBookIds);
  assert.equal(e.books.reduce((n,b)=>n+b.unitCount,0),units);
  assert.equal(e.books.reduce((n,b)=>n+b.emptyUnitCount,0),empty);
  assert.ok(e.attribution&&e.licenseRef);
  assert.equal(e.canonId,null);assert.equal(e.versificationId,null);
 }
 assert.equal(result.publicationEnabled,false);
});
test('distinguishes edition unavailable, book outside coverage and metadata available',()=>{
 const c=buildReaderCoverage(report);
 assert.deepEqual(lookupReaderBook(c,gr,'LIB-GEN'),{status:'book_outside_coverage'});
 assert.deepEqual(lookupReaderBook(c,'TXT-UNKNOWN','LIB-GEN'),{status:'edition_unavailable'});
 const found=lookupReaderBook(c,rv,'LIB-GEN');
 assert.equal(found.status,'metadata_only');assert.equal(found.book.chapterCount,50);
 assert.equal(found.publicationEnabled,false);
});
test('coverage exposes counts, never generated chapter labels or textual units',()=>{
 const c=buildReaderCoverage(report);
 const b=c.editions[0].books[0];
 assert.deepEqual(Object.keys(b).sort(),['bookId','name','fragmentId','resourceId','chapterCount','unitCount','emptyUnitCount','rangeMarkerCount'].sort());
 assert.equal(c.mode,'internal_metadata_only');
 assert.equal(Object.hasOwn(c,'units'),false);
});
test('blocks publication and assignments of canon or harmonized versification',()=>{
 for(const mutate of [
  r=>r.controls.publicationAuthorized=true,
  r=>r.corpusManifests[0].publicationEnabled=true,
  r=>r.editions[0].canonId='CAN-UNAPPROVED',
  r=>r.editions[0].versificationId='VER-UNAPPROVED',
  r=>r.controls.corpusTextPersisted=true,
  r=>r.controls.alignmentsCreated=1
 ]) {
  const bad=structuredClone(report);mutate(bad);
  assert.throws(()=>buildReaderCoverage(bad));
 }
});
test('rejects duplicate editions and resource mappings',()=>{
 const duplicate=structuredClone(report);
 duplicate.editions[1]=structuredClone(duplicate.editions[0]);
 assert.throws(()=>buildReaderCoverage(duplicate));
 const bad=structuredClone(report);
 const f=bad.corpusManifests[0].fragments;
 f[1].resourceId=f[0].resourceId;f[1].sourceFileSha256=f[0].sourceFileSha256;
 assert.throws(()=>buildReaderCoverage(bad));
});
test('does not mutate the historical projection report',()=>{
 const before=JSON.stringify(report);buildReaderCoverage(report);
 assert.equal(JSON.stringify(report),before);
});

test('real ENT22 aliases are unique and preserve exact source labels',()=>{
 for(const b of report.books) assert.equal(new Set(b.aliases).size,b.aliases.length,b.id);
 assert.deepEqual(report.books.find(b=>b.id==='LIB-MRK').aliases,['MRK','Mark']);
 assert.deepEqual(report.books.find(b=>b.id==='LIB-MAT').aliases,['MAT','Matthew','Matt']);
 const bad=structuredClone(report);bad.books[0].aliases.push(bad.books[0].aliases[0]);
 assert.throws(()=>buildReaderCoverage(bad),/ENT22/);
});
