// Evaluates documentary and CI evidence only; never authorizes publication.
const fail=()=>{throw Error('Evidencia de liberación de manuscritos no válida');};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const scope={witnesses:2,variants:1,readings:2,resources:7,evidence:8,secondaryAttestations:2,directInspections:0,sourceFilesAdmitted:0};
const gates=['manualScreenReader','manualDeviceReview','rightsAndLinksReview','privacyReview','ownerPublicationApproval'];
export function evaluateManuscriptReleaseGate({audit,projection,candidate,integrity,release,historic,comparator,lexical}){
 if(!audit||!projection||!candidate||!integrity||!release||!historic||!comparator||!lexical)fail();
 for(const [r,phase] of [[audit,'P11.4.6.1'],[projection,'P11.4.6.2'],[candidate,'P11.4.6.3'],[integrity,'P11.4.6.4'],[release,'P11.4.6.5']])if(r.schemaVersion!==1||r.phase!==phase||!same(r.progress,release.progress))fail();
 if(projection.previousEvidence?.pr!==120||candidate.previousEvidence?.pr!==121||integrity.previousEvidence?.pr!==122||release.previousEvidence?.pr123?.merge!==release.baselineMain||release.previousEvidence?.pr123?.checksSuccess!==54||release.previousEvidence?.pr123?.checksSkipped!==1)fail();
 if(projection.rights?.decision!=='reference_only_historical_scope'||projection.rights?.resourceUse!=='reference_only'||projection.rights?.newAdmissions!==false||projection.rights?.currentExternalReview!=='pending_before_release'||candidate.rightsReview!=='pending_before_release'||integrity.rightsReview!=='pending_before_release')fail();
 for(const r of [projection,candidate,integrity])for(const k of ['publicationAuthorized','corpusImportAuthorized','publicAdapterConnected','sourceContentPersisted','upload'])if(r[k]!==false)fail();
 for(const k of ['publicationAuthorized','corpusImportAuthorized','publicAdapterConnected','imagesPersisted','transcriptionsPersisted','apparatusPersisted','thirdPartyMetadataImported','automaticAlignment','automaticWitnessAttribution','originalityAssessment'])if(audit.controls?.[k]!==false)fail();
 for(const k of ['publicArtifact','publicAdapterConnected','sourceContentPersisted','sourceContentPublished','publicationAuthorized','corpusImportAuthorized','releaseActionPerformed','canPublish','upload'])if(release[k]!==false)fail();
 for(const [k,n] of Object.entries(scope))if(projection.scope?.[k]!==n||candidate.scope?.[k]!==n||integrity.previousEvidence?.observed?.[k]!==n||release.scope?.[k]!==n)fail();
 if(release.scope.mode!=='reference_only_pilot'||release.scope.edition!==audit.scope?.edition||release.scope.locus!=='John 1:18'||!same(release.scope.witnessIds,audit.scope?.witnesses)||!same(release.scope.variantIds,audit.scope?.variants)||!same(release.scope.witnessIds,['MAN-GA-P66','MAN-GA-02'])||!same(release.scope.variantIds,['VAR-P943-JHN-1-18']))fail();
 for(const k of ['folioVerified','handVerified','assessments'])if(release.scope[k]!==0||audit.scope?.[k]!==0)fail();
 const prev=integrity.previousEvidence.observed,o=release.previousEvidence?.observed,p=integrity.planned;
 if(prev.candidate!=='success'||prev.browserScenarios!==8||prev.projectionRequests!==1||prev.externalRequests!==0||prev.pageErrors!==0||prev.distUnchanged!==true||prev.manualReview!==false||!o||!p||o.phase!=='P11.4.6.4'||o.candidate!=='success'||o.distUnchanged!==true)fail();
 for(const k of ['failureInjections','recoveries','layoutCases','axeScans','keyboardChecks'])if(o[k]!==p[k])fail();
 if(o.failureInjections!==5||o.recoveries!==5||o.layoutCases!==24||o.axeScans!==4||o.keyboardChecks!==2||o.projectionRequests!==11||o.projectionBytes!==prev.projectionBytes)fail();
 for(const k of ['externalRequests','unexpectedRequests','pageErrors'])if(o[k]!==0)fail();
 for(const k of ['manualScreenReader','physicalDevice','publicationAuthorized','corpusImportAuthorized','sourceContentPersisted','upload'])if(o[k]!==false)fail();
 for(const [k,max] of [['projectionBytes',65536],['initialBodyGzipEstimateBytes',512000],['initialJsGzipEstimateBytes',153600]])if(!Number.isSafeInteger(o[k])||o[k]<=0||o[k]>max)fail();
 for(const k of ['editions','witnesses','variants','readings','translations'])if(!same(historic[k],[]))fail();
 for(const k of ['publicationAuthorized','corpusImportAuthorized','textualContentPersisted','apparatusContentPersisted','imagesPersisted','automaticWitnessAttribution','automaticAlignment'])if(historic[k]!==false)fail();
 if(comparator.canPublish!==false||lexical.canPublish!==false||release.next!=='P11.4.7')fail();
 const blockers=[];
 for(const k of gates){const passed=k==='ownerPublicationApproval'?'approved':'passed';const value=release.gates?.[k];if(value!=='pending'&&value!==passed)fail();if(value!==passed)blockers.push(k);}
 return Object.freeze({status:blockers.length?'blocked_pending_manual_review':'ready_for_separate_release_action',blockers,canPublish:false,publicationAuthorized:false,corpusImportAuthorized:false,sourceContentPublished:false,sourceContentPersisted:false,releaseActionPerformed:false,scope:'reference_only_pilot',directInspections:0,sourceFilesAdmitted:0});
}
