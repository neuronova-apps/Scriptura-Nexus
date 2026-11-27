import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {validateManuscriptPilot} from '../src/lib/manuscript-pilot.ts';
import {createManuscriptView,emptyManuscriptRelease} from '../src/lib/manuscript-view.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadP1035(){return {record:read('docs/P10/registro-validacion-critica-textual-p1035.json'),previous:readFileSync('docs/P10/registro-validacion-cristologia-p1034.json'),application:readFileSync('docs/P10/registro-aplicacion-p1023.json'),sources:readFileSync('docs/P10/registro-fuentes-p1022.json'),sampleBytes:readFileSync('docs/P9/muestra-manuscritos-p943.json'),projection:read('docs/P9/proyeccion-ediciones-p913.json'),admissions:read('docs/P9/admisiones-ediciones-p912.json'),alignment:read('docs/P9/alineaciones-p931.json'),publication:read('src/data/publicaciones/registro.json')};}
export function validateP1035({record:r,previous,application,sources,sampleBytes,projection,admissions,alignment,publication}){
 for(const [bytes,actual,expected] of [[previous,r.previousBlob,'3fcf12479a6678eae20d5b7dd138f977a0c00d42'],[application,r.applicationBlob,'9e1a654fc3fd27a80be1fea127e0dd4cf71e5b14'],[sources,r.sourceBlob,'bd180877a71a2c59adee9d92fd4111e9d9985e79'],[sampleBytes,r.sampleBlob,'3c283e6bd9f0d4aab2ba939e0667753fae1b8053']]){assert.equal(blob(bytes),expected);assert.equal(actual,expected);}
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.3.5');assert.equal(r.baselineMain,'4d9c908bf597494ab63aca0dd709213136f58478');
 assert.deepEqual(r.previousIntegration,{pr:79,workflowRun:45940243485,deployRun:45941508512,deploy:'pending_confirmation'});
 assert.equal(r.pilot,'SN-040');assert.equal(r.scope,'validacion_documental_y_barreras_de_comparacion');assert.equal(r.publicationAuthorized,false);assert.equal(r.corpusImportAuthorized,false);assert.equal(r.academicAnalysisCompleted,false);
 const p=JSON.parse(application).pilots.find(x=>x.id===r.pilot),s=JSON.parse(sources),sp=s.pilots.find(x=>x.id===r.pilot);
 const keys=['bookId','chapter','focus','contextStart','contextEnd','sourceId','sourceUrl'];
 assert.deepEqual(Object.fromEntries(keys.map(k=>[k,r.case[k]])),Object.fromEntries(keys.map(k=>[k,p.cases[0][k]])));
 assert.equal(r.case.reference,'Jn 1:18');assert.equal(r.case.status,'candidato_no_referencia_original');assert.ok(sp.references[0].reference.includes('candidato'));
 assert.deepEqual(r.openNeeds,p.openNeeds);assert.deepEqual(r.openNeeds,sp.needs.map(n=>n.need));assert.ok(sp.needs.every(n=>n.status==='cobertura_parcial_pendiente'));
 const m=JSON.parse(sampleBytes);assert.deepEqual(validateManuscriptPilot(m,projection),[]);
 const reg=m.registry;const variant=reg.variants[0];assert.deepEqual(r.sample,{editionId:reg.editions[0].textualEditionId,variantId:variant.id,resources:m.resources.length,evidence:m.evidence.length,witnessIds:reg.witnesses.map(w=>w.id),readingIds:reg.readings.map(x=>x.id),secondaryAttestations:reg.readings.reduce((n,x)=>n+x.witnessAttestations.length,0),directInspections:0,assessment:variant.assessment.status,apparatusProvidesWitnesses:false,folioVerified:false,handVerified:false});
 assert.equal(reg.automaticAlignment,false);assert.equal(reg.automaticWitnessAttribution,false);assert.ok(m.readingRepresentation.every(x=>x.attestationBasis==='secondary_report'&&x.directManuscriptInspection===false&&x.apparatusProvidesWitnesses===false&&x.folioVerified===false&&x.handVerified===false));
 const tr=s.sources.find(x=>x.id==='P1022-R12');assert.deepEqual(r.trCandidate,{sourceId:tr.id,title:tr.title,url:tr.url,status:'no_admitida',fileSelected:false,sha256:null,permission:'pendiente'});
 assert.deepEqual(admissions.decisions.filter(x=>x.admissionStatus==='admitido').map(x=>x.id),['ED-C01','ED-C02']);assert.deepEqual(projection.editions.map(x=>x.id),['TXT-RV1909','TXT-SBLGNT-V1-2']);
 assert.equal(alignment.publicationAuthorized,false);assert.deepEqual(alignment.alignments,[]);assert.deepEqual(alignment.evidence,[]);
 assert.deepEqual(r.comparisonControls,{unavailableTargetTestId:'TXT-P1035-TR-NOT-ADMITTED',expectedTRStatus:'edition_unavailable',expectedRV1909SBLGNTStatus:'not_aligned',verifiedAlignments:0,originalReadingDetermined:false});
 assert.equal(publication.schemaVersion,1);assert.deepEqual(publication.snapshots,[]);assert.equal(r.next,'P10.3.6_tras_CI_integracion_y_despliegue');
 const view=createManuscriptView(emptyManuscriptRelease());assert.equal(view.available,false);assert.deepEqual(view.variants(),[]);assert.deepEqual(view.witnesses(),[]);
 return {phase:r.phase,pilot:r.pilot,contextUnits:5,greekAnchors:1,variants:1,witnesses:2,readings:2,resources:7,evidence:8,secondaryAttestations:2,directInspections:0,verifiedAlignments:0,openNeeds:4,academicAnalysisCompleted:false,publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP1035(loadP1035())));
