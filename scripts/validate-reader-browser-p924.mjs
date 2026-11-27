// Public artifact verification and isolated fixture exercise; never modify dist.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {createRequire} from 'node:module';
import {gzipSync} from 'node:zlib';
const base=resolve('dist'),prefix='/Scriptura-Nexus/',hub=prefix+'biblia/',reader=hub+'lector/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
const server=createServer((req,res)=>{try{
 const path=new URL(req.url,'http://127.0.0.1').pathname;if(!path.startsWith(prefix))throw Error();
 const rel=decodeURIComponent(path.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
 if(!file.startsWith(base+'/')||!statSync(file).isFile())throw Error();
 const raw=readFileSync(file),ext=extname(file),gzip=['.html','.js','.css','.svg','.json'].includes(ext)&&/\bgzip\b/.test(req.headers['accept-encoding']??'');
 const body=gzip?gzipSync(raw,{level:6}):raw;
 res.setHeader('Content-Type',mime[ext]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Length',body.length);
 if(gzip)res.setHeader('Content-Encoding','gzip');res.end(body);
}catch{res.statusCode=404;res.end();}});
let browser,stage='init';
const counts={layoutCases:0,axeScans:0,sectionLinks:0,keyboardNavigation:0,preferenceChecks:0,noJsChecks:0,fixtureChecks:0};
const publicControls=['br-edition','br-book','br-chapter','br-verse','br-consult','br-previous','br-next'];
const manifest=JSON.parse(readFileSync('docs/P9/proyeccion-ediciones-p913.json','utf8'));
const tokenList=manifest.corpusManifests.flatMap(m=>[m.id,m.integrity.projectionSha256,...m.fragments.flatMap(f=>[f.id,f.sourceFileSha256,f.projectionSha256])]);
const fixtureMarker='P924-PRIVATE-FIXTURE-ONLY';
let auditedFiles=0;
try{
 const require=createRequire(resolve(process.env.P924_DEPS,'package.json')),{chromium}=require('playwright'),axe=require.resolve('axe-core/axe.min.js');
 const ts=createRequire(import.meta.url)('typescript');
 stage='artifact-audit';
 for(const f of readdirSync(base,{recursive:true,withFileTypes:true})){
  if(!f.isFile())continue;
  assert.doesNotMatch(f.name,/\.(?:usfm|sfm|zip|7z|rar)$/i,'source archive in output');
  if(!/\.(?:html?|js|mjs|json|txt|xml|map|css)$/i.test(f.name))continue;
  const s=readFileSync(join(f.parentPath,f.name),'utf8');
  for(const t of tokenList)assert.ok(!s.includes(t),'internal projection identifier in '+f.name);
  assert.ok(!s.includes(fixtureMarker),'fixture in public artifact');auditedFiles++;
 }
 assert.ok(auditedFiles>0);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
 const external=[],errors=[];await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():(external.push(1),r.abort()));
 const page=await ctx.newPage();page.on('pageerror',()=>errors.push('pageerror'));page.on('response',r=>{if(r.status()>=400)errors.push('http');});
 const go=async path=>{assert.equal((await page.goto(origin+path))?.status(),200);await page.waitForLoadState('networkidle');};
 const keyLink=async(link,path)=>{await link.focus();assert.equal(await link.evaluate(e=>document.activeElement===e),true);await Promise.all([page.waitForURL(origin+path),page.keyboard.press('Enter')]);counts.keyboardNavigation++;};
 stage='public-navigation';await go(hub);
 await keyLink(page.getByRole('link',{name:'Abrir lector bíblico',exact:true}),reader);
 const blocked=async p=>{for(const id of publicControls)assert.equal(await p.locator('#'+id).isDisabled(),true);assert.equal(await p.locator('#br-detail').isHidden(),true);assert.match(await p.locator('#br-status').textContent(),/No hay ediciones disponibles/);};
 await blocked(page);
 const sections=page.getByRole('navigation',{name:'Secciones del lector'}).getByRole('link');assert.equal(await sections.count(),3);
 for(let i=0;i<3;i++){
  const link=sections.nth(i),hash=await link.getAttribute('href');assert.ok(hash?.startsWith('#'));
  await keyLink(link,reader+hash);await page.waitForFunction(id=>document.activeElement?.id===id,hash.slice(1));counts.sectionLinks++;
 }
 await keyLink(page.getByRole('link',{name:'Volver al módulo Biblia',exact:true}),hub);
 await keyLink(page.getByRole('link',{name:'Abrir lector bíblico',exact:true}),reader);
 stage='preferences';await page.locator('[data-appearance-panel] summary').click();
 await page.locator('#sn-appearance-theme').selectOption('contrast-dark');await page.locator('#sn-appearance-font-scale').selectOption('130');
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-appearance-panel]').evaluate(e=>e.open),false);
 for(const path of [hub,reader]){await go(path);assert.deepEqual(await page.evaluate(()=>[document.documentElement.dataset.theme,document.documentElement.dataset.fontScale]),['contrast-dark','130']);counts.preferenceChecks++;}
 await page.locator('[data-appearance-panel] summary').click();await page.locator('[data-appearance-reset]').click();await page.keyboard.press('Escape');
 await page.addScriptTag({path:axe});
 for(const theme of ['light','dark','contrast-light','contrast-dark'])for(const scale of ['100','115','130']){
  for(const width of [320,375,768,1024,1440]){
   stage='layout-'+theme+'-'+scale+'-'+width;await page.setViewportSize({width,height:900});
   await page.evaluate(async ({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
   assert.equal(await page.evaluate(()=>{const root=document.querySelector('.sn-bible-reader');return root.scrollWidth<=root.clientWidth+1&&[...root.querySelectorAll('nav,section')].every(e=>e.scrollWidth<=e.clientWidth+1);}),true);
   counts.layoutCases++;
  }
  stage='axe-'+theme+'-'+scale;await page.setViewportSize({width:320,height:900});await page.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  const violations=await page.evaluate(async()=>{const r=await window.axe.run('.sn-bible-reader',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.length}));});
  if(violations.length){console.error(JSON.stringify({stage,violations}));throw Error('axe');}counts.axeScans++;
 }
 await blocked(page);assert.equal(external.length,0);assert.equal(errors.length,0);await ctx.close();
 stage='no-js';const nojs=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});await nojs.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());const np=await nojs.newPage();
 assert.equal((await np.goto(origin+hub))?.status(),200);await Promise.all([np.waitForURL(origin+reader),np.getByRole('link',{name:'Abrir lector bíblico'}).click()]);await blocked(np);counts.noJsChecks++;
 await Promise.all([np.waitForURL(origin+hub),np.getByRole('link',{name:'Volver al módulo Biblia'}).click()]);counts.noJsChecks++;await nojs.close();
 // Public lab: cold contexts, gzip, no throttling. Hard budgets only for bytes; timings are descriptive.
 stage='performance';const metrics=[];
 for(const width of [360,1280])for(let run=1;run<=3;run++){
  const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  await c.addInitScript(()=>{window.__p924={lcp:null,cls:0};let sum=0,first=0,last=0;
   if(PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint'))new PerformanceObserver(l=>{for(const e of l.getEntries())window.__p924.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   if(PerformanceObserver.supportedEntryTypes.includes('layout-shift'))new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;if(!last||e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;sum=0;}last=e.startTime;sum+=e.value;window.__p924.cls=Math.max(window.__p924.cls,sum);}}).observe({type:'layout-shift',buffered:true});
  });
  const p=await c.newPage();assert.equal((await p.goto(origin+reader))?.status(),200);await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready);
  const m=await p.evaluate(()=>{const e=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];return {transferBytes:e.reduce((n,x)=>n+x.transferSize,0),externalJsBytes:e.filter(x=>new URL(x.name).pathname.endsWith('.js')).reduce((n,x)=>n+x.encodedBodySize,0),lcpMs:window.__p924.lcp,cls:window.__p924.cls};});
  const html=readFileSync(join(base,'biblia/lector/index.html'),'utf8');
  const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x=>!/(?:^|\s)src\s*=/.test(x[1])).reduce((n,x)=>n+gzipSync(Buffer.from(x[2]),{level:6}).length,0);
  const jsGzipBytes=m.externalJsBytes+inline;assert.ok(m.transferBytes>0&&m.transferBytes<=512000,'transfer budget');assert.ok(jsGzipBytes<=153600,'JS budget');
  metrics.push({width,run,transferBytes:m.transferBytes,jsGzipBytes,lcpMs:m.lcpMs,cls:m.cls});await c.close();
 }
 // Private context only: route fulfillment with synthetic data and actual TS modules.
 // Never write a fixture or test entry into src/public/dist.
 stage='private-fixture';
 const privateContext=await browser.newContext({viewport:{width:360,height:900},serviceWorkers:'block'});
 const modelPath=prefix+'__p924-private/model.js',uiPath=prefix+'__p924-private/ui.js';
 const model=ts.transpileModule(readFileSync('src/lib/reader-view.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const ui=ts.transpileModule(readFileSync('src/scripts/reader-ui.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace('../lib/reader-view','./model.js');
 assert.match(ui,/\.\/model\.js/);
 await privateContext.route('**/*',r=>{const url=r.request().url();if(url===origin+modelPath)return r.fulfill({contentType:'text/javascript',body:model});if(url===origin+uiPath)return r.fulfill({contentType:'text/javascript',body:ui});
  if(url===origin+reader)return r.fulfill({contentType:'text/html; charset=utf-8',body:readFileSync(join(base,'biblia/lector/index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')});
  return url.startsWith(origin+'/')?r.continue():r.abort();});
 const fp=await privateContext.newPage(),fe=[];fp.on('pageerror',e=>fe.push(e.message));
 assert.equal((await fp.goto(origin+reader))?.status(),200);
 await fp.evaluate(async ({modelPath,uiPath,marker})=>{
  const {createReaderView}=await import(modelPath),{mountReader}=await import(uiPath);
  const unit=(chapter,verse,text)=>({chapter,verse,text,sourceLocator:'private:'+chapter+':'+verse,resourceId:'private-fixture'});
  const edition=(id,language,units)=>({id,name:id,version:'fixture',language,attribution:'Test attribution',license:'Test license',source:'Test source',books:[{id:'book',name:'Test book',units}]});
  mountReader(document,createReaderView({publicationAuthorized:true,editions:[edition('spa','spa',[unit('1','1a',marker+' <b>literal</b>'),unit('1','2-3','range'),unit('1','4',''),unit('3','1','last')]),edition('grc','grc',[unit('1','1','λόγος')])]}));
 },{modelPath,uiPath,marker:fixtureMarker});
 const choose=async(e,b,c,v)=>{await fp.locator('#br-edition').selectOption(e);await fp.locator('#br-book').selectOption(b);await fp.locator('#br-chapter').selectOption(c);await fp.locator('#br-verse').selectOption(v);};
 const read=()=>fp.locator('#br-consult').click();
 await choose('spa','book','1','1a');await read();assert.equal(await fp.locator('#br-passage').textContent(),fixtureMarker+' <b>literal</b>');assert.equal(await fp.locator('#br-passage b').count(),0);assert.equal(await fp.locator('#br-passage').getAttribute('lang'),'es');counts.fixtureChecks++;
 assert.equal(await fp.locator('#br-previous').isDisabled(),true);assert.equal(await fp.evaluate(()=>document.activeElement?.id),'br-passage-title');for(const expected of ['Test license','Test attribution','Test source','private:1:1'])assert.ok((await fp.locator('#br-source').innerText()).includes(expected),'Atribución o procedencia no visible');counts.fixtureChecks++;
 await fp.locator('#br-next').click();assert.equal(await fp.locator('#br-verse').inputValue(),'2-3');assert.equal(await fp.locator('#br-passage').textContent(),'range');counts.fixtureChecks++;
 await fp.locator('#br-next').click();assert.match(await fp.locator('#br-status').textContent(),/marcador sin texto/i);counts.fixtureChecks++;
 await fp.locator('#br-next').click();assert.equal(await fp.locator('#br-chapter').inputValue(),'3');assert.equal(await fp.locator('#br-next').isDisabled(),true);counts.fixtureChecks++;
 await fp.locator('#br-previous').click();assert.equal(await fp.locator('#br-verse').inputValue(),'4');counts.fixtureChecks++;
 await fp.locator('#br-edition').selectOption('grc');assert.equal(await fp.locator('#br-detail').isHidden(),true);assert.equal(await fp.locator('#br-next').isDisabled(),true);assert.equal(await fp.locator('#br-consult').isDisabled(),true);assert.ok(!(await fp.locator('#br-passage').textContent()).includes(fixtureMarker));counts.fixtureChecks++;
 await fp.locator('#br-book').selectOption('book');await fp.locator('#br-chapter').selectOption('1');await fp.locator('#br-verse').selectOption('1');await read();assert.equal(await fp.locator('#br-passage').textContent(),'λόγος');assert.equal(await fp.locator('#br-passage').getAttribute('lang'),'grc');counts.fixtureChecks++;
 assert.deepEqual(fe,[]);await privateContext.close();
 assert.deepEqual(counts,{layoutCases:60,axeScans:12,sectionLinks:3,keyboardNavigation:6,preferenceChecks:2,noJsChecks:2,fixtureChecks:8});
 console.log(JSON.stringify({phase:'P9.2.4',mode:'public-empty-and-isolated-fixture',...counts,auditedFiles,metrics,publicationAuthorized:false,manualScreenReader:'pending',manualZoom:'pending',manualDevices:'pending',fieldINP:'not measured'},null,2));
}catch(e){console.error('P9.2.4 diagnostic at '+stage+': '+String(e?.message??e));throw Error('P9.2.4 failed at '+stage);}finally{if(browser)await browser.close();server.close();}
