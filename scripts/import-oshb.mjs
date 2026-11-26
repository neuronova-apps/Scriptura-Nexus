import {readFileSync,appendFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {validateCandidates,rawUrl} from './lib/linguistic-audit.mjs';
import {oshbFileIds,importOshb,summarizeOshb} from './lib/oshb-importer.mjs';
const manifest=validateCandidates(JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8')));
async function download(file){
 const response=await fetch(rawUrl(file,file.commit),{redirect:'error',signal:AbortSignal.timeout(90000)});
 if(!response.ok||!response.body)throw new Error('Descarga OSHB fallida: '+file.id);
 const reader=response.body.getReader(),chunks=[];let count=0;
 try{
  while(true){const {done,value}=await reader.read();if(done)break;
   count+=value.length;if(count>file.bytes||count>4*1024*1024)throw new Error('Tamaño excedido');
   chunks.push(Buffer.from(value));
  }
 }finally{await reader.cancel().catch(()=>{});}
 return Buffer.concat(chunks,count);
}
const report=[];
for(const id of oshbFileIds){
 const file=manifest.files.find(f=>f.id===id);
 if(!file||file.review!=='aprobado')throw new Error('Admisión no vigente');
 const bytes=await download(file);
 const first=summarizeOshb(importOshb(manifest,id,bytes));
 const second=summarizeOshb(importOshb(manifest,id,bytes));
 assert.deepEqual(first,second,'Proyección no reproducible');
 assert.equal(first.chapters,id==='LING-011'?50:12);
 assert.ok(first.verses>0&&first.words>0&&first.segments>0);
 report.push(first);
}
console.log(JSON.stringify({schemaVersion:1,mode:'validation-only',files:report},null,2));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## P8.2.2: importación reproducible, sin publicación\n\n'+
 report.map(x=>'- '+x.book+': '+x.chapters+' capítulos, '+x.verses+' versículos, '+x.words+' palabras directas, '+x.segments+' segmentos; SHA-256 proyección: '+x.projectionSha256+'; estructuras pendientes: '+JSON.stringify(x.pendingStructures)).join('\n')+
 '\n\nDos proyecciones idénticas por archivo. Sin persistir XML, corpus ni anotaciones. Los recuentos excluyen notas y lecturas alternativas.\n');
