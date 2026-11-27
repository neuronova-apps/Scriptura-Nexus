import test from 'node:test';
import assert from 'node:assert/strict';
import {loadManual,validateManual} from '../scripts/validate-reader-manual-p11425.mjs';
const reject=f=>{const d=loadManual();f(d);assert.throws(()=>validateManual(d));};
test('reader manual evidence is reported, four conforming and one unevaluable',()=>assert.deepEqual(validateManual(loadManual()),{phase:'P11.4.2.5.validacion_manual',manualConforme:4,manualNoEvaluable:1,realMobileVerified:false,editionDecisionsPending:2,publicationAuthorized:false}));
test('reject inferred mobile validation or acceptance',()=>{reject(d=>d.record.manual.checks[4].status='conforme');reject(d=>d.record.manual.mobile.realDeviceValidated=true);reject(d=>d.record.manual.mobile.deferralAccepted=true);});
test('reject invented test environment or independent observation',()=>{reject(d=>d.record.manual.environment.browser='Chrome');reject(d=>d.record.manual.independentlyVerified=true);});
test('reject authorization and premature closure',()=>{reject(d=>d.record.decisions[0].publication='aprobada');reject(d=>d.record.publicReleaseAuthorized=true);reject(d=>d.record.privacyReview='aprobada');reject(d=>d.record.progress.completed=62);});
test('preserve historical record and public reader boundary',()=>{reject(d=>d.preparation=Buffer.from('{}'));reject(d=>d.history.page+='createIsolatedFragmentReader');});
