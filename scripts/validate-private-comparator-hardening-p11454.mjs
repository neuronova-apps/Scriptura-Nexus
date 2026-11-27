import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {createPrivateComparatorOverlay,comparatorPath,privateAssets,readerAssets} from './lib/private-comparator-overlay-p11453.mjs';
const require=createRequire(resolve(process.env.P11454_DEPS,'package.json'));
const {chromium}=require('playwright'),axe=readFileSync(require.resolve('axe-core/axe.min.js'));
const base=resolve('dist'),prefix='/Scriptura-Nexus/',origin='http://127.0.0.1:43154',axePath=privateAssets+'axe-test.js';
const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const snapshot=()=>new Map(readdirSync(base,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()).map(f=>{const p=join(f.parentPath,f.name);return [relative(base,p),createHash('sha256').update(readFileSync(p)).digest('hex')];}));
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const A='TXT-RV1909',B='TXT-SBLGNT-V1-2',chapter=(e,b,ch)=>readerAssets+'chapters/'+[e,b,ch].map(encodeURIComponent).join('/')+'.json.gz';
const independent='Sin correspondencia verificada. Las lecturas son independientes.',error='No se pudo verificar el fragmento. Intenta nuevamente.';
let browser,stage='overlay',held=null;
try{
 const before=snapshot(),{files,summary}=await createPrivateComparatorOverlay();
 assert.deepEqual([summary.chapters,summary.units,summary.verifiedGroups,summary.publicationAuthorized,summary.corpusPersisted,summary.upload],[1449,39041,0,false,false,false]);
 const counts={catalogFailures:0,chapterFailures:0,recoveries:0,staleChecks:0,layoutCases:0,axeScans:0,keyboardChecks:0,externalRequests:0,unexpectedRequests:0,pageErrors:0};
 let collecting=false,initialBodyBytes=0,initialJsBytes=0,chapterRequests=0,failPath='',failMode='';
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',acceptDownloads:false,reducedMotion:'reduce'});
 const p=await c.newPage();p.on('pageerror',()=>counts.pageErrors++);
 await c.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),path=u.pathname;
  if(u.origin!==origin){counts.externalRequests++;return route.abort();}
  if(u.search||req.method()!=='GET'){counts.unexpectedRequests++;return route.abort();}
  let file=files.get(path);
  if(path===axePath)file={body:axe,type:'text/javascript; charset=utf-8'};
  if(!file&&path.startsWith(prefix)&&!path.startsWith(privateAssets)&&!path.startsWith(readerAssets)){
   const local=resolve(base,decodeURIComponent(path.slice(prefix.length))),rel=relative(base,local),type=mime[extname(local)];
   if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&type&&statSync(local,{throwIfNoEntry:false})?.isFile())file={body:readFileSync(local),type};
  }
  if(!file)return route.fulfill({status:404,contentType:'text/plain',body:'Ruta no disponible',headers});
  if(path.startsWith(readerAssets+'chapters/'))chapterRequests++;
  if(path.startsWith(readerAssets)){
   const h=await req.allHeaders();assert.ok(!h.cookie&&!h.referer,'Private data request carried cookie or referrer');
  }
  if(collecting){
   const size=/^(?:text\/|application\/javascript|image\/svg)/.test(file.type)?gzipSync(file.body,{level:6}).length:file.body.length;
   initialBodyBytes+=size;if(file.type.startsWith('text/javascript'))initialJsBytes+=size;
  }
  if(path===failPath){
   const mode=failMode;failPath='';failMode='';
   if(mode==='network')return route.abort('failed');
   if(mode==='truncate')return route.fulfill({status:200,contentType:file.type,body:file.body.subarray(0,-1),headers});
   const changed=Buffer.from(file.body);changed[changed.length-1]^=1;
   return route.fulfill({status:200,contentType:file.type,body:changed,headers});
  }
  if(held&&path===held.path){const h=held;held=null;h.seen.resolve();await h.release.promise;try{await route.fulfill({status:200,contentType:file.type,body:file.body,headers});}finally{h.done.resolve();}return;}
  return route.fulfill({status:200,contentType:file.type,body:file.body,headers});
 });
 const status=p.locator('#bc-status'),ctrl=(side,k)=>p.locator('#bc-'+side+'-'+k);
 const waitStatus=t=>p.waitForFunction(t=>document.querySelector('#bc-status')?.textContent===t,t,{timeout:15000});
 const go=async()=>{assert.equal((await p.goto(origin+comparatorPath))?.status(),200);};
 const ready=()=>p.waitForFunction(()=>!document.querySelector('#bc-fields')?.disabled);
 const select=async(side,e,b,ch,v)=>{
  await ctrl(side,'edition').selectOption(e);
  if(b){await ctrl(side,'book').selectOption(b);await ctrl(side,'chapter').selectOption(ch);await ctrl(side,'verse').selectOption(v);}
  else if(await ctrl(side,'book').isEnabled())await ctrl(side,'book').selectOption('');
 };
 const consult=async(t=independent)=>{await p.locator('#bc-consult').click();await waitStatus(t);};
 const noResults=async()=>{assert.equal(await p.locator('.bc-reading').count(),0);};
 stage='catalog corruption';
 failPath=readerAssets+'catalog.json.gz';failMode='corrupt';await go();await waitStatus('No se pudo verificar el candidato.');
 assert.equal(await p.locator('#bc-fields').isDisabled(),true);await noResults();assert.equal(chapterRequests,0);counts.catalogFailures++;
 stage='cold retry and budgets';
 collecting=true;await go();await ready();await p.waitForLoadState('networkidle');collecting=false;
 assert.equal(chapterRequests,0);assert.ok(initialBodyBytes>0&&initialBodyBytes<=512000,'Initial compressed-equivalent response body budget');
 assert.ok(initialJsBytes>0&&initialJsBytes<=153600,'Initial compressed-equivalent JS budget');counts.recoveries++;
 stage='chapter corruption and recovery';
 await select('origin',A,'LIB-JHN','1','1');await select('target',B,'LIB-JHN','1','2');
 failPath=chapter(B,'LIB-JHN','1');failMode='corrupt';await consult(error);await noResults();counts.chapterFailures++;
 await consult();assert.equal(await p.locator('.bc-reading').count(),2);counts.recoveries++;
 stage='network failure and recovery';
 await select('origin',A,'LIB-GEN','1','1');await select('target',B);
 failPath=chapter(A,'LIB-GEN','1');failMode='network';await consult(error);await noResults();counts.chapterFailures++;
 await consult();assert.match(await p.locator('#bc-origin-result h4').textContent(),/1:1$/);counts.recoveries++;
 stage='truncated chapter and recovery';
 await select('origin',A,'LIB-NUM','12','16');failPath=chapter(A,'LIB-NUM','12');failMode='truncate';
 await consult(error);await noResults();counts.chapterFailures++;
 await consult('La fuente de origen contiene un marcador vacío.');counts.recoveries++;
 stage='late response cannot replace newer result';
 await select('origin',A,'LIB-JHN','1','1');await select('target',B);
 const gate={path:chapter(A,'LIB-JHN','1'),seen:deferred(),release:deferred(),done:deferred()};held=gate;
 await p.locator('#bc-consult').click();await Promise.race([gate.seen.promise,new Promise((_,reject)=>{const t=setTimeout(()=>reject(Error('delayed request not observed')),10000);t.unref();})]);
 try{
  await select('origin',A,'LIB-GEN','1','1');await consult();
  const newer=await p.locator('#bc-origin-result h4').textContent();
  assert.match(newer,/1:1$/);assert.match(await p.locator('#bc-diagnostic').textContent(),/no está incluido/);
  gate.release.resolve();await gate.done.promise;await p.waitForLoadState('networkidle');
  assert.equal(await p.locator('#bc-origin-result h4').textContent(),newer);
  assert.match(await p.locator('#bc-diagnostic').textContent(),/no está incluido/);counts.staleChecks++;
 }finally{gate.release.resolve();}
 stage='keyboard and parallel reading';
 await select('origin',A,'LIB-JHN','1','1');await select('target',B,'LIB-JHN','1','2');
 const button=p.locator('#bc-consult');await button.focus();await p.keyboard.press('Enter');await waitStatus(independent);
 assert.equal(await p.locator('#bc-result-title').evaluate(e=>document.activeElement===e),true);counts.keyboardChecks++;
 assert.equal(await p.locator('#bc-origin-result .bc-reading').getAttribute('lang'),'es');assert.equal(await p.locator('#bc-target-result .bc-reading').getAttribute('lang'),'grc');
 assert.equal(await p.locator('#bc-target-result .bc-reading').getAttribute('dir'),'ltr');
 assert.match(await p.locator('#bc-evidence').textContent(),/Sin grupo de correspondencia verificado/);
 stage='layout and axe on populated candidate';
 await p.addScriptTag({url:origin+axePath});
 for(const theme of ['light','dark','contrast-light','contrast-dark']){
  for(const scale of ['100','115','130']){
   for(const width of [320,1280]){
    await p.setViewportSize({width,height:900});
    await p.evaluate(async ({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
    assert.equal(await p.evaluate(()=>{const root=document.querySelector('.sn-bible-comparator');return document.documentElement.scrollWidth<=innerWidth+1&&root.scrollWidth<=root.clientWidth+1&&[...root.querySelectorAll('section,fieldset')].every(e=>e.scrollWidth<=e.clientWidth+1);}),true,'Candidate reflow');
    counts.layoutCases++;
   }
  }
  await p.setViewportSize({width:320,height:900});
  const violations=await p.evaluate(async()=>{const r=await window.axe.run('.sn-bible-comparator',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.length}));});
  if(violations.length){console.error(JSON.stringify({stage,theme,violations}));throw Error('axe');}counts.axeScans++;
 }
 assert.equal(counts.layoutCases,24);assert.equal(counts.axeScans,4);
 stage='privacy and public boundary';
 const store=await p.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).length,cache:(await caches.keys()).length}));
 assert.deepEqual(store,{local:[],session:[],db:0,cache:0});assert.deepEqual(await c.cookies(),[]);
 assert.deepEqual([counts.externalRequests,counts.unexpectedRequests,counts.pageErrors],[0,0,0]);
 await c.close();assert.deepEqual(snapshot(),before);
 assert.ok(!readFileSync(join(base,'biblia/comparador/index.html'),'utf8').includes('private-comparator/init.js'));
 console.log(JSON.stringify({phase:'P11.4.5.4',candidate:'success',...counts,initialBodyGzipEstimateBytes:initialBodyBytes,initialJsGzipEstimateBytes:initialJsBytes,chapterRequests,distUnchanged:true,verifiedGroups:0,manualScreenReader:false,physicalDevice:false,publicationAuthorized:false,corpusPersisted:false,upload:false}));
}catch(e){console.error('Private comparator hardening failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+')');process.exitCode=1;}
finally{held?.release.resolve();if(browser)await browser.close();}
