import test from 'node:test';
import assert from 'node:assert/strict';
import {loadAdmission,validateAdmission,mergeExpansion} from '../scripts/lib/linguistic-expansion-p11433.mjs';
test('explicit scope, six admitted sources, no release',()=>{const r=loadAdmission();assert.equal(validateAdmission(r).length,6);assert.equal(r.scope.totalOccurrences,78218);assert.equal(r.publicationAuthorized,false);});
test('reject changed source fingerprint, expanded components, or inferred release',()=>{for(const mutate of [r=>r.admitted[0].sha256='0'.repeat(64),r=>r.admitted[3].allowedComponents.push('texto_griego'),r=>r.publicationAuthorized=true,r=>r.scope.books.push('Exod')]){const r=loadAdmission();mutate(r);assert.throws(()=>validateAdmission(r));}});
test('reject changed projection or extra book before consuming any data',()=>{const r=loadAdmission();assert.throws(()=>mergeExpansion({}, {summary:{},books:{}},r));assert.throws(()=>mergeExpansion({}, {summary:r.verifiedProjection,books:{Lev:{},Deut:{},Acts:{},'1Cor':{},Exod:{}}},r));});
