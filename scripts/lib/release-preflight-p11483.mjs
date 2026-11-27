import assert from 'node:assert/strict';
import {verifyReleaseScope} from './release-scope-p11474.mjs';
import {verifyPreparationRecord} from './public-baseline-p11481.mjs';
import {validateRecoveryRecord} from './public-recovery-p11482.mjs';
export function evaluatePreflight({r,scope,integral,inputs,manual,combined,baseline,recovery,inventory}){
 const s=verifyReleaseScope(scope,integral,inputs,manual,combined);
 verifyPreparationRecord(baseline,scope);
 validateRecoveryRecord(recovery,baseline,scope);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.8.3');
 assert.equal(r.status,'preflight_prepared_release_blocked');
 assert.equal(r.previousEvidence.pr,130);assert.equal(r.previousEvidence.merge,r.baselineMain);
 assert.equal(r.previousEvidence.checksSuccess,61);assert.equal(r.previousEvidence.checksSkipped,1);
 const o=r.previousEvidence.observed,b=recovery.previousEvidence.observed;
 assert.equal(o.phase,recovery.phase);assert.equal(o.status,'recovery_rehearsed_release_blocked');
 assert.equal(o.incidents,recovery.planned.incidents.length);assert.equal(o.restorations,recovery.planned.restorations);
 for(const k of ['tamperedBackupRejected','gitRevertRehearsed','baselineIntact','temporaryCleanup','previousManifestMatches'])assert.equal(o[k],true);
 for(const k of ['actualRollback','remoteGitWrites','publicationAuthorized','corpusImportAuthorized','releaseActionPerformed','upload'])assert.equal(o[k],false);
 for(const k of ['files','bytes','manifestSha256','protectedObjects','manualPending','publicModulesEnabled'])assert.equal(o[k],b[k]);
 assert.equal(inventory.files,o.files);assert.equal(inventory.bytes,o.bytes);assert.equal(inventory.sha256,o.manifestSha256,'Public baseline differs from verified historical artifact');
 assert.equal(r.selectedOption,scope.selectedOption);assert.equal(r.manualPending,s.manualPending);
 assert.deepEqual(r.approvedModules,scope.decision.approvedModules);assert.deepEqual(r.approvedModules,[]);
 assert.deepEqual(r.blockers,['manual_review_evidence','rights_and_privacy_decisions','explicit_scope_approval','authorized_release_artifact']);
 for(const k of ['publicationAuthorized','corpusImportAuthorized','releaseActionPerformed','upload'])assert.equal(r[k],false);
 assert.equal(r.publicModulesEnabled,0);assert.deepEqual(r.progress,recovery.progress);
 assert.deepEqual(r.next,{phase:'P11.4.8.4',state:'blocked_pending_evidence_and_approval',requiresNewDecision:true});
 return {phase:r.phase,status:'release_blocked',technicalModules:s.technicalModules,manualPending:r.manualPending,approvedModules:0,baselineVerified:true,manifestSha256:o.manifestSha256,recoveryVerified:true,blockers:r.blockers,canPublish:false,publicationAuthorized:false,corpusImportAuthorized:false,releaseActionPerformed:false,publicModulesEnabled:0,upload:false};
}
