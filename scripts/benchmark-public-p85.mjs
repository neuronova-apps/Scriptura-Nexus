// P8.5.2: gzip lab server for public build only. No private model or endpoint.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
const base=resolve('dist'),prefix='/Scriptura-Nexus/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json'};
const compressible=new Set(['.html','.js','.css','.svg','.json','.txt','.xml']);
const cache=new Map();
function body(file){if(cache.has(file))return cache.get(file);const raw=readFileSync(file),ext=extname(file),gzip=compressible.has(ext)?gzipSync(raw,{level:6}):null;const x={raw,gzip,ext};cache.set(file,x);return x;}
const server=createServer((req,res)=>{try{
 const path=new URL(req.url,'http://127.0.0.1').pathname;if(!path.startsWith(prefix))throw Error();
 const rel=decodeURIComponent(path.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
 if(!file.startsWith(base+'/')||!statSync(file).isFile())throw Error();
 const x=body(file),use=!!x.gzip&&/\bgzip\b/.test(req.headers['accept-encoding']??'');const b=use?x.gzip:x.raw;
 res.setHeader('Content-Type',mime[x.ext]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Length',b.length);if(use)res.setHeader('Content-Encoding','gzip');res.end(b);
}catch{res.statusCode=404;res.end();}});
const r=n=>Math.round(n*100)/100;
const routes=[['home',prefix],['analyzer',prefix+'linguistica/analizador/'],['lexicon',prefix+'linguistica/lexicos-concordancias/']];
let browser,stage='init';
try{
 const require=createRequire(resolve(process.env.P852_DEPS,'package.json'));const {chromium}=require('playwright');
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const result=[];
 for(const [name,path] of routes)for(const width of [360,1280])for(let run=1;run<=3;run++){
  stage=name+'-'+width+'-'+run;
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',acceptDownloads:false});
  const external=[];await context.route('**/*',route=>{if(route.request().url().startsWith(origin+'/'))return route.continue();external.push(1);return route.abort();});
  await context.addInitScript(()=>{
   const m=window.__perf={lcp:null,cls:0,events:[],supported:[]};let sum=0,first=0,last=0;
   const observe=(type,fn,extra={})=>{if(!PerformanceObserver.supportedEntryTypes.includes(type))return;m.supported.push(type);new PerformanceObserver(list=>{for(const e of list.getEntries())fn(e);}).observe({type,buffered:true,...extra});};
   observe('largest-contentful-paint',e=>m.lcp=e.startTime);
   observe('layout-shift',e=>{if(e.hadRecentInput)return;if(!last||e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;sum=0;}last=e.startTime;sum+=e.value;m.cls=Math.max(m.cls,sum);});
   observe('event',e=>{if(e.interactionId)m.events.push({id:e.interactionId,duration:e.duration});},{durationThreshold:16});
  });
  const page=await context.newPage();const failures=[];page.on('pageerror',()=>failures.push(1));page.on('response',x=>{if(x.status()>=400)failures.push(1);});
  assert.equal((await page.goto(origin+path))?.status(),200);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  const initial=await page.evaluate(()=>{
   const entries=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];
   const total=entries.reduce((n,e)=>n+e.transferSize,0),body=entries.reduce((n,e)=>n+e.encodedBodySize,0);
   const js=entries.filter(e=>new URL(e.name).pathname.endsWith('.js')).reduce((n,e)=>n+e.encodedBodySize,0);
   return {requests:entries.length,transferBytes:total,encodedBodyBytes:body,externalJsGzipBytes:js,lcp:window.__perf.lcp,cls:window.__perf.cls,supported:window.__perf.supported};
  });
  // Inline JS is already in compressed HTML transfer, counted separately for JS budget.
  const html=readFileSync(join(base,path.slice(prefix.length),'index.html'),'utf8');
  const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!/(?:^|\s)src\s*=/.test(m[1])&&!/type\s*=\s*["']application\/ld\+json/.test(m[1])).map(m=>m[2]);
  const inlineBytes=inline.reduce((n,s)=>n+gzipSync(Buffer.from(s),{level:6}).length,0);
  const jsBytes=initial.externalJsGzipBytes+inlineBytes;
  await page.locator('details.appearance-settings summary').click();
  await page.locator('#sn-appearance-theme').selectOption('dark');
  await page.locator('[data-appearance-reset]').click();
  await page.waitForTimeout(250);
  const ev=await page.evaluate(()=>window.__perf.events);
  const groups=new Map();for(const e of ev)groups.set(e.id,Math.max(groups.get(e.id)??0,e.duration));
  assert.equal(external.length,0);assert.equal(failures.length,0);
  result.push({route:name,width,run,requests:initial.requests,transferBytes:initial.transferBytes,encodedBodyBytes:initial.encodedBodyBytes,jsGzipBytes:jsBytes,lcpMs:initial.lcp===null?null:r(initial.lcp),cls:r(initial.cls),observedInteractionCount:groups.size,maxObservedInteractionMs:groups.size?Math.max(...groups.values()):null,observerTypes:initial.supported});
  await context.close();
 }
 const totalDistBytes=readdirSync(base,{recursive:true,withFileTypes:true}).filter(x=>x.isFile()).reduce((n,x)=>n+statSync(join(x.parentPath,x.name)).size,0);
 const home=result.filter(x=>x.route==='home'),max=(a,k)=>Math.max(...a.map(x=>x[k]));
 console.log(JSON.stringify({mode:'P8.5.2-public-lab',chromium:browser.version(),conditions:'local gzip level 6, cold contexts, no artificial throttling; public empty data',runs:result,totalDistBytes,budgets:{jsInitialBytes:153600,homeTransferBytes:512000,lcpMs:2500,cls:.1,interactionMs:200},homeMaxJsGzipBytes:max(home,'jsGzipBytes'),homeMaxTransferBytes:max(home,'transferBytes'),allMaxJsGzipBytes:max(result,'jsGzipBytes'),homeJsPass:max(home,'jsGzipBytes')<=153600,homeTransferPass:max(home,'transferBytes')<=512000,labLcpPass:result.every(x=>x.lcpMs!==null&&x.lcpMs<=2500),labClsPass:result.every(x=>x.cls<=.1),observedInteractionPass:result.some(x=>x.maxObservedInteractionMs!==null)?result.filter(x=>x.maxObservedInteractionMs!==null).every(x=>x.maxObservedInteractionMs<=200):null,fieldINP:'not measured',published:0},null,2));
}catch{throw new Error('P8.5.2 public lab failed at '+stage);}finally{if(browser)await browser.close();server.close();}
