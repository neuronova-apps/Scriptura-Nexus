import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateComparatorReleaseGate} from './lib/comparator-release-gate-p11455.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const release=read('docs/P11/registro-liberacion-comparador-p11455.json');
const result=evaluateComparatorReleaseGate({candidate:read('docs/P11/registro-candidato-comparador-p11453.json'),integrity:read('docs/P11/registro-integridad-comparador-p11454.json'),registry:read('docs/P9/alineaciones-p931.json'),release});
assert.equal(result.status,release.status);assert.deepEqual(result.blockers,release.expectedBlockers);assert.equal(result.canPublish,false);
console.log(JSON.stringify({phase:'P11.4.5.5',...result,releaseActionPerformed:false}));
