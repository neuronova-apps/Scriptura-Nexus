// Public artifact verification and isolated fixture exercise; never modify dist.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {createRequire} from 'node:module';
import {gzipSync} from 'node:zlib';
const base=resolve('dist'),prefix='/Scriptura-Nexus/',hub=prefix+'biblia/',reader=hub+'lector/',comparator=hub+'comparador/';
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
const publicControls=['bc-consult',...['origin','target'].flatMap(side=>['edition','book','chapter','verse'].map(field=>'bc-'+side+'-'+field))];
const manifest=JSON.parse(readFileSync('docs/P9/proyeccion-ediciones-p913.json','utf8'));
const tokenList=manifest.corpusManifests.flatMap(m=>[m.id,m.integrity.projectionSha256,...m.fragments.flatMap(f=>[f.id,f.sourceFileSha256,f.projectionSha256])]);
const fixtureMarker='P934-PRIVATE-FIXTURE-ONLY';
const alignmentRegistry=JSON.parse(readFileSync('docs/P9/alineaciones-p931.json','utf8'));
assert.equal(alignmentRegistry.publicationAuthorized,false);assert.deepEqual(alignmentRegistry.alignments,[]);assert.deepEqual(alignmentRegistry.evidence,[]);
let auditedFiles=0;
try{
 const require=createRequire(resolve(process.env.P934_DEPS,'package.json')),{chromium}=require('playwright'),axe=require.resolve('axe-core/axe.min.js');
 const ts=createRequire(import.meta.url)('typescript');
 stage='artifact-audit';
 for(const f of readdirSync(base,{recursive:true,withFileTypes:true})){
  if(!f.isFile())continue;
  assert.doesNotMatch(f.name,/\.(?:usfm|sfm|zip|7z|rar)$/i,'source archive in output');
  if(!/\.(?:html?|js|mjs|json|txt|xml|map|css)$/i.test(f.name))continue;
  const s=readFileSync(join(f.parentPath,f.name),'utf8');
  for(const t of tokenList)assert.ok(!s.includes(t),'internal projection identifier in '+f.name);
  assert.ok(!s.includes(fixtureMarker),'fixture in public artifact');assert.doesNotMatch(s,/alineaciones-p931\.json|comparison-engine-p932\.py|P933 PRIVATE FIXTURE|TXT-comparator-fixture|comparator-fixture-only|ALI-comparator-test|EVD-comparator-test/);auditedFiles++;
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
 await keyLink(page.getByRole('link',{name:'Abrir comparador bíblico',exact:true}),comparator);
 const blocked=async p=>{for(const id of publicControls)assert.equal(await p.locator('#'+id).isDisabled(),true);assert.match(await p.locator('#bc-status').textContent(),/No hay ediciones disponibles/);assert.equal(await p.locator('.bc-reading').count(),0);assert.match(await p.locator('#bc-evidence').textContent(),/No hay correspondencias disponibles/);};
 await blocked(page);
 const sections=page.getByRole('navigation',{name:'Secciones del comparador'}).getByRole('link');assert.equal(await sections.count(),3);
 for(let i=0;i<3;i++){
  const link=sections.nth(i),hash=await link.getAttribute('href');assert.ok(hash?.startsWith('#'));
  await keyLink(link,comparator+hash);await page.waitForFunction(id=>document.activeElement?.id===id,hash.slice(1));counts.sectionLinks++;
 }
 await keyLink(page.getByRole('navigation',{name:'Herramientas bíblicas'}).getByRole('link',{name:'Lector bíblico',exact:true}),reader);
 await keyLink(page.getByRole('link',{name:'Abrir comparador bíblico',exact:true}),comparator);
 await keyLink(page.getByRole('link',{name:'Volver al módulo Biblia',exact:true}),hub);
 await keyLink(page.getByRole('link',{name:'Abrir comparador bíblico',exact:true}),comparator);
 stage='preferences';await page.locator('[data-appearance-panel] summary').click();
 await page.locator('#sn-appearance-theme').selectOption('contrast-dark');await page.locator('#sn-appearance-font-scale').selectOption('130');
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-appearance-panel]').evaluate(e=>e.open),false);
 for(const path of [hub,reader,comparator]){await go(path);assert.deepEqual(await page.evaluate(()=>[document.documentElement.dataset.theme,document.documentElement.dataset.fontScale]),['contrast-dark','130']);counts.preferenceChecks++;}
 await page.locator('[data-appearance-panel] summary').click();await page.locator('[data-appearance-reset]').click();await page.keyboard.press('Escape');
 await page.addScriptTag({path:axe});
 for(const theme of ['light','dark','contrast-light','contrast-dark'])for(const scale of ['100','115','130']){
  for(const width of [320,375,768,1024,1440]){
   stage='layout-'+theme+'-'+scale+'-'+width;await page.setViewportSize({width,height:900});
   await page.evaluate(async ({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
   assert.equal(await page.evaluate(()=>{const root=document.querySelector('.sn-bible-comparator');return root.scrollWidth<=root.clientWidth+1&&[...root.querySelectorAll('nav,section,fieldset')].every(e=>e.scrollWidth<=e.clientWidth+1);}),true);
   counts.layoutCases++;
  }
  stage='axe-'+theme+'-'+scale;await page.setViewportSize({width:320,height:900});await page.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  const violations=await page.evaluate(async()=>{const r=await window.axe.run('.sn-bible-comparator',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.length}));});
  if(violations.length){console.error(JSON.stringify({stage,violations}));throw Error('axe');}counts.axeScans++;
 }
 await blocked(page);assert.equal(external.length,0);assert.equal(errors.length,0);await ctx.close();
 stage='no-js';const nojs=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});await nojs.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());const np=await nojs.newPage();
 assert.equal((await np.goto(origin+hub))?.status(),200);await Promise.all([np.waitForURL(origin+comparator),np.getByRole('link',{name:'Abrir comparador bíblico',exact:true}).click()]);await blocked(np);counts.noJsChecks++;
 await Promise.all([np.waitForURL(origin+reader),np.getByRole('navigation',{name:'Herramientas bíblicas'}).getByRole('link',{name:'Lector bíblico',exact:true}).click()]);counts.noJsChecks++;
 await Promise.all([np.waitForURL(origin+comparator),np.getByRole('link',{name:'Abrir comparador bíblico',exact:true}).click()]);await blocked(np);counts.noJsChecks++;await nojs.close();
 // Public lab: cold contexts, gzip, no throttling. Hard budgets only for bytes; timings are descriptive.
 stage='performance';const metrics=[];
 for(const width of [360,1280])for(let run=1;run<=3;run++){
  const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  await c.addInitScript(()=>{window.__p934={lcp:null,cls:0};let sum=0,first=0,last=0;
   if(PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint'))new PerformanceObserver(l=>{for(const e of l.getEntries())window.__p934.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   if(PerformanceObserver.supportedEntryTypes.includes('layout-shift'))new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;if(!last||e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;sum=0;}last=e.startTime;sum+=e.value;window.__p934.cls=Math.max(window.__p934.cls,sum);}}).observe({type:'layout-shift',buffered:true});
  });
  const p=await c.newPage();assert.equal((await p.goto(origin+comparator))?.status(),200);await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready);
  const m=await p.evaluate(()=>{const e=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];return {transferBytes:e.reduce((n,x)=>n+x.transferSize,0),externalJsBytes:e.filter(x=>new URL(x.name).pathname.endsWith('.js')).reduce((n,x)=>n+x.encodedBodySize,0),lcpMs:window.__p934.lcp,cls:window.__p934.cls};});
  const html=readFileSync(join(base,'biblia/comparador/index.html'),'utf8');
  const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x=>!/(?:^|\s)src\s*=/.test(x[1])).reduce((n,x)=>n+gzipSync(Buffer.from(x[2]),{level:6}).length,0);
  const jsGzipBytes=m.externalJsBytes+inline;assert.ok(m.transferBytes>0&&m.transferBytes<=512000,'transfer budget');assert.ok(jsGzipBytes<=153600,'JS budget');
  metrics.push({width,run,transferBytes:m.transferBytes,jsGzipBytes,lcpMs:m.lcpMs,cls:m.cls});await c.close();
 }
 // Private context only: synthetic fixtures and actual TS modules, never written to dist.
 stage='private-fixture';
 const pc=await browser.newContext({viewport:{width:360,height:900},serviceWorkers:'block'});
 const privateBase=prefix+'__p934-private/',modelPath=privateBase+'model.js',readerPath=privateBase+'reader.js',uiPath=privateBase+'ui.js';
 const transpile=path=>ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const modules=new Map([[readerPath,transpile('src/lib/reader-view.ts')],
  [modelPath,transpile('src/lib/comparator-view.ts').replace('./reader-view.ts','./reader.js')],
  [uiPath,transpile('src/scripts/comparator-ui.ts').replace('../lib/comparator-view','./model.js').replace('../lib/reader-view','./reader.js')]]);
 assert.match(modules.get(modelPath),/\.\/reader\.js/);assert.match(modules.get(uiPath),/\.\/model\.js/);assert.match(modules.get(uiPath),/\.\/reader\.js/);
 await pc.route('**/*',r=>{const url=r.request().url(),path=new URL(url).pathname;
  if(url.startsWith(origin+'/')&&modules.has(path))return r.fulfill({contentType:'text/javascript',body:modules.get(path)});
  if(url===origin+comparator)return r.fulfill({contentType:'text/html; charset=utf-8',body:readFileSync(join(base,'biblia/comparador/index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')});
  return url.startsWith(origin+'/')?r.continue():r.abort();});
 const fp=await pc.newPage(),fe=[];fp.on('pageerror',()=>fe.push(1));
 assert.equal((await fp.goto(origin+comparator))?.status(),200);
 await fp.evaluate(async ({modelPath,uiPath,marker})=>{
  const {createComparatorView}=await import(modelPath),{mountComparator}=await import(uiPath);
  const unit=(verse,text)=>({chapter:'1',verse,text,sourceLocator:'private:1:'+verse,resourceId:'private-fixture'});
  const ed=(id,language,units)=>({id,name:id,version:'fixture',language,attribution:'Test attribution',license:'Test license',source:'Test source',books:[{id:'book',name:'Test book',units}]});
  const ref=(editionId,verse)=>({editionId,bookId:'book',chapter:'1',verse});
  const group=(id,left,right,relationship)=>({id,source:left.map(v=>ref('spa',v)),target:right.map(v=>ref('grc',v)),relationship,verification:'verified',evidence:[{id:'EVD-'+id,sourceRef:'Test source',sourceRevision:'fixture',locator:'Test locator '+id,reviewedBy:'Test reviewer',reviewedOn:'2026-01-01',verification:'verified'}]});
  const reading={publicationAuthorized:true,editions:[ed('spa','spa',[unit('1',marker+' <b>literal</b>'),unit('2-3','range'),unit('4',''),unit('5','one'),unit('6','many-a'),unit('7','many-b'),unit('8','group-a'),unit('9','group-b')]),ed('grc','grc',[unit('1','λόγος'),unit('2','β'),unit('3','γ'),unit('4',''),unit('5','δ'),unit('6','ε'),unit('7','ζ'),unit('8','η'),unit('9','θ')])]};
  mountComparator(document,createComparatorView({reading,groups:[group('g1',['2-3'],['2','3'],'one_to_many'),group('g2',['5'],['5'],'one_to_one'),group('g3',['6','7'],['6'],'many_to_one'),group('g4',['8','9'],['8','9'],'many_to_many')]}));
 },{modelPath,uiPath,marker:fixtureMarker});
 const control=(side,field)=>fp.locator('#bc-'+side+'-'+field);
 const select=async(side,e,v)=>{await control(side,'edition').selectOption(e);if(v!==undefined){await control(side,'book').selectOption('book');await control(side,'chapter').selectOption('1');await control(side,'verse').selectOption(v);}};
 const submit=fp.locator('#bc-consult'),status=fp.locator('#bc-status'),source=fp.locator('#bc-origin-result'),target=fp.locator('#bc-target-result'),evidence=fp.locator('#bc-evidence');
 const compare=async (se,sv,te,tv)=>{await select('origin',se,sv);await select('target',te,tv);await submit.click();};
 const check=()=>{counts.fixtureChecks++;};
 stage='fixture-unverified';
 await compare('spa','1','grc');
 assert.match(await status.textContent(),/Sin correspondencia verificada/);assert.match(await fp.locator('#bc-diagnostic').textContent(),/no constituye una alineación/);
 assert.equal(await target.locator('.bc-reading').count(),0);check();
 assert.equal(await source.locator('.bc-reading').textContent(),fixtureMarker+' <b>literal</b>');assert.equal(await source.locator('b').count(),0);assert.equal(await source.locator('.bc-reading').getAttribute('lang'),'es');check();
 assert.equal(await fp.evaluate(()=>document.activeElement?.id),'bc-result-title');for(const expected of ['Test license','Test attribution','Test source','private:1:1'])assert.ok((await source.innerText()).includes(expected),'Atribución o procedencia no visible');check();
 await control('target','book').selectOption('book');assert.equal(await submit.isDisabled(),true);await control('target','chapter').selectOption('1');assert.equal(await submit.isDisabled(),true);await control('target','verse').selectOption('1');assert.equal(await submit.isDisabled(),false);check();
 await submit.click();assert.match(await status.textContent(),/Sin correspondencia verificada/);assert.equal(await target.locator('.bc-reading').textContent(),'λόγος');assert.equal(await target.locator('.bc-reading').getAttribute('lang'),'grc');check();
 stage='fixture-groups';
 for(const [se,sv,te,expected,leftCount,rightCount] of [['spa','2-3','grc','Uno a varios',1,2],['grc','3','spa','Varios a uno',2,1],['spa','5','grc','Uno a uno',1,1],['spa','6','grc','Varios a uno',2,1],['spa','8','grc','Varios a varios',2,2]]){
  await compare(se,sv,te);
  assert.match(await status.textContent(),/Correspondencia documental verificada/);assert.match(await evidence.textContent(),new RegExp(expected));assert.match(await evidence.textContent(),/Test locator/);
  assert.equal(await source.locator('.bc-reading').count(),leftCount);assert.equal(await target.locator('.bc-reading').count(),rightCount);
  assert.match(await evidence.textContent(),/Idiomas distintos/);check();
 }
 await compare('spa','2-3','grc','5');assert.match(await status.textContent(),/fuera del grupo documentado/);assert.equal(await target.locator('.bc-reading').textContent(),'δ');assert.doesNotMatch(await evidence.textContent(),/Test locator/);check();
 await compare('spa','4','grc','1');assert.match(await status.textContent(),/origen contiene un marcador vacío/);assert.match(await source.locator('.bc-reading').textContent(),/marcador sin texto/);check();
 await compare('spa','1','grc','4');assert.match(await status.textContent(),/destino contiene un marcador vacío/);assert.equal(await target.locator('.bc-reading').getAttribute('lang'),'es');check();
 await control('target','edition').selectOption('spa');assert.equal(await submit.isDisabled(),true);assert.match(await status.textContent(),/dos ediciones distintas/);assert.equal(await fp.locator('.bc-reading').count(),0);assert.doesNotMatch(await evidence.textContent(),/Test locator/);check();
 assert.deepEqual(fe,[]);await pc.close();
 assert.deepEqual(counts,{layoutCases:60,axeScans:12,sectionLinks:3,keyboardNavigation:8,preferenceChecks:3,noJsChecks:3,fixtureChecks:14});
 console.log(JSON.stringify({phase:'P9.3.4',mode:'public-empty-and-isolated-fixture',...counts,auditedFiles,metrics,publicationAuthorized:false,manualScreenReader:'pending',manualZoom:'pending',manualDevices:'pending',fieldINP:'not measured'},null,2));
}catch(e){console.error('P9.3.4 diagnostic at '+stage+': '+String(e?.message??e));throw Error('P9.3.4 failed at '+stage);}finally{if(browser)await browser.close();server.close();}
