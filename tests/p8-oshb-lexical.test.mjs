import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOshbXml} from '../scripts/lib/oshb-importer.mjs';
import {identifyOshb} from '../scripts/lib/oshb-occurrences.mjs';
import {splitLemma,organizeLexical,summarizeLexical} from '../scripts/lib/oshb-lexical.mjs';
const manifest=JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8'));
const f=manifest.files.find(x=>x.id==='LING-012');
const w=(id,lemma,morph='HNp',type='')=>'<w id="'+id+'" '+(lemma===null?'':'lemma="'+lemma+'" ')+'morph="'+morph+'" '+type+'>שָׁ/לֹם</w>';
const fixture=(inner=w('a','c/m/6529')+w('b','1004 b')+w('c','1004 a')+w('d','6598+')+w('e','1004 b','ANp'))=>{
 const xml='<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"><osisText osisIDWork="OSHB"><div type="book" osisID="Dan"><chapter osisID="Dan.1"><verse osisID="Dan.1.1">'+inner+'</verse></chapter></div></osisText></osis>';
 const p={source:{fileId:f.id,commit:f.commit,sha256:f.sha256,edition:'OSHB v.2.2',versification:'Bible.MT'},...parseOshbXml(Buffer.from(xml),'Dan')};
 return identifyOshb([p],manifest);
};
const build=(o=fixture())=>organizeLexical(o,manifest);
test('P8.2.4: slash order, exact provider code, suffix and extension',()=>{
 const p=splitLemma('c/m/6529/1004 b/6598+');
 assert.deepEqual(p.parts.map(x=>x.code),['c','m','6529','1004 b','6598+']);
 assert.equal(p.parts[3].homograph,'b');assert.equal(p.parts[4].extension,'+');
});
test('P8.2.4: null and unknown codes remain explicit',()=>{
 assert.equal(splitLemma(null).state,'absent');assert.equal(splitLemma('12//odd!').state,'partial');
 assert.equal(splitLemma('12//odd!').parts[1].code,'');
});
test('P8.2.4: separate homographs, extensions and languages',()=>{
 const r=build();assert.equal(r.registry.lemmas.length,5);
 assert.equal(new Set(r.registry.lemmas.map(x=>x.id)).size,5);
 assert.equal(r.registry.lemmas.filter(x=>x.providerKey==='1004 b').length,2);
 assert.ok(r.registry.lemmas.every(x=>x.form===null));
});
test('P8.2.4: repeated provider key shares lemma only within same language',()=>{
 const r=build(fixture(w('a','1004 b')+w('b','1004 b')+w('c','1004 b','ANp')));
 const ids=r.links.map(l=>l.components[0].lemmaId);assert.equal(ids[0],ids[1]);assert.notEqual(ids[0],ids[2]);
});
test('P8.2.4: Strong candidates not admitted or treated as equivalences',()=>{
 const r=build();assert.equal(r.links[1].components[0].strongCandidate,'H1004');
 assert.equal(r.links[1].components[0].strongState,'pending-evidence-and-admission');
 assert.deepEqual(r.registry.identifiers,[]);assert.deepEqual(r.registry.analyses,[]);
 assert.equal(r.links[0].components[0].lemmaId,null);
});
test('P8.2.4: alternative layer remains separate',()=>{
 const r=build(fixture(w('a','1004 a','HNp','type="x-ketiv"')+'<note type="variant"><rdg type="x-qere">'+w('alt','1004 b')+'</rdg></note>'));
 assert.equal(r.counts.primary,1);assert.equal(r.counts.alternative,1);
 assert.equal(r.links[1].layer,'alternative');assert.equal(summarizeLexical(r).primaryLemmaKeys,1);
});
test('P8.2.4: missing lemma and unknown language not invented',()=>{
 const r=build(fixture(w('a',null)+w('b','123','X')+w('c','123')));
 assert.equal(r.counts.absent,1);assert.equal(r.counts.unknownLanguage,1);
 assert.equal(r.links[1].components[0].lemmaId,null);assert.equal(r.registry.lemmas.length,1);
});
test('P8.2.4: wrong admission and duplicate links rejected',()=>{
 const p=fixture();p.records[0].events[0].lemmaOrigin.sha256='0'.repeat(64);assert.throws(()=>build(p));
 const q=fixture();q.records[0].events.push(q.records[0].events[0]);assert.throws(()=>build(q));
});
test('P8.2.4: reproducible without modifying prior occurrence registry',()=>{
 const p=fixture(),before=structuredClone(p);const a=build(p),b=build(p);
 assert.deepEqual(p,before);assert.deepEqual(summarizeLexical(a),summarizeLexical(b));
 assert.deepEqual(a.registry.tokens,p.registry.tokens);
});
test('P8.2.4: registry on disk still empty',()=>{
 const p=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));
 for(const [key,v] of Object.entries(p))if(key!=='schemaVersion')assert.deepEqual(v,[]);
});
