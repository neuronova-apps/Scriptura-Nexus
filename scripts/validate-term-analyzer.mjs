import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {validateCandidates,rawUrl} from './lib/linguistic-audit.mjs';
import {admittedFiles} from './lib/linguistic-admission.mjs';
import {oshbFileIds,importOshb} from './lib/oshb-importer.mjs';
import {identifyOshb} from './lib/oshb-occurrences.mjs';
import {organizeLexical} from './lib/oshb-lexical.mjs';
import {organizeMorphology} from './lib/oshb-morphology.mjs';
import {projectGreek,greekAdmissions} from './lib/greek-projection.mjs';
import {oshbSupplements} from './lib/term-analyzer-oshb.mjs';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
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
let stage='inicio';
async function main(){
 stage='importacion-oshb';
 const p=[];
 for(const id of oshbFileIds){const f=heb.files.find(x=>x.id===id);assert.ok(f&&f.review==='aprobado');p.push(importOshb(heb,id,await download(f)));}
 stage='proyeccion-oshb';
 const occurrence=identifyOshb(p,heb),lexical=organizeLexical(occurrence,heb),morph=organizeMorphology(occurrence,lexical,heb);
 stage='proyeccion-griega';
 const raw=execFileSync('python3',['scripts/project-greek-p83.py'],{encoding:'utf8',maxBuffer:2*1024*1024,timeout:180000,stdio:['ignore','pipe','pipe']});
 const greek=projectGreek(JSON.parse(raw).rows,grk);
 const combined={schemaVersion:1};
 for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])combined[k]=[...morph.registry[k],...greek.registry[k]];
 const admissions=[...admittedFiles(heb),...greekAdmissions(grk)];
 stage='adaptador-oshb';
 const supplements=oshbSupplements(lexical,morph);
 stage='contrato-motor';
 const engine=createTermAnalyzer(combined,admissions,supplements);
 const again=createTermAnalyzer(combined,admissions,supplements);
 stage='cobertura';
 assert.equal(combined.tokens.length,26750);
 assert.equal(combined.units.length,1905);
 const count={hbo:0,arc:0,grc:0},states={},hash=createHash('sha256');
 stage='consulta-real';
 for(const u of combined.units){
  const ref={editionId:u.editionId,bookId:u.bookId,chapter:u.chapter,verse:u.verse};
  const found=engine.select(ref);assert.equal(found.status,'disponible');assert.equal(found.unitId,u.id);
  assert.ok(found.occurrences.length>0);
  for(const t of found.occurrences){
   const a=engine.analyze(t.id),b=again.analyze(t.id);
   assert.ok(a.status==='disponible'&&a.token.form===t.form&&a.token.language===t.language&&a.token.direction===(t.language==='grc'?'ltr':'rtl')&&a.identifiers.length===0&&a.meaning.state==='no_disponible');
   assert.ok(JSON.stringify(a)===JSON.stringify(b));
   count[t.language]++;
   const k=t.language+':'+a.morphology.state;states[k]=(states[k]??0)+1;
   hash.update(JSON.stringify(a),'utf8');
  }
 }
 stage='conciliacion';
 assert.deepEqual(count,{hbo:22930,arc:3601,grc:219});
 assert.equal(states['grc:documentado'],213);assert.equal(states['grc:sin_interpretar'],3);assert.equal(states['grc:ausente'],3);
 assert.equal(engine.analyze('TOK-inexistente').status,'ocurrencia_no_disponible');
 assert.equal(engine.select({editionId:'TXT-inexistente',bookId:'LIB-Gen',chapter:'1',verse:'1'}).status,'edicion_no_disponible');
 const edition=engine.coverage().find(e=>e.languages.includes('grc'));
 assert.equal(engine.select({editionId:edition.editionId,bookId:'LIB-Matt',chapter:'1',verse:'1'}).status,'fuera_de_cobertura');
 assert.equal(engine.select({editionId:edition.editionId,bookId:'LIB-3John',chapter:'2',verse:'1'}).status,'unidad_no_disponible');
 console.log(JSON.stringify({mode:'P8.3.3-validation-only',editions:combined.editions.length,units:combined.units.length,occurrences:combined.tokens.length,languageCounts:count,states,admittedFiles:admissions.length,identifiers:0,published:0,publicRegistryEmpty:true,sha256:hash.digest('hex')},null,2));
}
try{await main();}catch(e){const safe=['Registro lingüístico inválido o no admitido','Suplemento ajeno o duplicado','Lema ausente con datos','Procedencia léxica no admitida','Componentes léxicos divergentes','Vínculo léxico inválido','Estado morfológico inválido','Suplemento morfológico divergente'];throw new Error('Validación del motor fallida en '+stage+(safe.includes(e?.message)?': '+e.message:'')+'; datos de corpus omitidos');}
