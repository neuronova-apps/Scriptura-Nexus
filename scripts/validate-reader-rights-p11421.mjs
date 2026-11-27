import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadP11421(){return {record:read('docs/P11/registro-permisos-lector-p11421.json'),selection:readFileSync('docs/P11/registro-seleccion-funcional-p1141.json'),admissions:readFileSync('docs/P9/admisiones-ediciones-p912.json'),projection:readFileSync('docs/P9/proyeccion-ediciones-p913.json'),publication:read('src/data/publicaciones/registro.json'),linguistic:read('src/data/linguistica/registro.json'),alignment:read('docs/P9/alineaciones-p931.json')};}
export function validateP11421({record:r,selection,admissions,projection,publication,linguistic,alignment}){
 for(const [bytes,field,sha] of [[selection,'selectionBlob','43d971ae286a979c3d58a0c2f475cd219e112024'],[admissions,'admissionsBlob','ed258f7067315a91814fb8f222af696ed9d0d303'],[projection,'projectionBlob','ff6ef60588416089b26afcc6160df74956b496df']]){assert.equal(blob(bytes),sha);assert.equal(r[field],sha);}
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.2.1');assert.equal(r.baselineMain,'67789ae1fc374592cb599fb540e8da0482767c0b');
 assert.deepEqual(r.previousIntegration,{pr:87,workflowRun:45949709479,job:140342478333,successfulWorkflows:19,deployRun:45950611947,deploy:'pending_confirmation'});
 assert.equal(r.reviewDate,'2026-11-27');assert.equal(r.scope,'revision_de_permisos_y_preparacion_de_adaptador_sin_redistribucion');
 const s=JSON.parse(selection),a=JSON.parse(admissions),p=JSON.parse(projection);
 assert.equal(s.approval.option,'B');assert.equal(s.approval.individualResourcePublicationApproved,false);
 assert.equal(a.publication.authorized,false);assert.equal(r.editions.length,2);
 const rights=[['Public Domain declarado por eBible.org',['https://ebible.org/spaRV1909/copyright.htm','https://ebible.org/find/details.php?id=spaRV1909'],'pendiente'],['CC BY 4.0',['https://www.sblgnt.com/license/','https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/LICENSE','https://creativecommons.org/licenses/by/4.0/'],'licencia_publica_documentada_no_dictamen_juridico']];
 for(let i=0;i<2;i++){
  const d=a.decisions[i],e=p.editions[i],m=p.corpusManifests[i],x=r.editions[i],c=s.selection.reader[i];
  assert.equal(d.admissionStatus,'admitido');assert.equal(d.projectPublication.approved,false);assert.equal(d.scope.alignmentAllowed,false);
  assert.equal(c.id,d.id);assert.equal(c.edition,e.id);
  assert.deepEqual(x,{id:d.id,editionId:e.id,version:e.version,books:e.coverageBookIds.length,units:m.integrity.unitCount,emptyMarkers:m.integrity.emptyUnitCount,source:i===0?d.sourceArchive.url:'https://github.com/Faithlife/SBLGNT/tree/'+d.sourceCommit,revision:e.sourceRevision,license:rights[i][0],rightsSources:rights[i][1],territorialReview:rights[i][2],technicalPreparation:'permitida_en_memoria_segun_P9',publicReleaseDecision:'pendiente',authorizationRef:null,attribution:e.attribution,transformations:i===0?p.textPolicies.rv1909:p.textPolicies.sblgnt});
  assert.equal(e.referencePolicy,'source_native_unmapped');assert.equal(m.publicationEnabled,false);
 }
 assert.equal(a.decisions[0].license.territorialLegalOpinion,false);assert.equal(a.decisions[1].license.type,'CC BY 4.0');assert.equal(a.decisions[1].license.url,'https://creativecommons.org/licenses/by/4.0/');
 assert.deepEqual(r.requirements,['fuentes_fijadas_y_huellas_verificadas','alcance_texto_principal_y_etiquetas_nativas','atribucion_licencia_enlace_y_transformaciones_visibles','decision_explicita_por_edicion','revision_territorial_RV1909_antes_de_publicar','fragmentos_gzip_hasta_250_KiB_y_validacion_de_integridad','ninguna_alineacion_inferida','pruebas_y_revision_privacidad_antes_de_habilitar']);
 for(const k of ['publicationAuthorized','corpusImportAuthorized','releaseScopeApproved','alignmentAuthorized'])assert.equal(r[k],false);
 assert.deepEqual(publication.snapshots,[]);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(linguistic[k],[]);
 assert.equal(alignment.publicationAuthorized,false);assert.deepEqual(alignment.alignments,[]);assert.deepEqual(alignment.evidence,[]);
 assert.deepEqual(r.progress,{completed:61,total:69,afterReaderClosure:62});assert.equal(r.next,'P11.4.2.2_proyeccion_aislada_tras_CI_integracion_y_despliegue');
 return {phase:r.phase,editions:2,bookFiles:93,units:39041,emptyMarkers:18,releaseDecisionsPending:2,territorialReviewPending:1,publicationAuthorized:false,corpusImportAuthorized:false,completed:61,total:69};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP11421(loadP11421())));
