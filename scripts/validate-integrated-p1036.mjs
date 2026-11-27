import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadP1031,validateP1031} from './validate-hebrew-p1031.mjs';
import {loadP1032,validateP1032} from './validate-greek-p1032.mjs';
import {loadP1033,validateP1033,auditContracts as covenantContracts} from './validate-covenants-p1033.mjs';
import {loadP1034,validateP1034,auditContracts as christologyContracts} from './validate-christology-p1034.mjs';
import {loadP1035,validateP1035} from './validate-textual-criticism-p1035.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const expected=[
 ['P10.3.1','SN-001','hebreo-p1031','a48d2971e19e04b2c68d11fb818afa15f8b4e3ce',76,45936328551,140300267670,45937908539,'success','cobertura_linguistica_parcial'],
 ['P10.3.2','SN-008','griego-p1032','e529ff7ec45a1901ab30e64244724c30ba8c94ff',77,45938307832,140306525093,45938914102,'success','cobertura_linguistica_parcial'],
 ['P10.3.3','SN-015','pactos-p1033','45870d78b5ebb3967cd2d58810c517df00423f5b',78,45939097913,140309016716,45940134163,'success','aplicacion_normativa_pendiente'],
 ['P10.3.4','SN-021','cristologia-p1034','3fcf12479a6678eae20d5b7dd138f977a0c00d42',79,45940243485,140312661994,45941508512,'success','cotejo_y_atribucion_pendientes'],
 ['P10.3.5','SN-040','critica-textual-p1035','ba49b4c725e7f4fd5c44af53cdc684cb052b1ce2',80,45941627134,140317021067,45941890416,'pending_confirmation','tr_y_colacion_directa_pendientes']
];
export function loadP1036(){return {record:read('docs/P10/registro-validacion-integral-p1036.json'),application:readFileSync('docs/P10/registro-aplicacion-p1023.json'),review:readFileSync('docs/P10/registro-revision-p1024.json'),pilots:expected.map(x=>readFileSync('docs/P10/registro-validacion-'+x[2]+'.json')),publication:read('src/data/publicaciones/registro.json'),linguistic:read('src/data/linguistica/registro.json'),catalog:read('src/data/catalogo/estudios.json'),alignment:read('docs/P9/alineaciones-p931.json')};}
export function validateP1036({record:r,application,review,pilots,publication,linguistic,catalog,alignment}){
 assert.equal(blob(application),'9e1a654fc3fd27a80be1fea127e0dd4cf71e5b14');assert.equal(r.applicationBlob,blob(application));
 assert.equal(blob(review),'46c949dbccf623a110a98b1f2ad8c32a733b89a1');assert.equal(r.reviewBlob,blob(review));
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.3.6');assert.equal(r.baselineMain,'896c11416b429b4d04d83636cb2a2f54c1022d24');assert.equal(r.scope,'consolidacion_tecnica_sin_cierre_academico');
 assert.equal(r.publicationAuthorized,false);assert.equal(r.corpusImportAuthorized,false);assert.equal(r.academicAnalysisCompleted,false);
 const app=JSON.parse(application),rev=JSON.parse(review);
 assert.equal(r.pilots.length,5);assert.equal(pilots.length,5);
 const sections={};let cases=0,rvUnits=0,greekAnchors=0,openNeeds=0;
 for(const [i,[phase,pilot,suffix,sha,pr,run,job,deployRun,deploy,limitation]] of expected.entries()){
  assert.equal(blob(pilots[i]),sha);const old=JSON.parse(pilots[i]);assert.equal(old.phase,phase);assert.equal(old.pilot,pilot);assert.equal(old.academicAnalysisCompleted,false);assert.equal(old.publicationAuthorized,false);
  const x=app.pilots.find(p=>p.id===pilot),n=x.cases.length,u=x.cases.reduce((z,c)=>z+Number(c.contextEnd)-Number(c.contextStart)+1,0),g=x.cases.filter(c=>c.greekIndependentCheck).length;
  assert.deepEqual(r.pilots[i],{phase,pilot,path:'docs/P10/registro-validacion-'+suffix+'.json',blob:sha,pr,run,job,ci:'success',deployRun,deploy,specificTests:6,cases:n,rvUnits:u,greekAnchors:g,limitation});
  cases+=n;rvUnits+=u;greekAnchors+=g;openNeeds+=x.openNeeds.length;assert.deepEqual(x.evidenceIds,[]);assert.deepEqual(x.conclusions,[]);
  for(const s of x.sections)sections[s.status]=(sections[s.status]||0)+1;
 }
 assert.deepEqual([cases,rvUnits,greekAnchors,openNeeds],[17,101,11,20]);
 assert.deepEqual(sections,{preparada_desde_delimitacion:10,parcial_requiere_revision:15,pendiente:74,parcial_referencia_documental_previa:1});
 const sample=JSON.parse(pilots[4]).sample;
 const summary={pilots:5,cases,rvUnits,greekAnchors,specificTests:30,linguisticPositiveControls:3,linguisticControlTokens:30,blockedLinguisticCases:8,documentaryVariants:1,secondaryAttestations:sample.secondaryAttestations,directInspections:sample.directInspections,verifiedAlignments:0,academicSections:100,prepared:10,partial:16,pending:74,openNeeds,academicStudiesCompleted:0,publishedStudies:0};
 assert.deepEqual(r.results,summary);assert.deepEqual(r.carryForward,rev.findings.map(f=>f.id));assert.ok(rev.findings.every(f=>f.status==='abierta'));
 assert.equal(publication.schemaVersion,1);assert.deepEqual(publication.snapshots,[]);assert.equal(linguistic.schemaVersion,1);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(linguistic[k],[]);
 assert.ok(catalog.items.every(s=>s.status==='planificado'&&s.publishedVersion===null));assert.equal(alignment.publicationAuthorized,false);assert.deepEqual(alignment.alignments,[]);assert.deepEqual(alignment.evidence,[]);
 assert.equal(r.next.phase,'P10.4');assert.equal(r.next.status,'condicionada_a_CI_integracion_y_despliegue');assert.ok(r.next.required.includes('P11.4'));
 return summary;
}
export function reconcileExisting(){
 const h=validateP1031(loadP1031()),g=validateP1032(loadP1032()),c=validateP1033(loadP1033()),x=validateP1034(loadP1034()),t=validateP1035(loadP1035());
 assert.deepEqual([h.uncoveredPilotCases,g.pilotCases,c.cases,x.cases,t.variants],[2,6,5,3,1]);
 assert.deepEqual(covenantContracts(),{validEmptyTemplate:true,unsupportedStrongClaimBlocked:true,missingComparisonJustificationBlocked:true});
 assert.deepEqual(christologyContracts(),{validEmptyTemplate:true,unsupportedStrongClaimBlocked:true,unattributedPositionBlocked:true});
 return {validatorsReconciled:5,editorialContractAudits:2};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({phase:'P10.3.6',...validateP1036(loadP1036()),...reconcileExisting()}));
