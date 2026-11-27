// Cross-tool integration and comparable cold-context budgets. No fixture or corpus is written to dist.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {createRequire} from 'node:module';
import {gzipSync} from 'node:zlib';
const base=resolve('dist'),prefix='/Scriptura-Nexus/';
const tools=[
 {id:'reader',path:'biblia/lector/',name:'Abrir lector bíblico',status:'#br-status',controls:['br-edition','br-book','br-chapter','br-verse','br-consult','br-previous','br-next']},
 {id:'comparator',path:'biblia/comparador/',name:'Abrir comparador bíblico',status:'#bc-status',controls:['bc-consult',...['origin','target'].flatMap(s=>['edition','book','chapter','verse'].map(f=>'bc-'+s+'-'+f))]},
 {id:'manuscripts',path:'manuscritos/consulta/',name:'Abrir catálogo de manuscritos',status:'#mv-status',controls:['mv-search','mv-witness','mv-variant']}
];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
const server=createServer((req,res)=>{try{
 const path=new URL(req.url,'http://127.0.0.1').pathname;if(!path.startsWith(prefix))throw Error();
 const rel=decodeURIComponent(path.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
 if(!file.startsWith(base+'/')||!statSync(file).isFile())throw Error();
 const raw=readFileSync(file),ext=extname(file),gzip=['.html','.js','.css','.svg','.json'].includes(ext)&&/\bgzip\b/.test(req.headers['accept-encoding']??'');
 const body=gzip?gzipSync(raw,{level:6}):raw;
 res.setHeader('Content-Type',mime[ext]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Length',body.length);if(gzip)res.setHeader('Content-Encoding','gzip');res.end(body);
}catch{res.statusCode=404;res.end();}});
let browser,stage='init';
try{
 const require=createRequire(resolve(process.env.P95_DEPS,'package.json')),{chromium}=require('playwright');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const errors=[],external=[];
 const context=await browser.newContext({viewport:{width:375,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
 await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():(external.push(r.request().url()),r.abort()));
 const page=await context.newPage();page.on('pageerror',()=>errors.push('pageerror'));page.on('response',r=>{if(r.status()>=400)errors.push('http');});
 const go=async path=>{assert.equal((await page.goto(origin+prefix+path))?.status(),200);await page.waitForLoadState('networkidle');};
 const key=async(link,path)=>{await link.focus();assert.equal(await link.evaluate(e=>document.activeElement===e),true);await Promise.all([page.waitForURL(origin+prefix+path),page.keyboard.press('Enter')]);};
 const blocked=async tool=>{
  for(const id of tool.controls)assert.equal(await page.locator('#'+id).isDisabled(),true);
  assert.match(await page.locator(tool.status).textContent(),/No hay/);
  assert.ok(await page.getByRole('link').filter({hasText:/licencias/i}).count()>0);
 };
 stage='integration';await go(tools[0].path);await blocked(tools[0]);
 await page.locator('[data-appearance-panel] summary').click();await page.locator('#sn-appearance-theme').selectOption('contrast-dark');await page.locator('#sn-appearance-font-scale').selectOption('130');await page.keyboard.press('Escape');
 let transitions=0,preferenceChecks=0;
 // Existing reciprocal links: reader->comparator->manuscripts->reader->manuscripts->comparator->reader.
 const journey=[['comparator','Abrir comparador bíblico'],['manuscripts','Abrir catálogo de manuscritos'],['reader','Lector bíblico'],['manuscripts','Abrir catálogo de manuscritos'],['comparator','Comparador bíblico'],['reader','Lector bíblico']];
 for(const [id,label] of journey){
  const tool=tools.find(t=>t.id===id);stage='navigation-'+id;
  const link=id==='reader'&&label==='Lector bíblico'?page.getByRole('navigation',{name:/Herramientas (bíblicas|textuales)/}).getByRole('link',{name:label,exact:true}):page.getByRole('link',{name:label,exact:true});
  await key(link,tool.path);transitions++;await blocked(tool);
  assert.deepEqual(await page.evaluate(()=>[document.documentElement.dataset.theme,document.documentElement.dataset.fontScale]),['contrast-dark','130']);preferenceChecks++;
 }
 assert.equal(transitions,6);assert.equal(preferenceChecks,6);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await context.close();

 stage='performance';const metrics=[];
 for(const tool of tools)for(const width of [360,1280])for(let run=1;run<=3;run++){
  const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  const out=[];await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():(out.push(1),r.abort()));
  await c.addInitScript(()=>{window.__p95={lcp:null,cls:0};let sum=0,first=0,last=0;
   if(PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint'))new PerformanceObserver(l=>{for(const e of l.getEntries())window.__p95.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   if(PerformanceObserver.supportedEntryTypes.includes('layout-shift'))new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;if(!last||e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;sum=0;}last=e.startTime;sum+=e.value;window.__p95.cls=Math.max(window.__p95.cls,sum);}}).observe({type:'layout-shift',buffered:true});
  });
  const p=await c.newPage();assert.equal((await p.goto(origin+prefix+tool.path))?.status(),200);await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready);
  const m=await p.evaluate(()=>{const e=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];return {transferBytes:e.reduce((n,x)=>n+x.transferSize,0),externalJsBytes:e.filter(x=>new URL(x.name).pathname.endsWith('.js')).reduce((n,x)=>n+x.encodedBodySize,0),lcpMs:window.__p95.lcp,cls:window.__p95.cls};});
  const html=readFileSync(join(base,tool.path,'index.html'),'utf8');
  const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x=>!/(?:^|\s)src\s*=/.test(x[1])).reduce((n,x)=>n+gzipSync(Buffer.from(x[2]),{level:6}).length,0);
  const jsGzipBytes=m.externalJsBytes+inline;
  assert.ok(m.transferBytes>0&&m.transferBytes<=512000,tool.id+' transfer budget');assert.ok(jsGzipBytes<=153600,tool.id+' JS budget');
  assert.deepEqual(out,[]);metrics.push({tool:tool.id,width,run,transferBytes:m.transferBytes,jsGzipBytes,lcpMs:m.lcpMs,cls:m.cls});await c.close();
 }
 assert.equal(metrics.length,18);
 console.log(JSON.stringify({phase:'P9.5',transitions,preferenceChecks,metrics,publicationAuthorized:false,fieldINP:'not measured',manualAccessibility:'pending'},null,2));
}catch(e){console.error('P9.5 diagnostic at '+stage);throw e;}finally{if(browser)await browser.close();server.close();}
