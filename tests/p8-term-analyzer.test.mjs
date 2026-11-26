import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
import {projectGreek,greekAdmissions} from '../scripts/lib/greek-projection.mjs';
import {oshbSupplements} from '../scripts/lib/term-analyzer-oshb.mjs';
const m=JSON.parse(readFileSync('docs/P8/admision-griega.json','utf8'));
const make=()=>projectGreek([{verse:1,position:1,form:'ἄ',annotation:{pos:'N-',parsing:'----NSM-',lemma:'ἄ'}},{verse:1,position:2,form:'α\u0301',annotation:null},{verse:1,position:3,form:'β',annotation:{pos:'N-',parsing:'----ZSM-',lemma:'β'}}],m,{fixedBaseline:false}).registry;
const adm=greekAdmissions(m);
const engine=()=>{const r=make();return {r,a:createTermAnalyzer(r,adm)};};
const ref=r=>({editionId:r.editions[0].id,bookId:'LIB-3John',chapter:'1',verse:'1'});
test('select exact occurrence positions and Unicode',()=>{const {r,a}=engine();const s=a.select(ref(r));assert.equal(s.status,'disponible');assert.deepEqual(s.occurrences.map(t=>[t.position,t.form]),[[0,'ἄ'],[1,'α\u0301'],[2,'β']]);});
test('different absence states',()=>{const {r,a}=engine();const q=ref(r);assert.equal(a.select({...q,editionId:'TXT-none'}).status,'edicion_no_disponible');assert.equal(a.select({...q,bookId:'LIB-Gen'}).status,'fuera_de_cobertura');assert.equal(a.select({...q,verse:'2'}).status,'unidad_no_disponible');assert.equal(a.analyze('TOK-none').status,'ocurrencia_no_disponible');});
test('documented, missing and unresolved are distinct',()=>{const {r,a}=engine();assert.deepEqual(r.tokens.map(t=>a.analyze(t.id).morphology.state),['documentado','ausente','sin_interpretar']);assert.deepEqual(a.analyze(r.tokens[2].id).morphology.analyses[0].features,{});});
test('source-specific lemma and morphology provenance',()=>{const {r,a}=engine();const x=a.analyze(r.tokens[0].id);assert.equal(x.token.origin.fileId,'LING-013');assert.equal(x.lexical.direct[0].lemma.origin.fileId,'LING-014');assert.equal(x.morphology.analyses[0].origin.fileId,'LING-014');assert.equal(x.meaning.state,'no_disponible');assert.deepEqual(x.identifiers,[]);});
test('no mutation of index through input or returned data',()=>{const {r,a}=engine();const token=r.tokens[0].id;r.tokens[0].form='x';const x=a.analyze(token);x.token.form='y';assert.equal(a.analyze(token).token.form,'ἄ');});
test('reject invalid source and wrong component',()=>{const r=make();r.tokens[0].origin.component='anotaciones_lema';assert.throws(()=>createTermAnalyzer(r,adm));assert.throws(()=>createTermAnalyzer(make(),[]));});
test('empty registry explicit',()=>{const a=createTermAnalyzer({schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]},[]);assert.deepEqual(a.coverage(),[]);assert.equal(a.analyze('TOK-none').status,'ocurrencia_no_disponible');});
test('OSHB adapter separates primary from alternatives',()=>{const token={id:'TOK-a',unitId:'UNIT-a',language:'hbo'};const l={occurrenceId:token.id,unitId:token.unitId,language:'hbo',layer:'primary',raw:'1',origin:{fileId:'LING-011'},components:[{position:0,code:'1',lemmaId:'LEM-a',strongCandidate:'H1'}]};const mm={occurrenceId:token.id,unitId:token.unitId,language:'hbo',layer:'primary',state:'partial',analysisId:'MOR-a'};const s=oshbSupplements({links:[l,{...l,layer:'alternative'}]},{registry:{tokens:[token]},links:[mm]});assert.equal(s.length,1);assert.equal(s[0].morphology.state,'partial');assert.equal(s[0].lexical.components[0].strongCandidate,undefined);});
test('reject supplemental Greek or mismatched identity',()=>{const r=make();assert.throws(()=>createTermAnalyzer(r,adm,[{tokenId:r.tokens[0].id,lexical:{raw:null,origin:null,components:[]},morphology:{state:'absent',analysisId:null}}]));});
test('no implied variant or semantic equivalence',()=>{const {r,a}=engine();assert.equal(a.analyze(r.tokens[0].id).alternatives.state,'no_evaluadas');assert.equal(a.analyze(r.tokens[0].id).meaning.state,'no_disponible');});

// A provider lemma is shared across books in the same OSHB version; its representative origin need not be the occurrence's file.
test('OSHB shared lemma retains representative source and occurrence source separately',()=>{
 const commit='a'.repeat(40),sha256='b'.repeat(64),shaDan='c'.repeat(64);
 const files=[{id:'LING-011',commit,sha256,allowedComponents:['texto_wlc','anotaciones_lema','anotaciones_morfologia']},{id:'LING-012',commit,sha256:shaDan,allowedComponents:['texto_wlc','anotaciones_lema','anotaciones_morfologia']}];
 const o=(f,component)=>({fileId:f.id,commit:f.commit,sha256:f.sha256,component,locator:'synthetic'});
 const r={schemaVersion:1,editions:[{id:'TXT-oshb',name:'OSHB',languages:['hbo'],version:'2.2',versificationRef:'Bible.MT',canonRef:null,coverageBookIds:['LIB-Gen','LIB-Dan'],fileIds:files.map(f=>f.id)}],units:[{id:'UNIT-dan',editionId:'TXT-oshb',bookId:'LIB-Dan',chapter:'1',verse:'1',order:0,text:'א',origin:o(files[1],'texto_wlc')}],tokens:[{id:'TOK-dan',unitId:'UNIT-dan',position:0,form:'א',language:'hbo',direction:'rtl',origin:o(files[1],'texto_wlc'),analysisIds:[]}],lemmas:[{id:'LEM-shared',language:'hbo',form:null,homograph:null,providerKey:'1',system:'OSHB-lemma',origin:o(files[0],'anotaciones_lema')}],identifiers:[],analyses:[],morphCodes:[]};
 const s={tokenId:'TOK-dan',lexical:{raw:'1',origin:o(files[1],'anotaciones_lema'),components:[{position:0,code:'1',lemmaId:'LEM-shared'}]},morphology:{state:'absent',analysisId:null}};
 const a=createTermAnalyzer(r,files,[s]).analyze('TOK-dan');
 assert.equal(a.lexical.origin.fileId,'LING-012');assert.equal(a.lexical.components[0].lemma.origin.fileId,'LING-011');assert.equal(a.lexical.components[0].lemma.form,null);
});
