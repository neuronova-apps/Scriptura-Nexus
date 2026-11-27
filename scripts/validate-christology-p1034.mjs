import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {makeSections,validateEditorial} from '../src/lib/editorial-contracts.ts';
import {validateRelations} from '../src/lib/editorial-relations.ts';
import {plannedTemplate} from '../src/lib/study-template.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadP1034(){return {record:read('docs/P10/registro-validacion-cristologia-p1034.json'),previous:readFileSync('docs/P10/registro-validacion-pactos-p1033.json'),application:readFileSync('docs/P10/registro-aplicacion-p1023.json'),sources:readFileSync('docs/P10/registro-fuentes-p1022.json'),catalog:read('src/data/catalogo/estudios.json'),profiles:read('src/data/catalogo/perfiles-relaciones-p1014.json'),publication:read('src/data/publicaciones/registro.json')};}
export function validateP1034({record:r,previous,application,sources,catalog,profiles,publication}){
 assert.equal(blob(previous),'45870d78b5ebb3967cd2d58810c517df00423f5b');assert.equal(r.previousBlob,blob(previous));
 assert.equal(blob(application),'9e1a654fc3fd27a80be1fea127e0dd4cf71e5b14');assert.equal(r.applicationBlob,blob(application));
 assert.equal(blob(sources),'bd180877a71a2c59adee9d92fd4111e9d9985e79');assert.equal(r.sourceBlob,blob(sources));
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.3.4');assert.equal(r.baselineMain,'474785957f042c053439993bfe40702d0c19c006');
 assert.deepEqual(r.previousIntegration,{pr:78,workflowRun:45939097913,deployRun:45940134163,deploy:'pending_confirmation'});
 assert.equal(r.pilot,'SN-021');assert.equal(r.scope,'validacion_tecnica_referencias_intertextualidad_y_atribucion');assert.equal(r.publicationAuthorized,false);assert.equal(r.academicAnalysisCompleted,false);assert.equal(r.automaticDoctrinalInference,false);
 const p=JSON.parse(application).pilots.find(x=>x.id===r.pilot),s=JSON.parse(sources),sp=s.pilots.find(x=>x.id===r.pilot);
 assert.deepEqual(r.openNeeds,p.openNeeds);assert.deepEqual(r.openNeeds,sp.needs.map(n=>n.need));assert.ok(sp.needs.every(n=>n.status==='cobertura_parcial_pendiente'));
 const labels=['Sal 22','Mt 27:46','Mc 15:34'],ks=['bookId','chapter','focus','contextStart','contextEnd','sourceId','sourceUrl','greekIndependentCheck'];
 assert.deepEqual(r.cases.map(c=>c.reference),labels);assert.deepEqual(r.cases.map(c=>c.literaryContextCandidate),['salmo_de_lamento','relato_de_pasion_mateo','relato_de_pasion_marcos']);
 for(const [i,c] of r.cases.entries()){assert.deepEqual(Object.fromEntries(ks.map(k=>[k,c[k]])),Object.fromEntries(ks.map(k=>[k,p.cases[i][k]])));assert.equal(c.reviewQuestion,p.cases[i].question);assert.equal(c.sourceId,sp.references[i].sourceId);assert.ok(sp.references[i].chapterUrls.includes(c.sourceUrl));assert.equal(c.status,'provisional');}
 assert.deepEqual(r.candidateRelations,[{from:'Mt 27:46',to:'Sal 22',kind:'cita_o_evocacion_por_verificar',status:'pendiente_de_cotejo'},{from:'Mc 15:34',to:'Sal 22',kind:'cita_o_evocacion_por_verificar',status:'pendiente_de_cotejo'},{from:'Mt 27:46',to:'Mc 15:34',kind:'paralelo_narrativo_por_verificar',status:'pendiente_de_cotejo'}]);
 const d=s.sources.find(x=>x.id==='P1022-R11');assert.equal(d.locator,r.documentarySource.locator);assert.equal(d.authority,r.documentarySource.authority);
 assert.deepEqual(r.documentarySource,{id:'P1022-R11',locator:'§603',authority:'Santa Sede',scope:'referencia_atribuida_sin_generalizar',permission:'solo_referencia'});
 assert.deepEqual(r.excludedSource,{id:'P1022-R13',reason:'La muestra Jn 1:18 no acredita variantes de Mateo o Marcos.'});
 const study=catalog.items.find(x=>x.id===r.pilot);assert.equal(study.status,'planificado');assert.equal(study.publishedVersion,null);assert.deepEqual(study.initialReferences,labels);assert.deepEqual(study.evidenceIds,[]);assert.ok(study.relatedAxisIds.includes('E03'));
 assert.equal(r.relatedStudy,'SN-023');assert.equal(r.relatedStudyKind,'doctrinal');assert.ok(profiles.links.some(l=>l.a===r.pilot&&l.b===r.relatedStudy&&l.kind===r.relatedStudyKind));
 assert.deepEqual(r.requiredSections,[4,5,6,7,8,10,11,12,13,14,15,17,19,20]);assert.deepEqual(plannedTemplate(r.pilot).map(x=>x.state),Array(20).fill('pendiente'));
 assert.equal(publication.schemaVersion,1);assert.deepEqual(publication.snapshots,[]);
 assert.ok(r.controls.length===5&&r.controls.every(x=>typeof x==='string'&&x.trim()));assert.equal(r.next,'P10.3.5_tras_CI_integracion_y_despliegue');
 return {phase:r.phase,pilot:r.pilot,cases:3,contextUnits:20,greekAnchors:2,candidateRelations:3,sections:20,requiredSections:14,openNeeds:4,publicationAuthorized:false,academicAnalysisCompleted:false};
}
export function auditContracts(){
 const record={schemaVersion:1,studyId:'SN-021',version:'0.0.0',createdAt:'2026-11-26',updatedAt:'2026-11-26',objective:'Control técnico sintético',scope:'Prueba de contratos sin tesis doctrinal',sections:makeSections('SN-021'),claims:[],conclusions:[],reviews:[]};
 const relations={schemaVersion:1,studyId:'SN-021',evidence:[],arguments:[],positions:[],relatedStudies:[{targetStudyId:'SN-023',reason:'Relación doctrinal de prueba'}]};
 const context={studyIds:['SN-021','SN-023'],bibliographyIds:[],resourceIds:[],authorIds:[],disciplineIds:[],traditionIds:[]};
 assert.deepEqual(validateRelations(relations,record,context),[]);
 const bad=structuredClone(record);bad.claims.push({id:'AF-1',studyId:'SN-021',sectionId:'SN-021/S19',proposition:'Afirmación sintética no acreditada',type:'interpretacion_teologica',grade:'explicito',gradeJustification:'Prueba negativa',supportingEvidenceIds:[],opposingEvidenceIds:[],reasoning:'Control sin fuente'});
 assert.ok(validateEditorial(bad,{studyIds:context.studyIds,evidenceIds:[]}).includes('grado fuerte sin evidencia'));
 const missing=structuredClone(relations);missing.positions.push({id:'POS-1',studyId:'SN-021',traditionId:'T03',disciplineIds:[],authorId:'AUT-no',claimIds:[],evidenceIds:[],scope:'Control',authority:'Control',assumptions:'Control',limitations:'Control'});
 assert.ok(validateRelations(missing,record,context).includes('atribución desconocida'));
 return {validEmptyTemplate:true,unsupportedStrongClaimBlocked:true,unattributedPositionBlocked:true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({...validateP1034(loadP1034()),...auditContracts()}));
