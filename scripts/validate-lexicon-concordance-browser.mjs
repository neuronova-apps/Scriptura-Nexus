// P8.4.7: isolated Chromium test; no corpus files, snapshots, traces or public endpoint.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {loadVerifiedAnalyzerData} from './lib/term-analyzer-validation-data.mjs';
import {execFileSync} from 'node:child_process';
import {createConcordance} from '../src/lib/concordance.ts';
import {createLexicalQuery} from '../src/lib/lexical-query.ts';
const prefix='/Scriptura-Nexus/';
const base=resolve('dist');
const pagePath=prefix+'linguistica/lexicos-concordancias/';
const sourceFiles=new Map([
 ['/__isolated/modules/term-analyzer.js','src/lib/term-analyzer.ts'],
 ['/__isolated/modules/linguistic-contracts.js','src/lib/linguistic-contracts.ts'],
 ['/__isolated/modules/term-analyzer-view.js','src/lib/term-analyzer-view.ts'],
 ['/__isolated/modules/concordance.js','src/lib/concordance.ts'],
 ['/__isolated/modules/lexical-query.js','src/lib/lexical-query.ts'],
 ['/__isolated/modules/lexicon-concordance-ui.js','src/scripts/lexicon-concordance-ui.ts']
]);
const moduleAliases={
 './linguistic-contracts.ts':'./linguistic-contracts.js',
 './term-analyzer.ts':'./term-analyzer.js',
 '../lib/term-analyzer-view':'./term-analyzer-view.js',
 '../lib/term-analyzer-view.ts':'./term-analyzer-view.js',
 '../lib/linguistic-contracts':'./linguistic-contracts.js'
};
const html=readFileSync('dist/linguistica/lexicos-concordancias/index.html','utf8');
const isolated=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer((req,res)=>{
 try{
  const path=new URL(req.url,'http://127.0.0.1').pathname;
  res.setHeader('Cache-Control','no-store');
  if(path==='/__isolated/lexicon'){res.setHeader('Content-Type',mime['.html']);return res.end(isolated);}
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
const checks={publicEmpty:false,noJavaScript:false,lexicalCases:0,concordanceCases:0,frequencyCases:0,pagination:false,keyboard:false,staleSelection:false,appearanceLayouts:0,axeScans:0};
const books={'LIB-Gen':'Génesis','LIB-Dan':'Daniel','LIB-3John':'3 Juan'};
const names={index:'Índice léxico de Open Scriptures',strong:'Strong hebreo',bdb:'Brown-Driver-Briggs'};
const python=`
import importlib.util,json
s=importlib.util.spec_from_file_location('model','scripts/project-lexical-model-p84.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
roots,ds,_=m.load_verified()
model=m.project(roots,ds,True);m.validate_model(model,ds,True)
assert m.digest(model)=='26c8e8897f24c1991180cbbf0c0796afa130a6f6a088b1039cf69f137fe73f62'
admissions=[{k:d[k] for k in ('id','commit','sha256','allowedComponents','selectors')} for d in ds]
print(json.dumps({'model':model,'admissions':admissions},ensure_ascii=False,separators=(',',':')))
`;
async function main(){
 const deps=process.env.P847_DEPS;assert.ok(deps);
 const require=createRequire(resolve(deps,'package.json'));
 const {chromium}=require('playwright'),axePath=require.resolve('axe-core/axe.min.js');
 stage='sources';
 // Private stdout pipe only: never print subprocess stdout, stderr, exceptions, or corpus.
 const lexical=JSON.parse(execFileSync('python3',['-c',python],{encoding:'utf8',timeout:240000,maxBuffer:128*1024*1024,stdio:['ignore','pipe','pipe']}));
 const data=await loadVerifiedAnalyzerData(),lex=createLexicalQuery(lexical.model,lexical.admissions),con=createConcordance(data.registry,data.admissions,data.supplements);
 assert.equal(lexical.model.entries.length,30740);assert.equal(lexical.model.definitions.length,35496);assert.equal(data.registry.tokens.length,26750);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:false,serviceWorkers:'block'});
 await context.route('**/*',route=>route.request().url().startsWith(url+'/')?route.continue():route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',()=>errors.push('pageerror'));
 const loc=id=>page.locator('#'+id);
 stage='publico';
 assert.equal((await page.goto(url+pagePath))?.status(),200);await page.waitForLoadState('networkidle');
 for(const id of ['lc-lex-fields','lc-con-fields'])assert.equal(await loc(id).evaluate(e=>e.disabled),true);
 for(const id of ['lc-lex-mode','lc-lex-lang','lc-lex-system','lc-lex-value','lc-edition','lc-lang','lc-book','lc-mode','lc-system','lc-value','lc-frequency'])assert.equal(await loc(id).isDisabled(),true);
 for(const id of ['lc-lex-results','lc-lex-detail','lc-con-results'])assert.equal(await loc(id).isVisible(),false);
 assert.match(await loc('lc-lex-status').innerText(),/No hay recursos léxicos/);assert.match(await loc('lc-con-status').innerText(),/No hay ediciones/);
 assert.equal(errors.length,0);checks.publicEmpty=true;
 stage='publico-sin-js';
 const nojs=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});
 await nojs.route('**/*',route=>route.request().url().startsWith(url+'/')?route.continue():route.abort());
 const np=await nojs.newPage();assert.equal((await np.goto(url+pagePath))?.status(),200);
 for(const id of ['lc-lex-fields','lc-con-fields'])assert.equal(await np.locator('#'+id).evaluate(e=>e.disabled),true);
 assert.match(await np.locator('section[aria-labelledby="lc-con-title"] noscript').textContent(),/consulta interactiva requiere JavaScript/);
 checks.noJavaScript=true;await nojs.close();
 stage='mount';
 assert.equal((await page.goto(url+'/__isolated/lexicon'))?.status(),200);
 // Send validated records in bounded in-memory chunks, not over a corpus endpoint.
 await page.evaluate(admissions=>{window.__privateLex={model:{schemaVersion:1,scope:'internal-only',entries:[],forms:[],definitions:[],links:[]},admissions};},lexical.admissions);
 for(const key of ['entries','forms','definitions','links']){
  const records=lexical.model[key];for(let i=0;i<records.length;i+=2000)await page.evaluate(({key,rows})=>{window.__privateLex.model[key].push(...rows);},{key,rows:records.slice(i,i+2000)});
 }
 await page.evaluate(async payload=>{
  const {createConcordance}=await import('/__isolated/modules/concordance.js');
  const {createLexicalQuery}=await import('/__isolated/modules/lexical-query.js');
  const {mountLexiconConcordance}=await import('/__isolated/modules/lexicon-concordance-ui.js');
  const l=window.__privateLex;delete window.__privateLex;
  mountLexiconConcordance(document,createLexicalQuery(l.model,l.admissions),createConcordance(payload.registry,payload.admissions,payload.supplements));
 },data);
 assert.equal(await loc('lc-lex-fields').evaluate(e=>e.disabled),false);assert.equal(await loc('lc-con-fields').evaluate(e=>e.disabled),false);
 assert.equal(await page.evaluate(()=>Object.hasOwn(window,'__privateLex')),false);
 const contains=async (id,s)=>assert.ok((await loc(id).textContent()).includes(s));
 const openLex=async q=>{
  await loc('lc-lex-mode').selectOption(q.mode);
  if(q.mode==='form')await loc('lc-lex-lang').selectOption(q.language);else await loc('lc-lex-system').selectOption(q.system);
  await loc('lc-lex-value').fill(q.value);await page.getByRole('button',{name:'Buscar entrada',exact:true}).click();
  const r=lex.search({...q,limit:20});assert.equal(r.status,'disponible');
  await contains('lc-lex-status',r.total+' entradas');
  assert.equal(await loc('lc-lex-results').locator('li').count(),r.entries.length);
  return r;
 };
 const checkDetail=async d=>{
  await contains('lc-lex-detail',names[d.entry.system]+' · '+d.entry.providerKey);
  await contains('lc-lex-detail',d.entry.origin.sha256);
  for(const f of d.forms){const b=loc('lc-lex-detail').locator('bdi').filter({hasText:f.form}).first();assert.equal(await b.textContent(),f.form);assert.equal(await b.getAttribute('dir'),f.language==='grc'?'ltr':'rtl');assert.equal(await b.getAttribute('lang'),f.language);}
  assert.equal(await loc('lc-lex-detail').locator('p[lang="en"]').count(),d.definitions.length);
  for(let i=0;i<d.definitions.length;i++)assert.equal(await loc('lc-lex-detail').locator('p[lang="en"]').nth(i).textContent(),d.definitions[i].text);
  if(!d.definitions.length)await contains('lc-lex-detail','No hay definiciones directas');
  if(d.links.some(l=>l.state==='sin_resolver'))await contains('lc-lex-detail','Sin resolver');
  await contains('lc-lex-detail','no establecen sinonimia ni significado contextual');
 };
 for(const language of ['hbo','arc']){
  stage='lex-form-'+language;
  const f=lexical.model.forms.find(f=>f.language===language);
  const r=await openLex({mode:'form',language,value:f.form});
  const b=loc('lc-lex-results').getByRole('button').first();await b.focus();await page.keyboard.press('Enter');
  await checkDetail(lex.detail(r.entries[0].id));assert.equal(await loc('lc-lex-detail').evaluate(e=>document.activeElement===e),true);checks.lexicalCases++;
 }
 for(const system of ['strong','bdb']){
  stage='lex-id-'+system;
  const d=lexical.model.entries.find(e=>e.system===system&&lex.detail(e.id).definitions.length);
  await openLex({mode:'identifier',system,value:d.providerKey});
  await loc('lc-lex-results').getByRole('button').first().click();await checkDetail(lex.detail(d.id));checks.lexicalCases++;
 }
 stage='lex-reference';
 const rel=lexical.model.links.find(l=>l.kind==='index-strong'&&l.state==='documentado');
 const d=lex.detail(rel.sourceEntryId);await openLex({mode:'identifier',system:'index',value:d.entry.providerKey});
 await loc('lc-lex-results').getByRole('button').first().click();await checkDetail(d);
 const targets=d.links.filter(l=>l.targetEntryId&&l.targetEntryId!==d.entry.id);
 await loc('lc-lex-detail').getByRole('button',{name:'Consultar entrada relacionada'}).nth(targets.findIndex(l=>l.id===rel.id)).click();
 await checkDetail(lex.detail(rel.targetEntryId));checks.lexicalCases++;
 stage='lex-unresolved';
 const unresolved=lexical.model.links.find(l=>l.kind==='index-strong'&&l.state==='sin_resolver');
 const ud=lex.detail(unresolved.sourceEntryId);await openLex({mode:'identifier',system:'index',value:ud.entry.providerKey});
 await loc('lc-lex-results').getByRole('button').first().click();await checkDetail(ud);checks.lexicalCases++;
 stage='lex-absences';
 await loc('lc-lex-value').fill('');assert.equal(await loc('lc-lex-detail').isVisible(),false);
 await loc('lc-lex-mode').selectOption('form');await loc('lc-lex-lang').selectOption('grc');await loc('lc-lex-value').fill('α');await page.getByRole('button',{name:'Buscar entrada',exact:true}).click();await contains('lc-lex-status','No hay formas léxicas disponibles');checks.lexicalCases++;
 await openLex({mode:'identifier',system:'strong',value:'__no_match__'});await contains('lc-lex-status','Sin coincidencias exactas');checks.lexicalCases++;
 const scope=async q=>{
  await loc('lc-edition').selectOption(q.editionId);await loc('lc-lang').selectOption(q.language);await loc('lc-book').selectOption(q.bookId??'');await loc('lc-mode').selectOption(q.mode);
  if(q.mode==='provider')await loc('lc-system').selectOption(q.system);
 };
 const checkHits=async r=>{
  assert.equal(r.status,'disponible');await contains('lc-con-status',r.total+' ocurrencias');
  const hits=loc('lc-con-results').locator('li');assert.equal(await hits.count(),r.occurrences.length);
  for(let i=0;i<r.occurrences.length;i++){const t=r.occurrences[i],li=hits.nth(i),b=li.locator('bdi');assert.equal(await b.textContent(),t.form);assert.equal(await b.getAttribute('lang'),t.language);assert.equal(await b.getAttribute('dir'),t.direction);const text=await li.textContent();assert.ok(text.includes((books[t.bookId]??t.bookId)+' '+t.chapter+':'+t.verse+' · posición '+(t.position+1))&&text.includes(t.origin.sha256));if(!t.lemmas.length)assert.ok(text.includes('Lema no disponible.'));for(const l of t.lemmas)assert.ok(text.includes(l.lemmaId)&&text.includes(l.annotationOrigin.sha256));}
 };
 const runSearch=async q=>{await scope(q);await loc('lc-value').fill(q.mode==='lemma'?q.lemmaId:q.value);await page.getByRole('button',{name:'Buscar ocurrencias',exact:true}).click();const r=con.search({...q,limit:20});await checkHits(r);return r;};
 for(const language of ['hbo','arc','grc']){
  const edition=con.coverage().find(e=>e.languages.includes(language)),base={editionId:edition.editionId,language};
  const system=language==='grc'?'MorphGNT-lemma':'OSHB-lemma';
  for(const mode of ['form','lemma','provider']){
   stage='con-'+language+'-'+mode;
   const fq={...base,mode,...(mode==='provider'?{system}:{})};
   const f=con.frequency({...fq,limit:20});assert.ok(f.entries.length);
   const k=f.entries[0].key,q={...fq,...(mode==='lemma'?{lemmaId:k}:{value:k})};
   const r=await runSearch(q);checks.concordanceCases++;
   if(language==='hbo'&&mode==='form'){
    assert.ok(r.nextOffset!==null);await loc('lc-con-next').click();await checkHits(con.search({...q,limit:20,offset:20}));await loc('lc-con-prev').click();await checkHits(r);checks.pagination=true;
   }
   stage='frequency-'+language+'-'+mode;
   await scope(fq);await loc('lc-frequency').click();
   await contains('lc-con-status',f.totalKeys+' claves · '+f.totalPostings+' referencias');
   const buttons=loc('lc-con-results').getByRole('button');assert.equal(await buttons.count(),f.entries.length);
   assert.deepEqual(await buttons.allTextContents(),f.entries.map(x=>'Consultar '+x.key+' ('+x.count+')'));
   if(language==='hbo'&&mode==='form'){assert.ok(f.nextOffset!==null);await loc('lc-con-next').click();const p=con.frequency({...fq,limit:20,offset:20});assert.deepEqual(await buttons.allTextContents(),p.entries.map(x=>'Consultar '+x.key+' ('+x.count+')'));await loc('lc-con-prev').click();}
   await buttons.first().focus();await page.keyboard.press('Enter');await checkHits(r);checks.frequencyCases++;
   if(mode==='form'){const t=r.occurrences[0];await runSearch({...q,bookId:t.bookId});checks.concordanceCases++;}
  }
 }
 stage='con-absences';
 const greek=con.coverage().find(e=>e.languages.includes('grc'));
 const absent=data.registry.tokens.find(t=>t.language==='grc'&&t.analysisIds.length===0);
 await runSearch({editionId:greek.editionId,language:'grc',mode:'form',value:absent.form});checks.concordanceCases++;
 await runSearch({editionId:greek.editionId,language:'grc',mode:'form',value:'__no_match__'});checks.concordanceCases++;
 await scope({editionId:greek.editionId,language:'grc',mode:'provider',system:'OSHB-lemma'});await loc('lc-value').fill('1');await page.getByRole('button',{name:'Buscar ocurrencias',exact:true}).click();await contains('lc-con-status','Sistema de proveedor no disponible');checks.concordanceCases++;
 await loc('lc-lang').selectOption('');assert.equal(await loc('lc-con-results').isVisible(),false);checks.staleSelection=true;checks.keyboard=true;
 stage='appearance-preparation';
 const def=lexical.model.entries.find(e=>e.system==='bdb'&&lex.detail(e.id).definitions.length);
 await openLex({mode:'identifier',system:'bdb',value:def.providerKey});await loc('lc-lex-results').getByRole('button').first().click();
 const heb=con.coverage().find(e=>e.languages.includes('hbo'));const q={editionId:heb.editionId,language:'hbo',mode:'form'};const key=con.frequency({...q,limit:1}).entries[0].key;await runSearch({...q,value:key});
 await page.addScriptTag({path:axePath});
 for(const theme of ['light','dark','contrast-light','contrast-dark']){
  for(const scale of ['100','115','130'])for(const width of [320,1280]){
   stage='layout-'+theme+'-'+scale+'-'+width;
   await page.setViewportSize({width,height:900});
   await page.evaluate(async ({theme,scale})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.fontScale=scale;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},{theme,scale});
   assert.equal(await page.evaluate(()=>{const x=document.querySelector('.sn-lexicons');return x.scrollWidth<=x.clientWidth+1&&[...x.querySelectorAll('section')].every(s=>s.scrollWidth<=s.clientWidth+1);}),true);
   await loc('lc-value').focus();assert.equal(await loc('lc-value').evaluate(e=>document.activeElement===e),true);checks.appearanceLayouts++;
  }
  stage='axe-'+theme;
  await page.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  const violations=await page.evaluate(async()=>{
   const r=await window.axe.run('.sn-lexicons',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
   return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>{let e;try{if(typeof n.target[0]==='string')e=document.querySelector(n.target[0]);}catch{}const d=n.any.find(x=>x.id==='color-contrast')?.data;return {tag:e?.tagName.toLowerCase()??null,id:/^lc-[a-z-]+$/.test(e?.id??'')?e.id:null,ratio:Number.isFinite(d?.contrastRatio)?d.contrastRatio:null};})}));
  });
  if(violations.length){console.error(JSON.stringify({stage,violations}));throw new Error('AXE:'+violations.map(v=>v.id).join(','));}
  checks.axeScans++;
 }
 assert.equal(errors.length,0);
 console.log(JSON.stringify({mode:'P8.4.7-isolated-browser',...checks,lexicalEntries:lexical.model.entries.length,definitions:lexical.model.definitions.length,occurrences:data.registry.tokens.length,corpusPersisted:0,corpusPublished:0,manualScreenReader:'pending',manualDeviceReview:'pending'},null,2));
}
try{await main();}catch(e){const diagnostic=typeof e?.message==='string'&&/^AXE:[a-z0-9,-]+$/.test(e.message)?' '+e.message:'';throw new Error('P8.4.7 fallo en '+stage+diagnostic+'; datos del corpus omitidos');}finally{if(browser)await browser.close();server.close();}
