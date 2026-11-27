import {readFileSync} from 'node:fs';
import {verifyIntegralRegister} from './lib/integral-reconciliation-p11471.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const record=read('docs/P11/registro-conciliacion-integral-p11471.json');
const inputs=Object.fromEntries(Object.entries(record.inputs).map(([k,p])=>[k,read(p)]));
const r=verifyIntegralRegister(record,inputs);
console.log(JSON.stringify({phase:'P11.4.7.1',...r,preparedModules:r.modules.length,manualCrossModuleReview:'pending',combinedPrivateBrowserReview:'pending'}));
