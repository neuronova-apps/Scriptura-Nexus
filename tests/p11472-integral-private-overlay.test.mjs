import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {combineOverlays,routes,privatePrefixes} from '../scripts/lib/integral-private-overlay-p11472.mjs';
const f=body=>({body:Buffer.from(body),type:'application/octet-stream'});
test('shared reader fragment is accepted only from reader and comparator with exact bytes',()=>{
 const p=routes.reader+'reader-data/chapters/a.json.gz';
 assert.equal(combineOverlays([['reader',new Map([[p,f('a')]])],['comparator',new Map([[p,f('a')]])]]).size,1);
 assert.throws(()=>combineOverlays([['reader',new Map([[p,f('a')]])],['comparator',new Map([[p,f('b')]])]]));
 assert.throws(()=>combineOverlays([['reader',new Map([[p,f('a')]])],['analyzer',new Map([[p,f('a')]])]]));
});
test('overlay excludes unrelated routes, duplicate HTML and traversal',()=>{
 for(const p of ['/outside','/Scriptura-Nexus/index.html',routes.reader+'reader-data/../bad',routes.reader+'?query=x'])assert.throws(()=>combineOverlays([['reader',new Map([[p,f('x')]])]]));
 assert.throws(()=>combineOverlays([['reader',new Map([[routes.reader,f('x')]])],['comparator',new Map([[routes.reader,f('x')]])]]));
 assert.equal(privatePrefixes.length,5);
});
test('combined review remains private and manual review is pending',()=>{
 const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
 const r=read('docs/P11/registro-validacion-conjunta-p11472.json'),previous=read('docs/P11/registro-conciliacion-integral-p11471.json');
 assert.equal(r.planned.modules,previous.modules.length);assert.equal(r.previousEvidence.publicModulesEnabled,0);assert.equal(r.publicModulesEnabled,0);
 for(const k of ['publicationAuthorized','corpusImportAuthorized','corpusPersisted','upload','manualReview'])assert.equal(r[k],false);
 assert.equal(r.progress.historicalCompleted,previous.progress.historicalCompleted);assert.equal(r.progress.total,previous.progress.total);
});
