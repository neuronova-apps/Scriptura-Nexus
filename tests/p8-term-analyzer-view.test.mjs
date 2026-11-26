import test from 'node:test';
import assert from 'node:assert/strict';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
import {createAnalyzerSession,statusLabels,languageNames} from '../src/lib/term-analyzer-view.ts';
const empty={schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]};
function demo(){
 const r=structuredClone(empty);
 const f={id:'LING-demo',commit:'a'.repeat(40),sha256:'b'.repeat(64),allowedComponents:['texto_wlc','texto_griego']};
 const o=component=>({fileId:f.id,commit:f.commit,sha256:f.sha256,component,locator:'test-only'});
 for(const [i,language,form] of [[1,'hbo','א'],[2,'arc','ב'],[3,'grc','α']]){
  const eid='TXT-demo'+i,uid='UNIT-demo'+i,bid='LIB-demo'+i,component=language==='grc'?'texto_griego':'texto_wlc';
  r.editions.push({id:eid,name:'Test',languages:[language],version:'test',versificationRef:'test',canonRef:null,coverageBookIds:[bid],fileIds:[f.id]});
  r.units.push({id:uid,editionId:eid,bookId:bid,chapter:'1',verse:'1',order:0,text:form,origin:o(component)});
  r.tokens.push({id:'TOK-demo'+i,unitId:uid,position:0,form,language,direction:language==='grc'?'ltr':'rtl',origin:o(component),analysisIds:[]});
 }
 return createAnalyzerSession(createTermAnalyzer(r,[f]));
}
const ref=i=>({editionId:'TXT-demo'+i,bookId:'LIB-demo'+i,chapter:'1',verse:'1'});
test('public empty registry never produces editions or occurrences',()=>{const s=createAnalyzerSession(createTermAnalyzer(empty,[]));assert.deepEqual(s.coverage(),[]);assert.equal(s.consult(ref(1)).status,'edicion_no_disponible');assert.equal(s.choose('TOK-demo1').status,'ocurrencia_no_disponible');});
test('reference and occurrence selection in all three languages',()=>{const s=demo();for(const [i,lang,dir] of [[1,'hbo','rtl'],[2,'arc','rtl'],[3,'grc','ltr']]){const a=s.consult(ref(i));assert.equal(a.status,'disponible');assert.equal(a.occurrences[0].direction,dir);const v=s.choose(a.occurrences[0].id);assert.equal(v.status,'disponible');assert.equal(v.token.language,lang);assert.equal(v.morphology.state,'ausente');}});
test('no stale selection after reference or reset',()=>{const s=demo();s.consult(ref(1));assert.equal(s.choose('TOK-demo1').status,'disponible');s.consult(ref(2));assert.equal(s.choose('TOK-demo1').status,'ocurrencia_no_disponible');s.reset();assert.equal(s.choose('TOK-demo2').status,'ocurrencia_no_disponible');});
test('invalid reference cannot reveal prior occurrence',()=>{const s=demo();s.consult(ref(3));assert.equal(s.consult({...ref(3),verse:'2'}).status,'unidad_no_disponible');assert.equal(s.choose('TOK-demo3').status,'ocurrencia_no_disponible');});
test('outside coverage distinguished from missing edition',()=>{const s=demo();assert.equal(s.consult({...ref(1),bookId:'LIB-other'}).status,'fuera_de_cobertura');assert.equal(s.consult({...ref(1),editionId:'TXT-other'}).status,'edicion_no_disponible');});
test('labels distinguish partial, missing and uninterpreted',()=>{assert.equal(new Set([statusLabels.parcial,statusLabels.ausente,statusLabels.sin_interpretar]).size,3);assert.deepEqual(Object.keys(languageNames),['hbo','arc','grc']);});
