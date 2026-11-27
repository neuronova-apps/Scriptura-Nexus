import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createIsolatedFragmentReader} from '../src/lib/reader-fragment-view.ts';
import {loadP11423,validateP11423} from '../scripts/validate-reader-plan-p11423.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),enc=new TextEncoder(),eid='TXT-TEST',bid='LIB-TEST';
function fixture(){
 const data=new Map(),chapters=[];
 for(const [ch,rows,start] of [['1',[['1a','α'],['3','']],0],['3',[['1','<b>literal</b>']],2]]){
  const units=rows.map(([verse,text],i)=>{const sourceLocator='TEST.'+ch+'.'+verse;return {id:'UNIT-'+sha([eid,bid,ch,verse,sourceLocator].join('\u001f')),editionId:eid,bookId:bid,chapter:ch,verse,order:start+i,text,resourceId:'REC-TEST',sourceLocator,sourceSegmentSha256:'a'.repeat(64),textSha256:sha(text)};});
  const raw=enc.encode(JSON.stringify({schemaVersion:1,format:'sn-reader-chapter-v1',editionId:eid,bookId:bid,chapter:ch,units}));
  data.set(ch,raw);chapters.push({editionId:eid,bookId:bid,chapter:ch,verses:rows.map(r=>r[0]),unitCount:rows.length,emptyMarkers:rows.filter(r=>!r[1]).length,firstOrder:start,lastOrder:start+rows.length-1,resourceId:'REC-TEST',jsonBytes:raw.length,gzipBytes:100,sha256:sha(raw),gzipSha256:'b'.repeat(64)});
 }
 return {data,catalog:{schemaVersion:1,mode:'isolated_validation',publicationAuthorized:false,editions:[{id:eid,name:'Prueba',version:'1',language:'grc',attribution:'Prueba',license:'Prueba',source:'Prueba',books:[{id:bid,name:'Prueba',chapters}]}]}};
}
const ref=(chapter='1',verse='1a')=>({editionId:eid,bookId:bid,chapter,verse});
test('plan and public boundary',()=>{assert.equal(validateP11423(loadP11423()).plannedBrowserChecks,9);const d=loadP11423();d.record.publicReleaseAuthorized=true;assert.throws(()=>validateP11423(d));});
test('no chapter before selection, cache one chapter and cross-chapter navigation',async()=>{const f=fixture(),calls=[];const v=createIsolatedFragmentReader(f.catalog,async d=>{calls.push(d.chapter);return f.data.get(d.chapter);});assert.deepEqual(v.chapters(eid,bid),['1','3']);assert.deepEqual(v.verses(eid,bid,'1'),['1a','3']);assert.deepEqual(calls,[]);const a=await v.locate(ref());assert.equal(a.unit.text,'α');assert.equal(a.previous,null);const b=await v.locate(a.next);assert.equal(b.status,'empty_marker');assert.deepEqual(b.next,ref('3','1'));assert.deepEqual(calls,['1']);const c=await v.locate(b.next);assert.equal(c.unit.text,'<b>literal</b>');assert.equal(c.next,null);assert.deepEqual(calls,['1','3']);await v.locate(ref());assert.deepEqual(calls,['1','3','1']);});
test('unknown references never fetch',async()=>{const f=fixture();const v=createIsolatedFragmentReader(f.catalog,async()=>{throw Error('unexpected');});assert.equal((await v.locate({...ref(),editionId:'x'})).status,'edition_unavailable');assert.equal((await v.locate({...ref(),bookId:'x'})).status,'book_outside_coverage');assert.equal((await v.locate(ref('2','1'))).status,'chapter_not_found');assert.equal((await v.locate(ref('1','2'))).status,'reference_not_found');});
test('tampered bytes fail before rendering and can retry',async()=>{const f=fixture();let bad=true;const v=createIsolatedFragmentReader(f.catalog,async d=>bad?enc.encode('{}'):f.data.get(d.chapter));await assert.rejects(v.locate(ref()));bad=false;assert.equal((await v.locate(ref())).status,'available');});
test('reject manifest duplicate, excessive gzip and public mode',()=>{for(const change of [c=>c.publicationAuthorized=true,c=>c.editions[0].books[0].chapters[0].gzipBytes=256001,c=>c.editions[0].books[0].chapters[0].verses=['1a','1a']]){const f=fixture();change(f.catalog);assert.throws(()=>createIsolatedFragmentReader(f.catalog,async()=>enc.encode('')));}});
test('catalog and result detached from caller',async()=>{const f=fixture(),v=createIsolatedFragmentReader(f.catalog,async d=>f.data.get(d.chapter));f.catalog.editions[0].books[0].chapters[0].verses[0]='changed';const a=await v.locate(ref());a.unit.text='changed';assert.equal((await v.locate(ref())).unit.text,'α');});
