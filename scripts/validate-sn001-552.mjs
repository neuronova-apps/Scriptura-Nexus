import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {parseBibliography} from '../src/lib/bibliography-contracts.ts';
import {parsePermissions,publicationAdmissions} from '../src/lib/source-permissions.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='docs/investigaciones/';
const bibliography=read(dir+'SN-001-biblioteca-candidato.json');
const permissions=read(dir+'SN-001-permisos-candidato.json');
const matrix=read(dir+'SN-001-matriz-permisos-552.json');
const traditions=read('src/data/taxonomia/tradiciones.json').items.map(x=>x.id);
const b=parseBibliography(bibliography,traditions);
const p=parsePermissions(permissions,b);
assert.equal(matrix.schemaVersion,1);
assert.equal(matrix.studyId,'SN-001');
assert.equal(matrix.phase,'5.5.2');
assert.equal(matrix.publicationAuthorized,false);
assert.equal(matrix.resources.length,b.resources.length);
assert.equal(matrix.summary.resources,b.resources.length);
assert.equal(matrix.summary.withLicense,8);
assert.equal(matrix.summary.withoutRecordedLicense,5);
assert.equal(matrix.summary.permissionPending,b.resources.length);
assert.equal(matrix.summary.approved,0);
assert.equal(matrix.summary.externalConsultationOnly,b.resources.length);
assert.equal(publicationAdmissions(b,p).length,0,'No debe existir ninguna fuente admitida para publicación');
const byPermission=new Map(p.items.map(x=>[x.resourceId,x]));
for(const resource of b.resources){
 const item=matrix.resources.find(x=>x.resourceId===resource.id);
 assert.ok(item,'Falta matriz para '+resource.id);
 const permission=byPermission.get(resource.id);
 const edition=b.editions.find(x=>x.id===resource.editionId);
 const source=b.sources.find(x=>x.id===resource.sourceId);
 assert.equal(item.sourceId,resource.sourceId);
 assert.equal(item.editionId,resource.editionId);
 assert.equal(item.originUrl,resource.originUrl);
 assert.equal(item.versionRef,resource.versionRef);
 assert.equal(item.resourceAdmission,resource.admission);
 assert.deepEqual(item.provenance.resource,resource.provenance);
 assert.deepEqual(item.provenance.edition,edition.provenance);
 assert.deepEqual(item.provenance.source,source.provenance);
 assert.deepEqual(item.permissionReview,{decision:permission.decision,uses:permission.uses,reviewedAt:permission.reviewedAt,basis:permission.basis,authorizationRef:permission.authorizationRef,reviewerRole:permission.reviewerRole});
 assert.equal(item.permissionReview.decision,'pendiente');
 assert.equal(item.permissionReview.authorizationRef,null);
 assert.equal(item.permissionReview.reviewerRole,null);
 assert.equal(item.permissionReview.uses.consulta,'permitida');
 for(const use of ['cita','reproduccion','adaptacion'])assert.notEqual(item.permissionReview.uses[use],'permitida',resource.id+' '+use);
 assert.equal(resource.admission,'en_revision');
 assert.equal(item.publicationDisposition.status,'blocked_pending_editorial_authorization');
 assert.equal(item.publicationDisposition.corpusRedistribution,false);
 assert.equal(item.publicationDisposition.quotePublicationAuthorized,false);
 assert.equal(item.publicationDisposition.adaptationAuthorized,false);
 const expected=resource.licenseIds.map(id=>b.licenses.find(l=>l.id===id)).map(l=>({licenseId:l.id,identifier:l.identifier,holder:l.holder,url:l.url??null,attribution:l.attribution,restrictions:l.restrictions,scope:l.scope,provenance:l.provenance}));
 assert.deepEqual(item.licenseEvidence,expected,resource.id+' license evidence mismatch');
 for(const license of item.licenseEvidence)assert.equal(license.provenance.verification,'verificada');
}
assert.equal(matrix.resources.filter(x=>x.licenseEvidence.length).length,8);
assert.equal(matrix.resources.filter(x=>!x.licenseEvidence.length).length,5);
const publicRegistry=read('src/data/publicaciones/registro.json');
assert.equal(publicRegistry.snapshots.length,0,'5.5.2 no debe crear una publicación');
const report={
 phase:'5.5.2',studyId:'SN-001',matrixValid:true,publicationAuthorized:false,
 resources:matrix.summary,
 decisions:{approved:0,pending:matrix.summary.permissionPending,authorizationReferences:0,reviewerRoles:0},
 controls:{
  sourceAndEditionProvenance:'verified_as_recorded',
  licenseDeclarations:'verified_as_recorded',
  consultation:'permitted_external_consultation_only',
  quotation:'not_authorized_for_publication',
  reproduction:'not_authorized',
  adaptation:'not_authorized',
  corpusRedistribution:'not_authorized',
  publicSnapshotCreated:false
 },
 pendingActions:[
  'Responsable editorial debe revisar y firmar la decisión de uso de cada recurso.',
  'Para REC-000001, REC-000002, REC-000003, REC-000005 y REC-000006, obtener o documentar una base específica antes de publicar citas o extractos.',
  'Para REC-000004, verificar componentes de terceros, atribución y aprobación del responsable pese a la declaración CC BY 4.0.',
  'Para REC-000007, mantener la declaración del distribuidor separada de una conclusión territorial y de la identidad con otros paquetes.',
  'Para REC-000008 y REC-000009, limitar cualquier uso a las capas WLC/anotaciones y condiciones ya registradas; no inferir autorización de redistribución general.',
  'Para REC-000010 a REC-000013, respetar los selectores y exclusiones específicos de cada recurso.',
  'No incorporar textos comerciales, corpus ni material de terceros no autorizado.'
 ]
};
mkdirSync('sn001-validation-output',{recursive:true});
writeFileSync('sn001-validation-output/permissions-552-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({phase:report.phase,resources:report.resources,decisions:report.decisions,publicationAuthorized:false}));
