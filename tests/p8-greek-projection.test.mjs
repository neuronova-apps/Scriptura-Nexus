import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectGreek,greekAdmissions,decodeGreek} from '../scripts/lib/greek-projection.mjs';
const m=()=>JSON.parse(readFileSync('docs/P8/admision-griega.json','utf8'));
const fixture=()=>[{verse:1,position:1,form:'ἄ',annotation:{pos:'N-',parsing:'----NSM-',lemma:'ἄ'}},{verse:1,position:2,form:'α\u0301',annotation:null}];
const project=(rows=fixture(),manifest=m())=>projectGreek(rows,manifest,{fixedBaseline:false});
test('P8.3.2 actual admission scope and independent origins',()=>{
 const a=project();assert.equal(a.registry.tokens[0].origin.fileId,'LING-013');assert.equal(a.registry.analyses[0].origin.fileId,'LING-014');assert.equal(a.registry.lemmas[0].origin.fileId,'LING-014');assert.equal(a.summary.missing,1);assert.equal(a.registry.tokens[1].analysisIds.length,0);
});
test('exact Unicode and stable identifiers',()=>{const a=project(),b=project();assert.deepEqual(a,b);assert.equal(a.registry.tokens[1].form,'α\u0301');assert.equal(a.registry.units[0].text,'ἄ α\u0301');});
test('decode provider codes without inferring missing fields',()=>{assert.deepEqual(decodeGreek('N-','----NSM-'),{state:'documentado',features:{categoria:'sustantivo',caso:'nominativo',numero:'singular',genero:'masculino'}});assert.deepEqual(decodeGreek('N-','----ZSM-'),{state:'sin_interpretar',features:{}});});
test('reject wider admissions, publication and MACULA',()=>{let a=m();a.files[1].allowedComponents.push('texto_griego');assert.throws(()=>greekAdmissions(a));a=m();a.publication=true;assert.throws(()=>greekAdmissions(a));a=m();a.deferred=[];assert.throws(()=>greekAdmissions(a));});
test('reject duplicated and discontinuous positions',()=>{let a=fixture();a[1].position=1;assert.throws(()=>project(a));a=fixture();a[1].position=3;assert.throws(()=>project(a));});
test('reject unauthorized annotations',()=>{const a=fixture();a[0].annotation.strong='G1';assert.throws(()=>project(a));});
test('reject unexpected language and empty forms',()=>{let a=fixture();a[0].form='x';assert.throws(()=>project(a));a=fixture();a[0].form='';assert.throws(()=>project(a));});
test('fixed baseline cannot pass using sample',()=>assert.throws(()=>projectGreek(fixture(),m())));
test('public registry remains empty',()=>{const r=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));assert.deepEqual(r,{schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]});});
