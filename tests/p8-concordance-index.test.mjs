import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConcordance} from '../src/lib/concordance.ts';
import {projectGreek,greekAdmissions} from '../scripts/lib/greek-projection.mjs';
const manifest=JSON.parse(readFileSync('docs/P8/admision-griega.json','utf8'));
const ann={pos:'N-',parsing:'----NSM-',lemma:'α'};
function setup(){
 const registry=projectGreek([{verse:1,position:1,form:'α',annotation:ann},{verse:1,position:2,form:'α',annotation:ann},{verse:1,position:3,form:'β',annotation:null},{verse:2,position:1,form:'α\u0301',annotation:ann},{verse:2,position:2,form:'γ',annotation:{...ann,lemma:'γ'}}],manifest,{fixedBaseline:false}).registry;
 const c=createConcordance(registry,greekAdmissions(manifest));
 return {registry,c,q:{editionId:registry.editions[0].id,language:'grc'}};
}
test('frequency ranks count then exact key, without Unicode normalization',()=>{const {c,q}=setup();const r=c.frequency({...q,mode:'form'});assert.equal(r.totalKeys,4);assert.equal(r.totalPostings,5);assert.deepEqual(r.entries,[{key:'α',count:2},{key:'α\u0301',count:1},{key:'β',count:1},{key:'γ',count:1}]);});
test('frequency and search agree for all observed keys',()=>{const {c,q}=setup();for(const mode of ['form','lemma','provider']){const system=mode==='provider'?{system:'MorphGNT-lemma'}:{};const freq=c.frequency({...q,mode,...system});for(const entry of freq.entries){const key=mode==='lemma'?{lemmaId:entry.key}:{value:entry.key};assert.equal(c.search({...q,mode,...system,...key}).total,entry.count);}}});
test('pagination and total postings independent of requested page',()=>{const {c,q}=setup();const r=c.frequency({...q,mode:'form',limit:2});const s=c.frequency({...q,mode:'form',offset:r.nextOffset,limit:2});assert.equal(r.nextOffset,2);assert.equal(s.nextOffset,null);assert.equal(s.totalPostings,5);assert.deepEqual([...r.entries,...s.entries],c.frequency({...q,mode:'form'}).entries);assert.equal(c.frequency({...q,mode:'form',offset:20}).entries.length,0);});
test('book scope agrees, unsupported book/language distinct',()=>{const {c,q}=setup();assert.deepEqual(c.frequency({...q,mode:'form',bookId:'LIB-3John'}).entries,c.frequency({...q,mode:'form'}).entries);assert.equal(c.frequency({...q,mode:'form',bookId:'LIB-Gen'}).status,'libro_fuera_de_cobertura');assert.equal(c.frequency({...q,mode:'form',language:'arc'}).totalKeys,null);});
test('unavailable provider, edition and valid empty scope',()=>{const {c,q}=setup();assert.equal(c.frequency({...q,mode:'provider',system:'Strong'}).status,'sistema_no_disponible');assert.equal(c.frequency({...q,mode:'form',editionId:'TXT-none'}).totalPostings,null);assert.equal(c.search({...q,mode:'form',value:'χ'}).total,0);});
test('frequency results cannot mutate ranking',()=>{const {c,q}=setup();const a=c.frequency({...q,mode:'form'});a.entries[0].count=999;a.entries[0].key='x';assert.equal(c.frequency({...q,mode:'form'}).entries[0].count,2);});
test('reject invalid frequency parameters',()=>{const {c,q}=setup();for(const x of [{limit:0},{limit:101},{offset:-1},{mode:'provider'},{mode:'bad'}])assert.throws(()=>c.frequency({...q,mode:'form',...x}));});
test('lemma frequency excludes missing annotation; form counts all tokens',()=>{const {c,q}=setup();assert.equal(c.frequency({...q,mode:'lemma'}).totalPostings,4);assert.equal(c.frequency({...q,mode:'provider',system:'MorphGNT-lemma'}).totalPostings,4);assert.equal(c.frequency({...q,mode:'form'}).totalPostings,5);});
test('repeated lemma components deduplicate but different lemmas can exceed token count',()=>{
 const commit='a'.repeat(40),sha256='b'.repeat(64),files=[{id:'LING-011',commit,sha256,allowedComponents:['texto_wlc','anotaciones_lema']}];
 const o=component=>({fileId:'LING-011',commit,sha256,component,locator:'fixture'});
 const registry={schemaVersion:1,editions:[{id:'TXT-h',name:'OSHB',version:'test',languages:['hbo'],versificationRef:'test',canonRef:null,coverageBookIds:['LIB-Gen','LIB-Dan'],fileIds:['LING-011']}],units:[{id:'UNIT-a',editionId:'TXT-h',bookId:'LIB-Gen',chapter:'1',verse:'1',order:0,text:'א',origin:o('texto_wlc')}],tokens:[{id:'TOK-a',unitId:'UNIT-a',position:0,form:'א',language:'hbo',direction:'rtl',origin:o('texto_wlc'),analysisIds:[]}],lemmas:['1 a','1 b'].map((code,i)=>({id:'LEM-'+i,language:'hbo',form:null,homograph:code.at(-1),providerKey:code,system:'OSHB-lemma',origin:o('anotaciones_lema')})),identifiers:[],analyses:[],morphCodes:[]};
 const supplements=[{tokenId:'TOK-a',lexical:{raw:'1 a/1 a/1 b',origin:o('anotaciones_lema'),components:['1 a','1 a','1 b'].map((code,i)=>({position:i,code,lemmaId:'LEM-'+(i===2?1:0)}))},morphology:{state:'absent',analysisId:null}}];
 const c=createConcordance(registry,files,supplements);const q={editionId:'TXT-h',language:'hbo'};
 assert.equal(c.frequency({...q,mode:'form'}).totalPostings,1);assert.equal(c.frequency({...q,mode:'lemma'}).totalPostings,2);assert.deepEqual(c.frequency({...q,mode:'provider',system:'OSHB-lemma'}).entries,[{key:'1 a',count:1},{key:'1 b',count:1}]);assert.equal(c.frequency({...q,mode:'provider',system:'OSHB-lemma',bookId:'LIB-Dan'}).totalKeys,0);
});
