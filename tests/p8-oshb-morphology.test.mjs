import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOshbXml} from '../scripts/lib/oshb-importer.mjs';
import {identifyOshb} from '../scripts/lib/oshb-occurrences.mjs';
import {organizeLexical} from '../scripts/lib/oshb-lexical.mjs';
import {decodeMorphology,organizeMorphology,summarizeMorphology,auditTehmc} from '../scripts/lib/oshb-morphology.mjs';
const manifest=JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8'));
const f=manifest.files.find(x=>x.id==='LING-012');
const word=(id,morph,extra='')=>'<w id="'+id+'" lemma="123" '+(morph===null?'':'morph="'+morph+'" ')+extra+'>שָׁ</w>';
function fixture(inner=word('a','HVqp3ms')+word('b','AVqp3ms')+word('c','HR/Ncfsa')){
 const xml='<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"><osisText osisIDWork="OSHB"><div type="book" osisID="Dan"><chapter osisID="Dan.1"><verse osisID="Dan.1.1">'+inner+'</verse></chapter></div></osisText></osis>';
 const o=identifyOshb([{source:{fileId:f.id,commit:f.commit,sha256:f.sha256,edition:'OSHB v.2.2',versification:'Bible.MT'},...parseOshbXml(Buffer.from(xml),'Dan')}],manifest);
 return [o,organizeLexical(o,manifest)];
}
const build=(args=fixture())=>organizeMorphology(...args,manifest);
test('P8.2.5: Hebrew and Aramaic distinct stems',()=>{
 assert.equal(decodeMorphology('HVqp3ms').components[0].features.patron,'qal');
 assert.equal(decodeMorphology('AVqp3ms').components[0].features.patron,'peal');
 assert.equal(decodeMorphology('HVqp3ms').components[0].features.persona,'tercera');
});
test('P8.2.5: composite morphology and nominal state',()=>{
 const d=decodeMorphology('HR/Ncfsc');assert.equal(d.state,'documented');
 assert.equal(d.components[0].features.categoria,'preposición');
 assert.equal(d.components[1].features.estado,'constructo');
});
test('P8.2.5: participle and infinitive without invented person',()=>{
 const p=decodeMorphology('HVqrmsa').components[0].features;
 assert.equal(p.conjugacion,'participio activo');assert.equal(p.persona,undefined);
 assert.equal(decodeMorphology('HVqc').state,'documented');
});
test('P8.2.5: unsupported codes and x remain explicit',()=>{
 assert.equal(decodeMorphology(null).state,'absent');
 assert.equal(decodeMorphology('HV!p3ms').state,'unresolved');
 assert.equal(decodeMorphology('HVqpxms').state,'partial');
 assert.deepEqual(decodeMorphology('HVqpxms').components[0].unknownFields,['persona']);
 assert.equal(decodeMorphology('Xabc').language,null);
});
test('P8.2.5: primary analyses linked, no automatic lemma alignment or contextual tense',()=>{
 const r=build();assert.equal(r.registry.analyses.length,3);
 assert.ok(r.registry.analyses.every(a=>a.lemmaId===null&&!Object.keys(a.features).some(k=>/tiempo|voz/.test(k))));
 assert.ok(r.registry.tokens.every(t=>t.analysisIds.length===1));
});
test('P8.2.5: alternatives excluded from primary analyses',()=>{
 const r=build(fixture(word('a','HNcmsa','type="x-ketiv"')+'<note type="variant"><rdg type="x-qere">'+word('alt','HNcfsa')+'</rdg></note>'));
 assert.equal(r.counts.alternative,1);assert.equal(r.registry.analyses.length,1);assert.equal(r.links[1].analysisId,null);
});
test('P8.2.5: invalid morphology provenance rejected',()=>{
 const p=fixture();p[0].records[0].events[0].morphOrigin.sha256='0'.repeat(64);assert.throws(()=>build(p));
});
test('P8.2.5: unknown morphology never fabricates features',()=>{
 const r=build(fixture(word('a','HV!p3ms')+word('b',null)+word('c','HNp')));
 assert.equal(r.counts.absent,1);assert.equal(r.counts.unresolved,1);assert.deepEqual(r.registry.analyses[0].features,{});
});
test('P8.2.5: TEHMC rejects unverified bytes',()=>{
 assert.throws(()=>auditTehmc(manifest,Buffer.from('HC'),build()));
});
test('P8.2.5: deterministic and non-mutating, public registry empty',()=>{
 const p=fixture(),before=structuredClone(p);assert.deepEqual(summarizeMorphology(build(p)),summarizeMorphology(build(p)));assert.deepEqual(p,before);
 const disk=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));for(const [k,v] of Object.entries(disk))if(k!=='schemaVersion')assert.deepEqual(v,[]);
});
