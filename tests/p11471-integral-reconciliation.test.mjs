import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyIntegralRegister} from '../scripts/lib/integral-reconciliation-p11471.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const fixture=()=>{const r=read('docs/P11/registro-conciliacion-integral-p11471.json');return {r,x:Object.fromEntries(Object.entries(r.inputs).map(([k,p])=>[k,read(p)]))};};
test('five candidates reconcile without enabling publication',()=>{const {r,x}=fixture(),v=verifyIntegralRegister(r,x);assert.equal(v.modules.length,5);assert.equal(v.publicModulesEnabled,0);assert.equal(v.publicationAuthorized,false);assert.equal(v.academicAnalysisCompleted,false);});
test('reject changed scope and implicit permissions',()=>{
 for(const mutate of [(r,x)=>x.reader.publicReleaseAuthorized=true,(r,x)=>x.readerAuthorization.publicReleaseAuthorized=true,(r,x)=>x.analyzer.decision.publicationAuthorized=true,(r,x)=>x.lexical.canPublish=true,(r,x)=>x.comparator.scope.verifiedGroups=1,(r,x)=>x.manuscripts.scope.directInspections=1,(r,x)=>r.modules[0].scope.units++]){
 const {r,x}=fixture();mutate(r,x);assert.throws(()=>verifyIntegralRegister(r,x));}
});
test('preserve exclusions and editorial boundaries',()=>{
 for(const mutate of [(r,x)=>x.analyzer.scope.excluded.shift(),(r,x)=>x.lexical.exclusions.dodson='admitted',(r,x)=>x.editorial.academicAnalysisCompleted=true,(r,x)=>x.editorial.results.openNeeds--,(r,x)=>r.controls.exclusions.pop()]){
 const {r,x}=fixture();mutate(r,x);assert.throws(()=>verifyIntegralRegister(r,x));}
});
test('manual and metric limits are not promoted by green CI',()=>{
 for(const mutate of [(r,x)=>x.readerManual.manual.independentlyVerified=true,(r,x)=>x.reader.mobile.realDeviceValidated=true,(r,x)=>x.accessibility.wcagCertification=true,(r,x)=>r.progress.historicalCompleted++,(r,x)=>r.progress.technicalPreparationIsNotClosure=false,(r,x)=>r.controls.combinedPrivateBrowserReview='passed']){
 const {r,x}=fixture();mutate(r,x);assert.throws(()=>verifyIntegralRegister(r,x));}
});
test('all five production routes retain empty release contracts',()=>{
 const requirements=[
 ['src/pages/biblia/lector.astro','createReaderView(emptyReaderRelease())'],
 ['src/pages/linguistica/analizador.astro','editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]'],
 ['src/pages/linguistica/lexicos-concordancias.astro',"scope:'internal-only',entries:[],forms:[],definitions:[],links:[]"],
 ['src/pages/biblia/comparador.astro','createComparatorView(emptyComparatorRelease())'],
 ['src/pages/manuscritos/consulta.astro','createManuscriptView(emptyManuscriptRelease())']];
 for(const [p,marker] of requirements){const page=readFileSync(new URL('../'+p,import.meta.url),'utf8');assert.ok(page.includes(marker));assert.ok(!page.includes('scripts/lib/private-'));}
});
