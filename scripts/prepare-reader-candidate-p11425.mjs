// Build a private static-file overlay in memory, never write to dist or upload.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import ts from 'typescript';
import {readLoopbackGzip} from './lib/reader-loopback-gzip.mjs';
import {loadAuthorization,validateAuthorization} from './validate-reader-authorization-p11425.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const prefix='/Scriptura-Nexus/',root=prefix+'biblia/lector/',assets=root+'reader-data/';
const known=[['TXT-RV1909',66,1189,31102,18],['TXT-SBLGNT-V1-2',27,260,7939,0]];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const staticPath=d=>assets+'chapters/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/')+'.json.gz';
function checkCatalog(c){
 assert.equal(c.schemaVersion,1);assert.equal(c.mode,'isolated_validation');assert.equal(c.publicationAuthorized,false);assert.equal(c.editions.length,2);
 const keys=new Set(),descriptors=[];
 for(const [i,e] of c.editions.entries()){
  const [id,books,chapters,units,empty]=known[i];assert.equal(e.id,id);assert.equal(e.books.length,books);assert.equal(new Set(e.books.map(b=>b.id)).size,books);
  let n=0,u=0,z=0;
  for(const b of e.books){assert.match(b.id,/^LIB-[A-Z0-9]+$/);for(const d of b.chapters){
   assert.equal(d.editionId,id);assert.equal(d.bookId,b.id);assert.match(d.chapter,/^[1-9][0-9]*$/);
   assert.ok(Number.isSafeInteger(d.jsonBytes)&&d.jsonBytes>0&&d.jsonBytes<=8*1024*1024&&Number.isSafeInteger(d.gzipBytes)&&d.gzipBytes>0&&d.gzipBytes<=256000);
   assert.match(d.sha256,/^[0-9a-f]{64}$/);assert.match(d.gzipSha256,/^[0-9a-f]{64}$/);
   const path=staticPath(d);assert.ok(!keys.has(path));keys.add(path);descriptors.push(d);n++;u+=d.unitCount;z+=d.emptyMarkers;
  }}assert.deepEqual([n,u,z],[chapters,units,empty]);
 }
 return descriptors;
}
async function makeCandidate(backend,ready){
 validateAuthorization(loadAuthorization());
 assert.equal(ready.publicationAuthorized,false);assert.equal(ready.fragments,1449);
 const catalog=await readLoopbackGzip(backend,'/catalog',{expectedGzipBytes:ready.catalogGzipBytes,expectedJsonBytes:ready.catalogJsonBytes});
 const parsed=JSON.parse(catalog.raw.toString('utf8')),ds=checkCatalog(parsed);
 const overlay=new Map(),add=(path,body,type)=>{assert.ok(!overlay.has(path));overlay.set(path,{body:Buffer.isBuffer(body)?body:Buffer.from(body),type});};
 add(assets+'catalog.json.gz',catalog.packed,'application/octet-stream');
 let gzipBytes=catalog.packed.length;
 for(const d of ds){
  const path='/chapter/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/');
  const {raw,packed}=await readLoopbackGzip(backend,path,{expectedGzipBytes:d.gzipBytes,expectedJsonBytes:d.jsonBytes});
  assert.ok(sha(raw)===d.sha256&&sha(packed)===d.gzipSha256,'fragment digest');
  add(staticPath(d),packed,'application/octet-stream');gzipBytes+=packed.length;
 }
 assert.equal(ds.length,1449);assert.equal(overlay.size,1450);
 for(const [name,file] of [['reader-view.js','src/lib/reader-view.ts'],['reader-fragment-view.js','src/lib/reader-fragment-view.ts'],['reader-ui.js','src/scripts/reader-ui.ts'],['appearance.js','src/lib/appearance.ts']]){
  const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/(['"])\.\.\/lib\/reader-view\1/g,"'./reader-view.js'").replace(/(['"])\.\/reader-view\.ts\1/g,"'./reader-view.js'");
  add(assets+name,js,'text/javascript; charset=utf-8');
 }
 add(assets+'static-gzip.js',readFileSync('scripts/lib/reader-static-gzip.mjs'),'text/javascript; charset=utf-8');
 const catalogSpec={gzipBytes:catalog.packed.length,jsonBytes:catalog.raw.length,gzipSha256:sha(catalog.packed),sha256:sha(catalog.raw)};
 add(assets+'init.js',[
 "import {initializeAppearance} from './appearance.js';",
 "import {createIsolatedFragmentReader} from './reader-fragment-view.js';",
 "import {mountReader} from './reader-ui.js';",
 "import {loadStaticGzip} from './static-gzip.js';",
 "initializeAppearance(document);",
 "const spec="+JSON.stringify(catalogSpec)+";",
 "const read=(path,d)=>loadStaticGzip(new URL(path,import.meta.url),d,location.origin);",
 "try{const raw=await read('catalog.json.gz',spec);const catalog=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));const view=createIsolatedFragmentReader(catalog,d=>read('chapters/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/')+'.json.gz',d));mountReader(document,view);}catch{document.querySelector('#br-status').textContent='No se pudo verificar el candidato.';}"
 ].join('\n'),'text/javascript; charset=utf-8');
 const rights=JSON.parse(readFileSync('docs/P11/registro-permisos-lector-p11421.json','utf8'));
 const sections=rights.editions.map((e,i)=>{
  const source=parsed.editions[i].source,links=[...new Set([e.source,source,...e.rightsSources])];
  const transform=e.id==='ED-C01'?'Proyección del texto principal USFM: se excluyen notas, referencias cruzadas, encabezados y marcadores de formato; se normalizan espacios y se preservan etiquetas nativas.':'Proyección XML de palabras, prefijos y sufijos en orden de fuente; separadores de palabras y conservación de puntuación, Unicode y etiquetas nativas. No se incluye aparato crítico.';
  return '<h3>'+esc(e.editionId+' · '+e.version)+'</h3><p>'+esc(e.license)+'</p><p>'+esc(e.attribution)+'</p><p>'+esc(transform)+'</p><ul>'+links.map(link=>'<li><a rel="noreferrer" href="'+esc(link)+'">'+esc(link===source?'Fuente utilizada':link===e.source?'Fuente fijada':'Derechos y licencia')+'</a></li>').join('')+'</ul>';
 }).join('');
 const supplement='<section class="sn-card sn-card--default" id="candidate-rights"><h2>Fuentes, licencias y transformaciones</h2>'+sections+'</section><section class="sn-card sn-card--default" id="candidate-privacy"><h2>Privacidad de la consulta</h2><p>No se requiere cuenta y la aplicación no guarda historial de lectura ni envía analítica de consultas. Los capítulos se solicitan al mismo sitio. Se guardan únicamente las preferencias visuales en el navegador. En el futuro alojamiento público, GitHub Pages registra direcciones IP por seguridad; las solicitudes de recursos pueden quedar en los registros del proveedor.</p><p><a rel="noreferrer" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">Declaración de privacidad de GitHub</a></p></section>';
 const original=readFileSync('dist/biblia/lector/index.html','utf8'),notice='No hay ediciones autorizadas para consulta pública. La validación técnica de las fuentes no equivale a autorización de publicación.';
 assert.ok(original.includes(notice)&&original.includes('</body>')&&original.includes('</main>'));
 const html=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</head>','<meta name="referrer" content="no-referrer"></head>').replace(notice,'Candidato de publicación: revisión privada, no disponible en el sitio público.').replace('Los controles se habilitarán cuando exista una edición autorizada.','Los controles se habilitan al verificar el catálogo del candidato.').replace('</main>',supplement+'</main>').replace('</body>','<script type="module" src="'+assets+'init.js"></script></body>');
 add(root,html,'text/html; charset=utf-8');
 assert.equal(overlay.size,1457);
 return {overlay,summary:{editions:2,books:93,chapters:ds.length,units:ds.reduce((n,d)=>n+d.unitCount,0),gzipBytes,publicationAuthorized:false,corpusPersisted:false}};
}
const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
let child,server,lines,stage='authorization';
const finish=()=>{server?.closeAllConnections();server?.close();lines?.close();child?.kill();};
process.once('SIGINT',()=>{finish();process.exit(0);});process.once('SIGTERM',()=>{finish();process.exit(0);});
try{
 validateAuthorization(loadAuthorization());stage='source';
 child=spawn(process.env.PYTHON||'python3',['scripts/serve-reader-isolated-p11423.py','--rv-alternative'],{stdio:['ignore','pipe','ignore']});
 lines=createInterface({input:child.stdout});
 const ready=await Promise.race([once(lines,'line').then(([s])=>JSON.parse(s)),once(child,'exit').then(()=>{throw Error('backend exit');}),once(child,'error').then(()=>{throw Error('backend error');})]);
 stage='all fragments';const {overlay,summary}=await makeCandidate('http://127.0.0.1:'+ready.port,ready);
 lines.close();child.kill();
 const base=resolve('dist');
 const send=(res,status,body,type)=>{const bytes=Buffer.isBuffer(body)?body:Buffer.from(body);res.writeHead(status,{'Content-Type':type,'Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"});res.end(bytes);};
 stage='serve candidate';
 server=createServer((req,res)=>{try{
  if(req.method!=='GET'||req.headers.host!=='127.0.0.1:'+server.address().port||['cross-site','same-site'].includes(req.headers['sec-fetch-site'])||(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host))return send(res,403,'Acceso local únicamente','text/plain');
  const url=new URL(req.url,'http://'+req.headers.host);if(url.search)return send(res,404,'Ruta no disponible','text/plain');const path=url.pathname;
  if(overlay.has(path)){const f=overlay.get(path);return send(res,200,f.body,f.type);}
  if(path.startsWith(prefix)&&!path.startsWith(assets)){const file=resolve(base,decodeURIComponent(path.slice(prefix.length))),rel=relative(base,file);if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&mime[extname(file)]&&statSync(file,{throwIfNoEntry:false})?.isFile())return send(res,200,readFileSync(file),mime[extname(file)]);}
  return send(res,404,'Ruta no disponible','text/plain');
 }catch{if(!res.headersSent)send(res,500,'No se pudo verificar el recurso','text/plain');else res.destroy();}});
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 console.log(JSON.stringify({...summary,url:'http://127.0.0.1:'+server.address().port+root}));
}catch{finish();console.error('Private candidate failed at '+stage+'; no corpus persisted');process.exitCode=1;}
