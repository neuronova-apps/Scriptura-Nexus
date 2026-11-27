import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {snapshot} from './reader-artifact-scope.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const blocked=['biblia/lector/reader-data/','biblia/comparador/private-comparator/','linguistica/analizador/candidate-data/','linguistica/lexicos-concordancias/private-lexical/','manuscritos/consulta/private-manuscript/','data/biblia/','data/linguistica/'];
const staticPages=['index.html','404.html','design-system/index.html','buscar/index.html','fundamentos/index.html','fundamentos/exegesis/index.html','fundamentos/hermeneutica/index.html','fundamentos/fuentes/index.html','fundamentos/licencias/index.html','fundamentos/glosario/index.html','estudios/index.html','biblioteca/index.html','biblioteca/permisos/index.html','historia/index.html','biblia/index.html','linguistica/index.html','manuscritos/index.html','biblia/lector/index.html','biblia/comparador/index.html','linguistica/analizador/index.html','linguistica/lexicos-concordancias/index.html','manuscritos/consulta/index.html'];
const fixed=['favicon.svg','brand/scriptura-mark.svg','data/catalog-search.json',...staticPages];
export function assertPublicPath(p){
 assert.equal(typeof p,'string');
 assert.ok(!p.includes('\\')&&!p.includes('%')&&!p.includes('?')&&!p.includes('#')&&!p.split('/').some(s=>!s||s==='.'||s==='..'));
 assert.ok(!blocked.some(b=>p.startsWith(b)));
 assert.ok(fixed.includes(p)||/^(?:estudios\/SN-\d{3}|ejes\/E\d{2}|biblioteca\/(?:autores|documentos)\/[A-Za-z0-9_-]+)\/index\.html$/.test(p)||/^_astro\/[A-Za-z0-9_.-]+\.(?:css|js|mjs|svg|woff2)$/.test(p),'Unexpected public build path');
}
export function inventoryPublicBaseline(root='dist'){
 const map=snapshot(root);
 for(const p of fixed)assert.ok(map.has(p),'Required public path absent');
 const rows=[];
 for(const [path,digest] of [...map].sort(([a],[b])=>a<b?-1:a>b?1:0)){
  assertPublicPath(path);
  const bytes=statSync(join(root,path)).size;assert.ok(bytes>0);
  rows.push({path,bytes,sha256:digest});
 }
 assert.equal(rows.filter(r=>/^estudios\/SN-\d{3}\/index\.html$/.test(r.path)).length,80);
 assert.equal(rows.filter(r=>/^ejes\/E\d{2}\/index\.html$/.test(r.path)).length,14);
 const controls=[['biblia/lector/index.html','br-fields'],['biblia/comparador/index.html','bc-fields'],['linguistica/analizador/index.html','ta-fields'],['linguistica/lexicos-concordancias/index.html','lc-lex-fields'],['linguistica/lexicos-concordancias/index.html','lc-con-fields'],['manuscritos/consulta/index.html','mv-fields']];
 for(const [p,id] of controls){
  const html=readFileSync(join(root,p),'utf8');
  assert.ok(new RegExp('<fieldset\\b(?=[^>]*\\bid="'+id+'")(?=[^>]*\\sdisabled(?:\\s|=|>))[^>]*>').test(html),'Public control must remain disabled');
  assert.doesNotMatch(html,/\/(?:reader-data|candidate-data|private-comparator|private-lexical|private-manuscript)\/init\.js/);
 }
 return {files:rows.length,bytes:rows.reduce((n,r)=>n+r.bytes,0),sha256:sha(Buffer.from(JSON.stringify(rows))),rows};
}
export function comparePublicInventories(a,b){
 assert.deepEqual(a,b,'Rebuild differs from baseline');
 return {files:a.files,bytes:a.bytes,manifestSha256:a.sha256,rebuildIdentical:true};
}
export function verifyPreparationRecord(r,scope){
 assert.equal(r.phase,'P11.4.8.1');assert.equal(r.schemaVersion,1);assert.equal(r.previousEvidence.pr,128);assert.equal(r.previousEvidence.merge,r.baselineMain);
 assert.equal(r.previousEvidence.checksSuccess,59);assert.equal(r.previousEvidence.checksSkipped,1);assert.equal(r.previousEvidence.status,scope.status);
 assert.equal(scope.next.allowedPreparationOnly,true);assert.equal(scope.next.state,'blocked_for_effective_publication');
 assert.equal(r.artifact.mode,'existing_public_baseline_only');assert.equal(r.artifact.manualPending,scope.manual.pending);assert.equal(r.artifact.publicModulesEnabled,0);
 for(const k of ['privateOverlayIncluded','releaseActionPerformed','publicationAuthorized','corpusImportAuthorized','upload'])assert.equal(r.artifact[k],false);
 for(const k of ['publicationAuthorized','corpusImportAuthorized','releaseActionPerformed','publicArtifact','corpusPersisted','upload'])assert.equal(scope.controls[k],false);
 assert.equal(r.progress.historicalCompleted,scope.progress.historicalCompleted);assert.equal(r.progress.total,scope.progress.total);assert.equal(r.progress.technicalPreparationMilestones,scope.progress.technicalPreparationMilestones);
 assert.equal(r.next,'P11.4.8.2');
}
