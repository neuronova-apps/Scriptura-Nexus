// P11.4.4.4.2: real UI over verified private fragments, in-memory server only.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {execFileSync} from 'node:child_process';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {loadPrivateLexicalModel,buildPrivateLexicalBrowserCandidate} from './lib/build-lexical-browser-candidate-p114442.mjs';
import {createConcordance} from '../src/lib/concordance.ts';
import {createLexicalQuery} from '../src/lib/lexical-query.ts';
import {snapshot} from './lib/reader-artifact-scope.mjs';
const prefix='/Scriptura-Nexus/',pagePath=prefix+'linguistica/lexicos-concordancias/',assetPrefix='/__private-fragments/';
const base=resolve('dist'),html=readFileSync('dist/linguistica/lexicos-concordancias/index.html','utf8'),isolated=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const sourceFiles=new Map([
 ['/__isolated/modules/term-analyzer.js','src/lib/term-analyzer.ts'],
 ['/__isolated/modules/linguistic-contracts.js','src/lib/linguistic-contracts.ts'],
 ['/__isolated/modules/term-analyzer-view.js','src/lib/term-analyzer-view.ts'],
 ['/__isolated/modules/concordance.js','src/lib/concordance.ts'],
 ['/__isolated/modules/lexical-query.js','src/lib/lexical-query.ts'],
 ['/__isolated/modules/lexical-fragment-runtime.js','src/lib/lexical-fragment-runtime.ts'],
 ['/__isolated/modules/analyzer-fragment-runtime.js','src/lib/analyzer-fragment-runtime.ts'],
 ['/__isolated/modules/private-fragment-loader.js','src/lib/private-fragment-loader.ts'],
 ['/__isolated/modules/lexicon-concordance-fragments.js','src/lib/lexicon-concordance-fragments.ts'],
 ['/__isolated/modules/lexicon-concordance-ui.js','src/scripts/lexicon-concordance-ui.ts']
]);
const aliases={
 './linguistic-contracts.ts':'./linguistic-contracts.js',
 './term-analyzer.ts':'./term-analyzer.js',
 './term-analyzer-view.ts':'./term-analyzer-view.js',
 '../lib/term-analyzer-view.ts':'./term-analyzer-view.js',
 './concordance.ts':'./concordance.js',
 './lexical-query.ts':'./lexical-query.js',
 './lexical-fragment-runtime.ts':'./lexical-fragment-runtime.js',
 './analyzer-fragment-runtime.ts':'./analyzer-fragment-runtime.js',
 './private-fragment-loader.ts':'./private-fragment-loader.js'
};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
let candidate,stage='sources',browserInstance;
const fragmentFiles=new Set();let fragmentBytes=0;
const server=createServer((req,res)=>{
 try{
  const path=new URL(req.url,'http://127.0.0.1').pathname;res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(path==='/__isolated/lexicon'){res.setHeader('Content-Type',mime['.html']);return res.end(isolated);}
  if(sourceFiles.has(path)){
   let js=ts.transpileModule(readFileSync(sourceFiles.get(path),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
   for(const [from,to] of Object.entries(aliases))js=js.replaceAll("'"+from+"'","'"+to+"'").replaceAll('"'+from+'"','"'+to+'"');
   res.setHeader('Content-Type',mime['.js']);return res.end(js);
  }
  if(path===assetPrefix+'manifest.json'){
   res.setHeader('Content-Type','application/json; charset=utf-8');return res.end(JSON.stringify(candidate.rootManifest));
  }
  if(path.startsWith(assetPrefix)){
   const rel=decodeURIComponent(path.slice(assetPrefix.length)),bytes=candidate.assets.get(rel);
   if(!bytes){res.statusCode=404;return res.end();}
   if(!fragmentFiles.has(rel)){fragmentFiles.add(rel);fragmentBytes+=bytes.length;}res.setHeader('Content-Type','application/gzip');return res.end(bytes);
  }
  if(!path.startsWith(prefix)){res.statusCode=404;return res.end();}
  const rel=decodeURIComponent(path.slice(prefix.length)),file=resolve(base,rel+(rel.endsWith('/')||!rel?'index.html':''));
  if(!file.startsWith(base+'/')||!statSync(file).isFile()){res.statusCode=404;return res.end();}
  res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');return res.end(readFileSync(file));
 }catch{res.statusCode=404;res.end();}
});
const books={'LIB-Gen':'Génesis','LIB-Lev':'Levítico','LIB-Deut':'Deuteronomio','LIB-Dan':'Daniel','LIB-Acts':'Hechos','LIB-1Cor':'1 Corintios','LIB-3John':'3 Juan'};
const names={index:'Índice léxico de Open Scriptures',strong:'Strong hebreo',bdb:'Brown-Driver-Briggs'};
const checks={publicEmpty:false,noJavaScript:false,fragmentedMount:false,lexicalCases:0,concordanceCases:0,frequencyCases:0,pagination:false,keyboard:false,staleSelection:false,appearanceLayouts:0,axeScans:0};
async function main(){
 const deps=process.env.P114442_DEPS;assert.ok(deps);
 const require=createRequire(resolve(deps,'package.json')),{chromium}=require('playwright'),axePath=require.resolve('axe-core/axe.min.js');
 const before=snapshot('dist');
 stage='build-private-candidate';
 const data=await loadExpandedAnalyzerData(),lexical=loadPrivateLexicalModel();
 const lex=createLexicalQuery(lexical.model,lexical.admissions),con=createConcordance(data.registry,data.admissions,data.supplements);
 assert.equal(data.registry.tokens.length,78218);assert.equal(lexical.model.entries.length,30740);assert.equal(lexical.model.forms.length,10221);assert.equal(lexical.model.definitions.length,35496);
 candidate=await buildPrivateLexicalBrowserCandidate(data,lexical);
 assert.equal(candidate.summary.publicationAuthorized,false);assert.equal(candidate.summary.corpusPersisted,false);assert.equal(candidate.rootManifest.publicationAuthorized,false);
 assert.ok(candidate.summary.maxGzipBytes<=256000&&candidate.summary.maxJsonBytes<=8388608);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 browserInstance=await chromium.launch({headless:true});
 const context=await browserInstance.newContext({viewport:{width:1280,height:900},acceptDownloads:false,serviceWorkers:'block'});
 await context.route('**/*',route=>route.request().url().startsWith(url+'/')?route.continue():route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',()=>errors.push('pageerror'));
 const loc=id=>page.locator('#'+id);
 stage='public-page';
 assert.equal((await page.goto(url+pagePath))?.status(),200);await page.waitForLoadState('networkidle');
 for(const id of ['lc-lex-fields','lc-con-fields'])assert.equal(await loc(id).evaluate(e=>e.disabled),true);
 for(const id of ['lc-lex-mode','lc-lex-lang','lc-lex-system','lc-lex-value','lc-edition','lc-lang','lc-book','lc-mode','lc-system','lc-value','lc-frequency'])assert.equal(await loc(id).isDisabled(),true);
 for(const id of ['lc-lex-results','lc-lex-detail','lc-con-results'])assert.equal(await loc(id).isVisible(),false);
 assert.match(await loc('lc-lex-status').innerText(),/No hay recursos léxicos/);assert.match(await loc('lc-con-status').innerText(),/No hay ediciones/);checks.publicEmpty=true;
 stage='public-no-js';
 const nojs=await browserInstance.newContext({javaScriptEnabled:false,serviceWorkers:'block'});await nojs.route('**/*',route=>route.request().url().startsWith(url+'/')?route.continue():route.abort());
 const np=await nojs.newPage();assert.equal((await np.goto(url+pagePath))?.status(),200);
 for(const id of ['lc-lex-fields','lc-con-fields'])assert.equal(await np.locator('#'+id).evaluate(e=>e.disabled),true);
 assert.match(await np.locator('section[aria-labelledby="lc-con-title"] noscript').textContent(),/consulta interactiva requiere JavaScript/);checks.noJavaScript=true;await nojs.close();
 stage='mount-fragments';
 assert.equal((await page.goto(url+'/__isolated/lexicon'))?.status(),200);
 await page.evaluate(async({manifestUrl,assetBase})=>{
  const {createLexiconConcordanceFragments}=await import('/__isolated/modules/lexicon-concordance-fragments.js');
  const {mountLexiconConcordance}=await import('/__isolated/modules/lexicon-concordance-ui.js');
  const adapter=await createLexiconConcordanceFragments({manifestUrl,assetBase});mountLexiconConcordance(document,adapter.lexicon,adapter.concordance);
  window.__privateClose=adapter.close;
 },{manifestUrl:assetPrefix+'manifest.json',assetBase:assetPrefix});
 assert.equal(await loc('lc-lex-fields').evaluate(e=>e.disabled),false);assert.equal(await loc('lc-con-fields').evaluate(e=>e.disabled),false);
 assert.equal(await page.evaluate(()=>Object.keys(window).some(k=>/privateLex|corpus|lexicalModel/i.test(k))),false);checks.fragmentedMount=true;
 const contains=async(id,value)=>page.waitForFunction(({id,value})=>document.getElementById(id)?.textContent?.includes(value),{id,value},{timeout:30000});
 const openLex=async q=>{
  await loc('lc-lex-mode').selectOption(q.mode);
  if(q.mode==='form')await loc('lc-lex-lang').selectOption(q.language);else await loc('lc-lex-system').selectOption(q.system);
  await loc('lc-lex-value').fill(q.value);await page.getByRole('button',{name:'Buscar entrada',exact:true}).click();
  const r=lex.search({...q,limit:20});assert.equal(r.status,'disponible');await contains('lc-lex-status',r.total+' entradas');
  assert.equal(await loc('lc-lex-results').locator('li').count(),r.entries.length);return r;
 };
 const checkDetail=async d=>{
  await contains('lc-lex-detail',names[d.entry.system]+' · '+d.entry.providerKey);await contains('lc-lex-detail',d.entry.origin.sha256);
  for(const f of d.forms){const b=loc('lc-lex-detail').locator('bdi').filter({hasText:f.form}).first();assert.equal(await b.textContent(),f.form);assert.equal(await b.getAttribute('dir'),f.language==='grc'?'ltr':'rtl');assert.equal(await b.getAttribute('lang'),f.language);}
  assert.equal(await loc('lc-lex-detail').locator('p[lang="en"]').count(),d.definitions.length);
  for(let i=0;i<d.definitions.length;i++)assert.equal(await loc('lc-lex-detail').locator('p[lang="en"]').nth(i).textContent(),d.definitions[i].text);
  if(!d.definitions.length)await contains('lc-lex-detail','No hay definiciones directas');
  if(d.links.some(l=>l.state==='sin_resolver'))await contains('lc-lex-detail','Sin resolver');
  await contains('lc-lex-detail','no establecen sinonimia ni significado contextual');
 };
 for(const language of ['hbo','arc']){
  stage='lex-form-'+language;const f=lexical.model.forms.find(x=>x.language===language),r=await openLex({mode:'form',language,value:f.form});
  await loc('lc-lex-results').getByRole('button').first().focus();await page.keyboard.press('Enter');await checkDetail(lex.detail(r.entries[0].id));assert.equal(await loc('lc-lex-detail').evaluate(e=>document.activeElement===e),true);checks.lexicalCases++;checks.keyboard=true;
 }
 for(const system of ['strong','bdb']){
  stage='lex-id-'+system;const d=lexical.model.entries.find(e=>e.system===system&&lex.detail(e.id).definitions.length);
  await openLex({mode:'identifier',system,value:d.providerKey});await loc('lc-lex-results').getByRole('button').first().click();await checkDetail(lex.detail(d.id));checks.lexicalCases++;
 }
 stage='lex-reference';
 const rel=lexical.model.links.find(x=>x.kind==='index-strong'&&x.state==='documentado'),sourceDetail=lex.detail(rel.sourceEntryId);
 await openLex({mode:'identifier',system:'index',value:sourceDetail.entry.providerKey});await loc('lc-lex-results').getByRole('button').first().click();await checkDetail(sourceDetail);
 const targetIndex=sourceDetail.links.filter(l=>l.targetEntryId&&l.targetEntryId!==sourceDetail.entry.id).findIndex(l=>l.id===rel.id);assert.ok(targetIndex>=0);await loc('lc-lex-detail').getByRole('button',{name:'Consultar entrada relacionada'}).nth(targetIndex).click();await checkDetail(lex.detail(rel.targetEntryId));checks.lexicalCases++;
 stage='lex-unresolved';
 const unresolved=lexical.model.links.find(x=>x.kind==='index-strong'&&x.state==='sin_resolver'),unresolvedDetail=lex.detail(unresolved.sourceEntryId);
 await openLex({mode:'identifier',system:'index',value:unresolvedDetail.entry.providerKey});await loc('lc-lex-results').getByRole('button').first().click();await checkDetail(unresolvedDetail);checks.lexicalCases++;
 stage='lex-absences';
 await loc('lc-lex-mode').selectOption('form');await loc('lc-lex-lang').selectOption('grc');await loc('lc-lex-value').fill('α');await page.getByRole('button',{name:'Buscar entrada',exact:true}).click();await contains('lc-lex-status','No hay formas léxicas disponibles');checks.lexicalCases++;
 await openLex({mode:'identifier',system:'strong',value:'__no_match__'});await contains('lc-lex-status','Sin coincidencias exactas');checks.lexicalCases++;
 const scope=async q=>{await loc('lc-edition').selectOption(q.editionId);await loc('lc-lang').selectOption(q.language);await loc('lc-book').selectOption(q.bookId??'');await loc('lc-mode').selectOption(q.mode);if(q.mode==='provider')await loc('lc-system').selectOption(q.system);};
 const checkHits=async r=>{
  assert.equal(r.status,'disponible');await contains('lc-con-status',r.total+' ocurrencias');const hits=loc('lc-con-results').locator('li');assert.equal(await hits.count(),r.occurrences.length);
  for(let i=0;i<r.occurrences.length;i++){const t=r.occurrences[i],li=hits.nth(i),b=li.locator('bdi');assert.equal(await b.textContent(),t.form);assert.equal(await b.getAttribute('lang'),t.language);assert.equal(await b.getAttribute('dir'),t.direction);const text=await li.textContent();assert.ok(text.includes((books[t.bookId]??t.bookId)+' '+t.chapter+':'+t.verse+' · posición '+(t.position+1))&&text.includes(t.origin.sha256));if(!t.lemmas.length)assert.ok(text.includes('Lema no disponible.'));for(const l of t.lemmas)assert.ok(text.includes(l.lemmaId)&&text.includes(l.annotationOrigin.sha256));}
 };
 const runSearch=async q=>{
  await scope(q);await loc('lc-value').fill(q.mode==='lemma'?q.lemmaId:q.value);await page.getByRole('button',{name:'Buscar ocurrencias',exact:true}).click();
  const r=con.search({...q,limit:20});await checkHits(r);return r;
 };
 for(const language of ['hbo','arc','grc']){
  const edition=con.coverage().find(e=>e.languages.includes(language)),base={editionId:edition.editionId,language},system=language==='grc'?'MorphGNT-lemma':'OSHB-lemma';
  for(const mode of ['form','lemma','provider']){
   stage='con-'+language+'-'+mode;const fq={...base,mode,...(mode==='provider'?{system}:{})},f=con.frequency({...fq,limit:20});assert.ok(f.entries.length);
   const row=f.entries[0],key=row.key,q={...fq,...(mode==='lemma'?{lemmaId:key}:{value:key})};
   const r=await runSearch(q);checks.concordanceCases++;
   if(language==='hbo'&&mode==='form'&&r.nextOffset!==null){await loc('lc-con-next').click();await checkHits(con.search({...q,limit:20,offset:20}));await loc('lc-con-prev').click();await checkHits(r);checks.pagination=true;}
   stage='freq-'+language+'-'+mode;await scope(fq);await loc('lc-frequency').click();await contains('lc-con-status',f.totalKeys+' claves · '+f.totalPostings+' referencias');
   const buttons=loc('lc-con-results').getByRole('button');assert.equal(await buttons.count(),f.entries.length);assert.deepEqual(await buttons.allTextContents(),f.entries.map(x=>'Consultar '+x.key+' ('+x.count+')'));
   if(language==='hbo'&&mode==='form'&&f.nextOffset!==null){await loc('lc-con-next').click();const p=con.frequency({...fq,limit:20,offset:20});assert.deepEqual(await buttons.allTextContents(),p.entries.map(x=>'Consultar '+x.key+' ('+x.count+')'));await loc('lc-con-prev').click();}
   await buttons.first().focus();await page.keyboard.press('Enter');await checkHits(r);checks.frequencyCases++;
   if(mode==='form'){const hit=r.occurrences[0];await runSearch({...q,bookId:hit.bookId});checks.concordanceCases++;}
  }
 }
 stage='con-absences';
 const greek=con.coverage().find(e=>e.languages.includes('grc')),absent=data.registry.tokens.find(t=>t.language==='grc'&&t.analysisIds.length===0)??data.registry.tokens.find(t=>t.language==='grc');
 await runSearch({editionId:greek.editionId,language:'grc',mode:'form',value:absent.form});checks.concordanceCases++;
 await runSearch({editionId:greek.editionId,language:'grc',mode:'form',value:'__no_match__'});checks.concordanceCases++;
 await scope({editionId:greek.editionId,language:'grc',mode:'provider',system:'OSHB-lemma'});await loc('lc-value').fill('1');await page.getByRole('button',{name:'Buscar ocurrencias',exact:true}).click();await contains('lc-con-status','Sistema de proveedor no disponible');checks.concordanceCases++;
 await loc('lc-lang').selectOption('');assert.equal(await loc('lc-con-results').isVisible(),false);checks.staleSelection=true;
 stage='accessibility';
 const def=lexical.model.entries.find(e=>e.system==='bdb'&&lex.detail(e.id).definitions.length);await openLex({mode:'identifier',system:'bdb',value:def.providerKey});await loc('lc-lex-results').getByRole('button').first().click();await checkDetail(lex.detail(def.id));
 const heb=con.coverage().find(e=>e.languages.includes('hbo')),baseQ={editionId:heb.editionId,language:'hbo',mode:'form'},freqQ=con.frequency({...baseQ,limit:1}),top=freqQ.entries[0].key;await runSearch({...baseQ,value:top});
 await page.addScriptTag({path:axePath});
 for(const theme of ['light','dark','contrast-light','contrast-dark']){
  for(const scale of ['100','115','130'])for(const width of [320,1280]){
   stage='layout-'+theme+'-'+scale+'-'+width;await page.setViewportSize({width,height:900});
   await page.evaluate(async({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
   assert.equal(await page.evaluate(()=>{const x=document.querySelector('.sn-lexicons');return x.scrollWidth<=x.clientWidth+1&&[...x.querySelectorAll('section')].every(s=>s.scrollWidth<=s.clientWidth+1);}),true);
   await loc('lc-value').focus();assert.equal(await loc('lc-value').evaluate(e=>document.activeElement===e),true);checks.appearanceLayouts++;
  }
  stage='axe-'+theme;await page.evaluate(async()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const violations=await page.evaluate(async()=>{const r=await window.axe.run('.sn-lexicons',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>v.id);});
  assert.deepEqual(violations,[]);checks.axeScans++;
 }
 assert.equal(errors.length,0);assert.ok(fragmentFiles.size<candidate.assets.size);assert.ok(fragmentBytes<candidate.summary.totalGzipBytes);
 assert.deepEqual(snapshot('dist'),before);
 console.log(JSON.stringify({mode:'P11.4.4.4.2-private-fragment-browser',...checks,lexicalEntries:lexical.model.entries.length,definitions:lexical.model.definitions.length,occurrences:data.registry.tokens.length,fragmentFiles:candidate.summary.fragmentFiles,fragmentFilesFetched:fragmentFiles.size,fragmentBytesFetched:fragmentBytes,totalGzipBytes:candidate.summary.totalGzipBytes,maxGzipBytes:candidate.summary.maxGzipBytes,catalogGzipBytes:candidate.summary.catalogGzipBytes,corpusPersisted:false,corpusPublished:false,distUnchanged:true,manualScreenReader:'pending',manualDeviceReview:'pending'},null,2));
}
try{await main();}catch{throw new Error('P11.4.4.4.2 falló en '+stage+'; datos del corpus omitidos');}finally{if(browserInstance)await browserInstance.close();if(server.listening)server.close();}
