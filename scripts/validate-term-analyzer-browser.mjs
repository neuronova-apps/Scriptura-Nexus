// P8.3.5: isolated Chromium test; no corpus files, snapshots, traces or public endpoint.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {loadVerifiedAnalyzerData} from './lib/term-analyzer-validation-data.mjs';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
const prefix='/Scriptura-Nexus/';
const base=resolve('dist');
const pagePath=prefix+'linguistica/analizador/';
const sourceFiles=new Map([
 ['/__isolated/modules/term-analyzer.js','src/lib/term-analyzer.ts'],
 ['/__isolated/modules/linguistic-contracts.js','src/lib/linguistic-contracts.ts'],
 ['/__isolated/modules/term-analyzer-view.js','src/lib/term-analyzer-view.ts'],
 ['/__isolated/modules/term-analyzer-ui.js','src/scripts/term-analyzer-ui.ts']
]);
const moduleAliases={
 './linguistic-contracts.ts':'./linguistic-contracts.js',
 '../lib/term-analyzer-view':'./term-analyzer-view.js',
 '../lib/linguistic-contracts':'./linguistic-contracts.js'
};
const html=readFileSync('dist/linguistica/analizador/index.html','utf8');
const isolated=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer((req,res)=>{
 try{
  const path=new URL(req.url,'http://127.0.0.1').pathname;
  res.setHeader('Cache-Control','no-store');
  if(path==='/__isolated/analyzer'){res.setHeader('Content-Type',mime['.html']);return res.end(isolated);}
  if(sourceFiles.has(path)){
   let js=ts.transpileModule(readFileSync(sourceFiles.get(path),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
   for(const [from,to] of Object.entries(moduleAliases))js=js.replaceAll("'"+from+"'","'"+to+"'").replaceAll('"'+from+'"','"'+to+'"');
   res.setHeader('Content-Type',mime['.js']);return res.end(js);
  }
  if(!path.startsWith(prefix)){res.statusCode=404;return res.end();}
  const rel=decodeURIComponent(path.slice(prefix.length));
  const file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
  if(!file.startsWith(base+'/')||!statSync(file).isFile()){res.statusCode=404;return res.end();}
  res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');
  res.end(readFileSync(file));
 }catch{res.statusCode=404;res.end();}
});
let stage='inicio',browser;
const checks={publicEmpty:false,noJavaScript:false,realCases:0,keyboard:false,staleSelection:false,appearanceLayouts:0,axeScans:0};
async function main(){
 const deps=process.env.P835_DEPS;
 assert.ok(deps);
 const require=createRequire(resolve(deps,'package.json'));
 const {chromium}=require('playwright');
 const axePath=require.resolve('axe-core/axe.min.js');
 stage='fuentes';
 const data=await loadVerifiedAnalyzerData();
 const engine=createTermAnalyzer(data.registry,data.admissions,data.supplements);
 const wanted=new Set(['hbo:documentado','hbo:parcial','arc:documentado','arc:parcial','arc:sin_interpretar','grc:documentado','grc:sin_interpretar','grc:ausente']);
 const cases=[];
 for(const t of data.registry.tokens){
  const a=engine.analyze(t.id);
  const k=t.language+':'+a.morphology.state;
  if(wanted.delete(k))cases.push({k,token:t,reference:a.reference,analysis:a});
  if(!wanted.size)break;
 }
 assert.equal(cases.length,8);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 await context.route('**/*',route=>route.request().url().startsWith(url+'/')?route.continue():route.abort());
 const page=await context.newPage();
 const errors=[];page.on('pageerror',()=>errors.push('pageerror'));
 stage='publico-http';
 const response=await page.goto(url+pagePath);
 assert.equal(response?.status(),200);
 await page.waitForLoadState('networkidle');
 stage='publico-controles';
 // fieldset is not a focusable control; test its native disabled property and its descendants separately.
 assert.equal(await page.locator('#ta-fields').evaluate(el=>el.disabled),true);
 for(const id of ['ta-edition','ta-book','ta-chapter','ta-verse','ta-occurrence']){
  stage='publico-control-'+id;
  assert.equal(await page.locator('#'+id).isDisabled(),true);
 }
 stage='publico-boton';
 assert.equal(await page.getByRole('button',{name:'Consultar referencia'}).isDisabled(),true);
 stage='publico-estado';
 assert.match(await page.locator('#ta-status').innerText(),/No hay ediciones disponibles/);
 assert.equal(await page.locator('#ta-result').isVisible(),false);
 assert.equal(await page.locator('#ta-edition option').count(),1);
 assert.equal(errors.length,0);
 checks.publicEmpty=true;
 stage='publico-sin-js-http';
 const nojs=await browser.newContext({javaScriptEnabled:false});
 await nojs.route('**/*',route=>route.request().url().startsWith(url+'/')?route.continue():route.abort());
 const np=await nojs.newPage();const nr=await np.goto(url+pagePath);assert.equal(nr?.status(),200);
 stage='publico-sin-js-controles';
 assert.equal(await np.locator('#ta-fields').evaluate(el=>el.disabled),true);
 assert.equal(await np.locator('#ta-edition').isDisabled(),true);
 assert.equal(await np.locator('#ta-occurrence').isDisabled(),true);
 stage='publico-sin-js-aviso';
 // Read the specific noscript node, not the rendered text of the last unrelated noscript.
 assert.match(await np.locator('section[aria-labelledby="ta-reference-title"] noscript').textContent(),/consulta interactiva requiere JavaScript/);
 checks.noJavaScript=true;await nojs.close();
 stage='interfaz-aislada';
 await page.goto(url+'/__isolated/analyzer');
 await page.evaluate(async payload=>{
  const {createTermAnalyzer}=await import('/__isolated/modules/term-analyzer.js');
  const {mountAnalyzer}=await import('/__isolated/modules/term-analyzer-ui.js');
  mountAnalyzer(document,createTermAnalyzer(payload.registry,payload.admissions,payload.supplements));
 },data);
 stage='interfaz-aislada-controles';
 assert.equal(await page.locator('#ta-fields').evaluate(el=>el.disabled),false);
 assert.equal(await page.locator('#ta-edition').isEnabled(),true);
 const labels={documentado:'Documentado',parcial:'Parcial',sin_interpretar:'Código sin interpretar',ausente:'No disponible'};
 const open=async c=>{
  await page.locator('#ta-edition').selectOption(c.reference.editionId);
  await page.locator('#ta-book').selectOption(c.reference.bookId);
  await page.locator('#ta-chapter').fill(c.reference.chapter);
  await page.locator('#ta-verse').fill(c.reference.verse);
  await page.getByRole('button',{name:'Consultar referencia'}).click();
  assert.equal(await page.locator('#ta-occurrence').isEnabled(),true);
  const b=page.locator('#ta-words button').filter({has:page.locator('bdi')});
  assert.ok(await b.count()>0);
  const target=page.locator('#ta-words button[data-token-id="'+c.token.id+'"]');
  assert.equal(await target.count(),1);
  return target;
 };
 for(const c of cases){
  stage='caso-'+c.k;
  const caseStage=stage;
  stage=caseStage+'-referencia';
  const button=await open(c);
  stage=caseStage+'-teclado';
  await button.focus();await page.keyboard.press('Enter');
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#ta-occurrence').inputValue(),c.token.id);
  assert.equal(await page.locator('#ta-result').isVisible(),true);
  stage=caseStage+'-forma';
  const bdi=page.locator('#ta-result bdi').first();
  assert.equal(await bdi.textContent(),c.token.form);
  assert.equal(await bdi.getAttribute('dir'),c.token.direction);
  assert.equal(await bdi.getAttribute('lang'),c.token.language);
  stage=caseStage+'-analisis';
  assert.ok((await page.locator('#ta-result').innerText()).includes(labels[c.analysis.morphology.state]));
  assert.ok((await page.locator('#ta-result').innerText()).includes(c.token.origin.fileId));
  assert.match(await page.locator('#ta-result').innerText(),/Significados no disponibles/);
  if(c.analysis.morphology.analyses.length)assert.ok((await page.locator('#ta-result').innerText()).includes(c.analysis.morphology.analyses[0].code));
  stage=caseStage+'-sincronizacion';
  await page.locator('#ta-occurrence').selectOption(c.token.id);
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  stage=caseStage+'-reinicio';
  await page.locator('#ta-verse').fill('99999');
  assert.equal(await page.locator('#ta-result').isVisible(),false);
  assert.equal(await page.locator('#ta-occurrence').isDisabled(),true);
  await page.getByRole('button',{name:'Consultar referencia'}).click();
  assert.match(await page.locator('#ta-status').innerText(),/Referencia no disponible/);
  checks.realCases++;
 }
 checks.keyboard=true;checks.staleSelection=true;
 stage='apariencias';
 const sample=cases.find(c=>c.k==='hbo:documentado');
 await (await open(sample)).click();
 await page.addScriptTag({path:axePath});
 for(const theme of ['light','dark','contrast-light','contrast-dark']){
  for(const scale of ['100','115','130']){
   for(const width of [320,1280]){
    stage='apariencia-'+theme+'-'+scale+'-'+width;
    await page.setViewportSize({width,height:900});
    await page.evaluate(({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;},{theme,scale});
    assert.equal(await page.evaluate(()=>{const x=document.querySelector('.sn-analyzer');return x.scrollWidth<=x.clientWidth+1;}),true);
    const focus=page.locator('#ta-occurrence');await focus.focus();
    assert.equal(await focus.evaluate(el=>document.activeElement===el),true);
    checks.appearanceLayouts++;
   }
  }
  await page.setViewportSize({width:320,height:900});
  stage='axe-'+theme;
  const violations=await page.evaluate(async()=>{const r=await window.axe.run('.sn-analyzer',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(x=>x.id);});
  if(violations.length)throw new Error('AXE:'+violations.join(','));
  checks.axeScans++;
 }
 assert.equal(errors.length,0);
 console.log(JSON.stringify({mode:'P8.3.5-isolated-browser',...checks,corpusPersisted:0,corpusPublished:0,manualScreenReader:'pending',manualDeviceReview:'pending'},null,2));
}
try{await main();}catch(e){const diagnostic=typeof e?.message==='string'&&/^AXE:[a-z0-9,-]+$/.test(e.message)?' '+e.message:'';throw new Error('P8.3.5 fallo en '+stage+diagnostic+'; datos del corpus omitidos');}finally{if(browser)await browser.close();server.close();}
