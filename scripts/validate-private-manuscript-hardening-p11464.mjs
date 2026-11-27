import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {createPrivateManuscriptOverlay,manuscriptPath,manuscriptAssets} from './lib/private-manuscript-overlay-p11463.mjs';
const require=createRequire(resolve(process.env.P11464_DEPS,'package.json'));
const {chromium}=require('playwright'),axe=readFileSync(require.resolve('axe-core/axe.min.js'));
const base=resolve('dist'),prefix='/Scriptura-Nexus/',origin='http://127.0.0.1:43164',dataPath=manuscriptAssets+'references.json',axePath=manuscriptAssets+'axe-test.js';
const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const snapshot=()=>new Map(readdirSync(base,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()).map(f=>{const p=join(f.parentPath,f.name);return [relative(base,p),createHash('sha256').update(readFileSync(p)).digest('hex')];}));
let browser,stage='overlay';
try{
 const before=snapshot(),{files,original,spec,summary}=createPrivateManuscriptOverlay();
 assert.deepEqual([summary.witnesses,summary.variants,summary.readings,summary.resources,summary.evidence,summary.secondaryAttestations,summary.directInspections,summary.sourceFilesAdmitted],[2,1,2,7,8,2,0,0]);
 assert.equal(summary.publicationAuthorized,false);assert.equal(summary.corpusImportAuthorized,false);assert.equal(summary.upload,false);
 assert.ok(spec.bytes>0&&spec.bytes<=65536);
 const counts={failureInjections:0,recoveries:0,layoutCases:0,axeScans:0,keyboardChecks:0,externalRequests:0,unexpectedRequests:0,pageErrors:0};
 let failMode='',collecting=false,initialBodyBytes=0,initialJsBytes=0,projectionRequests=0;
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',acceptDownloads:false,reducedMotion:'reduce'});
 const p=await c.newPage();p.on('pageerror',()=>counts.pageErrors++);
 await c.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url()),path=u.pathname;
  if(u.origin!==origin){counts.externalRequests++;return route.abort();}
  if(u.search||req.method()!=='GET'){counts.unexpectedRequests++;return route.abort();}
  let f=files.get(path);
  if(path===axePath)f={body:axe,type:'text/javascript; charset=utf-8'};
  if(!f&&path.startsWith(prefix)&&!path.startsWith(manuscriptAssets)){
   const local=resolve(base,decodeURIComponent(path.slice(prefix.length))),rel=relative(base,local),type=mime[extname(local)];
   if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&type&&statSync(local,{throwIfNoEntry:false})?.isFile())f={body:readFileSync(local),type};
  }
  if(!f)return route.fulfill({status:404,contentType:'text/plain',body:'Ruta no disponible',headers});
  if(collecting){
   const size=/^(?:text\/|application\/json|application\/javascript|image\/svg)/.test(f.type)?gzipSync(f.body,{level:6}).length:f.body.length;
   initialBodyBytes+=size;if(f.type.startsWith('text/javascript'))initialJsBytes+=size;
  }
  if(path===dataPath){
   projectionRequests++;
   const h=await req.allHeaders();
   assert.ok(!h.cookie&&!h.referer,'Projection requests must omit cookies and referrer');
   if(failMode){
    const mode=failMode;failMode='';counts.failureInjections++;
    if(mode==='network')return route.abort('failed');
    if(mode==='http')return route.fulfill({status:503,contentType:'text/plain',body:'Unavailable',headers});
    let body;
    if(mode==='truncate')body=f.body.subarray(0,-1);
    else if(mode==='oversize')body=Buffer.concat([f.body,Buffer.alloc(65536)]);
    else{body=Buffer.from(f.body);body[body.length-1]^=1;}
    return route.fulfill({status:200,contentType:f.type,body,headers});
   }
  }
  return route.fulfill({status:200,contentType:f.type,body:f.body,headers});
 });
 const go=async()=>{assert.equal((await p.goto(origin+manuscriptPath))?.status(),200);};
 const ready=()=>p.waitForFunction(()=>!document.querySelector('#mv-fields')?.disabled);
 const search=p.locator('#mv-search'),witness=p.locator('#mv-witness'),variant=p.locator('#mv-variant'),detail=p.locator('#mv-witness-detail'),vd=p.locator('#mv-variant-detail'),directory=p.locator('#private-evidence-list');
 const blocked=async()=>{
  assert.equal(await p.locator('#mv-fields').evaluate(e=>e instanceof HTMLFieldSetElement&&e.disabled),true,'Native fieldset must remain disabled');
  for(const x of [search,witness,variant])assert.equal(await x.isDisabled(),true,'Controls must stay blocked');
  assert.equal(await directory.locator('li').count(),0);assert.equal(await vd.locator('.mv-panel').count(),0);
  assert.doesNotMatch(await detail.textContent(),/P\. Bodmer II|Royal MS 1 D VIII/);
 };
 for(const mode of ['corrupt','truncate','oversize','http','network']){
  stage='reject-'+mode;failMode=mode;const old=projectionRequests;await go();
  await p.waitForFunction(()=>document.querySelector('#mv-status')?.textContent==='No se pudo verificar la proyección documental.');
  assert.equal(projectionRequests,old+1);assert.equal(failMode,'');await blocked();
  stage='recover-'+mode;await go();await ready();
  assert.equal(projectionRequests,old+2);assert.equal(await directory.locator(':scope > ul > li').count(),8);
  await witness.selectOption('MAN-GA-P66');assert.match(await detail.textContent(),/P\. Bodmer II/);
  await variant.selectOption('VAR-P943-JHN-1-18');assert.equal(await vd.locator('.mv-panel').count(),2);counts.recoveries++;
 }
 stage='cold-load-budgets';collecting=true;await go();await ready();await p.waitForLoadState('networkidle');collecting=false;
 assert.ok(initialBodyBytes>0&&initialBodyBytes<=512000,'Initial equivalent gzip body budget exceeded');
 assert.ok(initialJsBytes>0&&initialJsBytes<=153600,'Initial equivalent gzip JS budget exceeded');
 const loaded=projectionRequests;
 stage='keyboard';
 await search.focus();assert.equal(await search.evaluate(e=>e===document.activeElement),true);
 await p.keyboard.type('Bodmer');assert.match(await p.locator('#mv-status').textContent(),/1 testigo disponible/);
 await p.keyboard.press('Tab');assert.equal(await witness.evaluate(e=>e===document.activeElement),true);
 await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');
 assert.equal(await witness.inputValue(),'MAN-GA-P66');assert.match(await detail.textContent(),/P\. Bodmer II/);counts.keyboardChecks++;
 await variant.focus();assert.equal(await variant.evaluate(e=>e===document.activeElement),true);
 await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');
 assert.equal(await variant.inputValue(),'VAR-P943-JHN-1-18');assert.equal(await vd.locator('.mv-panel').count(),2);counts.keyboardChecks++;
 stage='populated-layout-and-axe';assert.equal(await p.locator('.sn-manuscript-view > #mv-candidate-rights, .sn-manuscript-view > #mv-candidate-privacy').count(),2);await p.addScriptTag({url:origin+axePath});
 for(const theme of ['light','dark','contrast-light','contrast-dark']){
  for(const scale of ['100','115','130']){
   for(const width of [320,1280]){
    stage='layout-'+theme+'-'+scale+'-'+width;
    await p.setViewportSize({width,height:900});
    await p.evaluate(async({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
    assert.equal(await p.evaluate(()=>{const root=document.querySelector('.sn-manuscript-view');return document.documentElement.scrollWidth<=innerWidth+1&&root.scrollWidth<=root.clientWidth+1&&[...root.querySelectorAll('nav,section,fieldset')].every(e=>e.scrollWidth<=e.clientWidth+1);}),true,'Populated candidate reflow');
    counts.layoutCases++;
   }
  }
  stage='axe-'+theme;await p.setViewportSize({width:320,height:900});
  const violations=await p.evaluate(async()=>{const r=await window.axe.run('.sn-manuscript-view',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.length}));});
  if(violations.length){console.error(JSON.stringify({stage,violations}));throw Error('axe');}counts.axeScans++;
 }
 stage='reference-links-and-privacy';
 assert.equal(await directory.locator(':scope > ul > li').count(),8);
 assert.ok(await directory.locator('a').evaluateAll(links=>links.length===16&&links.every(a=>a.protocol==='https:'&&a.referrerPolicy==='no-referrer'&&a.relList.contains('noreferrer'))));
 assert.doesNotMatch(await directory.textContent(),/undefined|Examen directo documentado/);
 assert.doesNotMatch(await vd.textContent(),/Examen directo documentado/);
 assert.match(await vd.textContent(),/No evaluada/);
 await search.fill('consulta-sin-coincidencia');assert.equal(await witness.isDisabled(),true);
 await search.fill('');assert.match(await p.locator('#mv-status').textContent(),/2 testigos/);
 await variant.selectOption('');assert.equal(await vd.locator('.mv-panel').count(),0);
 assert.equal(projectionRequests,loaded,'Searching and changing selections must not fetch again');
 const store=await p.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).length,cache:(await caches.keys()).length}));
 assert.deepEqual(store,{local:[],session:[],db:0,cache:0});assert.deepEqual(await c.cookies(),[]);
 assert.deepEqual([counts.externalRequests,counts.unexpectedRequests,counts.pageErrors],[0,0,0]);
 assert.deepEqual([counts.failureInjections,counts.recoveries,counts.layoutCases,counts.axeScans,counts.keyboardChecks],[5,5,24,4,2]);
 await c.close();
 stage='public boundary';assert.deepEqual(snapshot(),before);assert.doesNotMatch(original,/private-manuscript\/init\.js|MAN-GA-P66|VAR-P943-JHN-1-18/);
 console.log(JSON.stringify({phase:'P11.4.6.4',candidate:'success',...counts,projectionBytes:spec.bytes,projectionRequests,initialBodyGzipEstimateBytes:initialBodyBytes,initialJsGzipEstimateBytes:initialJsBytes,distUnchanged:true,manualScreenReader:false,physicalDevice:false,publicationAuthorized:false,corpusImportAuthorized:false,sourceContentPersisted:false,upload:false}));
}catch(e){const line=e instanceof Error?e.stack?.match(/validate-private-manuscript-hardening-p11464\.mjs:\d+:\d+/)?.[0]:undefined;console.error('Private manuscript hardening failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+') '+(line??''));process.exitCode=1;}
finally{if(browser)await browser.close();}
