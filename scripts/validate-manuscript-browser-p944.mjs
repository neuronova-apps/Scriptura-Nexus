import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import {fixture,marker} from '../tests/fixtures/manuscript-p944.mjs';
const base=resolve('dist'),prefix='/Scriptura-Nexus/',hub=prefix+'manuscritos/',route=hub+'consulta/',reader=prefix+'biblia/lector/',comparator=prefix+'biblia/comparador/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer((req,res)=>{try{
 const path=new URL(req.url,'http://127.0.0.1').pathname;if(!path.startsWith(prefix))throw Error();
 const rel=decodeURIComponent(path.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
 if(!file.startsWith(base+'/')||!statSync(file).isFile())throw Error();
 res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(readFileSync(file));
}catch{res.statusCode=404;res.end();}});
let browser,stage='init';
const counts={layoutCases:0,axeScans:0,sectionLinks:0,keyboardNavigation:0,noJsChecks:0,fixtureChecks:0};
try{
 const require=createRequire(resolve(process.env.P944_DEPS,'package.json')),{chromium}=require('playwright'),axe=require.resolve('axe-core/axe.min.js');
 const ts=createRequire(import.meta.url)('typescript');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
 await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',()=>errors.push('pageerror'));
 const go=async path=>{assert.equal((await page.goto(origin+path))?.status(),200);await page.waitForLoadState('networkidle');};
 const key=async(link,path)=>{await link.focus();assert.equal(await link.evaluate(e=>document.activeElement===e),true);await Promise.all([page.waitForURL(origin+path),page.keyboard.press('Enter')]);counts.keyboardNavigation++;};
 const blocked=async p=>{for(const id of ['mv-search','mv-witness','mv-variant'])assert.equal(await p.locator('#'+id).isDisabled(),true);assert.match(await p.locator('#mv-status').textContent(),/No hay testigos disponibles/);assert.match(await p.locator('#mv-variant-status').textContent(),/No hay variantes disponibles/);assert.equal(await p.locator('.mv-panel').count(),0);};
 stage='navigation';await go(hub);await key(page.getByRole('link',{name:'Abrir catálogo de manuscritos',exact:true}),route);await blocked(page);
 const sections=page.getByRole('navigation',{name:'Secciones del catálogo'}).getByRole('link');
 for(let i=0;i<3;i++){const l=sections.nth(i),hash=await l.getAttribute('href');assert.ok(hash?.startsWith('#'));await key(l,route+hash);await page.waitForFunction(id=>document.activeElement?.id===id,hash.slice(1));counts.sectionLinks++;}
 for(const [label,path] of [['Lector bíblico',reader],['Comparador bíblico',comparator]]){
  await key(page.getByRole('navigation',{name:'Herramientas textuales'}).getByRole('link',{name:label,exact:true}),path);
  await key(page.getByRole('link',{name:'Abrir catálogo de manuscritos',exact:true}),route);
 }
 await page.addScriptTag({path:axe});
 for(const theme of ['light','dark','contrast-light','contrast-dark'])for(const scale of ['100','115','130']){
  for(const width of [320,375,768,1024,1440]){
   stage='layout-'+theme+'-'+scale+'-'+width;await page.setViewportSize({width,height:900});
   await page.evaluate(async({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
   assert.equal(await page.evaluate(()=>{const root=document.querySelector('.sn-manuscript-view');return root.scrollWidth<=root.clientWidth+1&&[...root.querySelectorAll('nav,section,fieldset')].every(e=>e.scrollWidth<=e.clientWidth+1);}),true);counts.layoutCases++;
  }
  stage='axe-'+theme+'-'+scale;await page.setViewportSize({width:320,height:900});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const violations=await page.evaluate(async()=>{const r=await window.axe.run('.sn-manuscript-view',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.length}));});
  assert.deepEqual(violations,[]);counts.axeScans++;
 }
 await blocked(page);assert.deepEqual(errors,[]);await context.close();
 stage='no-js';const nojs=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});const np=await nojs.newPage();assert.equal((await np.goto(origin+route))?.status(),200);await blocked(np);counts.noJsChecks++;await nojs.close();
 // The synthetic release and transpiled modules exist only in this isolated browser context.
 stage='fixture';const pc=await browser.newContext({viewport:{width:320,height:900},serviceWorkers:'block'});
 const privateBase=prefix+'__p944-private/',modelPath=privateBase+'model.js',uiPath=privateBase+'ui.js';
 const transpile=path=>ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const modules=new Map([[modelPath,transpile('src/lib/manuscript-view.ts')],[uiPath,transpile('src/scripts/manuscript-ui.ts')]]);
 await pc.route('**/*',r=>{const url=r.request().url(),path=new URL(url).pathname;
  if(url.startsWith(origin+'/')&&modules.has(path))return r.fulfill({contentType:'text/javascript',body:modules.get(path)});
  if(url===origin+route)return r.fulfill({contentType:'text/html; charset=utf-8',body:readFileSync(resolve(base,'manuscritos/consulta/index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')});
  return url.startsWith(origin+'/')?r.continue():r.abort();
 });
 const fp=await pc.newPage(),fe=[];fp.on('pageerror',()=>fe.push('pageerror'));assert.equal((await fp.goto(origin+route))?.status(),200);
 await fp.evaluate(async({modelPath,uiPath,data})=>{const {createManuscriptView}=await import(modelPath),{mountManuscripts}=await import(uiPath);mountManuscripts(document,createManuscriptView(data));},{modelPath,uiPath,data:fixture()});
 const search=fp.locator('#mv-search'),witness=fp.locator('#mv-witness'),variant=fp.locator('#mv-variant'),detail=fp.locator('#mv-witness-detail'),vd=fp.locator('#mv-variant-detail');
 assert.equal(await search.isDisabled(),false);assert.match(await fp.locator('#mv-status').textContent(),/2 testigos/);counts.fixtureChecks++;
 await search.fill('codice');assert.match(await fp.locator('#mv-status').textContent(),/1 testigos/);await witness.selectOption('MAN-p944-fixture-A');assert.match(await detail.textContent(),new RegExp(marker));assert.match(await detail.textContent(),/No documentada/);counts.fixtureChecks++;
 assert.equal(await detail.getByRole('link',{name:'Synthetic catalog',exact:true}).getAttribute('href'),'https://example.invalid/REC-p944-catalog');counts.fixtureChecks++;
 await search.fill('sin coincidencia');assert.equal(await witness.isDisabled(),true);assert.doesNotMatch(await detail.textContent(),new RegExp(marker));counts.fixtureChecks++;
 await variant.selectOption('VAR-p944-fixture');assert.equal(await vd.locator('.mv-panel').count(),3);assert.match(await vd.textContent(),/Atestación secundaria/);assert.match(await vd.textContent(),/Examen directo documentado/);assert.match(await vd.textContent(),/No verificada/);assert.match(await vd.textContent(),/No evaluada/);counts.fixtureChecks++;
 assert.match(await vd.textContent(),/Sin atestaciones documentadas/);assert.match(await vd.textContent(),/Referencia <b>literal<\/b>/);assert.equal(await vd.locator('b').count(),0);counts.fixtureChecks++;
 assert.equal(await fp.evaluate(()=>{const root=document.querySelector('.sn-manuscript-view');return root.scrollWidth<=root.clientWidth+1;}),true);counts.fixtureChecks++;
 await variant.selectOption('');assert.equal(await vd.locator('.mv-panel').count(),0);assert.deepEqual(fe,[]);counts.fixtureChecks++;
 await pc.close();
 assert.deepEqual(counts,{layoutCases:60,axeScans:12,sectionLinks:3,keyboardNavigation:8,noJsChecks:1,fixtureChecks:8});
 console.log(JSON.stringify({phase:'P9.4.4',...counts,publicationAuthorized:false,realPilotLoaded:false}));
}catch(error){console.error('P9.4.4 stage: '+stage);throw error;}finally{if(browser)await browser.close();server.close();}
