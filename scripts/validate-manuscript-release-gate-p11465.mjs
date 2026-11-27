import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateManuscriptReleaseGate} from './lib/manuscript-release-gate-p11465.mjs';
const paths={"audit":"docs/P11/registro-auditoria-manuscritos-p11461.json","projection":"docs/P11/registro-proyeccion-manuscritos-p11462.json","candidate":"docs/P11/registro-candidato-manuscritos-p11463.json","integrity":"docs/P11/registro-integridad-manuscritos-p11464.json","release":"docs/P11/registro-liberacion-manuscritos-p11465.json","historic":"docs/P9/registro-manuscritos-p942.json","comparator":"docs/P11/registro-liberacion-comparador-p11455.json","lexical":"docs/P11/registro-liberacion-lexicos-p114444.json"};
const input=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,JSON.parse(readFileSync(p,'utf8'))]));
const result=evaluateManuscriptReleaseGate(input);
assert.equal(result.status,input.release.status);assert.deepEqual(result.blockers,input.release.expectedBlockers);assert.equal(result.canPublish,false);
console.log(JSON.stringify({phase:'P11.4.6.5',...result}));
