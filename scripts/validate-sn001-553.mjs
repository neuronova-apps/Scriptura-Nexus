import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {parseBibliography} from '../src/lib/bibliography-contracts.ts';
import {parsePermissions,publicationAdmissions} from '../src/lib/source-permissions.ts';
import {validateEditorial} from '../src/lib/editorial-contracts.ts';
import {validateRelations} from '../src/lib/editorial-relations.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='docs/investigaciones/';
const manuscriptPath=dir+'SN-001-levitico-19-28.md';
const integrationPath=dir+'SN-001-candidato-integracion.json';
const editorialPath=dir+'SN-001-registro-editorial-531.json';
const preregPath=dir+'SN-001-pre-registro-editorial-531.json';
const bibliographyPath=dir+'SN-001-biblioteca-candidato.json';
const permissionsPath=dir+'SN-001-permisos-candidato.json';
const manuscript=readFileSync(manuscriptPath,'utf8');
const integration=read(integrationPath);
const editorial=read(editorialPath);
const prereg=read(preregPath);
const bibliography=read(bibliographyPath);
const permissions=read(permissionsPath);
const publication=read('src/data/publicaciones/registro.json');
const methodology=await import('../src/lib/methodology.ts');
const traditions=read('src/data/taxonomia/tradiciones.json').items.map(x=>x.id);
const b=parseBibliography(bibliography,traditions);
const p=parsePermissions(permissions,b);
const admissions=publicationAdmissions(b,p);
const blob=createHash('sha1').update('blob '+Buffer.byteLength(manuscript)+'\\0').update(manuscript).digest('hex');
assert.equal(integration.source.blob,blob,'El puntero del candidato no coincide con el manuscrito actual');
assert.match(integration.source.commit,/^[a-f0-9]{40}$/,'Commit de origen inválido');
const headings=[...manuscript.matchAll(/^## S(\\d{2})\\./gm)].map(m=>Number(m[1]));
assert.deepEqual(headings,Array.from({length:20},(_,i)=>i+1),'El manuscrito no contiene exactamente S01-S20 en orden');
assert.equal(integration.sections.length,20);
assert.equal(editorial.sections.length,20);
assert.deepEqual(editorial.sections.map(s=>s.id),integration.sections.map(s=>s.id),'IDs de sección desalineados');
assert.deepEqual(editorial.sections.map(s=>s.title),methodology.studySections,'Títulos canónicos desalineados con metodología');
const candidateById=new Map(integration.sections.map(s=>[s.id,s]));
const sectionAudit=editorial.sections.map(s=>{
 const c=candidateById.get(s.id);
 assert.ok(c,'Sección candidata ausente '+s.id);
 if(s.applicability==='analizada'){
  assert.equal(s.contentRef,s.id,'Referencia de cuerpo incorrecta '+s.id);
  assert.equal(editorial.bodies[s.id],c.body,'Cuerpo editorial distinto del candidato '+s.id);
  return {id:s.id,order:s.order,title:s.title,state:'analizada',candidateStatus:c.status,bodyMatch:true,justificationMatch:null};
 }
 assert.equal(s.applicability,'no_aplicable','Estado inesperado '+s.id);
 assert.equal(s.justification,c.body,'La justificación no coincide con el candidato '+s.id);
 assert.equal(Object.hasOwn(editorial.bodies,s.id),false,'Sección fuera de alcance tiene cuerpo editorial '+s.id);
 return {id:s.id,order:s.order,title:s.title,state:'fuera_de_alcance_delimitado',candidateStatus:c.status,bodyMatch:null,justificationMatch:true,justification:s.justification};
});
assert.equal(sectionAudit.filter(s=>s.state==='analizada').length,14);
assert.equal(sectionAudit.filter(s=>s.state==='fuera_de_alcance_delimitado').length,6);
assert.equal(editorial.evidence.length,8);
const evidenceIds=new Set(editorial.evidence.map(e=>e.id));
for(const claim of editorial.claims){
 for(const eid of [...claim.supportingEvidenceIds,...claim.opposingEvidenceIds])assert.ok(evidenceIds.has(eid),'Afirmación con evidencia inexistente '+claim.id+'/'+eid);
}
const claimIds=new Set(editorial.claims.map(c=>c.id));
for(const conclusion of editorial.conclusions)for(const cid of conclusion.claimIds)assert.ok(claimIds.has(cid),'Conclusión con afirmación inexistente '+conclusion.id+'/'+cid);
assert.equal(editorial.claims.length,5);
assert.equal(editorial.conclusions.length,3);
assert.equal(prereg.conclusions.length,editorial.conclusions.length);
assert.deepEqual(editorial.conclusions.map(c=>({claims:c.claimIds,synthesis:c.synthesis,outcome:c.outcome,grade:c.grade})),prereg.conclusions.map(c=>({claims:c.claims.map(id=>'AF-'+String(Number(id.slice(1))).padStart(6,'0')),synthesis:c.synthesis,outcome:c.outcome,grade:c.grade})),'Conclusiones editoriales no corresponden al preregistro');
assert.ok(editorial.evidence.every(e=>e.bibliographyId==='BIB-000007'&&e.resourceId==='REC-000007'),'Las evidencias actuales no comparten el recurso RV1909 esperado por la auditoría');
assert.ok(editorial.evidence.every(e=>e.permission==='pendiente'),'Una evidencia cambió de estado de permiso sin aprobación');
assert.equal(permissions.items.length,b.resources.length);
assert.ok(permissions.items.every(x=>x.decision==='pendiente'&&x.authorizationRef===null&&x.reviewerRole===null));
assert.equal(admissions.length,0,'Hay una admisión de publicación no autorizada');
assert.equal(integration.passages.length,8);
assert.ok(integration.passages.every(x=>x.sourceAdmission==='pendiente'&&x.verification==='requiere_cotejo_documentado'));
assert.equal(integration.terms.length,12);
assert.ok(integration.terms.every(x=>x.verification==='reportada_no_admitida'));
const lxxWorks=b.works.filter(w=>/septuagint|septuaginta|lxx/i.test(w.title));
assert.equal(lxxWorks.length,0,'Se registró una fuente LXX que requiere actualizar esta auditoría');
assert.equal(publication.snapshots.length,0,'El proceso de consolidación no debe crear publicaciones');
const editorialErrors=validateEditorial(editorial,{studyIds:['SN-001'],evidenceIds:[...evidenceIds]});
assert.deepEqual(editorialErrors,[],'El registro editorial no cumple su contrato');
const relations={schemaVersion:1,studyId:'SN-001',evidence:editorial.evidence,arguments:editorial.claims.flatMap(c=>c.supportingEvidenceIds.map(evidenceId=>({claimId:c.id,evidenceId,role:'respalda',reasoning:c.reasoning,comparisonScope:'canon_compartido',comparisonJustification:'Pasajes bíblicos compartidos; no se atribuye autoridad confesional.'}))),positions:[],relatedStudies:[]};
const context={studyIds:['SN-001'],bibliographyIds:b.editions.map(x=>x.id),resourceIds:b.resources.map(x=>x.id),authorIds:b.authors.map(x=>x.id),disciplineIds:[],traditionIds:traditions,resourceEditionIds:Object.fromEntries(b.resources.map(x=>[x.id,x.editionId])),admittedSources:admissions};
assert.deepEqual(validateRelations(relations,editorial,context),[],'Las relaciones editoriales no cumplen su contrato');
const allEvidenceFromRv=editorial.evidence.every(e=>e.bibliographyId==='BIB-000007');
const findings=[
 {id:'REV-553-001',severity:'bloqueante_publicacion',area:'trazabilidad_linguistica',sections:['SN-001/S07','SN-001/S10','SN-001/S17'],claims:['AF-000002','AF-000004'],detail:'Las evidencias EVD-000001 a EVD-000008 están vinculadas a la edición española Reina-Valera 1909. Esa edición no acredita por sí sola los lemas, raíces, morfología ni los identificadores Strong reportados. El vínculo de AF-000002 debe permanecer como insuficiente hasta asociar una fuente hebrea concreta y cotejada.',requiredAction:'Incorporar evidencias específicas con localizador verificable para WLC/interlineal y léxicos; mantener los datos como reportados y no admitidos mientras no exista cotejo.'},
 {id:'REV-553-002',severity:'bloqueante_publicacion',area:'septuaginta',sections:['SN-001/S09'],claims:[],detail:'La comparación griega se describe como preliminar, pero la bibliografía y el registro de permisos no contienen una edición o recurso de la Septuaginta. La evidencia de S09 remite a RV1909.',requiredAction:'Registrar edición, recurso, procedencia y permiso de la fuente griega antes de utilizar esa comparación como evidencia admitida; si no se incorpora, conservarla solo como observación preliminar no probatoria.'},
 {id:'REV-553-003',severity:'bloqueante_publicacion',area:'datos_linguisticos',sections:['SN-001/S07','SN-001/S11'],claims:['AF-000002'],detail:'Los 12 términos lingüísticos están marcados reportada_no_admitida y los 8 pasajes mantienen sourceAdmission pendiente y verificación requiere_cotejo_documentado.',requiredAction:'No presentar morfología, Strong, raíces ni ocurrencias como verificados hasta completar el cotejo exacto y registrar la evidencia de origen.'},
 {id:'REV-553-004',severity:'bloqueante_publicacion',area:'licencias_y_permisos',sections:['SN-001/S20'],claims:[],detail:'Las 13 decisiones de permisos continúan pendientes. Las condiciones documentadas de licencia no equivalen a aprobación de cita, reproducción, adaptación o redistribución.',requiredAction:'Mantener bloqueada la publicación de citas, extractos, corpus y adaptaciones hasta que exista una decisión editorial y autorización aplicable.'},
 {id:'REV-553-005',severity:'reserva_editorial',area:'versionado',sections:['SN-001/S01','SN-001/S20'],claims:[],detail:'Los artefactos conservan etiquetas distintas: manuscrito 0.4, candidato de integración 0.4.0 y registro editorial 0.4.3. El candidato sí apunta al blob actual del manuscrito, pero aún no existe una única versión exacta aprobada para publicación.',requiredAction:'En 5.5.4 fijar explícitamente el artefacto y la versión exacta que se someterán a aprobación; no equiparar automáticamente las tres etiquetas.'},
 {id:'REV-553-006',severity:'reserva_de_alcance',area:'secciones_fuera_de_alcance',sections:['SN-001/S08','SN-001/S12','SN-001/S13','SN-001/S14','SN-001/S15','SN-001/S16'],claims:[],detail:'Seis secciones están correctamente justificadas como no desarrolladas dentro del alcance aprobado. No representan resultados negativos ni una revisión exhaustiva de crítica textual, recepción histórica o posturas confesionales.',requiredAction:'Conservar las delimitaciones en cualquier versión final y no presentar el estudio como cobertura exhaustiva de esas perspectivas.'},
 {id:'REV-553-007',severity:'bloqueante_aprobacion',area:'revision_exacta',sections:editorial.sections.map(s=>s.id),claims:[],detail:'El registro de revisión mantiene resultado pendiente y controles críticos pendientes; no existe aprobación del contenido exacto ni huella revisada aprobada.',requiredAction:'La aprobación debe realizarse en 5.5.4 sobre una versión inmutable y una huella de contenido exacta, sin convertir la validación automatizada en aprobación académica.'}
];
const report={
 schemaVersion:1,studyId:'SN-001',phase:'5.5.3',status:'consolidado_con_reservas_no_aprobado',reviewedAt:'2026-11-28',
 inputs:{manuscript:{path:manuscriptPath,version:'0.4',gitBlobSha:blob,sourceCommit:integration.source.commit},integrationCandidate:{path:integrationPath,version:integration.version,gitBlobSha:'ece386025684e725e9e8b28715ceac286028d6b0'},editorialRecord:{path:editorialPath,version:editorial.version,gitBlobSha:'0993fd5d7b9e8e599dd9bf393130f26fa3e57350'},preregistration:{path:preregPath,version:prereg.version,gitBlobSha:'b9d08062a97eda8ff6a94f4306a2ce361042b979'},bibliography:{path:bibliographyPath,gitBlobSha:'c6e101ef15d0b4278097fb5d0954a68a691486d4'},permissions:{path:permissionsPath,gitBlobSha:'1fd0552d835d1c80ac711b2596d7fd9123c0e8f1'}},
 coverage:{manuscriptHeadings:headings.length,sections:sectionAudit.length,analyzedSections:14,outOfScopeSections:6,evidence:editorial.evidence.length,claims:editorial.claims.length,conclusions:editorial.conclusions.length,passages:integration.passages.length,terms:integration.terms.length,termsNotAdmitted:integration.terms.filter(x=>x.verification==='reportada_no_admitida').length,bibliographySources:b.sources.length,bibliographyWorks:b.works.length,bibliographyEditions:b.editions.length,resources:b.resources.length,licenses:b.licenses.length,permissionDecisions:permissions.items.length,permissionDecisionsPending:permissions.items.filter(x=>x.decision==='pendiente').length,publicationAdmissions:admissions.length,publicSnapshots:publication.snapshots.length,allEightEvidenceItemsLinkedToRv1909:allEvidenceFromRv,allActiveBodiesMatchIntegrationCandidate:true,allOutOfScopeJustificationsMatchCandidate:true,manuscriptBlobPointerVerified:true,editorialContractValid:true,relationsContractValid:true},
 sections:sectionAudit,
 claims:editorial.claims.map(c=>({id:c.id,sectionId:c.sectionId,proposition:c.proposition,grade:c.grade,supportingEvidenceIds:c.supportingEvidenceIds,opposingEvidenceIds:c.opposingEvidenceIds,gradeJustification:c.gradeJustification})),
 conclusions:editorial.conclusions.map(c=>({id:c.id,claimIds:c.claimIds,synthesis:c.synthesis,outcome:c.outcome,grade:c.grade,reservations:c.reservations})),
 findings,
 publicationAuthorized:false,ownerApprovalRecorded:false,exactVersionApproved:false
};
mkdirSync('sn001-validation-output',{recursive:true});
writeFileSync('sn001-validation-output/consolidation-553-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({phase:report.phase,status:report.status,coverage:report.coverage,findings:findings.map(f=>({id:f.id,severity:f.severity,area:f.area})),publicationAuthorized:false},null,2));
