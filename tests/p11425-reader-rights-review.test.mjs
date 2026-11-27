import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRightsReview,validateRightsReview} from '../scripts/validate-reader-rights-review-p11425.mjs';
const reject=f=>{const d=loadRightsReview();f(d);assert.throws(()=>validateRightsReview(d));};
test('documentary reviews do not authorize release',()=>assert.deepEqual(validateRightsReview(loadRightsReview()),{phase:'P11.4.2.5.revision_documental_previa',documentaryReviews:2,editionDecisionsPending:2,privacyFinalPending:true,mobilePending:true,publicationAuthorized:false}));
test('reject inferred worldwide rights or publication',()=>{reject(d=>d.record.reviews[0].territorialAssessment='aprobada_global');reject(d=>d.record.reviews[1].publication='aprobada');reject(d=>d.record.publicReleaseAuthorized=true);});
test('preserve unresolved privacy and mobile checks',()=>{reject(d=>d.record.privacy.status='cerrada');reject(d=>d.record.mobile.deferralAccepted=true);reject(d=>d.record.progress.completed=62);});
test('preserve sources and restricted scope',()=>{reject(d=>d.record.scope.excludeApparatus=false);reject(d=>d.record.reviews[1].licenseBlob='0'.repeat(40));reject(d=>d.manualBytes=Buffer.from('{}'));});
