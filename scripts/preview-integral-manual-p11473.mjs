// Human review only: headed Chromium, intercepted same-origin resources, no public listener.
import assert from 'node:assert/strict';
import {readFileSync,statSync,realpathSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import {createRequire} from 'node:module';
import {snapshot} from './lib/reader-artifact-scope.mjs';
import {createIntegralPrivateOverlay,prefix,routes,privatePrefixes} from './lib/integral-private-overlay-p11472.mjs';
const modes=process.argv.slice(2);assert.ok(modes.length===1&&['--review','--smoke'].includes(modes[0]));
const smoke=modes[0]==='--smoke';
const deps=process.env.P11473_DEPS;assert.ok(deps,'Set P11473_DEPS to the isolated Playwright install directory');
const {chromium}=createRequire(resolve(deps,'package.json'))('playwright');
const base=realpathSync(resolve('dist')),origin='http://127.0.0.1:43173';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const fields={reader:['br-fields'],analyzer:['ta-fields'],lexical:['lc-lex-fields','lc-con-fields'],comparator:['bc-fields'],manuscripts:['mv-fields']};
let browser,context,stage='candidate',blockedExternal=0,blockedUnknown=0;
try{
 const before=snapshot(base),{files,summary}=await createIntegralPrivateOverlay();
 assert.equal(summary.modules,5);assert.equal(summary.publicationAuthorized,false);assert.equal(summary.corpusPersisted,false);assert.equal(summary.upload,false);
 stage='browser';
 browser=await chromium.launch({headless:smoke,args:['--force-renderer-accessibility']});
 context=await browser.newContext({viewport:null,serviceWorkers:'block',acceptDownloads:false});
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),path=u.pathname;
  if(u.origin!==origin){blockedExternal++;return route.abort('blockedbyclient');}
  if(u.search||req.method()!=='GET')return route.fulfill({status:403,body:'Acceso no permitido',headers});
  const f=files.get(path);
  if(f)return route.fulfill({status:200,contentType:f.type,body:f.body,headers});
  if(path.startsWith(prefix)&&!privatePrefixes.some(p=>path.startsWith(p))){
   const file=resolve(base,decodeURIComponent(path.slice(prefix.length))+(path.endsWith('/')?'index.html':''));
   const rel=relative(base,file),type=mime[extname(file)];
   if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&type&&statSync(file,{throwIfNoEntry:false})?.isFile()){
    const real=realpathSync(file),safe=relative(base,real);
    if(safe&&!safe.startsWith('..')&&!isAbsolute(safe))return route.fulfill({status:200,contentType:type,body:readFileSync(real),headers});
   }
  }
  blockedUnknown++;return route.fulfill({status:404,contentType:'text/plain',body:'Ruta no disponible',headers});
 });
 const page=await context.newPage();
 context.on('page',other=>{if(other!==page)other.close().catch(()=>{});});
 page.on('download',d=>d.cancel().catch(()=>{}));
 page.on('dialog',d=>d.dismiss().catch(()=>{}));
 let errors=0;page.on('pageerror',()=>errors++);
 if(smoke){
  stage='smoke';
  for(const [id,path] of Object.entries(routes)){
   assert.equal((await page.goto(origin+path))?.status(),200);
   for(const field of fields[id])await page.waitForFunction(id=>document.getElementById(id)?.disabled===false,field,{timeout:30000});
  }
  const bad=await page.evaluate(async path=>{const r=await fetch(path);return r.status;},prefix+'unknown-private-test.json.gz');assert.equal(bad,404);
  const denied=await page.evaluate(async()=>{try{await fetch('https://example.invalid/manual-review-test');return false;}catch{return true;}});assert.equal(denied,true);
  assert.equal(errors,0);await context.close();context=null;assert.deepEqual(snapshot(base),before);
  console.log(JSON.stringify({phase:'P11.4.7.3',launcherSmoke:'success',routes:5,unknownRouteDenied:true,externalFetchDenied:true,distUnchanged:true,manualReview:false,publicationAuthorized:false,upload:false}));
 }else{
  stage='manual';await page.goto(origin+routes.reader);
  console.log('Revision privada: use la ventana abierta por el script. Cierre la ventana al terminar. No copie la URL a otro navegador.');
  console.log('Sin publicaciones, capturas ni registros automaticos de consultas. No es una prueba de telefono real.');
  await new Promise(ok=>{page.once('close',ok);browser.once('disconnected',ok);if(page.isClosed())ok();});
  if(context)await context.close().catch(()=>{});context=null;
  assert.deepEqual(snapshot(base),before);
  console.log(JSON.stringify({phase:'P11.4.7.3',sessionEnded:true,manualReviewRecorded:false,distUnchanged:true,publicationAuthorized:false,upload:false}));
 }
}catch(e){console.error('Private manual review failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+')');process.exitCode=1;}
finally{if(context)await context.close().catch(()=>{});if(browser)await browser.close().catch(()=>{});}
