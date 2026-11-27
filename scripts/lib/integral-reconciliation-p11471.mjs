import {evaluateLexicalReleaseGate} from './lexical-release-gate-p114444.mjs';
import {evaluateComparatorReleaseGate} from './comparator-release-gate-p11455.mjs';
import {evaluateManuscriptReleaseGate} from './manuscript-release-gate-p11465.mjs';
const need=(ok)=>{if(!ok)throw Error('Conciliación integral inválida');};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const moduleRow=(id,route,scope,blockers,extra={})=>({id,route,scope,status:'private_candidate_prepared',blockers,...extra});
export function reconcilePrivateCandidates(x){
 const {selection:s,reader:r,readerManual:rm,readerRights:rr,readerAuthorization:ra,readerPermissions:rp,analyzer:a,analyzerArtifact:aa,lexical:l,comparator:c,manuscripts:m,accessibility:ac,editorial:e}=x;
 need(s.approval.option==='B'&&s.approval.individualResourcePublicationApproved===false&&s.publicationAuthorized===false&&s.progress.expandedTotal===69);
 need(same(s.route.map(z=>z.id),['P11.4.1','P11.4.2','P11.4.3','P11.4.4','P11.4.5','P11.4.6','P11.4.7','P11.4.8','P11.5']));
 need(r.publicReleaseAuthorized===false&&r.corpusImportAuthorized===false&&r.deploymentEnabled===false&&r.artifact.upload===false&&r.candidateEvidence.publicationAuthorized===false&&r.candidateEvidence.corpusPersisted===false);
 need(ra.publicReleaseAuthorized===false&&ra.corpusImportAuthorized===false&&ra.scope.mainTextOnly&&ra.scope.sourceNativeReferences&&ra.scope.excludeApparatus&&ra.scope.alignmentAuthorized===false);
 need(rp.publicationAuthorized===false&&rp.corpusImportAuthorized===false&&rp.alignmentAuthorized===false&&rp.editions.every(z=>z.publicReleaseDecision==='pendiente'));
 need(same(rp.editions.map(z=>z.editionId),['TXT-RV1909','TXT-SBLGNT-V1-2']));
 need(r.candidateEvidence.editions===ra.candidate.editions&&r.candidateEvidence.chaptersVerified===ra.candidate.chapters&&r.candidateEvidence.externalRequests===0&&r.candidateEvidence.queryStorage===false);
 need(rp.editions.reduce((sum,z)=>sum+z.units,0)===ra.candidate.units&&rp.editions.reduce((sum,z)=>sum+z.books,0)===ra.candidate.books);
 need(r.mobile.deferralAccepted===true&&ra.mobile.deferralAccepted===true&&r.mobile.realDeviceValidated===false&&rm.manual.checks.find(z=>z.id==='L05')?.status==='no_evaluable'&&rm.manual.independentlyVerified===false);
 need(rr.publicReleaseAuthorized===false&&rr.privacy.status==='revision_preliminar_no_cerrada'&&rr.reviews.every(z=>z.publication==='pendiente'));
 need(a.decision.publicationAuthorized===false&&a.decision.publicArtifact===false&&a.decision.territorialReviewAccepted===false&&a.decision.privacyAccepted===false);
 need(a.decision.keyboard==='pendiente'&&a.decision.screenReader==='pendiente'&&a.decision.realMobile==='pendiente'&&a.decision.manualDeferralAuthorized===false);
 need(a.recovery.recoveryRehearsed===true&&a.recovery.actualRollback===false&&a.recovery.baselineIntact===true&&a.recovery.temporaryCleaned===true);
 need(aa.artifact.publicationAuthorized===false&&aa.artifact.upload===false&&aa.scope.books===a.scope.books.length);
 for(const k of ['chapters','chapterLayers','units','occurrences'])need(a.scope[k]===aa.scope[k]);
 need(a.scope.withheldNewGreek===198&&a.scope.excluded.includes('LING-010'));
 const lg=evaluateLexicalReleaseGate({candidate:x.lexicalCandidate,integrity:x.lexicalIntegrity,release:l});
 const cg=evaluateComparatorReleaseGate({candidate:x.comparatorCandidate,integrity:x.comparatorIntegrity,registry:x.alignments,release:c});
 const mg=evaluateManuscriptReleaseGate({audit:x.manuscriptAudit,projection:x.manuscriptProjection,candidate:x.manuscriptCandidate,integrity:x.manuscriptIntegrity,release:m,historic:x.manuscriptHistoric,comparator:c,lexical:l});
 for(const [g,record] of [[lg,l],[cg,c],[mg,m]])need(g.status==='blocked_pending_manual_review'&&g.canPublish===false&&g.publicationAuthorized===false&&same(g.blockers,record.expectedBlockers));
 need(l.scope.occurrences===a.scope.occurrences&&same(c.scope.editions,rp.editions.map(z=>z.editionId))&&c.scope.chapters===ra.candidate.chapters&&c.scope.units===ra.candidate.units&&c.scope.books===ra.candidate.books&&c.scope.verifiedGroups===0);
 need(c.scope.excluded.includes('P1022-R12')&&c.scope.excluded.includes('Dodson XML')&&l.exclusions.dodson==='not_included_pending_separate_approval');
 need(ac.manualEvidence.independentVerification===false&&ac.wcagCertification===false&&ac.manualPrivacyReview==='pendiente'&&ac.fieldINP==='no_medido');
 need(e.academicAnalysisCompleted===false&&e.publicationAuthorized===false&&e.results.publishedStudies===0&&e.results.openNeeds===20);
 return {status:'private_candidates_prepared_publication_blocked',modules:[
 moduleRow('reader','biblia/lector/',{editions:ra.candidate.editions,books:ra.candidate.books,chapters:ra.candidate.chapters,units:ra.candidate.units},['effectiveEditionApproval','territorialReview','finalPrivacyReview','realMobileL05'],{mobileDeferralAccepted:true}),
 moduleRow('analyzer','linguistica/analizador/',{books:a.scope.books.length,chapters:a.scope.chapters,chapterLayers:a.scope.chapterLayers,units:a.scope.units,occurrences:a.scope.occurrences,withheldGreek:a.scope.withheldNewGreek},['manualKeyboard','manualScreenReader','manualDeviceReview','territorialReviewWLC','privacyReview','ownerPublicationApproval']),
 moduleRow('lexical','linguistica/lexicos-concordancias/',{historicalFiles:l.scope.admittedHistoricalFiles.length,occurrences:l.scope.occurrences,entries:l.scope.lexicalEntries,forms:l.scope.forms,definitions:l.scope.definitions,fragments:l.scope.fragmentFiles},lg.blockers),
 moduleRow('comparator','biblia/comparador/',{editions:c.scope.editions.length,books:c.scope.books,chapters:c.scope.chapters,units:c.scope.units,verifiedGroups:c.scope.verifiedGroups},cg.blockers),
 moduleRow('manuscripts','manuscritos/consulta/',Object.fromEntries(['witnesses','variants','readings','resources','evidence','secondaryAttestations','directInspections','sourceFilesAdmitted'].map(k=>[k,m.scope[k]])),mg.blockers)
 ],publicationAuthorized:false,corpusImportAuthorized:false,publicModulesEnabled:0,releaseActionPerformed:false,academicAnalysisCompleted:false};
}
export function verifyIntegralRegister(record,inputs){
 const result=reconcilePrivateCandidates(inputs);
 need(record.schemaVersion===1&&record.phase==='P11.4.7.1'&&record.previousEvidence.pr===124&&record.previousEvidence.checksSuccess===55&&record.previousEvidence.checksSkipped===1&&record.previousEvidence.merge===record.baselineMain);
 need(record.status===result.status&&same(record.modules,result.modules));
 for(const k of ['publicationAuthorized','corpusImportAuthorized','publicModulesEnabled','releaseActionPerformed','academicAnalysisCompleted'])need(record.controls[k]===result[k]);
 need(record.controls.manualCrossModuleReview==='pending'&&record.controls.combinedPrivateBrowserReview==='pending'&&record.controls.fieldINP==='not_measured');
 need(record.controls.publishedStudiesAtP104===inputs.editorial.results.publishedStudies&&record.controls.openNeedsAtP104===inputs.editorial.results.openNeeds);
 need(same(record.controls.exclusions,['P1022-R12','Dodson XML','LING-010',...inputs.lexical.scope.excludedCandidates]));
 need(record.progress.historicalCompleted===inputs.manuscripts.progress.completed&&record.progress.total===inputs.selection.progress.expandedTotal&&record.progress.technicalPreparationMilestones===inputs.selection.progress.expandedCompleted+6&&record.progress.technicalPreparationIsNotClosure===true&&record.progress.confirmedOperationalCompletion==='pending_reconciliation');
 need(same(record.progress.remainingGeneralPhases,['P11.4.7','P11.4.8','P11.5'])&&record.next==='P11.4.7.2');
 return result;
}
