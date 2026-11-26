import {createHash} from 'node:crypto';
const repos={F01:'STEPBible/STEPBible-Data',F02:'openscriptures/morphhb'};
const sha=(x,n)=>typeof x==='string'&&new RegExp('^[a-f0-9]{'+n+'}$').test(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
const path=x=>text(x)&&!/[\\\\:\u0000-\u001f?#]/.test(x)&&!x.split('/').some(p=>!p||p==='.'||p==='..');
export const hashBytes=bytes=>createHash('sha256').update(bytes).digest('hex');
export function validateCandidates(data){
 if(!data||data.schemaVersion!==1||!Array.isArray(data.files)||!Array.isArray(data.deferred))throw new Error('Manifiesto de candidatos inválido');
 const ids=new Set(),keys=new Set();
 for(const f of data.files){
  if(!f||!/^LING-\d{3}$/.test(f.id)||ids.has(f.id)||!Object.hasOwn(repos,f.sourceId)||repos[f.sourceId]!==f.repository||!path(f.path)||!path(f.licenseEvidencePath)||!(sha(f.ref,40)||f.ref==='refs/heads/master')||!text(f.scope)||!text(f.declaredLicense)||!['he','he-arc','grc'].includes(f.language))throw new Error('Candidato inválido');
  const key=f.repository+'/'+f.path;if(keys.has(key))throw new Error('Archivo duplicado');keys.add(key);ids.add(f.id);
  if(!['pendiente','rechazado','aprobado'].includes(f.review))throw new Error('Decisión inválida');
  const integrity=sha(f.commit,40)&&sha(f.sha256,64)&&Number.isSafeInteger(f.bytes)&&f.bytes>0&&sha(f.licenseEvidenceSha256,64);
  if(f.commit!==null||f.sha256!==null||f.bytes!==null||f.licenseEvidenceSha256!==null){if(!integrity)throw new Error('Integridad incompleta');if(sha(f.ref,40)&&f.ref!==f.commit)throw new Error('Commit incoherente');}
  if(f.review==='aprobado'){if(!integrity||!text(f.approvalRef))throw new Error('Aprobación sin evidencia por archivo');}
  else if(f.approvalRef!==null)throw new Error('Referencia de aprobación sin decisión');
 }
 return data;
}
export function rawUrl(f,commit,file=f.path){
 if(!sha(commit,40)||!Object.hasOwn(repos,f.sourceId)||repos[f.sourceId]!==f.repository||!path(file))throw new Error('Origen inválido');
 return 'https://raw.githubusercontent.com/'+f.repository+'/'+commit+'/'+file.split('/').map(encodeURIComponent).join('/');
}
export function inspectBytes(bytes){
 if(!bytes.length)throw new Error('Archivo vacío');
 const decoded=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 if(/^\s*<(?:!doctype html|html)/i.test(decoded))throw new Error('Respuesta HTML en lugar de datos');
 const header=decoded.slice(0,18000);
 return {bytes:bytes.length,sha256:hashBytes(bytes),utf8:true,headerSignals:{mentionsLicense:/licen[cs]e|creative commons|cc[- ]by/i.test(header),mentionsRedistribution:/redistribut|distribut|mirror/i.test(header),mentionsRestriction:/do not redistribute|not redistribute|non-commercial|cc[- ]by[- ]nc|permission/i.test(header),mentionsAttribution:/attribut|credit/i.test(header)}};
}
