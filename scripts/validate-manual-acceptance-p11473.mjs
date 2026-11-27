import {readFileSync} from 'node:fs';
import {validateManualPlan} from './lib/manual-acceptance-plan-p11473.mjs';
const read=p=>JSON.parse(readFileSync('docs/P11/'+p,'utf8'));
console.log(JSON.stringify(validateManualPlan(read('registro-revision-manual-p11473.json'),read('registro-validacion-conjunta-p11472.json'),read('registro-validacion-manual-lector-p11425.json'),read('registro-autorizacion-preparacion-lector-p11425.json'))));
