import test from 'node:test';
import assert from 'node:assert/strict';
import {validateIndexPlan} from '../scripts/lib/concordance-index-plan-p11443.mjs';
test('expanded index plan fixes observed coverage and preserves missing annotations',()=>{const r=validateIndexPlan();assert.equal(r.scope.occurrences,78218);assert.equal(r.observed.sample.occurrencesWithoutAdmittedLemma,1486);assert.equal(r.scope.books.length,7);});
test('rejects new admission, inferred links, publication, or changed coverage',()=>{for(const change of [r=>r.decision.newAdmissions=1,r=>r.decision.publicationAuthorized=true,r=>r.decision.automaticCorpusLinks=true,r=>r.scope.occurrences++,r=>r.observed.dodson.technicalAdmission='aprobado',r=>r.scope.excludedCandidates.pop(),r=>r.observed.sample.occurrencesWithoutAdmittedLemma=0]){const r=validateIndexPlan();change(r);assert.throws(()=>validateIndexPlan(r));}});
