import assert from 'node:assert/strict';
const ids=['reader','analyzer','lexical','comparator','manuscripts'];
const types=['keyboard','screenReader','visual','realMobile','rights','privacy','ownerApproval'];
const critical=['keyboard','screenReader','rights','privacy','ownerApproval'];
export function validateManualPlan(r,previous,readerManual,readerAuthorization){
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.7.3');assert.equal(r.status,'manual_review_pending');
 assert.equal(r.previousEvidence.pr,126);assert.equal(r.previousEvidence.merge,r.baselineMain);assert.equal(r.previousEvidence.checksSuccess,57);assert.equal(r.previousEvidence.checksSkipped,1);
 const o=r.previousEvidence.observed;assert.equal(o.phase,previous.phase);assert.equal(o.candidate,'success');
 for(const [k,v] of Object.entries(previous.planned))assert.equal(o[k],v);
 for(const k of ['publicationAuthorized','corpusPersisted','upload','manualReview'])assert.equal(o[k],false);
 assert.equal(o.publicModulesEnabled,0);assert.equal(o.combinedPrivateBrowserReview,true);assert.equal(o.unexpectedRequests,0);
 assert.deepEqual([o.readerChapterRequests,o.analyzerLayerRequests,o.lexicalFragmentRequests,o.manuscriptRequests],[3,2,15,1]);
 assert.deepEqual(r.matrix.map(c=>c.id),ids.flatMap(id=>types.map(t=>id+'.'+t)));
 for(const c of r.matrix){assert.equal(c.id,c.module+'.'+c.type);assert.equal(c.result,'pending');assert.equal(c.evidence,null);assert.equal(c.critical,critical.includes(c.type));}
 assert.deepEqual(r.crossModule.map(c=>c.id),['cross.navigation','cross.appearance','cross.originalLanguages']);
 for(const c of r.crossModule){assert.equal(c.result,'pending');assert.equal(c.evidence,null);}
 assert.equal(r.reviewEnvironment,null);assert.equal(r.reviewMethod.desktopOnly,true);assert.equal(r.reviewMethod.realMobileSupported,false);assert.equal(r.reviewMethod.networkListener,false);assert.equal(r.reviewMethod.externalNavigationBlocked,true);assert.equal(r.reviewMethod.temporaryBrowserContext,true);assert.equal(r.reviewMethod.ciSmokeIsNotManualEvidence,true);
 assert.ok(readerManual.manual.checks.filter(c=>['L01','L02','L03','L04'].includes(c.id)).every(c=>c.status==='conforme'));
 assert.equal(readerManual.manual.independentlyVerified,false);assert.equal(readerManual.manual.checks.find(c=>c.id==='L05').status,'no_evaluable');assert.equal(readerAuthorization.mobile.deferralAccepted,true);assert.equal(readerAuthorization.publicReleaseAuthorized,false);
 assert.deepEqual(r.readerPriorEvidence,{reportedL01L04:'conforme',independentlyVerified:false,L05:'no_evaluable',deferralAccepted:true,appliesOnlyToReader:true});
 for(const k of ['manualReviewCompleted','publicationAuthorized','corpusImportAuthorized','releaseActionPerformed','corpusPersisted','upload'])assert.equal(r[k],false);
 assert.equal(r.publicModulesEnabled,0);assert.deepEqual(r.progress,previous.progress);assert.equal(r.next,'P11.4.7.4');
 return {phase:r.phase,status:r.status,modules:ids.length,moduleChecks:r.matrix.length,crossModuleChecks:r.crossModule.length,manualPassed:0,publicModulesEnabled:0,publicationAuthorized:false};
}
