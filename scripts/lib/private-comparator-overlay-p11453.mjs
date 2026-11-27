// Isolated comparator overlay; no server, public route change or artifact write.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createCandidate} from '../prepare-reader-candidate-p11425.mjs';
const prefix='/Scriptura-Nexus/';
export const comparatorPath=prefix+'biblia/comparador/';
export const privateAssets=comparatorPath+'private-comparator/';
export const readerAssets=prefix+'biblia/lector/reader-data/';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFileSync(p,'utf8');
const replaceOnce=(text,from,to)=>{
 assert.equal(text.split(from).length,2,'Expected single private overlay patch');
 return text.replace(from,()=>to);
};
const transpile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
export function privateUiSource(source){
 let s=source;
 s=replaceOnce(s,' const clear=()=>{',' let sequence=0;\n const clear=()=>{\n  sequence++;');
 s=replaceOnce(s,"form.addEventListener('submit',event=>{","form.addEventListener('submit',async event=>{");
 s=replaceOnce(s,'  const x=engine.compare(ref(l),r[0].value,r[1].value?ref(r):undefined);',[
  '  clear();const ticket=++sequence;status.textContent="Verificando las referencias…";',
  '  let x;try{x=await engine.compare(ref(l),r[0].value,r[1].value?ref(r):undefined);}',
  '  catch{if(ticket===sequence)status.textContent="No se pudo verificar el fragmento. Intenta nuevamente.";return;}',
  '  if(ticket!==sequence)return;'
 ].join('\n'));
 s=replaceOnce(s,"readerStatus[x.literalProbe]","(x.literalProbe==='label_present'?'Etiqueta presente en el catálogo; el texto de destino no se ha verificado mediante este diagnóstico.':readerStatus[x.literalProbe])");
 return transpile(s).replace('../lib/comparator-view','./comparator-view.js').replace('../lib/reader-view','./reader-view.js');
}
export async function createPrivateComparatorOverlay(readerCandidate){
 const {overlay:reader,summary}=readerCandidate??await createCandidate();
 assert.deepEqual([summary.editions,summary.books,summary.chapters,summary.units,summary.publicationAuthorized,summary.corpusPersisted],[2,93,1449,39041,false,false]);
 const files=new Map(),add=(path,body,type)=>{assert.ok(!files.has(path));files.set(path,{body:Buffer.isBuffer(body)?body:Buffer.from(body),type});};
 for(const [path,file] of reader)if(path===readerAssets+'catalog.json.gz'||path.startsWith(readerAssets+'chapters/'))files.set(path,file);
 assert.equal(files.size,1450);
 const catalog=files.get(readerAssets+'catalog.json.gz').body,raw=gunzipSync(catalog,{maxOutputLength:8*1024*1024});
 const spec={gzipBytes:catalog.length,jsonBytes:raw.length,gzipSha256:sha(catalog),sha256:sha(raw)};
 const registry=JSON.parse(read('docs/P9/alineaciones-p931.json'));
 assert.equal(registry.publicationAuthorized,false);assert.deepEqual(registry.alignments,[]);assert.deepEqual(registry.evidence,[]);
 const js=(name,code)=>add(privateAssets+name,code,'text/javascript; charset=utf-8');
 for(const name of ['reader-view.js','reader-fragment-view.js','appearance.js','static-gzip.js'])js(name,reader.get(readerAssets+name).body);
 js('comparator-view.js',transpile(read('src/lib/comparator-view.ts')).replace('./reader-view.ts','./reader-view.js'));
 js('private-contract.js',replaceOnce(read('scripts/lib/private-comparator-p11452.mjs'),'../../src/lib/reader-fragment-view.ts','./reader-fragment-view.js'));
 js('comparator-ui.js',privateUiSource(read('src/scripts/comparator-ui.ts')));
 js('init.js',[
  "import {initializeAppearance} from './appearance.js';",
  "import {createPrivateComparator} from './private-contract.js';",
  "import {mountComparator} from './comparator-ui.js';",
  "import {loadStaticGzip} from './static-gzip.js';",
  "initializeAppearance(document);",
  "const spec="+JSON.stringify(spec)+";",
  "const registry="+JSON.stringify(registry)+";",
  "const base="+JSON.stringify(readerAssets)+";",
  "const load=(path,d)=>loadStaticGzip(new URL(base+path,location.origin),d,location.origin);",
  "try{const bytes=await load('catalog.json.gz',spec);const catalog=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));const engine=createPrivateComparator(catalog,d=>load('chapters/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/')+'.json.gz',d),registry);mountComparator(document,engine);}catch{document.querySelector('#bc-status').textContent='No se pudo verificar el candidato.';}"
 ].join('\n'));
 const readerHtml=reader.get(prefix+'biblia/lector/').body.toString('utf8');
 const rights=readerHtml.match(/<section class="sn-card sn-card--default" id="candidate-rights">[\s\S]*?<\/section>/)?.[0];
 const privacy=readerHtml.match(/<section class="sn-card sn-card--default" id="candidate-privacy">[\s\S]*?<\/section>/)?.[0];
 assert.ok(rights&&privacy);
 const original=read('dist/biblia/comparador/index.html');
 const notice='No hay ediciones autorizadas para comparación pública. El corpus y las correspondencias documentales requieren revisión y autorización.';
 const closing=/<\/div>\s*<\/div>\s*<\/main>/;
 assert.ok(original.includes(notice)&&closing.test(original)&&original.includes('</body>'));
 const html=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(notice,'Candidato privado de comparación: no está autorizado para publicación. Las lecturas son independientes.')
  .replace(closing,m=>rights+privacy+m)
  .replace('</body>','<script type="module" src="'+privateAssets+'init.js"></script></body>');
 add(comparatorPath,html,'text/html; charset=utf-8');
 assert.equal(read('dist/biblia/comparador/index.html'),original);
 return {files,summary:{...summary,verifiedGroups:0,publicAdapterConnected:false,upload:false},original};
}
