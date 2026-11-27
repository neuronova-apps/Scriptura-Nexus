import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {createPrivateManuscriptCandidate} from './private-manuscript-projection-p11462.mjs';
export const manuscriptPath='/Scriptura-Nexus/manuscritos/consulta/';
export const manuscriptAssets=manuscriptPath+'private-manuscript/';
const read=p=>readFileSync(p,'utf8');
const replaceOnce=(s,from,to)=>{assert.equal(s.split(from).length,2,'Private UI patch mismatch');return s.replace(from,()=>to);};
const transpile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
export function createPrivateManuscriptOverlay(){
 const {projection}=createPrivateManuscriptCandidate();
 assert.equal(projection.publicationAuthorized,false);
 const payload=Buffer.from(JSON.stringify(projection));
 assert.ok(payload.length>0&&payload.length<=65536);
 const spec={bytes:payload.length,sha256:createHash('sha256').update(payload).digest('hex')};
 const files=new Map(),add=(path,body,type)=>{assert.ok(!files.has(path));files.set(path,{body:Buffer.isBuffer(body)?body:Buffer.from(body),type});};
 const js=(name,body)=>add(manuscriptAssets+name,body,'text/javascript; charset=utf-8');
 add(manuscriptAssets+'references.json',payload,'application/json; charset=utf-8');
 js('view.js',read('scripts/lib/private-manuscript-view-p11463.mjs'));
 js('appearance.js',transpile(read('src/lib/appearance.ts')));
 let ui=read('src/scripts/manuscript-ui.ts');
 ui=replaceOnce(ui,"a.href=url;return a;","a.href=url;a.rel='noreferrer noopener';a.referrerPolicy='no-referrer';return a;");
 ui=replaceOnce(ui,"const evidenceLabels={catalog:","const evidenceLabels={edition_identity:'Identificación de edición textual',bibliographic_reference:'Referencia bibliográfica',catalog:");
 ui=replaceOnce(ui," fields.disabled=false;search.disabled=false;",[
  " const directory=doc.querySelector('#private-evidence-list');",
  " if(directory)directory.replaceChildren(evidenceList(view.evidenceIds()));",
  " fields.disabled=false;search.disabled=false;"
 ].join('\n'));
 js('ui.js',transpile(ui));
 js('init.js',[
  "import {initializeAppearance} from './appearance.js';",
  "import {mountManuscripts} from './ui.js';",
  "import {createIsolatedManuscriptView} from './view.js';",
  "initializeAppearance(document);",
  "const spec="+JSON.stringify(spec)+";",
  "try{",
  " const url=new URL('./references.json',import.meta.url);if(url.origin!==location.origin)throw Error();",
  " const r=await fetch(url,{method:'GET',redirect:'error',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});",
  " if(!r.ok||r.redirected||r.url!==url.href||!r.body)throw Error();",
  " const reader=r.body.getReader(),bytes=new Uint8Array(spec.bytes);let offset=0;",
  " try{while(true){const {done,value}=await reader.read();if(done)break;if(!(value instanceof Uint8Array)||offset+value.length>bytes.length)throw Error();bytes.set(value,offset);offset+=value.length;}}catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}",
  " if(offset!==spec.bytes)throw Error();",
  " const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');if(digest!==spec.sha256)throw Error();",
  " const p=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));mountManuscripts(document,createIsolatedManuscriptView(p));",
  "}catch{document.querySelector('#mv-status').textContent='No se pudo verificar la proyección documental.';}"
 ].join('\n'));
 const original=read('dist/manuscritos/consulta/index.html');
 let html=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 html=replaceOnce(html,'No hay fichas ni variantes autorizadas para consulta pública. La validación documental interna no equivale a autorización de publicación.','Candidato privado de consulta documental. No autorizado para publicación; solo referencias, sin transcripciones ni imágenes de manuscritos.');
 html=replaceOnce(html,'Los controles se habilitarán cuando haya registros autorizados.','Los controles se habilitan exclusivamente para la revisión aislada de la muestra.');
 const before='Las fichas distinguirán catálogo, aparato editorial, testimonio secundario y examen directo documentado.';
 html=replaceOnce(html,before,'La muestra distingue identidad de edición, catálogo, referencia bibliográfica, aparato editorial y testimonio secundario. No se realizó examen directo.');
 html=replaceOnce(html,'</body>','<script type="module" src="'+manuscriptAssets+'init.js"></script></body>');
 const marker='<noscript>';
 assert.equal(html.split(marker).length>=2,true);
 // The directory is inserted immediately before the module-specific noscript.
 html=replaceOnce(html,'<noscript><p>La búsqueda interactiva requiere JavaScript.','<h3>Registro de evidencias de la muestra</h3><div id="private-evidence-list"></div><noscript><p>La búsqueda interactiva requiere JavaScript.');
 add(manuscriptPath,html,'text/html; charset=utf-8');
 assert.equal(read('dist/manuscritos/consulta/index.html'),original);
 return {files,original,spec,summary:{witnesses:2,variants:1,readings:2,resources:7,evidence:8,secondaryAttestations:2,directInspections:0,publicationAuthorized:false,corpusImportAuthorized:false,sourceFilesAdmitted:0,upload:false}};
}
