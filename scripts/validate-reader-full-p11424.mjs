// Isolated validation only. No source text, screenshots, traces or corpus artifacts are logged.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {createHash} from 'node:crypto';
import {readLoopbackGzip} from './lib/reader-loopback-gzip.mjs';
import {createIsolatedFragmentReader} from '../src/lib/reader-fragment-view.ts';
const plan=JSON.parse(readFileSync('docs/P11/registro-validacion-lector-p11424.json','utf8'));
const dep=createRequire(resolve(process.env.P11424_DEPS,'package.json'));
const {chromium}=dep('playwright'),axe=dep.resolve('axe-core/axe.min.js');
const child=spawn('python3',['scripts/serve-reader-isolated-p11423.py'],{stdio:['ignore','pipe','ignore']});
const lines=createInterface({input:child.stdout});
let browser,stage='server';
const req=(ok,code)=>{if(!ok)throw Error(code);};
try{
 const ready=await Promise.race([once(lines,'line').then(([s])=>JSON.parse(s)),once(child,'exit').then(()=>{throw Error('server exited');})]);
 req(ready.publicationAuthorized===false&&ready.fragments===1449&&ready.catalogGzipBytes>0&&ready.catalogGzipBytes<=plan.budget.catalogGzipBytes,'catalog budget');
 const origin='http://127.0.0.1:'+ready.port,reader=origin+'/reader/';
 const chapterPath=d=>'/chapter/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/');
 const catalogResponse=await readLoopbackGzip(origin,'/catalog',{maxGzipBytes:plan.budget.catalogGzipBytes,expectedGzipBytes:ready.catalogGzipBytes,expectedJsonBytes:ready.catalogJsonBytes});
 const catalog=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(catalogResponse.raw));
 let loads=0,units=0,empties=0,books=0,chapters=0;
 const v=createIsolatedFragmentReader(catalog,async d=>{
  const r=await readLoopbackGzip(origin,chapterPath(d),{maxGzipBytes:plan.budget.chapterGzipBytes,expectedGzipBytes:d.gzipBytes,expectedJsonBytes:d.jsonBytes});loads++;
  req(createHash('sha256').update(r.packed).digest('hex')===d.gzipSha256,'compressed fingerprint');
  return new Uint8Array(r.raw);
 });
 stage='exhaustive-reference-navigation';
 for(const e of catalog.editions)for(const b of e.books){
  books++;const refs=b.chapters.flatMap(c=>c.verses.map(verse=>({editionId:e.id,bookId:b.id,chapter:c.chapter,verse})));chapters+=b.chapters.length;
  req(JSON.stringify(v.chapters(e.id,b.id))===JSON.stringify(b.chapters.map(c=>c.chapter)),'chapter labels');
  for(const c of b.chapters)req(JSON.stringify(v.verses(e.id,b.id,c.chapter))===JSON.stringify(c.verses),'verse labels');
  for(let i=0;i<refs.length;i++){
   const x=await v.locate(refs[i]);
   req('unit' in x&&x.edition.id===e.id&&x.unit.chapter===refs[i].chapter&&x.unit.verse===refs[i].verse&&x.bookName===b.name,'reference identity');
   req(JSON.stringify(x.previous)===JSON.stringify(refs[i-1]??null)&&JSON.stringify(x.next)===JSON.stringify(refs[i+1]??null),'neighbor order');
   units++;if(x.status==='empty_marker')empties++;else req(x.status==='available','status');
  }
 }
 assert.deepEqual({editions:catalog.editions.length,books,chapters,units,empties,loads},{editions:2,books:93,chapters:1449,units:39041,empties:18,loads:1449});
 const modules=new Map([
  ['/reader-view.js','src/lib/reader-view.ts'],['/reader-fragment-view.js','src/lib/reader-fragment-view.ts'],['/reader-ui.js','src/scripts/reader-ui.ts']
 ].map(([url,file])=>[url,ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/(['"])\.\.\/lib\/reader-view\1/g,"'./reader-view.js'").replace(/(['"])\.\/reader-view\.ts\1/g,"'./reader-view.js'")]));
 browser=await chromium.launch({headless:true});
 const html=readFileSync('dist/biblia/lector/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 const base=resolve('dist'),prefix='/Scriptura-Nexus/';
 const contexts=[];
 async function setup(width){
  const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',acceptDownloads:false,reducedMotion:'reduce'});contexts.push(c);
  const requests=[],errors=[],blocked=[];
  await c.route('**/*',async r=>{
   const url=new URL(r.request().url());
   if(url.origin!==origin){blocked.push(1);return r.abort();}
   if(url.pathname==='/reader/')return r.fulfill({contentType:'text/html; charset=utf-8',body:html});
   if(modules.has(url.pathname))return r.fulfill({contentType:'text/javascript',body:modules.get(url.pathname)});
   if(url.pathname==='/catalog')return r.continue();
   if(url.pathname.startsWith('/chapter/')){requests.push(url.pathname);return r.continue();}
   if(url.pathname.startsWith(prefix)){
    const f=resolve(base,decodeURIComponent(url.pathname.slice(prefix.length)));
    if(f.startsWith(base+'/')&&['.css','.svg','.png','.webp','.woff2'].includes(extname(f))&&statSync(f,{throwIfNoEntry:false})?.isFile())return r.fulfill({path:f});
   }
   return r.fulfill({status:404,body:''});
  });
  const p=await c.newPage();p.on('pageerror',()=>errors.push(1));
  req((await p.goto(reader))?.status()===200,'page');
  const mountMs=await p.evaluate(async()=>{
   const start=performance.now();
   const {createIsolatedFragmentReader}=await import('/reader-fragment-view.js'),{mountReader}=await import('/reader-ui.js');
   const res=await fetch('/catalog');if(!res.ok)throw Error('catalog');
   const v=createIsolatedFragmentReader(await res.json(),async d=>{const r=await fetch('/chapter/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/'),{cache:'no-store'});if(!r.ok)throw Error('fragment');return new Uint8Array(await r.arrayBuffer());});
   mountReader(document,v);return performance.now()-start;
  });
  const sel=id=>p.locator('#br-'+id);
  const choose=async(e,b,ch,verse)=>{await sel('edition').selectOption(e);await sel('book').selectOption(b);await sel('chapter').selectOption(ch);await sel('verse').selectOption(verse);};
  const consult=async()=>{const start=performance.now();await sel('consult').click();await p.waitForFunction(()=>document.querySelector('#br-status')?.textContent==='Referencia disponible.');return performance.now()-start;};
  const close=async()=>{req(errors.length===0&&blocked.length===0,'isolated context');await c.close();};
  return {p,sel,choose,consult,close,requests,mountMs};
 }
 const samples=[['TXT-RV1909','LIB-GEN','1','1','es'],['TXT-SBLGNT-V1-2','LIB-3JN','1','1','grc']];
 let layoutChecks=0,axeScans=0;
 for(const [e,b,ch,verse,lang] of samples){
  stage='accessibility-'+lang;
  const x=await setup(320);await x.choose(e,b,ch,verse);await x.consult();
  req(await x.sel('passage').getAttribute('lang')===lang,'language');
  req(await x.p.evaluate(()=>document.activeElement?.id)==='br-passage-title','focus');
  req(await x.sel('source').locator('dt').count()===9,'provenance fields');
  await x.p.addScriptTag({path:axe});
  for(const theme of plan.themes)for(const scale of plan.scales){
   await x.p.evaluate(({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;},{theme,scale});
   for(const width of plan.widths){
    await x.p.setViewportSize({width,height:900});await x.p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const reflow=await x.p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1);
    req(reflow,'reflow '+lang+' '+theme+' '+scale+' '+width);layoutChecks++;
   }
   await x.p.setViewportSize({width:320,height:900});
   const ids=await x.p.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return r.violations.map(v=>v.id);});
   if(ids.length){console.log(JSON.stringify({stage,theme,scale,ruleIds:ids}));throw Error('axe violations');}
   axeScans++;
  }
  req(x.requests.length===1,'no extra downloads on appearance changes');await x.close();
 }
 const metrics=[];
 for(const [e,b,ch,verse,lang] of samples)for(const width of [360,1280])for(let run=1;run<=3;run++){
  stage='lab-'+lang+'-'+width+'-'+run;
  const x=await setup(width);req(x.requests.length===0,'no eager text');
  await x.choose(e,b,ch,verse);const firstMs=await x.consult();req(x.requests.length===1,'first chapter');
  const cachedMs=await x.consult();req(x.requests.length===1,'cached chapter');
  const entries=await x.p.evaluate(()=>performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname.startsWith('/chapter/')).map(e=>({encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize})));
  req(entries.length===1&&entries[0].encodedBodySize>0&&entries[0].encodedBodySize<=plan.budget.chapterGzipBytes,'browser chapter budget');
  metrics.push({language:lang,width,run,mountMs:Math.round(x.mountMs),firstMs:Math.round(firstMs),cachedMs:Math.round(cachedMs),chapterGzipBytes:entries[0].encodedBodySize});
  await x.close();
 }
 assert.deepEqual({layoutChecks,axeScans,labSamples:metrics.length},{layoutChecks:120,axeScans:24,labSamples:12});
 console.log(JSON.stringify({phase:'P11.4.2.4',editions:2,books,chapters,units,emptyMarkers:empties,chapterLoads:loads,catalogJsonBytes:ready.catalogJsonBytes,catalogGzipBytes:ready.catalogGzipBytes,layoutChecks,axeScans,labSamples:metrics.length,maxMountMs:Math.max(...metrics.map(m=>m.mountMs)),maxFirstMs:Math.max(...metrics.map(m=>m.firstMs)),maxCachedMs:Math.max(...metrics.map(m=>m.cachedMs)),metrics,conditions:'isolated local Chromium; no throttling; timings descriptive',fieldINP:'not measured',manualLoadedReader:'pending',publicationAuthorized:false,corpusPersisted:false,sourceTextLogged:false}));
}catch{console.error('P11.4.2.4 validation failed at '+stage);process.exitCode=1;}
finally{if(browser)await browser.close();lines.close();child.kill();}
