import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import {gzipSync} from 'node:zlib';
const plan=JSON.parse(readFileSync('docs/P11/registro-accesibilidad-rendimiento-p113.json','utf8'));
const base=resolve('dist'),prefix='/Scriptura-Nexus/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json'};
const server=createServer((req,res)=>{try{
 const p=new URL(req.url,'http://127.0.0.1').pathname;if(!p.startsWith(prefix))throw Error();
 const rel=decodeURIComponent(p.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
 if(!file.startsWith(base+'/')||!statSync(file).isFile())throw Error();
 const raw=readFileSync(file),ext=extname(file),gz=['.html','.js','.css','.svg','.json'].includes(ext)&&/\bgzip\b/.test(req.headers['accept-encoding']??'');
 const body=gz?gzipSync(raw,{level:6}):raw;
 res.setHeader('Content-Type',mime[ext]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Length',body.length);
 if(gz)res.setHeader('Content-Encoding','gzip');res.end(body);
}catch{res.statusCode=404;res.end();}});
let browser;
try{
 const require=createRequire(resolve(process.env.P113_DEPS,'package.json')),{chromium}=require('playwright'),axe=require.resolve('axe-core/axe.min.js');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const failures=[],counts={routes:0,reflow:0,axe:0,labSamples:0},metrics=[];
 const fail=(route,kind,detail)=>failures.push({route,kind,detail});
 const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 for(const route of plan.routes){
  const ctx=await browser.newContext({viewport:{width:320,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
  await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():(fail(route,'external_request','blocked'),r.abort()));
  const p=await ctx.newPage();p.on('pageerror',()=>fail(route,'pageerror','runtime'));p.on('response',r=>{if(r.status()>=400)fail(route,'http',r.status());});
  try{
   assert.equal((await p.goto(origin+prefix+route))?.status(),200);await p.waitForLoadState('networkidle');await p.addScriptTag({path:axe});
   assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('main').count(),1);
   const layout=async(width,theme,scale)=>{
    await p.setViewportSize({width,height:900});
    await p.evaluate(({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;},{theme,scale});await settle(p);
    const d=await p.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    if(d.scroll>d.width+1)fail(route,'reflow',{width,theme,scale,...d});counts.reflow++;
   };
   for(const width of plan.widths)await layout(width,'light','100');
   for(const theme of plan.themes){
    for(const scale of plan.scales)await layout(320,theme,scale);
    const violations=await p.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,count:v.nodes.length,targets:v.nodes.map(n=>n.target).slice(0,5)}));});
    if(violations.length)fail(route,'axe',{theme,scale:'130',violations});counts.axe++;
   }
   counts.routes++;
  }catch(e){fail(route,'navigation_or_setup',String(e.message).slice(0,300));}
  finally{await ctx.close();}
 }
 for(const route of plan.routes)for(const width of [360,1280])for(let run=1;run<=3;run++){
  const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():(fail(route,'external_request','blocked'),r.abort()));
  await c.addInitScript(()=>{window.__lab={lcp:null,cls:0};let sum=0,first=0,last=0;
   if(PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint'))new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lab.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   if(PerformanceObserver.supportedEntryTypes.includes('layout-shift'))new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;if(!last||e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;sum=0;}last=e.startTime;sum+=e.value;window.__lab.cls=Math.max(window.__lab.cls,sum);}}).observe({type:'layout-shift',buffered:true});
  });
  try{
   const p=await c.newPage();p.on('pageerror',()=>fail(route,'pageerror','runtime'));p.on('response',r=>{if(r.status()>=400)fail(route,'http',r.status());});
   assert.equal((await p.goto(origin+prefix+route))?.status(),200);await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
   const m=await p.evaluate(()=>{const e=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];return {transferBytes:e.reduce((n,x)=>n+x.transferSize,0),externalJsBytes:e.filter(x=>new URL(x.name).pathname.endsWith('.js')).reduce((n,x)=>n+x.encodedBodySize,0),lcpMs:window.__lab.lcp,cls:window.__lab.cls};});
   const html=readFileSync(resolve(base,route,'index.html'),'utf8');
   const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x=>!/(?:^|\s)src\s*=/.test(x[1])).reduce((n,x)=>n+gzipSync(Buffer.from(x[2]),{level:6}).length,0);
   const row={route,width,run,...m,jsGzipBytes:m.externalJsBytes+inline};metrics.push(row);counts.labSamples++;
   if(row.jsGzipBytes>plan.budget.initialJsGzipBytes||(!route&&row.transferBytes>plan.budget.homeTransferBytes)||row.lcpMs===null||row.lcpMs>plan.budget.lcpMs||row.cls>plan.budget.cls)fail(route,'lab_budget',row);
  }catch(e){fail(route,'lab_setup',String(e.message).slice(0,300));}finally{await c.close();}
 }
 console.log(JSON.stringify({phase:'P11.3',...counts,conditions:'Chromium local gzip, cold contexts, no throttling, public data only',metrics,failures,fieldINP:'not measured',manualAccessibility:'pending',publicationAuthorized:false},null,2));
 assert.deepEqual(counts,{routes:18,reflow:306,axe:72,labSamples:108});assert.equal(failures.length,0,'Audit findings require correction or explicit review');
}finally{if(browser)await browser.close();server.close();}
