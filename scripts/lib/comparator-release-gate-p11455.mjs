// Technical evidence evaluator only. It never grants release permissions.
const fail=()=>{throw Error('Evidencia de liberación del comparador no válida');};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const editions=['TXT-RV1909','TXT-SBLGNT-V1-2'],excluded=['P1022-R12','Dodson XML'];
const keys=['manualScreenReader','manualDeviceReview','rightsAndPrivacyReview','ownerPublicationApproval'];
export function evaluateComparatorReleaseGate({candidate,integrity,registry,release}){
 if(!candidate||!integrity||!registry||!release||candidate.phase!=='P11.4.5.3'||integrity.phase!=='P11.4.5.4'||release.phase!=='P11.4.5.5')fail();
 if(integrity.previousEvidence?.pr!==117||release.previousEvidence?.pr118?.merge!==release.baselineMain||release.previousEvidence?.pr118?.checksSuccess!==49||release.previousEvidence?.pr118?.checksSkipped!==1)fail();
 if(!same(candidate.editions,editions)||!same(release.scope?.editions,editions)||!same(candidate.excluded,excluded)||!same(integrity.excluded,excluded)||!same(release.scope?.excluded,excluded))fail();
 for(const k of ['publicationAuthorized','publicAdapterConnected','corpusPersisted','upload'])if(candidate[k]!==false||integrity[k]!==false)fail();
 for(const k of ['publicArtifact','publicAdapterConnected','corpusPersisted','corpusPublished','publicationAuthorized','releaseActionPerformed','canPublish'])if(release[k]!==false)fail();
 if(candidate.books!==93||candidate.chapters!==1449||candidate.units!==39041||candidate.verifiedGroups!==0||integrity.previousEvidence?.chaptersVerified!==candidate.chapters||integrity.previousEvidence?.units!==candidate.units||integrity.previousEvidence?.verifiedGroups!==0||integrity.previousEvidence?.distUnchanged!==true)fail();
 for(const k of ['books','chapters','units','verifiedGroups'])if(release.scope?.[k]!==candidate[k])fail();
 if(registry.schemaVersion!==1||registry.phase!=='P9.3.1'||registry.scope!=='unit'||registry.publicationAuthorized!==false||!same(registry.alignments,[])||!same(registry.evidence,[]))fail();
 const o=release.previousEvidence?.observed,p=integrity.planned;
 if(!o||!p||o.phase!=='P11.4.5.4'||o.candidate!=='success'||o.catalogFailures!==1||o.chapterFailures!==3||o.recoveries!==4||o.staleChecks!==1||o.keyboardChecks!==1||o.layoutCases!==p.layoutCases||o.axeScans!==p.axeScans||o.verifiedGroups!==0||o.distUnchanged!==true)fail();
 for(const k of ['externalRequests','unexpectedRequests','pageErrors'])if(o[k]!==0)fail();
 for(const k of ['manualScreenReader','physicalDevice','publicationAuthorized','corpusPersisted','upload'])if(o[k]!==false)fail();
 for(const [k,max] of [['initialBodyGzipEstimateBytes',p.initialBodyGzipEstimateMax],['initialJsGzipEstimateBytes',p.initialJsGzipMax]])if(!Number.isSafeInteger(o[k])||o[k]<=0||o[k]>max)fail();
 if(!same(release.progress,integrity.progress)||!same(release.progress,candidate.progress)||release.next!=='P11.4.6')fail();
 const blockers=[];
 for(const k of keys){const approved=k==='ownerPublicationApproval'?'approved':'passed';const v=release.gates?.[k];if(v!=='pending'&&v!==approved)fail();if(v!==approved)blockers.push(k);}
 return Object.freeze({status:blockers.length?'blocked_pending_manual_review':'ready_for_separate_release_action',blockers,canPublish:false,publicationAuthorized:false,corpusPersisted:false,corpusPublished:false,verifiedGroups:0,excluded:[...excluded]});
}
