import {readFileSync} from 'node:fs';
import {validateCandidates,hashBytes} from './linguistic-audit.mjs';
// The only production projection from the P8.1 reviewed manifest.
export function admittedFiles(manifest){
 return validateCandidates(manifest).files.filter(f=>f.review==='aprobado').map(f=>({id:f.id,commit:f.commit,sha256:f.sha256,allowedComponents:[...f.allowedComponents]}));
}
export function readAdmissions(path='docs/P8/candidatos-linguisticos.json'){
 return admittedFiles(JSON.parse(readFileSync(path,'utf8')));
}
export function verifyImportBytes(manifest,id,bytes,components){
 const f=validateCandidates(manifest).files.find(f=>f.id===id);
 if(!f||f.review!=='aprobado'||!Array.isArray(components)||!components.length||new Set(components).size!==components.length||!components.every(c=>f.allowedComponents.includes(c)))throw new Error('Archivo o componente no admitido');
 if(bytes.length!==f.bytes||hashBytes(bytes)!==f.sha256)throw new Error('Huella o tamaño no coincide');
 return {fileId:f.id,commit:f.commit,sha256:f.sha256};
}
