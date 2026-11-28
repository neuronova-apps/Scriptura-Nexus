import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,statSync,mkdirSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname} from 'node:path';
const {chromium}=createRequire(resolve(process.env.SN001_BROWSER_DEPS,'package.json'))('playwright');
const root=resolve('sn001-review-output/dist'),publicRoot=resolve('dist'),origin='http://127.0.0.1:43154',prefix='/Scriptura-Nexus/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const report={phase:'5.4',study:'SN-001',publicationAuthorized:false,queries:[],modules:[],appearance:[],accessibility:[],pageErrors:[],externalRequests:[],missing:[],manualVisualReview:false};
mkdirSync('sn001-validation-output',{recursive:true});
let browser;
try {
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
 let activeRoot=root;
 await ctx.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.origin!==origin){report.externalRequests.push(u.origin);return route.abort();}
  if(!u.pathname.startsWith(prefix))return route.fulfill({status:404,body:'Not found'});
  const f=resolve(activeRoot,decodeURIComponent(u.pathname.slice(prefix.length))+(u.pathname.endsWith('/')?'index.html':''));
  const rel=relative(activeRoot,f),type=mime[extname(f)];
  if(!rel||rel.startsWith('..')||isAbsolute(rel)||!type||!statSync(f,{throwIfNoEntry:false})?.isFile()){report.missing.push(u.pathname);return route.fulfill({status:404,body:'Not found'});}
  return route.fulfill({status:200,contentType:type,body:readFileSync(f),headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 });
 const p=await ctx.newPage();p.on('pageerror',e=>report.pageErrors.push(e.message));
 const go=async path=>assert.equal((await p.goto(origin+prefix+path))?.status(),200);
 const study='estudios/SN-001/';
 await go('buscar/');
 for(const q of ['SN-001','tatuarse','tatuaje','Levítico 19:28','H7085','קַעֲקַע']){
  await p.locator('#search-query').fill(q);
  await p.locator('#search-form button[type="submit"]').click();
  const link=p.locator('#search-results a[href="'+prefix+study+'"]');
  await link.waitFor({state:'visible'});
  assert.match(await link.locator('..').locator('..').textContent(),/En revisión/);
  report.queries.push(q);
 }
 await p.locator('#search-results a[href="'+prefix+study+'"]').click();
 await p.waitForURL(origin+prefix+study);
 assert.equal(await p.locator('[data-section-id]').count(),20);
 assert.equal(await p.locator('[data-section-state="no_aplicable"]').count(),6);
 assert.equal(await p.locator('[data-section-state="analizada"]').count(),14);
 assert.equal(await p.locator('[id^="pasaje-E"]').count(),8);
 assert.equal(await p.locator('[id^="termino-"]').count(),12);
 const summary=p.locator('#pasaje-E01 summary');await summary.focus();await p.keyboard.press('Enter');
 assert.equal(await p.locator('#pasaje-E01').evaluate(e=>e.open),true);
 const links=await p.locator('[data-study-module]').evaluateAll(a=>[...new Map(a.map(e=>[e.dataset.studyModule,e.href])).entries()]);
 assert.equal(links.length,8);
 for(const [key,url] of links){await p.goto(url);const u=new URL(url);assert.ok(await p.locator(u.hash).count());report.modules.push(key);}
 await go(study);
 for(const width of [320,768,1280])for(const theme of ['light','dark','contrast-light','contrast-dark']){
  await p.setViewportSize({width,height:900});
  await p.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale='130';},theme);
  await p.locator('#pasaje-E01').evaluate(e=>e.open=true);
  await p.locator('#termino-1').evaluate(e=>e.open=true);
  const fits=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
  report.appearance.push({width,theme,fontScale:130,reflow:fits});
  await p.addScriptTag({path:resolve(process.env.SN001_BROWSER_DEPS,'node_modules/axe-core/axe.min.js')});
  const findings=await p.evaluate(async()=>{const r=await window.axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});
  report.accessibility.push({width,theme,violations:findings});
  if(width===320||width===1280)await p.screenshot({path:'sn001-validation-output/'+width+'-'+theme+'.png',fullPage:false});
 }
 assert.ok(await p.locator('bdi[lang="he"][dir="rtl"]').count()>0);
 await go('estudios/');await p.locator('#catalog-status').selectOption('en_revision');assert.equal(await p.locator('[data-study-id]:visible').count(),1);assert.equal(await p.locator('[data-study-id]:visible').getAttribute('data-study-id'),'SN-001');
 activeRoot=publicRoot;await go(study);assert.equal(await p.locator('[data-review-only]').count(),0);
 await go('biblia/lector/');assert.equal(await p.locator('#br-fields').isDisabled(),true);
 assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.missing,[]);
 assert.ok(report.appearance.every(x=>x.reflow),'Reflow: revisar informe');
 assert.ok(report.accessibility.every(x=>x.violations.length===0),'Accesibilidad: revisar informe');
 report.functionalValidated=true;
}finally{if(browser)await browser.close();writeFileSync('sn001-validation-output/browser-report.json',JSON.stringify(report,null,2));}
