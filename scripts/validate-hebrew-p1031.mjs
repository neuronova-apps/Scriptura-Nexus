import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
import {loadVerifiedAnalyzerData} from './lib/term-analyzer-validation-data.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const previous='docs/P10/registro-revision-p1024.json';
export function loadP1031(){return {record:read('docs/P10/registro-validacion-hebreo-p1031.json'),previousBytes:readFileSync(previous),expansion:read('docs/P8/candidatos-ampliacion-p85.json'),admission:read('docs/P8/candidatos-linguisticos.json'),publicRegistry:read('src/data/linguistica/registro.json')};}
export function validateP1031({record:r,previousBytes,expansion,admission,publicRegistry}){
 const hash=createHash('sha1').update(Buffer.from('blob '+previousBytes.length+'\0')).update(previousBytes).digest('hex');
 assert.equal(hash,'46c949dbccf623a110a98b1f2ad8c32a733b89a1');assert.equal(r.previousReviewBlob,hash);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.3.1');assert.equal(r.baselineMain,'e75d656368685554cfd9a73aa8ed416a6bdc2f94');
 assert.deepEqual(r.previousClosure,{pr:75,workflowRun:45935665574,deployRun:45936031296,build:'success',deploy:'success'});
 assert.equal(r.pilot,'SN-001');assert.equal(JSON.parse(previousBytes).next.criteria.find(x=>x.tool==='hebreo').pilot,r.pilot);
 assert.equal(r.scope,'validacion_tecnica_de_cobertura_y_barreras');assert.equal(r.publicationAuthorized,false);assert.equal(r.newAdmissionAuthorized,false);assert.equal(r.academicAnalysisCompleted,false);
 assert.deepEqual(r.edition,{name:'OSHB v.2.2 / WLC',version:'2.2',versification:'Bible.MT',commit:'6a5db284c715c18b239422e57bb89684e6a19f00',coveredBooks:['LIB-Gen','LIB-Dan'],admittedFiles:['LING-011','LING-012']});
 assert.deepEqual(admission.files.filter(x=>x.repository==='openscriptures/morphhb'&&x.review==='aprobado').map(x=>x.id).sort(),r.edition.admittedFiles);
 assert.deepEqual(r.pilotCases,[{reference:'Lv 19:28',bookId:'LIB-Lev',chapter:'19',verse:'28',expectedStatus:'fuera_de_cobertura',analysis:'pendiente',candidateId:'EXP-C02'},{reference:'Dt 14:1',bookId:'LIB-Deut',chapter:'14',verse:'1',expectedStatus:'fuera_de_cobertura',analysis:'pendiente',candidateId:null}]);
 assert.deepEqual(r.positiveControls,[{bookId:'LIB-Gen',chapter:'1',verse:'1',fileId:'LING-011'},{bookId:'LIB-Dan',chapter:'1',verse:'1',fileId:'LING-012'}]);
 assert.equal(expansion.admission,false);assert.equal(expansion.publication,false);
 const e=expansion.files.find(x=>x.id==='EXP-C02');
 assert.equal(e.review,'pendiente');assert.deepEqual(e.allowedComponents,[]);
 assert.deepEqual(r.candidateMetadata,{repository:'openscriptures/morphhb',commit:r.edition.commit,licenseBlob:expansion.licenseEvidence.gitBlobSha1,verification:'metadata_git_tree_only',files:[{path:e.path,gitBlobSha1:e.gitBlobSha1,bytes:e.bytes,sha256:null,admitted:false},{path:'wlc/Deut.xml',gitBlobSha1:'5317431fd1d1fb5848d7f9f1d22d0753152f9991',bytes:1315401,sha256:null,admitted:false}]});
 assert.equal(publicRegistry.schemaVersion,1);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(publicRegistry[k],[]);
 assert.ok(r.limits.length===4&&r.limits.every(x=>typeof x==='string'&&x.trim()));assert.equal(r.next,'P10.3.2_tras_CI_integracion_y_despliegue');
 return {phase:r.phase,pilot:r.pilot,admittedBooks:2,uncoveredPilotCases:2,candidateFiles:2,academicAnalysisCompleted:false,publicationAuthorized:false};
}
export function checkAbsent(engine,editionId,c){
 const result=engine.select({editionId,bookId:c.bookId,chapter:c.chapter,verse:c.verse});
 assert.ok(result.status===c.expectedStatus,'Estado de cobertura incorrecto');
 assert.ok(Array.isArray(result.occurrences)&&result.occurrences.length===0&&!('unitId' in result),'Ocurrencias no autorizadas');
}
export function checkPublic(engine,r){
 assert.ok(engine.coverage().length===0,'Cobertura pública no vacía');
 for(const c of r.pilotCases)checkAbsent(engine,'TXT-private',{...c,expectedStatus:'edicion_no_disponible'});
}
async function main(){
 const input=loadP1031(),r=input.record,summary=validateP1031(input);
 const data=await loadVerifiedAnalyzerData(),engine=createTermAnalyzer(data.registry,data.admissions,data.supplements);
 const h=engine.coverage().find(e=>e.name===r.edition.name);
 assert.ok(h&&h.version===r.edition.version&&h.versificationRef===r.edition.versification&&JSON.stringify(h.bookIds)===JSON.stringify(r.edition.coveredBooks),'Edición o cobertura incorrecta');
 for(const c of r.pilotCases)checkAbsent(engine,h.editionId,c);
 let tokens=0,withLemma=0,morphDocumented=0;
 for(const c of r.positiveControls){
  const {fileId,...ref}=c;const s=engine.select({editionId:h.editionId,...ref});
  assert.ok(s.status==='disponible'&&s.occurrences.length>0,'Control positivo sin ocurrencias');
  for(const t of s.occurrences){
   const a=engine.analyze(t.id);
   assert.ok(a.status==='disponible'&&a.token.origin.fileId===fileId&&a.token.origin.commit===r.edition.commit&&a.token.direction==='rtl'&&a.token.language==='hbo'&&a.token.form===t.form,'Control positivo de procedencia');
   assert.ok(a.meaning.state==='no_disponible'&&a.identifiers.length===0&&a.alternatives.state==='no_evaluadas','Inferencia no admitida');
   tokens++;if(a.lexical.components.some(x=>x.lemmaId!==null))withLemma++;if(a.morphology.state==='documentado')morphDocumented++;
  }
 }
 assert.ok(tokens>0&&withLemma>0&&morphDocumented>0,'Controles positivos insuficientes');
 assert.ok(engine.analyze('TOK-P1031-inexistente').status==='ocurrencia_no_disponible');
 checkPublic(createTermAnalyzer(input.publicRegistry,[]),r);
 console.log(JSON.stringify({...summary,positiveControls:2,controlTokens:tokens,controlTokensWithLemma:withLemma,controlTokensWithDocumentedMorphology:morphDocumented,blockedPilotCases:2,publicRegistryEmpty:true,corpusPersisted:false}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{await main();}catch{throw new Error('P10.3.1: validación fallida; contenido de corpus omitido');}}
