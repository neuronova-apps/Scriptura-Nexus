import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOshbXml} from '../scripts/lib/oshb-importer.mjs';
import {identifyOshb} from '../scripts/lib/oshb-occurrences.mjs';
import {organizeLexical} from '../scripts/lib/oshb-lexical.mjs';
import {organizeMorphology} from '../scripts/lib/oshb-morphology.mjs';
import {auditIntegrity,summarizeIntegrity} from '../scripts/lib/oshb-integrity.mjs';
const manifest=JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8'));
const f=manifest.files.find(x=>x.id==='LING-011');
function fixture(){
 const xml='<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"><osisText osisIDWork="OSHB"><div type="book" osisID="Gen"><chapter osisID="Gen.1"><verse osisID="Gen.1.1"><w id="a" lemma="123 a" morph="HNcmsa" type="x-ketiv">שָׁ</w><note type="variant"><rdg type="x-qere"><w id="b" lemma="123 b" morph="HNcfsa">שָׁ</w></rdg></note><seg type="x-maqqef">־</seg><w id="c" lemma="123" morph="HVqpxms">בָ</w><w id="d" lemma="456" morph="HV!p3ms">א</w></verse></chapter></div></osisText></osis>';
 const p={source:{fileId:f.id,commit:f.commit,sha256:f.sha256,edition:'OSHB v.2.2',versification:'Bible.MT'},...parseOshbXml(Buffer.from(xml),'Gen')};
 const o=identifyOshb([p],manifest),l=organizeLexical(o,manifest),m=organizeMorphology(o,l,manifest);
 return [[p],o,l,m];
}
const audit=(args=fixture(),options={})=>auditIntegrity(...args,manifest,options);
test('P8.2.6: reconcile units, words, segments and alternative layer',()=>{
 const a=audit();assert.equal(a.counts.units,1);assert.equal(a.counts.tokens,3);assert.equal(a.counts.alternativeWords,1);assert.equal(a.counts.segments,1);assert.equal(a.variantIssues.length,0);
});
test('P8.2.6: exact Unicode and combining marks preserved',()=>{
 const a=audit();assert.equal(a.unicode.forms,5);assert.ok(a.unicode.combiningMarks>0);assert.ok(a.unicode.nonNfc>0);
 const f=fixture();f[1].records[0].events[0].form=f[1].records[0].events[0].form.normalize('NFC');assert.throws(()=>audit(f));
});
test('P8.2.6: replacement and altered provider code rejected',()=>{
 const a=fixture();a[1].records[0].events[0].form='\ufffd';assert.throws(()=>audit(a));
 const b=fixture();b[1].records[0].events[0].lemmaRaw='999';assert.throws(()=>audit(b));
});
test('P8.2.6: partial and unresolved codes grouped without invention',()=>{
 const a=audit();assert.equal(a.pendingMorph.length,2);assert.equal(a.counts.partial,1);assert.equal(a.counts.unresolved,1);assert.equal(a.grouped.length,2);
});
test('P8.2.6: orphan lexical link rejected',()=>{
 const f=fixture();f[2].links.pop();assert.throws(()=>audit(f));
});
test('P8.2.6: orphan morphology and invalid anchor rejected',()=>{
 const f=fixture();f[3].links.pop();assert.throws(()=>audit(f));
 const g=fixture();g[1].records[0].alternatives[0].anchorId='invalid';assert.throws(()=>audit(g));
});
test('P8.2.6: altered positions and duplicate provider IDs rejected',()=>{
 const f=fixture();f[1].records[0].events[2].position=99;assert.throws(()=>audit(f));
 const g=fixture();g[0][0].chapters[0].verses[0].events[2].providerId='a';g[1].records[0].events[2].providerId='a';assert.throws(()=>audit(g));
});
test('P8.2.6: missing registry token rejected',()=>{
 const f=fixture();f[3].registry.tokens.pop();assert.throws(()=>audit(f));
});
test('P8.2.6: baseline cannot be satisfied by synthetic subset',()=>assert.throws(()=>audit(fixture(),{fixedBaseline:true})));
test('P8.2.6: deterministic audit and empty public registry',()=>{
 assert.deepEqual(summarizeIntegrity(audit()),summarizeIntegrity(audit()));
 const disk=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));for(const [k,v] of Object.entries(disk))if(k!=='schemaVersion')assert.deepEqual(v,[]);
});
