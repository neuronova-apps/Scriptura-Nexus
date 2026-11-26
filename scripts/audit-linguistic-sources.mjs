import {readFileSync,appendFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {validateCandidates,rawUrl,inspectBytes} from './lib/linguistic-audit.mjs';
const data=validateCandidates(JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8')));
const refs=new Map(),cache=new Map();
const MAX=64*1024*1024;
async function inspect(url){
 if(cache.has(url))return cache.get(url);
 const res=await fetch(url,{signal:AbortSignal.timeout(90000),redirect:'error'});
 if(!res.ok||!res.body)throw new Error('HTTP '+res.status+' '+url);
 const reader=res.body.getReader();const chunks=[];let n=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>MAX)throw new Error('Límite de auditoría superado');chunks.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}
 const result=inspectBytes(Buffer.concat(chunks,n));cache.set(url,result);return result;
}
const report=[];
for(const f of data.files){
 const key=f.repository+'@'+f.ref;
 if(!refs.has(key)){
  const commit=/^[a-f0-9]{40}$/.test(f.ref)?f.ref:execFileSync('git',['ls-remote','https://github.com/'+f.repository+'.git',f.ref],{encoding:'utf8',timeout:30000}).trim().split(/\s+/)[0];
  if(!/^[a-f0-9]{40}$/.test(commit))throw new Error('Versión no resuelta: '+key);
  refs.set(key,commit);
 }
 const commit=refs.get(key);
 const raw=rawUrl(f,commit),licenseUrl=rawUrl(f,commit,f.licenseEvidencePath);
 const content=await inspect(raw),license=await inspect(licenseUrl);
 if(f.commit&&(f.commit!==commit||f.sha256!==content.sha256||f.bytes!==content.bytes||f.licenseEvidenceSha256!==license.sha256))throw new Error('Integridad distinta de la registrada: '+f.id);
 report.push({id:f.id,dataset:f.dataset,commit,path:f.path,raw,licenseUrl,...content,licenseEvidenceSha256:license.sha256,review:'pendiente_revision_humana'});
}
console.log(JSON.stringify({schemaVersion:1,files:report},null,2));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## P8.1: auditoría de bytes (sin admisión)\n\n'+report.map(x=>'- '+x.id+' · '+x.dataset+' · '+x.bytes+' bytes · commit `'+x.commit+'` · SHA-256 `'+x.sha256+'` · evidencia de licencia `'+x.licenseEvidenceSha256+'`').join('\n')+'\n\nLas señales de cabecera son orientativas; requieren revisión humana por componente. No se guardaron ni publicaron archivos de datos.\n');
