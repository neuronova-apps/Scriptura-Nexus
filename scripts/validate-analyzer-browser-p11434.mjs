// P11.4.3.4 private candidate browser test; no corpus files or uploaded artifacts.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {buildAnalyzerFragments} from './lib/build-analyzer-fragments-p11434.mjs';
import {validateAnalyzerPlan} from './validate-analyzer-plan-p11434.mjs';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
const prefix='/Scriptura-Nexus/',root=prefix+'linguistica/analizador/',assets=root+'candidate-data/';
const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attribution=[{"label":"OSHB / WLC","text":"Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb. WLC: dominio público según proveedor; anotaciones: CC BY 4.0.","license":"CC BY 4.0 (anotaciones); WLC dominio público declarado","url":"https://github.com/openscriptures/morphhb/tree/6a5db284c715c18b239422e57bb89684e6a19f00","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","change":"Proyección de ocurrencias primarias y códigos; se excluyen notas y variantes; se preservan las formas Unicode."},{"label":"SBLGNT v1.2","text":"Copyright 2010 Society of Biblical Literature and Logos Bible Software; SBLGNT v1.2. https://github.com/Faithlife/SBLGNT","license":"CC BY 4.0","url":"https://github.com/Faithlife/SBLGNT/tree/736fdc76158950c3d04b949b7e013ca14305145a","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","change":"Selección de elementos de palabra oficiales por referencia y posición; no incluye aparato crítico."},{"label":"MorphGNT v6.12","text":"Tauber, J. K., ed. (2017). MorphGNT: SBLGNT Edition, v6.12. https://github.com/morphgnt/sblgnt; DOI 10.5281/zenodo.376200","license":"CC BY-SA 3.0","url":"https://github.com/morphgnt/sblgnt/tree/aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","change":"Se proyectan lemas y códigos morfológicos en una capa separada de anotaciones, bajo la misma licencia; se excluyen las columnas textuales y las divergencias no se vinculan."}];
let server,browser,release=null,stage='plan';
try{
 const plan=validateAnalyzerPlan();
 const deps=createRequire(resolve(process.env.P11434_DEPS,'package.json')), {chromium}=deps('playwright'),axe=deps.resolve('axe-core/axe.min.js');
 stage='verified sources';const data=await loadExpandedAnalyzerData();stage='fragments';const candidate=buildAnalyzerFragments(data);stage='full engine';const engine=createTermAnalyzer(data.registry,data.admissions,data.supplements);
 const overlay=new Map(),put=(path,body,type)=>{assert.ok(!overlay.has(path));overlay.set(path,{body:Buffer.isBuffer(body)?body:Buffer.from(body),type});};
 for(const [path,b] of candidate.assets)put(assets+path,b,'application/octet-stream');
 const aliases={'./linguistic-contracts.ts':'./linguistic-contracts.js','../lib/term-analyzer-view':'./term-analyzer-view.js','../../src/lib/term-analyzer.ts':'./term-analyzer.js'};
 for(const [name,path] of [['term-analyzer.js','src/lib/term-analyzer.ts'],['linguistic-contracts.js','src/lib/linguistic-contracts.ts'],['term-analyzer-view.js','src/lib/term-analyzer-view.ts'],['term-analyzer-ui.js','src/scripts/term-analyzer-ui.ts'],['appearance.js','src/lib/appearance.ts'],['analyzer-fragments.js','scripts/lib/analyzer-fragments-p11434.mjs']]){
  let js=path.endsWith('.ts')?ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText:readFileSync(path,'utf8');
  for(const [from,to] of Object.entries(aliases))js=js.replaceAll("'"+from+"'","'"+to+"'").replaceAll('"'+from+'"','"'+to+'"');
  put(assets+name,js,'text/javascript; charset=utf-8');
 }
 put(assets+'static-gzip.js',readFileSync('scripts/lib/reader-static-gzip.mjs'),'text/javascript; charset=utf-8');
 put(assets+'init.js',[
 "import {initializeAppearance} from './appearance.js';",
 "import {mountAnalyzer} from './term-analyzer-ui.js';",
 "import {createFragmentAnalyzer,decodeAnalyzerAsset} from './analyzer-fragments.js';",
 "import {loadStaticGzip} from './static-gzip.js';",
 "initializeAppearance(document);",
 "const spec="+JSON.stringify(candidate.catalogSpec)+";",
 "const load=async d=>decodeAnalyzerAsset(d.path,JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await loadStaticGzip(new URL(d.path,import.meta.url),d,location.origin))));",
 "try{const c=await load(spec);const a=createFragmentAnalyzer(c,load);mountAnalyzer(document,a.initial,a.prepare);}catch{document.querySelector('#ta-status').textContent='No se pudo verificar el catálogo.';}"
 ].join('\n'),'text/javascript; charset=utf-8');
 const original=readFileSync('dist/linguistica/analizador/index.html','utf8'),notice='La interfaz está preparada. No hay ediciones lingüísticas publicadas para consulta. La validación interna de datos no equivale a autorización de publicación.',closing=/<\/div>\s*<\/div>\s*<\/main>/;
 assert.ok(original.includes(notice)&&closing.test(original));
 const extra='<section class="sn-card sn-card--default" id="ta-candidate-rights"><h2>Fuentes, licencias y cambios</h2>'+attribution.map(x=>'<h3>'+esc(x.label)+'</h3><p>'+esc(x.text)+'</p><p>'+esc(x.license)+'</p><p>'+esc(x.change)+'</p><p><a rel="noreferrer" href="'+esc(x.url)+'">Fuente fijada de '+esc(x.label)+'</a> · <a rel="noreferrer" href="'+esc(x.licenseUrl)+'">Licencia de '+esc(x.label)+'</a></p>').join('')+'</section><section class="sn-card sn-card--default" id="ta-candidate-privacy"><h2>Privacidad</h2><p>Sin cuenta, historial de consulta ni analítica de referencias. Las peticiones de capítulos son del mismo origen. Solo se guardan las preferencias visuales. El alojamiento público puede registrar solicitudes y direcciones IP; esta prueba local no evalúa al proveedor.</p><p><a rel="noreferrer" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">Privacidad del alojamiento</a></p></section>';
 const html=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</head>','<meta name="referrer" content="no-referrer"></head>').replace(notice,'Candidato privado de consulta de siete libros. No constituye publicación.').replace('La selección se habilitará únicamente cuando existan ediciones publicadas.','La selección se habilita tras verificar el catálogo privado.').replace(closing,m=>extra+m).replace('</body>','<script type="module" src="'+assets+'init.js"></script></body>');
 put(root,html,'text/html; charset=utf-8');
 const base=resolve('dist');
 const send=(res,status,body,type)=>{const b=Buffer.isBuffer(body)?body:Buffer.from(body);res.writeHead(status,{'Content-Type':type,'Content-Length':b.length,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});res.end(b);};
 server=createServer((req,res)=>{try{
  if(req.method!=='GET'||req.headers.host!=='127.0.0.1:'+server.address().port||['cross-site','same-site'].includes(req.headers['sec-fetch-site'])||(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host))return send(res,403,'Acceso local únicamente','text/plain');
  const u=new URL(req.url,'http://'+req.headers.host),path=u.pathname;if(u.search)return send(res,404,'Ruta no disponible','text/plain');
  if(overlay.has(path)){const x=overlay.get(path);return send(res,200,x.body,x.type);}
  if(path.startsWith(prefix)&&!path.startsWith(assets)){const file=resolve(base,decodeURIComponent(path.slice(prefix.length))),rel=relative(base,file);if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&mime[extname(file)]&&statSync(file,{throwIfNoEntry:false})?.isFile())return send(res,200,readFileSync(file),mime[extname(file)]);}
  return send(res,404,'Ruta no disponible','text/plain');
 }catch{if(!res.headersSent)send(res,500,'Recurso no disponible','text/plain');else res.destroy();}});
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',acceptDownloads:false});
 let external=0,unexpected=0,errors=0,chapterLoads=0,corrupt=false,delay=false;
 await c.route('**/*',async route=>{
  const u=new URL(route.request().url());if(u.origin!==origin){external++;return route.abort();}
  if(u.search||route.request().method()!=='GET'){unexpected++;return route.abort();}
  if(u.pathname.startsWith(assets+'chapters/')){
   chapterLoads++;
   if(corrupt&&u.pathname.endsWith('/annotations.json.gz')){corrupt=false;return route.fulfill({status:200,body:Buffer.from('corrupt'),contentType:'application/octet-stream'});}
   if(delay&&u.pathname.endsWith('/text.json.gz')){delay=false;await new Promise(ok=>{release=ok;});}
  }
  return route.continue();
 });
 const p=await c.newPage();p.on('pageerror',()=>errors++);
 stage='initial catalog';const start=performance.now();assert.equal((await p.goto(origin+root))?.status(),200);
 await p.waitForFunction(()=>!document.querySelector('#ta-fields')?.disabled);const mountMs=Math.round(performance.now()-start);
 assert.equal(chapterLoads,0);assert.equal(await p.locator('#ta-candidate-rights h3').count(),3);
 assert.equal(await p.locator('#ta-candidate-rights a[href="https://creativecommons.org/licenses/by-sa/3.0/"]').count(),1);
 assert.equal(await p.locator('.sn-analyzer #ta-candidate-privacy').count(),1);
 const coverage=engine.coverage(),ref=(b,ch,v)=>({editionId:coverage.find(e=>e.bookIds.includes('LIB-'+b)).editionId,bookId:'LIB-'+b,chapter:ch,verse:v});
 const select=async q=>{await p.locator('#ta-edition').selectOption(q.editionId);await p.locator('#ta-book').selectOption(q.bookId);await p.locator('#ta-chapter').fill(q.chapter);await p.locator('#ta-verse').fill(q.verse);};
 const submit=async()=>p.getByRole('button',{name:'Consultar referencia'}).click();
 const open=async q=>{await select(q);await submit();const expected=engine.select(q);assert.equal(expected.status,'disponible');await p.waitForFunction(n=>document.querySelector('#ta-status')?.textContent===n+' ocurrencias disponibles.',expected.occurrences.length);assert.equal(await p.locator('#ta-words button').count(),expected.occurrences.length);return expected;};
 const choose=async t=>{const b=p.locator('#ta-words button[data-token-id="'+t.id+'"]');await b.focus();await p.keyboard.press('Enter');assert.equal(await b.getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#ta-occurrence').inputValue(),t.id);
  const a=engine.analyze(t.id),shown=p.locator('#ta-result bdi').first();assert.equal(await shown.textContent(),t.form);assert.equal(await shown.getAttribute('lang'),t.language);assert.equal(await shown.getAttribute('dir'),t.direction);
  const labels={documentado:'Documentado',parcial:'Parcial',sin_interpretar:'Código sin interpretar',ausente:'No disponible'};
  const text=await p.locator('#ta-result').innerText();assert.ok(text.includes(labels[a.morphology.state])&&text.includes(a.token.origin.fileId)&&text.includes('Significados no disponibles'));
  if(a.lexical.raw!==null)assert.ok(text.includes(a.lexical.raw));
  for(const m of a.morphology.analyses)assert.ok(text.includes(m.code)&&text.includes(m.origin.fileId));
  return a;
 };
 stage='pilot references';let pilots=0;
 for(const x of plan.integrationEvidence.pilotReferences){
  const q=ref(x.book,x.chapter,x.verse),v=await open(q);assert.equal(v.occurrences.length,x.occurrences);
  const missing=v.occurrences.filter(t=>engine.analyze(t.id).morphology.state==='ausente');
  if(v.occurrences[0].language==='grc')assert.equal(missing.length,x.missingGreekAnnotations);
  await choose(v.occurrences[0]);if(missing.length)await choose(missing[0]);pilots++;
 }
 const samples={};for(const t of data.registry.tokens){if(!samples[t.language]){const a=engine.analyze(t.id);if(a.morphology.state==='documentado')samples[t.language]={t,q:a.reference};}if(Object.keys(samples).length===3)break;}
 assert.equal(Object.keys(samples).length,3);
 stage='layouts';await p.addScriptTag({path:axe});let layoutChecks=0,axeScans=0;
 for(const language of ['hbo','arc','grc']){
  const sample=samples[language];await open(sample.q);await choose(sample.t);
  for(const theme of ['light','dark','contrast-light','contrast-dark']){
   for(const scale of ['100','115','130'])for(const width of [320,1280]){
    await p.setViewportSize({width,height:900});await p.evaluate(async({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
    assert.ok(await p.evaluate(()=>{const x=document.querySelector('.sn-analyzer');return x.scrollWidth<=x.clientWidth+1;}));
    await p.locator('#ta-occurrence').focus();assert.ok(await p.locator('#ta-occurrence').evaluate(x=>x===document.activeElement));layoutChecks++;
   }
   await p.setViewportSize({width:320,height:900});await p.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
   const violations=await p.evaluate(async()=>{const a=await window.axe.run('.sn-analyzer',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return a.violations.map(v=>v.id);});
   if(violations.length){console.error(JSON.stringify({language,theme,violations}));throw Error('accessibility');}axeScans++;
  }
 }
 assert.equal(layoutChecks,72);assert.equal(axeScans,12);
 stage='corruption';await p.setViewportSize({width:1280,height:900});const q=ref('Lev','11','42');corrupt=true;await select(q);await submit();
 await p.waitForFunction(()=>document.querySelector('#ta-status')?.textContent==='No se pudo verificar el capítulo. Intenta nuevamente.');assert.equal(await p.locator('#ta-occurrence').isDisabled(),true);assert.equal(await p.locator('#ta-result').isVisible(),false);
 const before=chapterLoads;const t0=performance.now();const found=await open(q);const firstMs=Math.round(performance.now()-t0);assert.equal(chapterLoads-before,2);await choose(found.occurrences[0]);
 const cached=chapterLoads,t1=performance.now();await open(q);const cachedMs=Math.round(performance.now()-t1);assert.equal(chapterLoads,cached);
 stage='stale selection';const stale=ref('Deut','6','4');delay=true;await select(stale);await submit();await p.waitForFunction(()=>document.querySelector('#ta-status')?.textContent==='Verificando capítulo…');
 for(let n=0;!release&&n<200;n++)await new Promise(ok=>setTimeout(ok,10));assert.ok(release);
 await p.locator('#ta-verse').fill('99999');release();release=null;await p.waitForLoadState('networkidle');assert.equal(await p.locator('#ta-occurrence').isDisabled(),true);assert.equal(await p.locator('#ta-result').isVisible(),false);
 await submit();await p.waitForFunction(()=>document.querySelector('#ta-status')?.textContent==='Referencia no disponible en esta edición.');
 stage='privacy';await p.locator('[data-appearance-panel] summary').click();await p.locator('[data-appearance-theme]').selectOption('contrast-dark');await p.locator('[data-appearance-font-scale]').selectOption('130');await p.locator('[data-appearance-panel] summary').click();
 const storage=await p.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).length,cache:(await caches.keys()).length}));
 assert.deepEqual(storage,{local:['scriptura-nexus:appearance:v1'],session:[],db:0,cache:0});assert.deepEqual(await c.cookies(),[]);assert.deepEqual([external,unexpected,errors],[0,0,0]);
 assert.equal((await c.request.get(origin+assets+'unknown.json.gz')).status(),404);
 await c.close();
 console.log(JSON.stringify({phase:plan.phase,...candidate.summary,pilotReferences:pilots,baselineLanguages:3,layoutChecks,axeScans,corruptionRecovery:true,staleSelection:true,externalRequests:0,queryStorage:false,initialChapterRequests:0,mountMs,firstMs,cachedMs,performanceConditions:'local Chromium, descriptive, no field measurement',manualScreenReader:'pending',realMobileValidated:false,publicationAuthorized:false}));
 }catch(e){
 // Assertion messages can contain complete text rows. Only extract allowlisted
 // source-code filenames and numeric line/column coordinates, not the message.
 const frames=typeof e?.stack==='string'?e.stack.split('\n').flatMap(line=>{const m=/(?:\/|^)((?:build-analyzer-fragments-p11434|analyzer-fragments-p11434|validate-analyzer-browser-p11434|linguistic-expansion-p11433|term-analyzer)\.(?:mjs|ts)):(\d+):(\d+)\)?$/.exec(line.trim());return m?[m[1]+':'+m[2]+':'+m[3]]:[];}).slice(0,5):[];
 console.error(JSON.stringify({phase:'P11.4.3.4',failedAt:stage,error:e instanceof Error?e.name:'UnknownError',frames,sourceDataOmitted:true}));process.exitCode=1;
}
finally{if(release)release();if(browser)await browser.close();server?.closeAllConnections();server?.close();}
