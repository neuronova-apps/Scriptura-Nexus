import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const sources=[
['docs/P9/admisiones-ediciones-p912.json','ed258f7067315a91814fb8f222af696ed9d0d303'],
['docs/P8/revision-publicacion-p85.json','30c2c3d5719eefd08ae059bfbe37ce1958b961cc'],
['docs/P10/registro-validacion-hebreo-p1031.json','a48d2971e19e04b2c68d11fb818afa15f8b4e3ce'],
['docs/P10/registro-validacion-griego-p1032.json','e529ff7ec45a1901ab30e64244724c30ba8c94ff'],
['docs/P10/registro-validacion-critica-textual-p1035.json','ba49b4c725e7f4fd5c44af53cdc684cb052b1ce2'],
['docs/P9/muestra-manuscritos-p943.json','3c283e6bd9f0d4aab2ba939e0667753fae1b8053'],
['docs/P9/proyeccion-ediciones-p913.json','ff6ef60588416089b26afcc6160df74956b496df'],
['docs/P10/registro-cierre-p104.json','39fb4a7da8d3282b02dbc9742b2b9010c5bb8f27']];
export function loadP1141(){return {record:read('docs/P11/registro-seleccion-funcional-p1141.json'),closure:readFileSync('docs/P11/registro-cierre-accesibilidad-p113.json'),proposal:readFileSync('docs/P11/04-propuesta-alcance-publicacion.md'),sources:sources.map(([p])=>readFileSync(p)),publication:read('src/data/publicaciones/registro.json'),linguistic:read('src/data/linguistica/registro.json'),alignment:read('docs/P9/alineaciones-p931.json')};}
export function validateP1141({record:r,closure,proposal,sources:bytes,publication,linguistic,alignment}){
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.1');assert.equal(r.baselineMain,'4f2f48d6d1a3cbb543b285ae0bf08f406b448bb5');
 assert.deepEqual(r.approval,{option:'B',origin:'declaracion_del_responsable_en_conversacion',date:'2026-11-27',scope:'ampliacion_funcional_previa_a_publicacion',individualResourcePublicationApproved:false});
 assert.equal(blob(closure),'66a5ba47d2b05bab1f58168613c22afc33aa6388');assert.equal(blob(proposal),'71140c96f69195b0bcea507d8d3d793fc311f69a');
 assert.deepEqual(r.previousClosure,{pr:86,deployRun:45949291089,build:'success',deploy:'success',closureBlob:blob(closure),proposalBlob:blob(proposal)});
 assert.deepEqual(r.sourceRecords,sources.map(([path,blob])=>({path,blob})));assert.deepEqual(bytes.map(blob),sources.map(x=>x[1]));
 const [ed,l,h,g,tr,sample,projection,close]=bytes.map(b=>JSON.parse(b));
 for(const k of ['publicationAuthorized','corpusImportAuthorized','releaseScopeApproved','academicAnalysisCompleted'])assert.equal(r[k],false);
 assert.equal(ed.publication.authorized,false);assert.ok(ed.decisions.every(x=>x.admissionStatus==='admitido'&&x.projectPublication.approved===false));
 assert.deepEqual(r.selection.reader.map(x=>[x.id,x.edition,x.books,x.priority,x.status,x.condition]),[['ED-C01','TXT-RV1909',66,'inicial','seleccionado_para_revision_de_publicacion','declaracion_proveedor_y_revision_territorial_pendiente'],['ED-C02','TXT-SBLGNT-V1-2',27,'inicial','seleccionado_para_revision_de_publicacion','CC_BY_4_0_atribucion_y_cambios']]);
 assert.deepEqual(r.selection.reader.map(x=>x.books),projection.editions.map(x=>x.coverageBookIds.length));
 assert.equal(ed.decisions[0].license.territorialLegalOpinion,false);assert.equal(ed.decisions[1].license.type,'CC BY 4.0');
 assert.equal(l.publication,false);assert.deepEqual(r.selection.linguisticExisting.map(x=>x.id),l.existing.map(x=>x.id));assert.ok(l.existing.every(x=>x.publication===false));assert.deepEqual(r.selection.linguisticExisting.map(x=>x.priority),['condicional',...Array(8).fill('inicial')]);
 const candidates=r.selection.linguisticExpansion;
 assert.deepEqual(candidates.map(x=>[x.book,x.path,x.candidateId,x.priority,x.status]),[['Lev','wlc/Lev.xml','EXP-C02','piloto','no_admitido'],['Deut','wlc/Deut.xml',null,'piloto','no_admitido'],['Acts','65-Ac-morphgnt.txt',null,'piloto','no_admitido'],['1Cor','67-1Co-morphgnt.txt',null,'piloto','no_admitido'],['Exod','wlc/Exod.xml','EXP-C01','posterior','no_admitido'],['Ezra','wlc/Ezra.xml','EXP-C03','posterior','no_admitido']]);
 assert.deepEqual(candidates.slice(0,4).map(x=>x.path),[...h.candidateMetadata.files,...g.candidateMetadata.files].map(x=>x.path));assert.ok([...h.candidateMetadata.files,...g.candidateMetadata.files].every(x=>x.admitted===false));assert.ok(l.expansion.every(x=>x.publication===false&&x.review==='propuesto_no_admitido'));
 assert.deepEqual(r.selection.greekLexiconCandidates,g.lexicalCandidatesDeferred);assert.equal(tr.trCandidate.status,'no_admitida');assert.equal(tr.trCandidate.fileSelected,false);
 assert.deepEqual(r.selection.comparator,{initialEditions:projection.editions.map(x=>x.id),trCandidate:tr.trCandidate.sourceId,trStatus:'no_admitido',verifiedAlignments:0,independentConsultationOnlyUntilAlignment:true});
 assert.deepEqual(r.selection.manuscripts,{sample:'P9.4.3',resources:sample.resources.length,evidence:sample.evidence.length,secondaryAttestations:tr.sample.secondaryAttestations,directInspections:0,status:'seleccionado_para_revision_documental_no_publicado'});
 assert.ok(close.decisions.every(x=>x.gap==='abierta'));assert.equal(r.gates.length,8);assert.equal(new Set(r.gates).size,8);
 assert.deepEqual(r.route.map(x=>x.id),[...Array.from({length:8},(_,i)=>'P11.4.'+(i+1)),'P11.5']);assert.ok(r.route.every(x=>x.status==='pendiente'));
 assert.deepEqual(r.progress,{originalCompleted:60,originalTotal:62,expandedCompleted:60,expandedTotal:69,afterVerifiedClosure:61});assert.equal(r.next,'P11.4.2_tras_CI_integracion_despliegue_y_revision_de_permisos_ediciones');
 assert.deepEqual(publication.snapshots,[]);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(linguistic[k],[]);
 assert.equal(alignment.publicationAuthorized,false);assert.deepEqual(alignment.alignments,[]);assert.deepEqual(alignment.evidence,[]);
 return {phase:r.phase,option:'B',readerCandidates:2,readerBookFiles:93,linguisticExisting:9,linguisticExpansionCandidates:6,pilotPriority:4,greekLexiconCandidates:2,documentarySampleResources:7,openFindings:5,publicationAuthorized:false,expandedTotal:69,completedAfterClosure:61};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP1141(loadP1141())));
