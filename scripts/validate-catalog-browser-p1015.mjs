// P10.1.5: browser closure over the actual static catalog, with no corpus or fixture imports.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import {loadOperationalCatalog} from './validate-p1013.mjs';
import {loadP1014,validateP1014} from './validate-p1014.mjs';
import {searchCatalog} from '../src/lib/catalog-search.ts';
const catalog=loadOperationalCatalog(),plan=loadP1014();
validateP1014(plan);
const base=resolve('dist'),prefix='/Scriptura-Nexus/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
const server=createServer((req,res)=>{try{
 const path=new URL(req.url,'http://127.0.0.1').pathname;if(!path.startsWith(prefix))throw Error();
 const rel=decodeURIComponent(path.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
 if(!file.startsWith(base+'/')||!statSync(file).isFile())throw Error();
 res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(readFileSync(file));
}catch{res.statusCode=404;res.end();}});
const counts={exactIdSearches:0,filterChecks:0,paginationChecks:0,keyboardTransitions:0,layoutChecks:0,axeScans:0,noJsChecks:0};
let browser,stage='init';
try{
 const require=createRequire(resolve(process.env.P1015_DEPS,'package.json')),{chromium}=require('playwright'),axe=require.resolve('axe-core/axe.min.js');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const errors=[],external=[],context=await browser.newContext({viewport:{width:375,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
 await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():(external.push(r.request().url()),r.abort()));
 const page=await context.newPage();page.on('pageerror',()=>errors.push('pageerror'));page.on('response',r=>{if(r.status()>=400)errors.push('http '+r.status());});
 const go=async path=>{assert.equal((await page.goto(origin+prefix+path))?.status(),200);await page.waitForLoadState('networkidle');};
 const key=async(link,path)=>{await link.focus();assert.equal(await link.evaluate(e=>document.activeElement===e),true);await Promise.all([page.waitForURL(origin+prefix+path),page.keyboard.press('Enter')]);counts.keyboardTransitions++;};
 const visibleIds=()=>page.locator('[data-study-id]:not([hidden])').evaluateAll(es=>es.map(e=>e.dataset.studyId));
 const assignment=new Map(plan.assignments.map(s=>[s.studyId,s.profiles]));
 stage='catalog filters';await go('estudios/');
 await page.locator('[data-catalog-filters]').waitFor({state:'visible'});
 const axis=page.locator('#catalog-axis'),status=page.locator('#catalog-status'),profile=page.locator('#catalog-profile');
 const apply=async(a='',s='',p='')=>{
  await axis.selectOption(a);await status.selectOption(s);await profile.selectOption(p);
  const expected=catalog.filter(x=>(!a||x.primaryAxisId===a)&&(!s||x.status===s)&&(!p||(p==='pendiente'?!assignment.has(x.id):assignment.get(x.id)?.includes(p)))).map(x=>x.id);
  assert.deepEqual(await visibleIds(),expected);
  assert.equal(await page.locator('#catalog-count').innerText(),expected.length+(expected.length===1?' investigación':' investigaciones'));
  assert.equal(await page.locator('#catalog-empty').isVisible(),expected.length===0);counts.filterChecks++;
 };
 await apply();for(const p of plan.profiles)await apply('','',p.id);await apply('','','pendiente');
 for(let i=1;i<=14;i++)await apply('E'+String(i).padStart(2,'0'));
 await apply('E14','planificado','religiosa_comparada');await apply('E09','planificado','religiosa_comparada');await apply('','publicado','interdisciplinaria');
 await page.locator('#catalog-reset').focus();await page.keyboard.press('Enter');
 assert.deepEqual(await visibleIds(),catalog.map(x=>x.id));assert.deepEqual(await Promise.all([axis.inputValue(),status.inputValue(),profile.inputValue()]),['','','']);counts.filterChecks++;

 stage='search';await key(page.getByRole('link',{name:'Buscar investigaciones',exact:true}),'buscar/');
 const input=page.locator('#search-query'),result=page.locator('#search-results li'),submit=page.locator('#search-form button[type="submit"]');
 await input.waitFor({state:'visible'});
 for(const study of catalog){
  await input.fill(study.id);await submit.click();
  await page.waitForFunction(id=>{const links=document.querySelectorAll('#search-results a');return links.length===1&&links[0].getAttribute('href')?.endsWith('/'+id+'/');},study.id);
  assert.equal(await page.locator('#search-status').innerText(),'Resultados: 1. Mostrados: 1.');
  assert.equal(await result.count(),1);counts.exactIdSearches++;
 }
 const index=JSON.parse(readFileSync('dist/data/catalog-search.json','utf8')).items;
 const matches=searchCatalog(index,'E09');assert.ok(matches.length>12);
 await input.fill('E09');await submit.click();await page.waitForFunction(()=>document.querySelectorAll('#search-results li').length===12);
 assert.equal(await result.count(),12);assert.ok(await page.locator('#search-more').isVisible());counts.paginationChecks++;
 await page.locator('#search-more').focus();await page.keyboard.press('Enter');
 assert.equal(await result.count(),Math.min(24,matches.length));assert.deepEqual(await result.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),matches.slice(0,24).map(s=>prefix+'estudios/'+s.id+'/'));
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('href')),prefix+'estudios/'+matches[12].id+'/');counts.paginationChecks++;
 await page.locator('#search-form button[type="reset"]').click();assert.equal(await result.count(),0);assert.equal(await input.inputValue(),'');counts.paginationChecks++;
 await input.fill('SN-999');await submit.click();await page.waitForFunction(()=>document.querySelector('#search-status')?.textContent?.includes('No se encontraron'));assert.equal(await result.count(),0);counts.paginationChecks++;
 await input.fill('SN-080');await submit.click();await page.waitForFunction(()=>document.querySelector('#search-results a')?.getAttribute('href')?.endsWith('/SN-080/'));
 await key(page.locator('#search-results a'),'estudios/SN-080/');
 const verifyStudy=async(id)=>{
  assert.equal(await page.locator('[data-section-state="pendiente"]').count(),20);
  assert.equal(await page.locator('.study-approved-body').count(),0);
  assert.match(await page.locator('[aria-labelledby="publicacion-titulo"]').innerText(),/Sin versión aprobada/);
  const expected=plan.links.filter(l=>l.a===id||l.b===id).map(l=>l.a===id?l.b:l.a).sort();
  assert.deepEqual(await page.locator('[data-cross-study]').evaluateAll(es=>es.map(e=>e.dataset.crossStudy)),expected);
 };
 await verifyStudy('SN-080');
 stage='cross references';
 for(const id of ['SN-027','SN-044','SN-064','SN-071']){
  await key(page.locator('[data-cross-study="'+id+'"] a'),'estudios/'+id+'/');await verifyStudy(id);
  await key(page.locator('[data-cross-study="SN-080"] a'),'estudios/SN-080/');await verifyStudy('SN-080');
 }
 await key(page.getByRole('link',{name:'Volver al catálogo',exact:true}),'estudios/');
 stage='reflow and axe';
 for(const path of ['estudios/','buscar/','estudios/SN-080/']){
  await go(path);await page.addScriptTag({path:axe});
  for(const theme of ['light','dark','contrast-light','contrast-dark'])for(const scale of ['100','115','130']){
   for(const width of [320,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(async({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
    assert.equal(await page.evaluate(()=>{const root=document.querySelector('.module-landing');return root.scrollWidth<=root.clientWidth+1;}),true,path+' '+theme+' '+scale+' '+width);counts.layoutChecks++;
   }
   await page.setViewportSize({width:320,height:900});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const violations=await page.evaluate(async()=>{const r=await window.axe.run('.module-landing',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.length}));});
   assert.deepEqual(violations,[],path+' '+theme+' '+scale);counts.axeScans++;
  }
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await context.close();
 stage='no JavaScript';const nojs=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'}),np=await nojs.newPage();
 for(const path of ['estudios/','buscar/','estudios/SN-080/']){
  assert.equal((await np.goto(origin+prefix+path))?.status(),200);
  if(path==='estudios/'){assert.equal(await np.locator('[data-study-id]:not([hidden])').count(),80);assert.ok(await np.locator('[data-catalog-filters]').isHidden());}
  else if(path==='buscar/'){assert.ok(await np.locator('#search-form').isHidden());assert.ok(await np.getByRole('link',{name:'Explorar catálogo completo'}).isVisible());}
  else {assert.equal(await np.locator('[data-cross-study]').count(),4);assert.equal(await np.locator('[data-section-state="pendiente"]').count(),20);}
  counts.noJsChecks++;
 }
 await nojs.close();
 assert.deepEqual(counts,{exactIdSearches:80,filterChecks:27,paginationChecks:4,keyboardTransitions:11,layoutChecks:108,axeScans:36,noJsChecks:3});
 console.log(JSON.stringify({phase:'P10.1.5',...counts,publicationAuthorized:false,manualAccessibility:'pending P11.3'}));
}catch(e){console.error('P10.1.5 stage: '+stage);throw e;}finally{if(browser)await browser.close();server.close();}
