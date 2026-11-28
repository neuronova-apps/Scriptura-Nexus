import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {parseBibliography} from '../src/lib/bibliography-contracts.ts';
import {parsePermissions,publicationAdmissions} from '../src/lib/source-permissions.ts';
import {validateEditorial} from '../src/lib/editorial-contracts.ts';
import {validateRelations} from '../src/lib/editorial-relations.ts';
import {reviewedContentDigest} from '../src/lib/publication.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='docs/investigaciones/';
const paths={
 manuscript:dir+'SN-001-levitico-19-28.md',
 integration:dir+'SN-001-candidato-integracion.json',
 editorial:dir+'SN-001-registro-editorial-531.json',
 prereg:dir+'SN-001-pre-registro-editorial-531.json',
 bibliography:dir+'SN-001-biblioteca-candidato.json',
 permissions:dir+'SN-001-permisos-candidato.json'
};
const gitBlob=p=>{const data=readFileSync(p);return createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');};
const manuscript=readFileSync(paths.manuscript,'utf8');
const integration=read(paths.integration);
const editorial=read(paths.editorial);
const prereg=read(paths.prereg);
const bibliography=read(paths.bibliography);
const permissions=read(paths.permissions);
const consolidated=read(dir+'SN-001-registro-consolidado-553.json');
const record=consolidated.record;
const relations=consolidated.relations;
const bodies=consolidated.bodies;
const publication=read('src/data/publicaciones/registro.json');
const methodology=await import('../src/lib/methodology.ts');
const traditions=read('src/data/taxonomia/tradiciones.json').items.map(x=>x.id);
const b=parseBibliography(bibliography,traditions);
const p=parsePermissions(permissions,b);
const admissions=publicationAdmissions(b,p);
assert.equal(consolidated.phase,'5.5.3');
assert.equal(consolidated.status,'consolidado_con_reservas_no_aprobado');
assert.equal(consolidated.publicationAuthorized,undefined,'La autorización no debe aparecer en el nivel del paquete');
assert.equal(consolidated.editorialDisposition.publicationAuthorized,false);
assert.equal(record.version,editorial.version);
assert.equal(consolidated.version,record.version);
assert.match(consolidated.sourceManuscriptCommit,/^[a-f0-9]{40}$/);
for(const path of Object.values(paths)){
 const key=Object.entries(paths).find(([,v])=>v===path)[0];
 assert.equal(consolidated.sourceDigests[path],gitBlob(path),'SHA Git de origen desactualizado: '+key);
}
assert.equal(integration.source.blob,gitBlob(paths.manuscript),'El puntero del candidato no coincide con el manuscrito actual');
const headings=[...manuscript.matchAll(/^## S(\d{2})\./gm)].map(m=>Number(m[1]));
assert.deepEqual(headings,Array.from({length:20},(_,i)=>i+1),'El manuscrito no contiene exactamente S01-S20 en orden');
assert.equal(integration.sections.length,20);
assert.equal(editorial.sections.length,20);
assert.equal(record.sections.length,20);
assert.deepEqual(record.sections.map(s=>s.id),integration.sections.map(s=>s.id),'IDs de sección desalineados');
assert.deepEqual(record.sections.map(s=>s.title),methodology.studySections,'Títulos canónicos desalineados con metodología');
const candidateById=new Map(integration.sections.map(s=>[s.id,s]));
const sectionAudit=record.sections.map(s=>{
 const c=candidateById.get(s.id);
 assert.ok(c,'Sección candidata ausente '+s.id);
 if(s.applicability==='analizada'){
  assert.equal(s.contentRef,s.id,'Referencia de cuerpo incorrecta '+s.id);
  assert.equal(bodies[s.id],c.body,'Cuerpo editorial distinto del candidato '+s.id);
  return {id:s.id,order:s.order,title:s.title,state:'analizada',candidateStatus:c.status,bodyMatch:true,justificationMatch:null,evidenceCount:s.evidenceIds.length};
 }
 assert.equal(s.applicability,'no_aplicable','Estado inesperado '+s.id);
 assert.equal(s.justification,c.body,'La justificación no coincide con el candidato '+s.id);
 assert.equal(Object.hasOwn(bodies,s.id),false,'Sección fuera de alcance tiene cuerpo editorial '+s.id);
 return {id:s.id,order:s.order,title:s.title,state:'fuera_de_alcance_delimitado',candidateStatus:c.status,bodyMatch:null,justificationMatch:true,evidenceCount:s.evidenceIds.length,justification:s.justification};
});
assert.equal(sectionAudit.filter(s=>s.state==='analizada').length,14);
assert.equal(sectionAudit.filter(s=>s.state==='fuera_de_alcance_delimitado').length,6);
assert.equal(relations.evidence.length,8);
const evidenceIds=new Set(relations.evidence.map(e=>e.id));
for(const claim of record.claims){
 for(const eid of [...claim.supportingEvidenceIds,...claim.opposingEvidenceIds])assert.ok(evidenceIds.has(eid),'Afirmación con evidencia inexistente '+claim.id+'/'+eid);
}
const claimIds=new Set(record.claims.map(c=>c.id));
for(const conclusion of record.conclusions)for(const cid of conclusion.claimIds)assert.ok(claimIds.has(cid),'Conclusión con afirmación inexistente '+conclusion.id+'/'+cid);
assert.equal(record.claims.length,5);
assert.equal(record.conclusions.length,3);
assert.equal(prereg.conclusions.length,record.conclusions.length);
assert.deepEqual(record.conclusions.map(c=>({claimIds:c.claimIds,synthesis:c.synthesis,outcome:c.outcome,grade:c.grade})),prereg.conclusions.map(c=>({claimIds:c.claims.map(id=>'AF-'+String(Number(id.slice(1))).padStart(6,'0')),synthesis:c.synthesis,outcome:c.outcome,grade:c.grade})),'Conclusiones no corresponden al preregistro');
assert.ok(relations.evidence.every(e=>e.bibliographyId==='BIB-000007'&&e.resourceId==='REC-000007'),'Las evidencias actuales no comparten el recurso RV1909 esperado por la auditoría');
assert.ok(relations.evidence.every(e=>e.permission==='pendiente'),'Una evidencia cambió de estado de permiso sin aprobación');
assert.equal(permissions.items.length,b.resources.length);
assert.ok(permissions.items.every(x=>x.decision==='pendiente'&&x.authorizationRef===null&&x.reviewerRole===null));
assert.equal(admissions.length,0,'Hay una admisión de publicación no autorizada');
assert.equal(integration.passages.length,8);
assert.ok(integration.passages.every(x=>x.sourceAdmission==='pendiente'&&x.verification==='requiere_cotejo_documentado'));
assert.equal(integration.terms.length,12);
assert.ok(integration.terms.every(x=>x.verification==='reportada_no_admitida'));
assert.equal(b.works.filter(w=>/septuagint|septuaginta|lxx/i.test(w.title)).length,0,'Se registró una fuente LXX que requiere actualizar esta auditoría');
assert.equal(publication.snapshots.length,0,'La consolidación no debe crear publicaciones');
assert.equal(record.reviews.length,1);
assert.equal(record.reviews[0].result,'pendiente','La consolidación no puede aprobar por sí misma el contenido');
assert.ok(record.reviews[0].controls.every(c=>c.result==='pendiente'));
assert.equal(consolidated.editorialDisposition.ownerApprovalRequired,true);
assert.equal(consolidated.editorialDisposition.permissionDecisionsApproved,0);
assert.equal(consolidated.editorialDisposition.publicationAdmissions,0);
assert.deepEqual(validateEditorial(record,{studyIds:['SN-001'],evidenceIds:[...evidenceIds]}),[],'El registro consolidado no cumple su contrato editorial');
const context={studyIds:['SN-001'],bibliographyIds:b.editions.map(x=>x.id),resourceIds:b.resources.map(x=>x.id),authorIds:b.authors.map(x=>x.id),disciplineIds:[],traditionIds:traditions,resourceEditionIds:Object.fromEntries(b.resources.map(x=>[x.id,x.editionId])),admittedSources:admissions};
assert.deepEqual(validateRelations(relations,record,context),[],'Las relaciones editoriales no cumplen su contrato');
const contentDigest=reviewedContentDigest({studyId:record.studyId,version:record.version,previousVersion:null,record,relations,bodies});
const findings=[
 {id:'REV-553-001',severity:'bloqueante_publicacion',area:'trazabilidad_linguistica',sections:['SN-001/S07','SN-001/S10','SN-001/S17'],claims:['AF-000002','AF-000004'],detail:'Las ocho evidencias editoriales están vinculadas a Reina-Valera 1909. Esa edición no acredita por sí sola lemas, raíces, morfología ni identificadores Strong.',requiredAction:'Vincular evidencias a fuentes hebreas concretas y cotejadas, con localizador exacto. Mantener los datos lingüísticos como reportados y no admitidos mientras falte ese cotejo.'},
 {id:'REV-553-002',severity:'bloqueante_publicacion',area:'septuaginta',sections:['SN-001/S09'],claims:[],detail:'La comparación griega se describe como preliminar, pero no existe una edición ni recurso de Septuaginta registrado en la bibliografía y permisos. La evidencia asignada a S09 remite a Reina-Valera 1909.',requiredAction:'Registrar edición, recurso, procedencia y permisos de la fuente griega antes de usar la comparación como evidencia admitida; de lo contrario conservarla solo como observación preliminar.'},
 {id:'REV-553-003',severity:'bloqueante_publicacion',area:'datos_linguisticos',sections:['SN-001/S07','SN-001/S11'],claims:['AF-000002'],detail:'Los doce términos lingüísticos conservan el estado reportada_no_admitida y los ocho pasajes mantienen sourceAdmission pendiente y verificación requiere_cotejo_documentado.',requiredAction:'No presentar morfología, Strong, raíces ni ocurrencias como verificadas hasta completar el cotejo exacto y registrar la evidencia de origen.'},
 {id:'REV-553-004',severity:'bloqueante_publicacion',area:'licencias_y_permisos',sections:['SN-001/S20'],claims:[],detail:'Las trece decisiones de permisos continúan pendientes. Las condiciones de licencia documentadas no equivalen a aprobación de cita, reproducción, adaptación o redistribución.',requiredAction:'Mantener bloqueada la publicación de citas, extractos, corpus y adaptaciones hasta que exista una decisión editorial y autorización aplicable.'},
 {id:'REV-553-005',severity:'reserva_editorial',area:'versionado',sections:['SN-001/S01','SN-001/S20'],claims:[],detail:'Los artefactos conservan etiquetas distintas: manuscrito 0.4, candidato de integración 0.4.0 y registro editorial 0.4.3. El candidato apunta al blob actual del manuscrito, pero aún no existe una única versión exacta aprobada.',requiredAction:'En 5.5.4 fijar explícitamente el artefacto y la versión exacta sometidos a aprobación; no equiparar automáticamente las tres etiquetas.'},
 {id:'REV-553-006',severity:'reserva_de_alcance',area:'secciones_fuera_de_alcance',sections:['SN-001/S08','SN-001/S12','SN-001/S13','SN-001/S14','SN-001/S15','SN-001/S16'],claims:[],detail:'Seis secciones están justificadas como no desarrolladas dentro del alcance aprobado. No representan resultados negativos ni una revisión exhaustiva de crítica textual, recepción histórica o posturas confesionales.',requiredAction:'Conservar las delimitaciones y no presentar el estudio como cobertura exhaustiva de esas perspectivas.'},
 {id:'REV-553-007',severity:'bloqueante_aprobacion',area:'revision_exacta',sections:record.sections.map(s=>s.id),claims:[],detail:'El registro mantiene la revisión pendiente y los controles críticos sin aprobación. No existe aprobación del contenido exacto ni huella revisada aprobada.',requiredAction:'La aprobación debe realizarse sobre una versión inmutable y una huella exacta; la validación automatizada no sustituye la aprobación académica del responsable.'}
];
const report={schemaVersion:1,studyId:'SN-001',phase:'5.5.3',status:'consolidado_con_reservas_no_aprobado',reviewedAt:'2026-11-28',contentDigest,coverage:{manuscriptHeadings:headings.length,sections:sectionAudit.length,analyzedSections:14,outOfScopeSections:6,evidence:relations.evidence.length,claims:record.claims.length,conclusions:record.conclusions.length,passages:integration.passages.length,terms:integration.terms.length,termsNotAdmitted:integration.terms.filter(x=>x.verification==='reportada_no_admitida').length,bibliographyAuthors:b.authors.length,bibliographyWorks:b.works.length,bibliographyEditions:b.editions.length,inventorySources:b.sources.length,resources:b.resources.length,licenses:b.licenses.length,permissionDecisions:permissions.items.length,permissionDecisionsPending:permissions.items.filter(x=>x.decision==='pendiente').length,publicationAdmissions:admissions.length,publicSnapshots:publication.snapshots.length,allEvidenceLinkedToRv1909:true,allAnalyzedBodiesMatchCandidate:true,allOutOfScopeJustificationsMatchCandidate:true,manuscriptBlobPointerVerified:true,editorialContractValid:true,relationsContractValid:true},sections:sectionAudit,claims:record.claims,conclusions:record.conclusions,findings,publicationAuthorized:false,ownerApprovalRecorded:false,exactVersionApproved:false};
mkdirSync('sn001-validation-output',{recursive:true});
writeFileSync('sn001-validation-output/consolidation-553-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({phase:report.phase,status:report.status,contentDigest,coverage:report.coverage,findings:findings.map(f=>({id:f.id,severity:f.severity,area:f.area})),publicationAuthorized:false},null,2));
