import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {reviewedContentDigest} from '../src/lib/publication.ts';
import {parseBibliography} from '../src/lib/bibliography-contracts.ts';
import {parsePermissions,publicationAdmissions} from '../src/lib/source-permissions.ts';
import {publicationEnabled} from '../src/lib/editorial-contracts.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='docs/investigaciones/';
const reviewPath=dir+'SN-001-revision-554.json';
const packagePath=dir+'SN-001-registro-consolidado-553.json';
const reportPath=dir+'SN-001-consolidacion-553.json';
const review=read(reviewPath);
const pkg=read(packagePath);
const report=read(reportPath);
const bibliography=read(dir+'SN-001-biblioteca-candidato.json');
const permissions=read(dir+'SN-001-permisos-candidato.json');
const candidate=read(dir+'SN-001-candidato-integracion.json');
const publicRegistry=read('src/data/publicaciones/registro.json');
const traditions=read('src/data/taxonomia/tradiciones.json').items.map(x=>x.id);
const b=parseBibliography(bibliography,traditions);
const p=parsePermissions(permissions,b);
const admissions=publicationAdmissions(b,p);
const blob=p=>{const data=readFileSync(p);return createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');};
assert.equal(review.phase,'5.5.4');
assert.equal(review.studyId,'SN-001');
assert.equal(review.status,'preparado_para_revision_responsable_bloqueado');
assert.equal(review.reviewTarget.recordVersion,'0.4.3');
assert.equal(pkg.record.version,review.reviewTarget.recordVersion);
assert.equal(review.reviewTarget.consolidatedPackageBlobSha,blob(packagePath));
assert.equal(review.reviewTarget.consolidationReportBlobSha,blob(reportPath));
assert.equal(review.reviewTarget.contentDigest,reviewedContentDigest({studyId:pkg.record.studyId,version:pkg.record.version,previousVersion:null,record:pkg.record,relations:pkg.relations,bodies:pkg.bodies}));
for(const [path,expected] of Object.entries(review.sourceDigests))assert.equal(blob(path),expected,'Hash Git de origen cambió: '+path);
assert.equal(report.status,'consolidado_con_reservas_no_aprobado');
assert.equal(report.coverage.sections,20);
assert.equal(report.coverage.analyzedSections,14);
assert.equal(report.coverage.outOfScopeSections,6);
assert.equal(report.coverage.evidence,8);
assert.equal(report.coverage.claims,5);
assert.equal(report.coverage.conclusions,3);
assert.equal(candidate.terms.length,12);
assert.ok(candidate.terms.every(x=>x.verification==='reportada_no_admitida'));
assert.equal(candidate.passages.length,8);
assert.ok(candidate.passages.every(x=>x.sourceAdmission==='pendiente'&&x.verification==='requiere_cotejo_documentado'));
assert.equal(pkg.relations.evidence.length,8);
assert.ok(pkg.relations.evidence.every(e=>e.bibliographyId==='BIB-000007'&&e.resourceId==='REC-000007'&&e.permission==='pendiente'));
assert.equal(review.evidenceAssessment.hebrewOccurrenceContentVerified,false);
assert.equal(review.evidenceAssessment.hebrewEvidenceLinkedToCurrentClaims,false);
assert.equal(review.evidenceAssessment.greekComparison.septuagintEditionRegistered,false);
assert.equal(review.permissions.resources,13);
assert.equal(review.permissions.decisionsPending,13);
assert.equal(review.permissions.decisionsApproved,0);
assert.equal(admissions.length,0);
assert.ok(p.items.every(x=>x.decision==='pendiente'&&x.authorizationRef===null&&x.reviewerRole===null));
assert.equal(b.works.filter(w=>/septuagint|septuaginta|lxx/i.test(w.title)).length,0);
for(const id of ['REC-000008','REC-000009','REC-000010','REC-000011','REC-000012','REC-000013'])assert.ok(b.resources.some(r=>r.id===id),'Recurso lingüístico registrado ausente: '+id);
assert.ok(b.resources.filter(r=>['REC-000008','REC-000009','REC-000010','REC-000011','REC-000012','REC-000013'].includes(r.id)).every(r=>r.provenance.locator.includes('contenido de ocurrencias no cotejado')));
assert.equal(review.permissions.publicSnapshots,0);
assert.equal(publicRegistry.snapshots.length,0);
assert.equal(publicationEnabled(),false);
assert.deepEqual(review.controls.map(x=>x.id),['fuentes','exactitud_textual','licencias','privacidad','aprobacion','imparcialidad','contexto_canonico']);
assert.deepEqual(review.controls.map(x=>x.status),['no_conforme','no_conforme','pendiente','pendiente','pendiente','pendiente','pendiente']);
assert.equal(review.editorialDisposition.reviewResult,'pendiente');
assert.equal(review.editorialDisposition.reviewerRole,null);
assert.equal(review.editorialDisposition.reviewDate,null);
assert.equal(review.editorialDisposition.reviewedDigest,null);
assert.equal(review.editorialDisposition.ownerApprovalRecorded,false);
assert.equal(review.editorialDisposition.publicationAuthorized,false);
assert.equal(review.editorialDisposition.snapshotCreated,false);
assert.equal(pkg.record.reviews.length,1);
assert.equal(pkg.record.reviews[0].result,'pendiente');
assert.equal(pkg.record.reviews[0].reviewedDigest,undefined);
assert.ok(pkg.record.reviews[0].controls.every(c=>c.result==='pendiente'));
assert.equal(review.scope.sectionsNeedingHumanReview.length,14);
assert.equal(review.scope.sectionsOutOfScope.length,6);
assert.deepEqual(review.scope.sectionsNeedingHumanReview,pkg.record.sections.filter(s=>s.applicability==='analizada').map(s=>s.id));
assert.deepEqual(review.scope.sectionsOutOfScope,pkg.record.sections.filter(s=>s.applicability==='no_aplicable').map(s=>s.id));
assert.equal(review.blockingFindings.length,5);
const output={
 schemaVersion:1,studyId:'SN-001',phase:'5.5.4',
 status:'bloqueado_a_la_espera_de_revision_y_decision_humana',
 targetVersion:review.reviewTarget.recordVersion,
 contentDigest:review.reviewTarget.contentDigest,
 exactPackageBlobSha:review.reviewTarget.consolidatedPackageBlobSha,
 coverage:{sections:20,sectionsRequiringHumanReview:14,sectionsOutOfScope:6,claims:5,conclusions:3,evidence:8,linguisticTermsNotAdmitted:12,passagesPendingCotejo:8,permissionDecisionsPending:13,publicationAdmissions:0,publicSnapshots:0},
 controls:review.controls,
 blockingFindings:review.blockingFindings,
 ownerApprovalRecorded:false,publicationAuthorized:false,snapshotCreated:false
};
mkdirSync('sn001-validation-output',{recursive:true});
writeFileSync('sn001-validation-output/revision-554-report.json',JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
