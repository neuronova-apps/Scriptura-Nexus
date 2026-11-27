// Real corpus stays on an isolated loopback server and a private browser context.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const dep=createRequire(resolve(process.env.P11423_DEPS,'package.json'));
const {chromium}=dep('playwright');
const child=spawn('python3',['scripts/serve-reader-isolated-p11423.py'],{stdio:['ignore','pipe','ignore']});
const lines=createInterface({input:child.stdout});
let browser,stage='server';
try{
 const ready=await Promise.race([once(lines,'line').then(([s])=>JSON.parse(s)),once(child,'exit').then(()=>{throw Error('private server exited');})]);
 assert.equal(ready.fragments,1449);assert.equal(ready.publicationAuthorized,false);
 const origin='http://127.0.0.1:'+ready.port,reader=origin+'/reader/';
 const modules=new Map([
  ['/reader-view.js','src/lib/reader-view.ts'],['/reader-fragment-view.js','src/lib/reader-fragment-view.ts'],['/reader-ui.js','src/scripts/reader-ui.ts']
 ].map(([url,file])=>[url,ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/(['"])\.\.\/lib\/reader-view\1/g,"'./reader-view.js'").replace(/(['"])\.\/reader-view\.ts\1/g,"'./reader-view.js'")]));
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:360,height:900},serviceWorkers:'block',acceptDownloads:false});
 const requests=[],errors=[],blocked=[];let corrupt=false,hold=null;
 await c.route('**/*',async r=>{
  const url=new URL(r.request().url());
  if(url.origin!==origin){blocked.push(1);return r.abort();}
  if(url.pathname==='/reader/')return r.fulfill({contentType:'text/html; charset=utf-8',body:readFileSync('dist/biblia/lector/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')});
  if(modules.has(url.pathname))return r.fulfill({contentType:'text/javascript',body:modules.get(url.pathname)});
  if(url.pathname==='/catalog')return r.continue();
  if(url.pathname.startsWith('/chapter/')){
   requests.push(url.pathname);
   if(corrupt){corrupt=false;return r.fulfill({contentType:'application/json',body:'{}'});}
   if(hold){const h=hold;hold=null;await h;}
   return r.continue();
  }
  const base=resolve('dist'),prefix='/Scriptura-Nexus/';
  if(url.pathname.startsWith(prefix)){
   const f=resolve(base,decodeURIComponent(url.pathname.slice(prefix.length)));
   if(f.startsWith(base+'/')&&['.css','.svg','.png','.webp','.woff2'].includes(extname(f))&&statSync(f,{throwIfNoEntry:false})?.isFile())return r.fulfill({path:f});
  }
  return r.fulfill({status:404,body:''});
 });
 const p=await c.newPage();p.on('pageerror',()=>errors.push(1));
 stage='mount';assert.equal((await p.goto(reader))?.status(),200);
 await p.evaluate(async()=>{
  const {createIsolatedFragmentReader}=await import('/reader-fragment-view.js'),{mountReader}=await import('/reader-ui.js');
  const response=await fetch('/catalog');if(!response.ok)throw Error('catalog');
  const catalog=await response.json();
  const loader=async d=>{const url='/chapter/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/');const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw Error('fragment');return new Uint8Array(await res.arrayBuffer());};
  const v=createIsolatedFragmentReader(catalog,loader);window.__reader=v;mountReader(document,v);
 });
 const sel=(id)=>p.locator('#br-'+id),choose=async(e,b,ch,v)=>{await sel('edition').selectOption(e);await sel('book').selectOption(b);await sel('chapter').selectOption(ch);await sel('verse').selectOption(v);};
 const count=async()=>p.evaluate(()=>window.__reader.editions().map(e=>window.__reader.books(e.id).length));
 const consult=async()=>{await sel('consult').click();await p.waitForFunction(()=>document.querySelector('#br-status')?.textContent==='Referencia disponible.'||document.querySelector('#br-status')?.textContent==='La fuente contiene este marcador sin texto.');};
 const rv='TXT-RV1909',gr='TXT-SBLGNT-V1-2';let checks=0;
 stage='catalog';assert.deepEqual(await count(),[66,27]);assert.equal(requests.length,0);checks++;
 stage='spanish';await choose(rv,'LIB-GEN','1','1');assert.equal(requests.length,0);await consult();assert.equal(requests.length,1);
 assert.equal(await p.locator('#br-passage').getAttribute('lang'),'es');assert.equal(await p.locator('#br-previous').isDisabled(),true);
 assert.equal(await p.evaluate(()=>document.activeElement?.id),'br-passage-title');
 assert.ok(await p.locator('#br-source').innerText().then(s=>s.includes('spaRV1909')&&s.includes('GEN.1.1')&&s.includes('eBible.org')));checks++;
 stage='cached-next';await sel('next').click();await p.waitForFunction(()=>document.querySelector('#br-status')?.textContent==='Referencia disponible.');assert.equal(await sel('verse').inputValue(),'2');assert.equal(requests.length,1);checks++;
 stage='cross-chapter';await sel('verse').selectOption('31');await consult();assert.equal(requests.length,1);await sel('next').click();await p.waitForFunction(()=>document.querySelector('#br-status')?.textContent==='Referencia disponible.');assert.equal(await sel('chapter').inputValue(),'2');assert.equal(await sel('verse').inputValue(),'1');assert.equal(requests.length,2);checks++;
 stage='empty-marker';await choose(rv,'LIB-NUM','12','16');await consult();assert.match(await sel('status').textContent(),/marcador sin texto/i);assert.equal(await sel('passage').textContent(),'Marcador sin texto en la fuente.');checks++;
 stage='greek';await choose(gr,'LIB-3JN','1','1');await consult();assert.equal(await sel('passage').getAttribute('lang'),'grc');assert.equal(await sel('passage').evaluate(e=>/[\u0370-\u03ff\u1f00-\u1fff]/u.test(e.textContent??'')),true);assert.ok((await sel('source').innerText()).includes('CC BY 4.0'));checks++;
 stage='absence';assert.deepEqual(await p.evaluate(async({rv,gr})=>{const v=window.__reader;return Promise.all([{editionId:'unknown',bookId:'LIB-GEN',chapter:'1',verse:'1'},{editionId:gr,bookId:'LIB-GEN',chapter:'1',verse:'1'},{editionId:rv,bookId:'LIB-GEN',chapter:'999999',verse:'1'},{editionId:rv,bookId:'LIB-GEN',chapter:'1',verse:'999999'}].map(async r=>(await v.locate(r)).status));},{rv,gr}),['edition_unavailable','book_outside_coverage','chapter_not_found','reference_not_found']);checks++;
 stage='corruption';corrupt=true;await choose(rv,'LIB-GEN','3','1');await sel('consult').click();await p.waitForFunction(()=>document.querySelector('#br-status')?.textContent?.includes('No se pudo verificar'));assert.equal(await sel('detail').isHidden(),true);assert.equal(await sel('consult').isDisabled(),false);await consult();checks++;
 stage='stale-response';let release;hold=new Promise(r=>{release=r;});await choose(rv,'LIB-GEN','4','1');await sel('consult').click();await p.waitForFunction(()=>document.querySelector('#br-status')?.textContent==='Consultando referencia…');await sel('edition').selectOption(gr);release();await p.waitForTimeout(300);assert.equal(await sel('detail').isHidden(),true);assert.equal(await sel('consult').isDisabled(),true);assert.equal(await sel('passage').textContent(),'Selecciona y consulta una referencia.');checks++;
 assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);assert.equal(checks,9);
 await c.close();console.log(JSON.stringify({phase:'P11.4.2.3',checks,chapterRequests:requests.length,editions:2,bookFiles:93,realFragments:1449,publicReleaseAuthorized:false,corpusPersisted:false,sourceTextLogged:false}));
}catch{console.error('P11.4.2.3 browser integration failed at '+stage);process.exitCode=1;}
finally{if(browser)await browser.close();lines.close();child.kill();}
