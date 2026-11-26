// P8.5.3: public navigation and accessibility integration. No corpus.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const prefix='/Scriptura-Nexus/',base=resolve('dist');
const paths={hub:prefix+'linguistica/',analyzer:prefix+'linguistica/analizador/',lexicon:prefix+'linguistica/lexicos-concordancias/'};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer((req,res)=>{try{
 const path=new URL(req.url,'http://127.0.0.1').pathname;if(!path.startsWith(prefix))throw Error();
 const rel=decodeURIComponent(path.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
 if(!file.startsWith(base+'/')||!statSync(file).isFile())throw Error();
 res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(readFileSync(file));
}catch{res.statusCode=404;res.end();}});
let browser,stage='init';
const counts={navigation:0,sectionLinks:0,layoutCases:0,axeScans:0,preferenceTransitions:0,noJsNavigation:0};
try{
 const require=createRequire(resolve(process.env.P853_DEPS,'package.json')), {chromium}=require('playwright'),axe=require.resolve('axe-core/axe.min.js');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',acceptDownloads:false,reducedMotion:'reduce'});
 const external=[],errors=[];await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():(external.push(1),route.abort()));
 const page=await context.newPage();page.on('pageerror',()=>errors.push(1));
 const go=async name=>{assert.equal((await page.goto(origin+paths[name]))?.status(),200);await page.waitForLoadState('networkidle');};
 const keyLink=async (link,path)=>{await link.focus();assert.equal(await link.evaluate(x=>document.activeElement===x),true);await Promise.all([page.waitForURL(origin+path),page.keyboard.press('Enter')]);await page.waitForLoadState('networkidle');counts.navigation++;};
 const nav=()=>page.getByRole('navigation',{name:'Herramientas lingüísticas',exact:true});
 stage='navigation';await go('hub');
 await keyLink(page.getByRole('link',{name:'Abrir analizador',exact:true}),paths.analyzer);
 assert.equal(await nav().locator('[aria-current="page"]').count(),1);
 await keyLink(nav().getByRole('link',{name:'Léxicos y concordancias',exact:true}),paths.lexicon);
 assert.equal(await nav().locator('[aria-current="page"]').count(),1);
 await keyLink(nav().getByRole('link',{name:'Analizador de términos',exact:true}),paths.analyzer);
 await keyLink(nav().getByRole('link',{name:'Lingüística bíblica',exact:true}),paths.hub);
 await keyLink(page.getByRole('link',{name:'Abrir léxicos y concordancias',exact:true}),paths.lexicon);
 stage='preferences';
 await page.locator('[data-appearance-panel] summary').click();
 await page.locator('#sn-appearance-theme').selectOption('contrast-dark');
 await page.locator('#sn-appearance-font-scale').selectOption('130');
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('[data-appearance-panel]').evaluate(e=>e.open),false);
 assert.equal(await page.locator('[data-appearance-panel] summary').evaluate(e=>e===document.activeElement),true);
 for(const [name,label] of [['analyzer','Analizador de términos'],['lexicon','Léxicos y concordancias'],['hub','Lingüística bíblica']]){
  await keyLink(nav().getByRole('link',{name:label,exact:true}),paths[name]);
  assert.deepEqual(await page.evaluate(()=>[document.documentElement.dataset.theme,document.documentElement.dataset.fontScale]),['contrast-dark','130']);counts.preferenceTransitions++;
 }
 await page.locator('[data-appearance-panel] summary').click();await page.locator('[data-appearance-reset]').click();
 assert.deepEqual(await page.evaluate(()=>[document.documentElement.dataset.theme,document.documentElement.dataset.fontScale]),['light','100']);
 for(const name of ['analyzer','lexicon']){
  stage='sections-'+name;await go(name);
  const section=page.getByRole('navigation',{name:'Secciones de esta herramienta',exact:true});
  const links=section.getByRole('link');const n=await links.count();
  assert.equal(n,name==='analyzer'?3:2);
  for(let i=0;i<n;i++){
   stage='sections-'+name+'-link-'+(i+1);
   const link=links.nth(i),hash=await link.getAttribute('href');assert.ok(hash?.startsWith('#'));
   const target=hash.slice(1);assert.equal(await page.locator(hash).getAttribute('tabindex'),'-1');
   await link.focus();assert.equal(await link.evaluate(e=>e===document.activeElement),true);
   await Promise.all([page.waitForURL(origin+paths[name]+hash),page.keyboard.press('Enter')]);
   stage='sections-'+name+'-focus-'+(i+1);
   // Wait for the browser's native fragment navigation and focus, not a forced focus in the test.
   await page.waitForFunction(id=>document.activeElement?.id===id,target,{timeout:5000});
   assert.equal(await page.evaluate(()=>document.activeElement?.id),target);counts.sectionLinks++;
  }
  stage='sections-'+name+'-release-gate';
  const fieldsets=name==='analyzer'?['ta-fields']:['lc-lex-fields','lc-con-fields'];
  for(const id of fieldsets)assert.equal(await page.locator('#'+id).evaluate(e=>e instanceof HTMLFieldSetElement&&e.disabled),true);
  const controls=name==='analyzer'?['ta-edition','ta-book','ta-chapter','ta-verse','ta-occurrence']:['lc-lex-mode','lc-lex-lang','lc-lex-system','lc-lex-value','lc-edition','lc-lang','lc-book','lc-mode','lc-system','lc-value','lc-frequency'];
  for(const id of controls)assert.equal(await page.locator('#'+id).isDisabled(),true);
 }
 for(const name of ['hub','analyzer','lexicon']){
  stage='layout-'+name;await go(name);await page.addScriptTag({path:axe});
  for(const theme of ['light','dark','contrast-light','contrast-dark']){
   for(const scale of ['100','115','130'])for(const width of [320,375,768,1024,1440]){
    stage='layout-'+name+'-'+theme+'-'+scale+'-'+width;await page.setViewportSize({width,height:900});
    await page.evaluate(async ({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
    assert.equal(await page.evaluate(()=>{const root=document.querySelector('.module-landing');return root.scrollWidth<=root.clientWidth+1&&[...root.querySelectorAll('nav,section')].every(e=>e.scrollWidth<=e.clientWidth+1);}),true);
    counts.layoutCases++;
   }
   stage='axe-'+name+'-'+theme;await page.setViewportSize({width:320,height:900});await page.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
   const violations=await page.evaluate(async()=>{const r=await window.axe.run('.module-landing',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.length}));});
   if(violations.length){console.error(JSON.stringify({stage,violations}));throw Error('axe');}counts.axeScans++;
  }
 }
 stage='no-js';const n=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});await n.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());const p=await n.newPage();
 assert.equal((await p.goto(origin+paths.analyzer))?.status(),200);assert.equal(await p.locator('#ta-fields').evaluate(e=>e instanceof HTMLFieldSetElement&&e.disabled),true);assert.equal(await p.locator('#ta-edition').isDisabled(),true);assert.equal(await p.locator('#ta-occurrence').isDisabled(),true);
 await Promise.all([p.waitForURL(origin+paths.lexicon),p.getByRole('navigation',{name:'Herramientas lingüísticas'}).getByRole('link',{name:'Léxicos y concordancias',exact:true}).click()]);counts.noJsNavigation++;
 for(const id of ['lc-lex-fields','lc-con-fields'])assert.equal(await p.locator('#'+id).evaluate(e=>e instanceof HTMLFieldSetElement&&e.disabled),true);assert.equal(await p.locator('#lc-edition').isDisabled(),true);assert.equal(await p.locator('#lc-lex-value').isDisabled(),true);await Promise.all([p.waitForURL(origin+paths.hub),p.getByRole('navigation',{name:'Herramientas lingüísticas'}).getByRole('link',{name:'Lingüística bíblica',exact:true}).click()]);counts.noJsNavigation++;await n.close();
 assert.deepEqual(counts,{navigation:8,sectionLinks:5,layoutCases:180,axeScans:12,preferenceTransitions:3,noJsNavigation:2});
 assert.equal(external.length,0);assert.equal(errors.length,0);
 console.log(JSON.stringify({mode:'P8.5.3-public-integration',...counts,manualScreenReader:'pending',manualZoom:'pending',manualDevices:'pending',corpusPublished:0},null,2));
}catch(e){console.error('P8.5.3 public-only diagnostic at '+stage+': '+String(e?.message??e));throw Error('P8.5.3 failed at '+stage);}finally{if(browser)await browser.close();server.close();}
