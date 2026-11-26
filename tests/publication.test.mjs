import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeSections,criticalControls} from '../src/lib/editorial-contracts.ts';
import {reviewedContentDigest,snapshotDigest,validateSnapshot,validateRegistry,appendSnapshot,approvedSnapshot} from '../src/lib/publication.ts';
const label='PRUEBA SINTÉTICA P6.4';
const ctx={studyIds:['SN-001'],bibliographyIds:['BIB-900001'],resourceIds:[],authorIds:[],disciplineIds:[],traditionIds:[],admittedSources:[{id:'BIB-900001',admission:'admitido',scope:'publicacion',licenseRef:'LIC-900001',attribution:label,authorizationRef:label}]};
function seal(s){const {digest,...payload}=s;return {...payload,digest:snapshotDigest(payload)};}
function approve(s){const review=s.record.reviews.find(r=>r.id===s.reviewId);review.reviewedDigest=reviewedContentDigest(s);return seal(s);}
function fixture(version='1.0.0',previousVersion=null){
 const sections=makeSections('SN-001').map(s=>({...s,applicability:'revisada',contentRef:s.id}));
 const claim={id:'AF-900001',studyId:'SN-001',sectionId:'SN-001/S10',proposition:label,type:'interpretacion_teologica',grade:'plausible',gradeJustification:label,supportingEvidenceIds:['EVD-900001'],opposingEvidenceIds:[],reasoning:label};
 return approve({schemaVersion:1,studyId:'SN-001',version,previousVersion,publishedAt:'2026-11-26',reviewId:'REV-900001',record:{schemaVersion:1,studyId:'SN-001',version,createdAt:'2026-11-26',updatedAt:'2026-11-26',objective:label,scope:label,sections,claims:[claim],conclusions:[{id:'CON-900001',studyId:'SN-001',claimIds:[claim.id],synthesis:label,outcome:'interpretativa',grade:'plausible',gradeJustification:label,reservations:[label]}],reviews:[{id:'REV-900001',studyId:'SN-001',version,date:'2026-11-26',reviewerRole:label,result:'aprobada',controls:criticalControls.map(id=>({id,result:'conforme'}))}]},relations:{schemaVersion:1,studyId:'SN-001',evidence:[{id:'EVD-900001',bibliographyId:'BIB-900001',locator:label,language:'es',kind:'parafrasis',consultedAt:'2026-11-26',verification:'verificada',permission:'autorizada'}],arguments:[{claimId:claim.id,evidenceId:'EVD-900001',role:'respalda',reasoning:label,comparisonScope:'no_aplicable',comparisonJustification:label}],positions:[],relatedStudies:[]},bodies:Object.fromEntries(sections.map(s=>[s.id,label]))});
}
const empty=()=>({schemaVersion:1,snapshots:[]});
const invalid=fn=>{const s=fixture();fn(s);assert.ok(validateSnapshot(seal(s),ctx).length);};
test('snapshot sintético válido con revisión y admisión',()=>assert.deepEqual(validateSnapshot(fixture(),ctx),[]));
test('registro real vacío y catálogo intacto',()=>{const r=JSON.parse(readFileSync('src/data/publicaciones/registro.json','utf8'));assert.deepEqual(r,empty());validateRegistry(r,ctx);assert.equal(approvedSnapshot(r,'SN-001',ctx),undefined);});
test('bloquea revisión ausente, rechazada o de versión diferente',()=>{invalid(s=>s.reviewId='REV-999');invalid(s=>s.record.reviews[0].result='rechazada');invalid(s=>s.record.reviews[0].version='2.0.0');});
test('bloquea evidencia no verificada o sin permiso',()=>{invalid(s=>s.relations.evidence[0].verification='consultada');invalid(s=>s.relations.evidence[0].permission='pendiente');});
test('bloquea recurso no admitido aunque la evidencia declare permiso',()=>assert.ok(validateSnapshot(fixture(),{...ctx,admittedSources:[]}).length));
test('bloquea cuerpo huérfano, ausente y sección pendiente',()=>{invalid(s=>s.bodies.private='privado');invalid(s=>delete s.bodies['SN-001/S01']);invalid(s=>s.record.sections[0].applicability='pendiente');});
test('omisión justificada no obligatoria; bloquea omisión obligatoria',()=>{const s=fixture();const x=s.record.sections[7];x.applicability='no_aplicable';x.justification=label;delete x.contentRef;delete s.bodies[x.id];assert.deepEqual(validateSnapshot(approve(s),ctx),[]);invalid(s=>{const x=s.record.sections[0];x.applicability='no_aplicable';x.justification=label;delete x.contentRef;delete s.bodies[x.id];});});
test('integridad detecta modificación posterior',()=>{const s=fixture();s.bodies['SN-001/S01']='alterado';assert.ok(validateSnapshot(s,ctx).length);});
test('historial append-only conserva versión previa y copia independiente',()=>{const first=appendSnapshot(empty(),fixture(),ctx);const next=appendSnapshot(first,fixture('1.1.0','1.0.0'),ctx);assert.equal(first.snapshots.length,1);assert.equal(next.snapshots.length,2);assert.equal(approvedSnapshot(next,'SN-001',ctx).version,'1.1.0');const copy=approvedSnapshot(next,'SN-001',ctx);copy.record.objective='alterado';assert.equal(next.snapshots[1].record.objective,label);});
test('bloquea duplicados, regresiones y saltos de historial',()=>{const r=appendSnapshot(empty(),fixture(),ctx);for(const s of [fixture(),fixture('0.9.0','1.0.0'),fixture('2.0.0','0.9.0')])assert.throws(()=>appendSnapshot(r,s,ctx));});
test('borrador externo no reemplaza snapshot aprobado',()=>{const r=appendSnapshot(empty(),fixture(),ctx);const draft=fixture('2.0.0','1.0.0');draft.record.reviews=[];assert.throws(()=>appendSnapshot(r,seal(draft),ctx));assert.equal(approvedSnapshot(r,'SN-001',ctx).version,'1.0.0');});
test('rechaza campos extras y entrada mal formada',()=>{invalid(s=>s.privateNotes='privado');assert.ok(validateSnapshot(null,ctx).length);});
