import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOshbXml} from '../scripts/lib/oshb-importer.mjs';
import {identifyOshb,summarizeOccurrences} from '../scripts/lib/oshb-occurrences.mjs';
const manifest=JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8'));
const word=(id,morph='HNp',type='')=>'<w id="'+id+'" morph="'+morph+'" '+type+' lemma="123 a">שָׁ/לֹם</w>';
const make=(book='Gen',inner=word('s1')+'<seg type="x-maqqef">־</seg>'+word('s2','ANp'))=>{
 const f=manifest.files.find(x=>x.id===(book==='Gen'?'LING-011':'LING-012'));
 const xml='<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"><osisText osisIDWork="OSHB"><div type="book" osisID="'+book+'"><chapter osisID="'+book+'.1"><verse osisID="'+book+'.1.1">'+inner+'</verse></chapter></div></osisText></osis>';
 return {source:{fileId:f.id,commit:f.commit,sha256:f.sha256,edition:'OSHB v.2.2',versification:'Bible.MT'},...parseOshbXml(Buffer.from(xml),book)};
};
const build=(p=[make()])=>identifyOshb(p,manifest);
test('P8.2.3: stable IDs, positions, original form and language',()=>{
 const r=build();assert.deepEqual(r,build());assert.equal(r.registry.units.length,1);assert.equal(r.registry.tokens.length,2);
 assert.deepEqual(r.registry.tokens.map(t=>[t.position,t.language,t.form]),[[0,'hbo','שָׁ/לֹם'],[1,'arc','שָׁ/לֹם']]);
 assert.equal(r.registry.units[0].text,'שָׁ/לֹם־שָׁ/לֹם');assert.equal(r.records[0].events[1].kind,'segment');
});
test('P8.2.3: repeated forms are occurrences not duplicate lemmas',()=>{
 const r=build();assert.notEqual(r.registry.tokens[0].id,r.registry.tokens[1].id);assert.deepEqual(r.registry.lemmas,[]);
 assert.deepEqual(r.registry.identifiers,[]);assert.deepEqual(r.registry.analyses,[]);assert.equal(r.records[0].events[0].lemmaRaw,'123 a');
});
test('P8.2.3: two books independent of input ordering',()=>{
 const a=make(),b=make('Dan',word('s3','ANp'));assert.deepEqual(build([a,b]),build([b,a]));
 assert.equal(build([a,b]).registry.units.length,2);
});
test('P8.2.3: unknown language stays explicit outside compatible registry',()=>{
 const p=make();p.chapters[0].verses[0].events[2].morphRaw=null;
 const r=build([p]);assert.equal(r.counts.unknown,1);assert.equal(r.registry.tokens.length,1);assert.equal(r.records[0].events[2].language,null);
});
test('P8.2.3: qere separate from ketiv, ordinary notes excluded',()=>{
 const p=make('Gen',word('s1','HNp','type="x-ketiv"')+'<note type="variant"><catchWord>omit</catchWord><rdg type="x-qere">'+word('alt1')+'</rdg></note><note><w>RESTRICTED</w></note>');
 const r=build([p]),v=r.records[0];assert.equal(r.registry.tokens.length,1);assert.equal(v.alternatives.length,1);
 assert.equal(v.alternatives[0].anchorId,v.events[0].id);assert.equal(v.alternatives[0].words[0].providerId,'alt1');assert.equal(r.counts.alternativeWords,1);assert.doesNotMatch(JSON.stringify(r),/RESTRICTED|omit/);
});
test('P8.2.3: alternatives without ketiv anchor stay unresolved',()=>{
 const r=build([make('Gen',word('s1')+'<note type="variant"><rdg type="x-qere">'+word('alt1')+'</rdg></note>')]);
 assert.equal(summarizeOccurrences(r).unanchoredAlternatives,1);
});
test('P8.2.3: duplicate source, provider ID, wrong source hash rejected',()=>{
 const p=make();assert.throws(()=>build([p,p]));
 assert.throws(()=>build([make('Gen',word('s1')+word('s1'))]));
 p.source.sha256='0'.repeat(64);assert.throws(()=>build([p]));
});
test('P8.2.3: provenance separate by component and reproducibility',()=>{
 const r=build(),w=r.records[0].events[0];assert.equal(w.origin.component,'texto_wlc');assert.equal(w.lemmaOrigin.component,'anotaciones_lema');assert.equal(w.morphOrigin.component,'anotaciones_morfologia');assert.deepEqual(summarizeOccurrences(r),summarizeOccurrences(build()));
});
test('P8.2.3: registry on disk remains unpublished',()=>{
 const r=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));for(const [k,v] of Object.entries(r))if(k!=='schemaVersion')assert.deepEqual(v,[]);
});
