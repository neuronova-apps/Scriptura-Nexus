import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createPrivateComparator} from '../scripts/lib/private-comparator-p11452.mjs';
const A='TXT-RV1909',B='TXT-SBLGNT-V1-2',book='LIB-test';
const sha=v=>createHash('sha256').update(v).digest('hex');
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const ref=(editionId,verse='1',bookId=book,chapter='1')=>({editionId,bookId,chapter,verse});
function fixture(){
 const bytes=new Map(),calls=[];
 const make=(editionId,language,bookId,rows)=>{
  const chapter='1',resourceId='REC-'+editionId;
  const units=rows.map(([verse,text],order)=>{
   const sourceLocator='fixture:'+chapter+':'+verse;
   return {id:'UNIT-'+sha([editionId,bookId,chapter,verse,sourceLocator].join('\u001f')),editionId,bookId,chapter,verse,order,text,resourceId,sourceLocator,sourceSegmentSha256:'a'.repeat(64),textSha256:sha(text)};
  });
  const raw=new TextEncoder().encode(JSON.stringify({schemaVersion:1,format:'sn-reader-chapter-v1',editionId,bookId,chapter,units}));
  bytes.set(editionId+'/'+bookId,raw);
  return {id:editionId,name:editionId,version:'fixture',language,attribution:'fixture credit',license:'fixture license',source:'fixture source',books:[{id:bookId,name:'fixture book',chapters:[{editionId,bookId,chapter,verses:rows.map(x=>x[0]),unitCount:units.length,emptyMarkers:rows.filter(x=>x[1]==='').length,firstOrder:0,lastOrder:units.length-1,resourceId,jsonBytes:raw.length,gzipBytes:100,sha256:sha(raw),gzipSha256:'b'.repeat(64)}]}]};
 };
 const catalog={schemaVersion:1,mode:'isolated_validation',publicationAuthorized:false,editions:[make(A,'spa',book,[['1','fixture A'],['2-3','range'],['4','']]),make(B,'grc',book,[['1','α'],['2a','β'],['4','']])]};
 const registry=read('docs/P9/alineaciones-p931.json');
 const load=async d=>{calls.push(d.editionId);return bytes.get(d.editionId+'/'+d.bookId);};
 return {catalog,registry,load,calls,bytes};
}
const engine=f=>createPrivateComparator(f.catalog,f.load,f.registry);
test('no preload and no automatic destination even with coincident label',async()=>{
 const f=fixture(),e=engine(f);
 assert.deepEqual(e.view.verses(A,book,'1'),['1','2-3','4']);
 assert.deepEqual(f.calls,[]);
 const r=await e.compare(ref(A),B);
 assert.equal(r.status,'not_aligned');assert.equal(r.literalProbe,'label_present');assert.equal(r.target,null);assert.equal(r.group,null);
 assert.deepEqual(f.calls,[A]);
});
test('explicit native reading, reverse direction and provenance',async()=>{
 const f=fixture(),e=engine(f);
 const r=await e.compare(ref(A,'2-3'),B,ref(B,'2a'));
 assert.equal(r.status,'not_aligned');assert.equal(r.literalProbe,'reference_not_found');
 assert.equal(r.source.unit.verse,'2-3');assert.equal(r.target.unit.verse,'2a');assert.equal(r.target.unit.text,'β');
 assert.equal(r.target.edition.license,'fixture license');assert.equal(r.target.edition.language,'grc');assert.equal(r.target.unit.sourceLocator,'fixture:1:2a');
 assert.deepEqual(f.calls,[A,B]);
 const reverse=await e.compare(ref(B,'2a'),A,ref(A,'2-3'));assert.equal(reverse.status,'not_aligned');assert.equal(reverse.target.unit.text,'range');
});
test('different edition, coverage, missing chapter and exact reference',async()=>{
 const f=fixture(),e=engine(f);
 assert.equal((await e.compare(ref(A),A)).status,'same_edition');
 assert.equal((await e.compare(ref(A),'unknown')).status,'edition_unavailable');
 assert.deepEqual(f.calls,[]);
 for(const [r,status] of [[ref(B,'1','absent'),'book_outside_coverage'],[ref(B,'1',book,'9'),'chapter_not_found'],[ref(B,'99'),'reference_not_found'],[ref(A),'edition_unavailable']]){
  const x=await e.compare(ref(A),B,r);assert.equal(x.status,'target_unavailable');assert.equal(x.target.status,status);
 }
 assert.equal((await e.compare(ref(A,'99'),B)).status,'source_unavailable');
 assert.deepEqual(f.calls,[A]);
});
test('empty marker is not omission, metadata probe does not fetch target',async()=>{
 const f=fixture(),e=engine(f);
 const r=await e.compare(ref(A,'4'),B);assert.equal(r.status,'source_empty_marker');assert.equal(r.literalProbe,'label_present');assert.equal(r.target,null);assert.deepEqual(f.calls,[A]);
 const x=await e.compare(ref(A),B,ref(B,'4'));assert.equal(x.status,'target_empty_marker');assert.equal(x.target.unit.text,'');assert.equal(x.group,null);
});
test('reject unapproved scope and any nonempty ENT30',()=>{
 for(const change of [f=>f.registry.alignments.push({id:'fake'}),f=>f.registry.evidence.push({id:'fake'}),f=>f.registry.publicationAuthorized=true,f=>f.catalog.publicationAuthorized=true,f=>f.catalog.editions[1].id='TR']){
  const f=fixture();change(f);assert.throws(()=>engine(f));assert.deepEqual(f.calls,[]);
 }
});
test('integrity error propagates and valid retry works',async()=>{
 const f=fixture(),e=engine(f),k=B+'/'+book,original=f.bytes.get(k);
 f.bytes.set(k,new TextEncoder().encode('{}'));
 await assert.rejects(e.compare(ref(A),B,ref(B)));
 f.bytes.set(k,original);assert.equal((await e.compare(ref(A),B,ref(B))).target.unit.text,'α');
});
test('snapshots inputs and results remain detached',async()=>{
 const f=fixture(),e=engine(f),s=ref(A),t=ref(B,'2a');
 const pending=e.compare(s,B,t);s.verse='4';t.verse='4';
 const r=await pending;assert.equal(r.source.unit.verse,'1');assert.equal(r.target.unit.verse,'2a');
 r.target.unit.text='changed';assert.equal((await e.compare(ref(A),B,ref(B,'2a'))).target.unit.text,'β');
});
test('record and historical publication gates remain consistent',()=>{
 const r=read('docs/P11/registro-contrato-comparador-p11452.json'),audit=read('docs/P11/registro-auditoria-comparador-p11451.json'),lex=read('docs/P11/registro-liberacion-lexicos-p114444.json');
 assert.deepEqual(r.editions,audit.scope.editions.map(e=>e.id));assert.deepEqual(r.progress,audit.progress);
 assert.equal(r.verifiedGroups,0);assert.equal(r.verifiedEvidence,0);assert.equal(r.automaticTarget,false);
 assert.equal(r.publicationAuthorized,false);assert.equal(r.publicAdapterConnected,false);assert.equal(r.corpusPersisted,false);
 assert.equal(lex.canPublish,false);assert.equal(lex.exclusions.dodson,'not_included_pending_separate_approval');
 const page=readFileSync(new URL('../src/pages/biblia/comparador.astro',import.meta.url),'utf8');
 assert.ok(page.includes('createComparatorView(emptyComparatorRelease())'));assert.ok(!page.includes('private-comparator-p11452'));
});
