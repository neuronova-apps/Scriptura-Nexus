import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {validateCandidates,rawUrl} from './linguistic-audit.mjs';
import {admittedFiles} from './linguistic-admission.mjs';
import {oshbFileIds,importOshb} from './oshb-importer.mjs';
import {identifyOshb} from './oshb-occurrences.mjs';
import {organizeLexical} from './oshb-lexical.mjs';
import {organizeMorphology} from './oshb-morphology.mjs';
import {projectGreek,greekAdmissions} from './greek-projection.mjs';
import {oshbSupplements} from './term-analyzer-oshb.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const heb=validateCandidates(json('docs/P8/candidatos-linguisticos.json')),grk=json('docs/P8/admision-griega.json');
const pub=json('src/data/linguistica/registro.json');
assert.ok(pub.schemaVersion===1&&Object.keys(pub).length===8&&['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'].every(k=>Array.isArray(pub[k])&&pub[k].length===0));
async function download(f){
 const res=await fetch(rawUrl(f,f.commit),{redirect:'error',signal:AbortSignal.timeout(90000)});
 if(!res.ok||!res.body)throw new Error('Descarga fallida');
 const chunks=[];let n=0;
 const reader=res.body.getReader();
 try{while(true){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>f.bytes||n>4*1024*1024)throw new Error('Tamaño excedido');chunks.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}
 return Buffer.concat(chunks,n);
}
export async function loadVerifiedAnalyzerData(){
 const p=[];
 for(const id of oshbFileIds){const f=heb.files.find(x=>x.id===id);assert.ok(f&&f.review==='aprobado');p.push(importOshb(heb,id,await download(f)));}
 const occurrence=identifyOshb(p,heb),lexical=organizeLexical(occurrence,heb),morph=organizeMorphology(occurrence,lexical,heb);
 const raw=execFileSync('python3',['scripts/project-greek-p83.py'],{encoding:'utf8',maxBuffer:2*1024*1024,timeout:180000,stdio:['ignore','pipe','pipe']});
 const greek=projectGreek(JSON.parse(raw).rows,grk);
 const registry={schemaVersion:1};
 for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])registry[k]=[...morph.registry[k],...greek.registry[k]];
 assert.equal(registry.units.length,1905);assert.equal(registry.tokens.length,26750);
 return {registry,admissions:[...admittedFiles(heb),...greekAdmissions(grk)],supplements:oshbSupplements(lexical,morph)};
}
