import test from 'node:test';
import assert from 'node:assert/strict';
import {loadP11425,validateP11425} from '../scripts/validate-reader-preparation-p11425.mjs';
const reject=f=>{const d=loadP11425();f(d);assert.throws(()=>validateP11425(d));};
test('verified historical evidence and pending decisions',()=>assert.deepEqual(validateP11425(loadP11425()),{phase:'P11.4.2.5.preparacion',manualPending:5,editionDecisionsPending:2,publicReleaseAuthorized:false}));
test('no inferred public release or territorial decision',()=>{reject(d=>d.record.decisions[0].territorialReview='aprobada');reject(d=>d.record.decisions[1].publication='aprobada');reject(d=>d.record.publicReleaseAuthorized=true);});
test('manual checks and privacy remain pending',()=>{reject(d=>d.record.manualChecks[0].status='conforme');reject(d=>d.record.privacyReview='aprobada');});
test('preserve public boundary and source records',()=>{reject(d=>d.page+='createIsolatedFragmentReader');reject(d=>d.rights=Buffer.from('{}'));reject(d=>d.record.preview.corpusPersisted=true);});
