import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {verifyImportBytes} from './linguistic-admission.mjs';

const books=Object.freeze({'LING-011':'Gen','LING-012':'Dan'});
const components=Object.freeze(['texto_wlc','anotaciones_lema','anotaciones_morfologia']);
const parser=fileURLToPath(new URL('./oshb-osis.py',import.meta.url));
export const oshbFileIds=Object.freeze(Object.keys(books));

// Low-level parser for synthetic tests; production must use importOshb.
export function parseOshbXml(bytes,book){
 if(!Buffer.isBuffer(bytes)||bytes.length>4*1024*1024)throw new Error('Bytes XML inválidos');
 const result=spawnSync('python3',['-I',parser,book],{input:bytes,encoding:'utf8',timeout:30000,maxBuffer:48*1024*1024});
 if(result.error||result.status!==0)throw new Error('XML OSIS rechazado o intérprete no disponible');
 return JSON.parse(result.stdout);
}

export function importOshb(manifest,id,bytes){
 if(!Object.hasOwn(books,id))throw new Error('Archivo fuera del alcance OSHB P8.2.2');
 const origin=verifyImportBytes(manifest,id,bytes,components);
 const file=manifest.files.find(f=>f.id===id);
 if(file.repository!=='openscriptures/morphhb'||file.path!=='wlc/'+books[id]+'.xml'||file.dataset!=='OSHB v.2.2')throw new Error('Edición o ruta inesperada');
 const projection=parseOshbXml(bytes,books[id]);
 return {schemaVersion:1,source:{...origin,repository:file.repository,path:file.path,
   edition:file.dataset,versification:'Bible.MT',components:[...components],
   attribution:file.attribution,license:file.declaredLicense,
   licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
   transformation:'Proyección OSIS directa; notas y estructuras pendientes no copiadas; códigos originales sin interpretar.'},...projection};
}
export function summarizeOshb(projection){
 let verses=0,words=0,segments=0,missingLemma=0,missingMorph=0;
 for(const chapter of projection.chapters)for(const verse of chapter.verses){
  verses++;
  for(const e of verse.events)if(e.kind==='word'){
   words++;if(e.lemmaRaw===null)missingLemma++;if(e.morphRaw===null)missingMorph++;
  }else segments++;
 }
 return {source:projection.source,book:projection.book,chapters:projection.chapters.length,
  verses,words,segments,missingLemma,missingMorph,pendingStructures:projection.pendingStructures,
  projectionSha256:createHash('sha256').update(JSON.stringify(projection),'utf8').digest('hex')};
}
