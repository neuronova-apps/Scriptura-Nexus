import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertPublicPath,comparePublicInventories,verifyPreparationRecord} from '../scripts/lib/public-baseline-p11481.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../docs/P11/'+p,import.meta.url),'utf8'));
test('public paths admit only existing site categories',()=>{
 for(const p of ['index.html','_astro/index.XYZ.js','estudios/SN-001/index.html','ejes/E01/index.html','biblioteca/documentos/DOC-001/index.html','data/catalog-search.json'])assert.doesNotThrow(()=>assertPublicPath(p));
 for(const p of ['biblia/lector/reader-data/chapter.json.gz','linguistica/analizador/candidate-data/init.js','linguistica/lexicos-concordancias/private-lexical/manifest.json','manuscritos/consulta/private-manuscript/references.json','_astro/corpus.json.gz','docs/private.txt','_astro/../secret.js','data/linguistica/registry.json','unknown/index.html','_astro/x%2fy.js'])assert.throws(()=>assertPublicPath(p));
});
test('inventory comparison detects changes even with same size',()=>{
 const a={files:1,bytes:1,sha256:'a',rows:[{path:'index.html',bytes:1,sha256:'a'}]};
 assert.equal(comparePublicInventories(a,structuredClone(a)).rebuildIdentical,true);
 const b=structuredClone(a);b.rows[0].sha256='b';assert.throws(()=>comparePublicInventories(a,b));
});
test('baseline verification never grants release authority',()=>{
 const r=read('registro-linea-base-publica-p11481.json'),s=read('registro-alcance-publicacion-p11474.json');
 assert.doesNotThrow(()=>verifyPreparationRecord(r,s));
 for(const mutate of [x=>x.artifact.publicationAuthorized=true,x=>x.artifact.privateOverlayIncluded=true,x=>x.artifact.upload=true,x=>x.artifact.manualPending=0,x=>x.progress.historicalCompleted++]){const x=structuredClone(r);mutate(x);assert.throws(()=>verifyPreparationRecord(x,s));}
});
