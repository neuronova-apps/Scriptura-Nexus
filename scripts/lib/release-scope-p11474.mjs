import assert from 'node:assert/strict';
import {validateManualPlan} from './manual-acceptance-plan-p11473.mjs';
import {verifyIntegralRegister} from './integral-reconciliation-p11471.mjs';
export function verifyReleaseScope(r,integral,inputs,manual,combined){
 const validated=verifyIntegralRegister(integral,inputs);
 const plan=validateManualPlan(manual,combined,inputs.readerManual,inputs.readerAuthorization);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.7.4');assert.equal(r.status,'technical_validation_complete_release_blocked');
 assert.equal(r.selectedOption,inputs.selection.approval.option);assert.equal(r.selectedOption,'B');
 const prev=r.previousEvidence;
 assert.equal(prev.pr,127);assert.equal(prev.merge,r.baselineMain);assert.equal(prev.checksSuccess,58);assert.equal(prev.checksSkipped,1);
 assert.deepEqual(prev.plan,plan);
 assert.deepEqual(prev.launcher,{phase:'P11.4.7.3',launcherSmoke:'success',routes:5,unknownRouteDenied:true,externalFetchDenied:true,distUnchanged:true,manualReview:false,publicationAuthorized:false,upload:false});
 assert.deepEqual(r.modules,validated.modules.map(m=>({...m,technicalValidation:'passed_private_automated',manualStatus:'pending',effectiveApproval:'pending',publicEnabled:false})));
 assert.equal(manual.previousEvidence.observed.combinedPrivateBrowserReview,true);
 assert.deepEqual(r.manual,{pending:manual.matrix.length+manual.crossModule.length,passed:0,failed:0,notEvaluable:0,readerL05HistoricalDeferral:true,reviewCompleted:false});
 assert.deepEqual(r.decision,{state:'pending_owner_and_manual_evidence',approvedModules:[],approvedEditions:[],approvedResourceComponents:[],approvalRef:null,acceptedDeferrals:[],criticalDefectsMayBeWaived:false});
 for(const k of ['publicationAuthorized','corpusImportAuthorized','releaseActionPerformed','publicArtifact','corpusPersisted','upload','academicAnalysisCompleted'])assert.equal(r.controls[k],false);
 assert.equal(r.controls.publicModulesEnabled,0);assert.equal(r.controls.fieldINP,'not_measured');assert.deepEqual(r.controls.exclusions,integral.controls.exclusions);
 assert.deepEqual(r.progress,{...manual.progress,technicalPreparationIsNotClosure:true,operationalClosure:'blocked_pending_manual_review_and_approval'});
 assert.deepEqual(r.next,{phase:'P11.4.8',state:'blocked_for_effective_publication',allowedPreparationOnly:true});
 return {phase:r.phase,status:r.status,technicalModules:r.modules.length,manualPending:r.manual.pending,manualPassed:0,approvedModules:0,publicModulesEnabled:0,publicationAuthorized:false,corpusImportAuthorized:false,releaseActionPerformed:false,next:r.next};
}
