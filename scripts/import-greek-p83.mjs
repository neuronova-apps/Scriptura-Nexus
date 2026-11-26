import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {projectGreek} from './lib/greek-projection.mjs';
const manifest=JSON.parse(readFileSync('docs/P8/admision-griega.json','utf8'));
const publicRegistry=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));
assert.ok(Object.keys(publicRegistry).length===8&&publicRegistry.schemaVersion===1&&['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'].every(k=>Array.isArray(publicRegistry[k])&&publicRegistry[k].length===0),'Registro público no vacío');
function run(){
 // The pipe stays private: never forward corpus-bearing stdout or child-process errors to logs.
 try{
  const raw=execFileSync('python3',['scripts/project-greek-p83.py'],{encoding:'utf8',maxBuffer:2*1024*1024,timeout:180000,stdio:['ignore','pipe','pipe']});
  return projectGreek(JSON.parse(raw).rows,manifest);
 }catch{throw new Error('Proyección griega: verificación de fuentes o contratos fallida (sin volcar datos)');}
}
const a=run(),b=run();
assert.ok(JSON.stringify(a)===JSON.stringify(b),'Proyección no reproducible');
console.log(JSON.stringify({mode:'P8.3.2-validation-only',...a.summary,admittedFiles:2,deferred:['GRK-C03'],publicRegistryEmpty:true,textPolicy:'Formas originales separadas por espacios; no es reconstrucción de puntuación editorial.'},null,2));
