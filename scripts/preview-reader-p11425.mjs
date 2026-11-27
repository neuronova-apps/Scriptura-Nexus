// Local manual validation only; never invoke this from the public build.
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import ts from 'typescript';
import {readLoopbackGzip} from './lib/reader-loopback-gzip.mjs';
const base=resolve('dist'),prefix='/Scriptura-Nexus/';
const rights=JSON.parse(readFileSync('docs/P11/registro-permisos-lector-p11421.json','utf8'));
if(rights.publicationAuthorized!==false||rights.editions.some(e=>e.publicReleaseDecision!=='pendiente'))throw Error('Expected isolated rights state');
const child=spawn(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['scripts/serve-reader-isolated-p11423.py'],{stdio:['ignore','pipe','ignore']});
const lines=createInterface({input:child.stdout});
let server;
const finish=()=>{server?.closeAllConnections();server?.close();child.kill();lines.close();};
process.once('SIGINT',()=>{finish();process.exit(0);});
process.once('SIGTERM',()=>{finish();process.exit(0);});
try{
 const ready=await Promise.race([once(lines,'line').then(([s])=>JSON.parse(s)),once(child,'error').then(()=>{throw Error('Python unavailable');}),once(child,'exit').then(()=>{throw Error('Private source server exited');})]);
 if(ready.publicationAuthorized!==false||ready.fragments!==1449)throw Error('Unexpected validation source');
 const backend='http://127.0.0.1:'+ready.port;
 const catalog=await readLoopbackGzip(backend,'/catalog',{expectedGzipBytes:ready.catalogGzipBytes,expectedJsonBytes:ready.catalogJsonBytes});
 const parsed=JSON.parse(catalog.raw.toString('utf8'));
 const descriptors=new Map(parsed.editions.flatMap(e=>e.books.flatMap(b=>b.chapters.map(d=>['/chapter/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/'),d]))));
 if(descriptors.size!==1449)throw Error('Unexpected fragment count');
 const modules=new Map([
  ['/reader-view.js','src/lib/reader-view.ts'],['/reader-fragment-view.js','src/lib/reader-fragment-view.ts'],['/reader-ui.js','src/scripts/reader-ui.ts'],['/appearance.js','src/lib/appearance.ts']
 ].map(([url,file])=>[url,ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/(['"])\.\.\/lib\/reader-view\1/g,"'./reader-view.js'").replace(/(['"])\.\/reader-view\.ts\1/g,"'./reader-view.js'")]));
 const metadata=rights.editions.map(e=>({edition:e.editionId,version:e.version,license:e.license,source:e.source,links:e.rightsSources,attribution:e.attribution,transformation:e.id==='ED-C01'?'Proyección del texto principal USFM: exclusión de notas, referencias cruzadas, encabezados y marcadores de formato; normalización de espacios; conservación de etiquetas originales.':'Proyección de elementos de palabra, prefijos y sufijos XML en orden de fuente; separadores de palabra; conservación de puntuación, Unicode y etiquetas originales.'}));
 modules.set('/preview-init.js',[
 "import {initializeAppearance} from './appearance.js';",
 "import {createIsolatedFragmentReader} from './reader-fragment-view.js';",
 "import {mountReader} from './reader-ui.js';",
 "initializeAppearance(document);",
 "const rights="+JSON.stringify(metadata)+";",
 "const section=document.createElement('section');section.className='sn-card sn-card--default';section.id='preview-rights';",
 "const title=document.createElement('h2');title.textContent='Fuentes, licencias y transformaciones de la prueba';section.append(title);",
 "for(const r of rights){const h=document.createElement('h3');h.textContent=r.edition+' · '+r.version;section.append(h);for(const t of [r.license,r.attribution,r.transformation]){const p=document.createElement('p');p.textContent=t;section.append(p);}const ul=document.createElement('ul');for(const link of [r.source,...r.links]){const li=document.createElement('li'),a=document.createElement('a');a.href=link;a.textContent=link;a.rel='noreferrer';li.append(a);ul.append(li);}section.append(ul);}",
 "document.querySelector('.sn-bible-reader').append(section);",
 "try{const r=await fetch('/catalog',{cache:'no-store'});if(!r.ok)throw Error('catalog');const v=createIsolatedFragmentReader(await r.json(),async d=>{const f=await fetch('/chapter/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/'),{cache:'no-store'});if(!f.ok)throw Error('fragment');return new Uint8Array(await f.arrayBuffer());});mountReader(document,v);}catch{document.querySelector('#br-status').textContent='No se pudo iniciar la revisión local.';}"
 ].join('\n'));
 const original=readFileSync(resolve(base,'biblia/lector/index.html'),'utf8');
 const notice='No hay ediciones autorizadas para consulta pública. La validación técnica de las fuentes no equivale a autorización de publicación.';
 if(!original.includes(notice))throw Error('Expected public boundary not found');
 const html=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(notice,'Vista de revisión exclusivamente local. Los datos no están autorizados para publicación pública.')
  .replace('Los controles se habilitarán cuando exista una edición autorizada.','Los controles están habilitados únicamente para esta revisión local.')
  .replace('</body>','<script type="module" src="/preview-init.js"></script></body>');
 const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
 function respond(res,status,body,type,encoding){
  const bytes=Buffer.isBuffer(body)?body:Buffer.from(body);
  res.writeHead(status,{'Content-Type':type,'Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",...(encoding?{'Content-Encoding':encoding}:{})});res.end(bytes);
 }
 server=createServer(async(req,res)=>{
  try{
   if(req.method!=='GET'||req.headers.host!=='127.0.0.1:'+server.address().port||['cross-site','same-site'].includes(req.headers['sec-fetch-site'])||(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)){respond(res,403,'Acceso local únicamente','text/plain; charset=utf-8');return;}
   const path=new URL(req.url,'http://'+req.headers.host).pathname;
   if(path==='/reader/')return respond(res,200,html,'text/html; charset=utf-8');
   if(modules.has(path))return respond(res,200,modules.get(path),'text/javascript; charset=utf-8');
   if(path==='/catalog')return respond(res,200,catalog.packed,'application/json; charset=utf-8','gzip');
   if(descriptors.has(path)){
    const d=descriptors.get(path),data=await readLoopbackGzip(backend,path,{expectedGzipBytes:d.gzipBytes,expectedJsonBytes:d.jsonBytes});
    return respond(res,200,data.packed,'application/json; charset=utf-8','gzip');
   }
   if(path.startsWith(prefix)){
    const file=resolve(base,decodeURIComponent(path.slice(prefix.length))),rel=relative(base,file);
    if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&mime[extname(file)]&&statSync(file,{throwIfNoEntry:false})?.isFile())return respond(res,200,readFileSync(file),mime[extname(file)]);
   }
   respond(res,404,'Ruta fuera de la revisión local','text/plain; charset=utf-8');
  }catch{if(!res.headersSent)respond(res,500,'No se pudo verificar el recurso','text/plain; charset=utf-8');else res.destroy();}
 });
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 console.log('http://127.0.0.1:'+server.address().port+'/reader/');
}catch{finish();console.error('No se pudo preparar la vista local; no se publicaron datos.');process.exitCode=1;}
