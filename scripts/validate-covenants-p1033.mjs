import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {makeSections,validateEditorial} from '../src/lib/editorial-contracts.ts';
import {validateRelations} from '../src/lib/editorial-relations.ts';
import {plannedTemplate} from '../src/lib/study-template.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadP1033(){return {record:read('docs/P10/registro-validacion-pactos-p1033.json'),previous:readFileSync('docs/P10/registro-validacion-griego-p1032.json'),application:readFileSync('docs/P10/registro-aplicacion-p1023.json'),sources:readFileSync('docs/P10/registro-fuentes-p1022.json'),catalog:read('src/data/catalogo/estudios.json'),profiles:read('src/data/catalogo/perfiles-relaciones-p1014.json'),publication:read('src/data/publicaciones/registro.json')};}
export function validateP1033({record:r,previous,application,sources,catalog,profiles,publication}){
 assert.equal(blob(previous),'e529ff7ec45a1901ab30e64244724c30ba8c94ff');assert.equal(r.previousBlob,blob(previous));
 assert.equal(blob(application),'9e1a654fc3fd27a80be1fea127e0dd4cf71e5b14');assert.equal(r.applicationBlob,blob(application));
 assert.equal(blob(sources),'bd180877a71a2c59adee9d92fd4111e9d9985e79');assert.equal(r.sourceBlob,blob(sources));
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.3.3');assert.equal(r.baselineMain,'d032609c315cdb3a8a8e7f526ad3ece42e44aacc');
 assert.deepEqual(r.previousClosure,{pr:77,workflowRun:45938307832,deployRun:45938914102,build:'success',deploy:'success'});
 assert.equal(r.pilot,'SN-015');assert.equal(r.scope,'validacion_de_plantillas_referencias_y_barreras_de_aplicacion');assert.equal(r.publicationAuthorized,false);assert.equal(r.academicAnalysisCompleted,false);assert.equal(r.automaticCovenantInference,false);
 const p=JSON.parse(application).pilots.find(x=>x.id===r.pilot),s=JSON.parse(sources).pilots.find(x=>x.id===r.pilot);
 assert.deepEqual(r.openNeeds,p.openNeeds);assert.deepEqual(r.openNeeds,s.needs.map(n=>n.need));assert.ok(s.needs.every(n=>n.status==='cobertura_parcial_pendiente'));
 const labels=['Gn 14:20','Lv 27:30','Mal 3:8-10','Mt 23:23','2 Co 9:7'];
 assert.deepEqual(r.cases.map(c=>c.reference),labels);assert.deepEqual(r.cases.map(c=>c.genreCandidate),['narracion_patriarcal','disposicion_legal','discurso_profetico','discurso_evangelico','exhortacion_epistolar']);assert.deepEqual(r.cases.map(c=>c.historicalContextCandidate),['practica_patriarcal','ley_mosaica','contexto_profetico_de_Israel','ministerio_terrenal_de_Jesus','comunidad_cristiana_y_colecta']);
 const ks=['bookId','chapter','focus','contextStart','contextEnd','sourceId','sourceUrl','greekIndependentCheck'];
 for(const [i,c] of r.cases.entries()){assert.deepEqual(Object.fromEntries(ks.map(k=>[k,c[k]])),Object.fromEntries(ks.map(k=>[k,p.cases[i][k]])));assert.equal(c.sourceId,s.references[i].sourceId);assert.ok(s.references[i].chapterUrls.includes(c.sourceUrl));assert.equal(c.classificationStatus,'provisional_no_es_conclusion');assert.equal(c.normativeApplication,'pendiente_de_evidencia');assert.ok(typeof c.reviewQuestion==='string'&&c.reviewQuestion.trim());}
 const study=catalog.items.find(x=>x.id===r.pilot);assert.equal(study.status,'planificado');assert.equal(study.publishedVersion,null);assert.deepEqual(study.initialReferences,labels);assert.deepEqual(study.evidenceIds,[]);assert.ok(study.relatedAxisIds.includes('E07'));
 assert.equal(r.relatedStudy,'SN-016');assert.equal(r.relatedStudyKind,'complementaria');assert.ok(profiles.links.some(l=>l.a===r.pilot&&l.b===r.relatedStudy&&l.kind===r.relatedStudyKind));
 assert.deepEqual(r.requiredSections,[4,5,6,10,11,17,18,19,20]);assert.deepEqual(plannedTemplate(r.pilot).map(x=>x.state),Array(20).fill('pendiente'));
 assert.equal(publication.schemaVersion,1);assert.deepEqual(publication.snapshots,[]);
 assert.ok(r.controls.length===5&&r.controls.every(x=>typeof x==='string'&&x.trim()));assert.equal(r.next,'P10.3.4_tras_CI_integracion_y_despliegue');
 return {phase:r.phase,pilot:r.pilot,cases:5,contextUnits:26,greekAnchors:2,sections:20,requiredSections:9,openNeeds:4,publicationAuthorized:false,academicAnalysisCompleted:false};
}
export function makeControl(){
 const record={schemaVersion:1,studyId:'SN-015',version:'0.0.0',createdAt:'2026-11-26',updatedAt:'2026-11-26',objective:'Control técnico sintético sin afirmación doctrinal',scope:'Prueba de contratos; no contenido editorial',sections:makeSections('SN-015'),claims:[],conclusions:[],reviews:[]};
 const relations={schemaVersion:1,studyId:'SN-015',evidence:[],arguments:[],positions:[],relatedStudies:[{targetStudyId:'SN-016',reason:'Relación complementaria de prueba'}]};
 const context={studyIds:['SN-015','SN-016'],bibliographyIds:[],resourceIds:[],authorIds:[],disciplineIds:[],traditionIds:[]};
 return {record,relations,context};
}
export function auditContracts(){
 const {record,relations,context}=makeControl();
 assert.deepEqual(validateRelations(relations,record,context),[]);
 const bad=structuredClone(record);bad.claims.push({id:'AF-1',studyId:'SN-015',sectionId:'SN-015/S18',proposition:'Afirmación sintética no acreditada',type:'mandamiento_explicito',grade:'explicito',gradeJustification:'Prueba negativa',supportingEvidenceIds:[],opposingEvidenceIds:[],reasoning:'Control sin fuente'});
 assert.ok(validateEditorial(bad,{studyIds:context.studyIds,evidenceIds:[]}).includes('grado fuerte sin evidencia'));
 const missing=structuredClone(relations);missing.arguments.push({claimId:'AF-1',evidenceId:'EVD-1',role:'respalda',reasoning:'Control',comparisonScope:'no_aplicable',comparisonJustification:''});
 assert.ok(validateRelations(missing,record,context).includes('alcance canónico o justificación inválida'));
 return {validEmptyTemplate:true,unsupportedStrongClaimBlocked:true,missingComparisonJustificationBlocked:true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({...validateP1033(loadP1033()),...auditContracts()}));
