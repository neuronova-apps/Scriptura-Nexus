import {readFileSync} from 'node:fs';
import {verifyReleaseScope} from './lib/release-scope-p11474.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const d='docs/P11/',integral=read(d+'registro-conciliacion-integral-p11471.json');
const inputs=Object.fromEntries(Object.entries(integral.inputs).map(([k,p])=>[k,read(p)]));
console.log(JSON.stringify(verifyReleaseScope(read(d+'registro-alcance-publicacion-p11474.json'),integral,inputs,read(d+'registro-revision-manual-p11473.json'),read(d+'registro-validacion-conjunta-p11472.json'))));
