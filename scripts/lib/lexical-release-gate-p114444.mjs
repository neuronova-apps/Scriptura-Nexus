const fail=()=>{throw new Error('Evidencia de liberación no válida');};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const admitted=['LING-015','LING-016','LING-017','LING-018'];
const required=['manualScreenReader','manualDeviceReview','ownerPublicationApproval'];
export function evaluateLexicalReleaseGate({candidate,integrity,release}){
 if(!candidate||!integrity||!release)fail();
 if(candidate.phase!=='P11.4.4.4.2.interfaz_fragmentada_privada'||integrity.phase!=='P11.4.4.4.3.integridad_privacidad_recuperacion')fail();
 if(candidate.gates?.publicationAuthorized!==false||integrity.gates?.publicationAuthorized!==false||release.publicationAuthorized!==false)fail();
 if(candidate.gates?.corpusPersisted!==false||candidate.gates?.corpusPublished!==false||integrity.gates?.corpusPersisted!==false||integrity.gates?.corpusPublished!==false)fail();
 if(release.corpusPersisted!==false||release.corpusPublished!==false||release.publicArtifact!==false)fail();
 if(candidate.observed?.occurrences!==integrity.scope?.occurrences||candidate.observed?.lexicalEntries!==integrity.scope?.lexicalEntries||candidate.observed?.lexicalForms!==integrity.scope?.forms||candidate.observed?.lexicalDefinitions!==integrity.scope?.definitions)fail();
 if(candidate.observed?.concordanceGroups!==integrity.scope?.concordanceGroups||integrity.scope?.queryGroups!==41||integrity.scope?.chapterLayers!==336)fail();
 if(!same(integrity.scope?.admittedHistoricalFiles,admitted))fail();
 if(candidate.gates?.dodsonAdmission!=='pending_approval'||integrity.scope?.dodsonAdmission!=='pending_approval')fail();
 if(release.exclusions?.dodson!=='not_included_pending_separate_approval')fail();
 if(integrity.browserValidation?.publicEmpty!==true||integrity.browserValidation?.noJavaScript!==true||integrity.browserValidation?.distUnchanged!==true)fail();
 if(integrity.browserValidation?.corpusPublished!==false||integrity.browserValidation?.corpusPersisted!==false)fail();
 if(integrity.design?.queryKeysInUrls!==false&&candidate.design?.queryKeysInUrls!==false)fail();
 const blockers=[];
 for(const key of required){
  const value=release.gates?.[key];
  const allowed=key==='ownerPublicationApproval'?['pending','approved']:['pending','passed'];
  if(!allowed.includes(value))fail();
  if(value!==(key==='ownerPublicationApproval'?'approved':'passed'))blockers.push(key);
 }
 const ready=blockers.length===0;
 return Object.freeze({status:ready?'ready_for_separate_release_action':'blocked_pending_manual_review',blockers,canPublish:false,publicationAuthorized:false,corpusPersisted:false,corpusPublished:false,excludedDodson:true});
}
