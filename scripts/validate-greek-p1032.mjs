import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
import {loadVerifiedAnalyzerData} from './lib/term-analyzer-validation-data.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadP1032(){return {record:read('docs/P10/registro-validacion-griego-p1032.json'),previous:readFileSync('docs/P10/registro-validacion-hebreo-p1031.json'),application:readFileSync('docs/P10/registro-aplicacion-p1023.json'),greek:read('docs/P8/admision-griega.json'),lexical:read('docs/P8/admision-lexica-p84.json'),textual:read('docs/P9/admisiones-ediciones-p912.json'),publicRegistry:read('src/data/linguistica/registro.json')};}
export function validateP1032({record:r,previous,application,greek,lexical,textual,publicRegistry}){
 assert.equal(blob(previous),'a48d2971e19e04b2c68d11fb818afa15f8b4e3ce');assert.equal(r.previousBlob,blob(previous));
 assert.equal(blob(application),'9e1a654fc3fd27a80be1fea127e0dd4cf71e5b14');assert.equal(r.applicationBlob,blob(application));
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.3.2');assert.equal(r.baselineMain,'41d0fac651b7a89d355e2f990606e57d558a8660');
 assert.deepEqual(r.previousClosure,{pr:76,workflowRun:45936328551,deployRun:45937908539,build:'success',deploy:'success'});
 assert.equal(r.pilot,'SN-008');assert.equal(r.scope,'validacion_tecnica_texto_y_cobertura_linguistica_independientes');assert.equal(r.publicationAuthorized,false);assert.equal(r.newAdmissionAuthorized,false);assert.equal(r.academicAnalysisCompleted,false);
 const p=JSON.parse(application).pilots.find(x=>x.id===r.pilot);
 const labels=['Hch 2:4','Hch 10:46','Hch 19:6','1 Co 12:10','1 Co 13:8','1 Co 14:2'];
 assert.deepEqual(r.cases,p.cases.map((c,i)=>({reference:labels[i],textualBookId:c.bookId,linguisticBookId:i<3?'LIB-Acts':'LIB-1Cor',chapter:c.chapter,verse:c.focus,textExpected:'verified_fragment',analysisExpected:'fuera_de_cobertura'})));
 assert.deepEqual(r.textEdition,{id:'TXT-SBLGNT-V1-2',version:'1.2',commit:'736fdc76158950c3d04b949b7e013ca14305145a',files:['data/sblgnt/xml/Acts.xml','data/sblgnt/xml/1Cor.xml']});
 const te=textual.decisions.find(x=>x.id==='ED-C02');
 assert.equal(te.sourceCommit,r.textEdition.commit);assert.equal(te.admissionStatus,'admitido');assert.ok(r.textEdition.files.every(p=>te.sourceFiles.some(f=>f.path===p&&/^[a-f0-9]{64}$/.test(f.sha256))));
 assert.deepEqual(r.linguisticEdition,{name:'SBLGNT',version:'1.2',versification:'SBLGNT-3John',coveredBooks:['LIB-3John'],admittedFiles:['LING-013','LING-014']});
 assert.deepEqual(greek.files.map(f=>f.id),r.linguisticEdition.admittedFiles);assert.deepEqual(greek.files.map(f=>f.path),['data/sblgnt/xml/3John.xml','85-3Jn-morphgnt.txt']);assert.ok(greek.files.every(f=>f.review==='aprobado'));
 assert.deepEqual(r.positiveControl,{bookId:'LIB-3John',chapter:'1',verse:'1'});
 assert.deepEqual(r.candidateMetadata,{repository:'morphgnt/sblgnt',commit:greek.files[1].commit,verification:'metadata_git_tree_only',files:[{path:'65-Ac-morphgnt.txt',gitBlobSha1:'3aed8e1a1dd9d77b4c448a0893bd4ddee6eb6842',bytes:1228900,sha256:null,admitted:false},{path:'67-1Co-morphgnt.txt',gitBlobSha1:'28dec6618da3a378f454b6c72776286855857920',bytes:435113,sha256:null,admitted:false}]});
 assert.deepEqual(r.lexicalCandidatesDeferred,['LEX-C01','LEX-C07']);assert.ok(r.lexicalCandidatesDeferred.every(id=>lexical.decisions.some(x=>x.candidateId===id&&x.review==='aplazado'&&x.allowedComponents.length===0)));
 assert.equal(publicRegistry.schemaVersion,1);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(publicRegistry[k],[]);
 assert.ok(r.limits.length===4&&r.limits.every(x=>typeof x==='string'&&x.trim()));assert.equal(r.next,'P10.3.3_tras_CI_integracion_y_despliegue');
 return {phase:r.phase,pilot:r.pilot,pilotCases:6,textBooks:2,linguisticBooks:1,candidateFiles:2,academicAnalysisCompleted:false,publicationAuthorized:false};
}
export function checkAbsent(engine,editionId,c,expected='fuera_de_cobertura'){
 const s=engine.select({editionId,bookId:c.linguisticBookId,chapter:c.chapter,verse:c.verse});
 assert.ok(s.status===expected&&Array.isArray(s.occurrences)&&s.occurrences.length===0&&!('unitId' in s),'Resultado no acreditado');
}
async function main(){
 const input=loadP1032(),r=input.record,summary=validateP1032(input);
 const d=await loadVerifiedAnalyzerData(),e=createTermAnalyzer(d.registry,d.admissions,d.supplements);
 const g=e.coverage().find(x=>x.name===r.linguisticEdition.name);
 assert.ok(g&&g.version==='1.2'&&g.versificationRef===r.linguisticEdition.versification&&JSON.stringify(g.bookIds)===JSON.stringify(r.linguisticEdition.coveredBooks),'Cobertura griega distinta');
 for(const c of r.cases)checkAbsent(e,g.editionId,c);
 const s=e.select({editionId:g.editionId,...r.positiveControl});assert.ok(s.status==='disponible'&&s.occurrences.length>0,'Control sin ocurrencias');
 let withLemma=0,documented=0;
 for(const t of s.occurrences){const a=e.analyze(t.id);assert.ok(a.status==='disponible'&&a.token.origin.fileId==='LING-013'&&a.token.language==='grc'&&a.token.direction==='ltr'&&a.token.form===t.form,'Procedencia');
 assert.ok(a.identifiers.length===0&&a.meaning.state==='no_disponible'&&a.alternatives.state==='no_evaluadas','Inferencia');
 if(a.lexical.direct.length){assert.ok(a.lexical.direct.every(x=>x.lemma.origin.fileId==='LING-014'),'Lema no admitido');withLemma++;}
 if(a.morphology.state==='documentado'){assert.ok(a.morphology.analyses.every(x=>x.origin.fileId==='LING-014'),'Morfología no admitida');documented++;}
 }
 assert.ok(withLemma>0&&documented>0,'Control insuficiente');
 assert.ok(e.analyze('TOK-P1032-inexistente').status==='ocurrencia_no_disponible');
 const pub=createTermAnalyzer(input.publicRegistry,[]);assert.ok(pub.coverage().length===0);for(const c of r.cases)checkAbsent(pub,g.editionId,c,'edicion_no_disponible');
 console.log(JSON.stringify({...summary,blockedPilotCases:6,positiveControlTokens:s.occurrences.length,controlWithLemma:withLemma,controlWithDocumentedMorphology:documented,publicRegistryEmpty:true,corpusPersisted:false}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{await main();}catch{throw new Error('P10.3.2: auditoría lingüística fallida; contenido omitido');}}
