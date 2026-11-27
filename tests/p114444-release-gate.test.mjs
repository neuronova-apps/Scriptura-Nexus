import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateLexicalReleaseGate} from '../scripts/lib/lexical-release-gate-p114444.mjs';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const candidate=read('docs/P11/registro-candidato-lexico-p114442.json');
const integrity=read('docs/P11/registro-candidato-lexico-p114443.json');
const release=read('docs/P11/registro-liberacion-lexicos-p114444.json');
const fixture=()=>structuredClone({candidate,integrity,release});
test('la evidencia consolidada conserva el candidato privado y bloquea la publicación',()=>{
 const r=evaluateLexicalReleaseGate(fixture());assert.equal(r.status,'blocked_pending_manual_review');assert.equal(r.canPublish,false);assert.equal(r.publicationAuthorized,false);assert.deepEqual(r.blockers,['manualScreenReader','manualDeviceReview','ownerPublicationApproval']);assert.equal(r.excludedDodson,true);
});
test('la aprobación manual completa solo habilita una decisión de liberación separada',()=>{
 const f=fixture();f.release.gates.manualScreenReader='passed';f.release.gates.manualDeviceReview='passed';f.release.gates.ownerPublicationApproval='approved';
 const r=evaluateLexicalReleaseGate(f);assert.equal(r.status,'ready_for_separate_release_action');assert.deepEqual(r.blockers,[]);assert.equal(r.canPublish,false);assert.equal(r.publicationAuthorized,false);
});
test('rechaza cualquier intento de marcar el corpus como autorizado o publicado',()=>{
 const f=fixture();f.release.publicationAuthorized=true;assert.throws(()=>evaluateLexicalReleaseGate(f),/Evidencia de liberación no válida/);
 const g=fixture();g.release.corpusPublished=true;assert.throws(()=>evaluateLexicalReleaseGate(g),/Evidencia de liberación no válida/);
 const h=fixture();h.release.corpusPersisted=true;assert.throws(()=>evaluateLexicalReleaseGate(h),/Evidencia de liberación no válida/);
});
test('rechaza discrepancias de cobertura y admisiones lingüísticas nuevas',()=>{
 const f=fixture();f.integrity.scope.occurrences++;assert.throws(()=>evaluateLexicalReleaseGate(f),/Evidencia de liberación no válida/);
 const g=fixture();g.integrity.scope.admittedHistoricalFiles.push('LEX-C08');assert.throws(()=>evaluateLexicalReleaseGate(g),/Evidencia de liberación no válida/);
});
test('Dodson permanece excluido y no bloquea la revisión del candidato histórico de cuatro fuentes',()=>{
 const f=fixture();const r=evaluateLexicalReleaseGate(f);assert.equal(r.excludedDodson,true);assert.equal(f.release.exclusions.dodson,'not_included_pending_separate_approval');assert.deepEqual(f.integrity.scope.admittedHistoricalFiles,['LING-015','LING-016','LING-017','LING-018']);
});
