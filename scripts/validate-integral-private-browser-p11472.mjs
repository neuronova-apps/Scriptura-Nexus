import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import {createRequire} from 'node:module';
import {snapshot} from './lib/reader-artifact-scope.mjs';
import {createIntegralPrivateOverlay,prefix,routes,privatePrefixes,lexicalAssets,analyzerAssets} from './lib/integral-private-overlay-p11472.mjs';
const {chromium}=createRequire(resolve(process.env.P11472_DEPS,'package.json'))('playwright');
const base=resolve('dist'),origin='http://127.0.0.1:43172';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const fields={reader:['br-fields'],analyzer:['ta-fields'],lexical:['lc-lex-fields','lc-con-fields'],comparator:['bc-fields'],manuscripts:['mv-fields']};
let browser,stage='overlay';
try{
 const before=snapshot('dist'),{files,query,summary}=await createIntegralPrivateOverlay();
 browser=await chromium.launch({headless:true});
 const counts={modules:0,queries:0,linkTransitions:0,appearanceChecks:0,publicBlocked:0,externalRequests:0,unexpectedRequests:0,pageErrors:0,readerChapterRequests:0,analyzerLayerRequests:0,lexicalFragmentRequests:0,manuscriptRequests:0};
 let activePath='',privateMode=true;
 const serve=async route=>{
  const req=route.request(),u=new URL(req.url()),path=u.pathname;
  if(u.origin!==origin){counts.externalRequests++;return route.abort();}
  if(u.search||req.method()!=='GET'){counts.unexpectedRequests++;return route.abort();}
  if(req.isNavigationRequest())activePath=path;
  const f=privateMode?files.get(path):undefined;
  if(f){
   const group=privatePrefixes.find(p=>path.startsWith(p));
   if(group){
    const owner=Object.entries(routes).find(([,p])=>p===activePath)?.[0];
    const allowed=owner==='comparator'?(group.includes('/reader-data/')||group.includes('/private-comparator/')):owner==='reader'?group.includes('/reader-data/'):owner==='analyzer'?group===analyzerAssets:owner==='lexical'?group===lexicalAssets:owner==='manuscripts'?group.includes('/private-manuscript/'):false;
    assert.ok(allowed,'Private fragment requested outside owning module');
    if(path.includes('/reader-data/chapters/'))counts.readerChapterRequests++;
    if(path.startsWith(analyzerAssets+'chapters/'))counts.analyzerLayerRequests++;
    if(path.startsWith(lexicalAssets)&&path.endsWith('.json.gz'))counts.lexicalFragmentRequests++;
    if(path.endsWith('/private-manuscript/references.json'))counts.manuscriptRequests++;
    const h=await req.allHeaders();assert.ok(!h.cookie&&!h.referer);
   }
   return route.fulfill({status:200,contentType:f.type,body:f.body,headers});
  }
  if(path.startsWith(prefix)&&!privatePrefixes.some(p=>path.startsWith(p))){
   const relPath=decodeURIComponent(path.slice(prefix.length))+(path.endsWith('/')?'index.html':''),file=resolve(base,relPath),rel=relative(base,file),type=mime[extname(file)];
   if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&type&&statSync(file,{throwIfNoEntry:false})?.isFile())return route.fulfill({status:200,contentType:type,body:readFileSync(file),headers});
  }
  return route.fulfill({status:404,contentType:'text/plain',body:'Ruta no disponible',headers});
 };
 const c=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',acceptDownloads:false,reducedMotion:'reduce'});
 await c.route('**/*',serve);
 const p=await c.newPage();p.on('pageerror',()=>counts.pageErrors++);
 const loc=id=>p.locator('#'+id);
 const ready=async name=>{for(const id of fields[name])await p.waitForFunction(id=>document.getElementById(id)?.disabled===false,id,{timeout:30000});};
 const go=async path=>{assert.equal((await p.goto(origin+path))?.status(),200);};
 const via=async path=>{const link=p.locator('main a[href="'+path+'"]').first();await link.focus();await Promise.all([p.waitForURL(origin+path),p.keyboard.press('Enter')]);counts.linkTransitions++;};
 const status=async(id,value)=>p.waitForFunction(({id,value})=>document.getElementById(id)?.textContent?.includes(value),{id,value},{timeout:30000});
 const appearance=async()=>{assert.equal(await p.locator('html').getAttribute('data-theme'),'contrast-dark');assert.equal(await p.locator('html').getAttribute('data-font-scale'),'130');counts.appearanceChecks++;};
 stage='reader';await go(routes.reader);await ready('reader');assert.equal(counts.readerChapterRequests,0);
 await p.locator('[data-appearance-panel] summary').click();await p.locator('[data-appearance-theme]').selectOption('contrast-dark');await p.locator('[data-appearance-font-scale]').selectOption('130');await p.locator('[data-appearance-panel] summary').click();await appearance();
 for(const [id,value] of [['edition','TXT-RV1909'],['book','LIB-JHN'],['chapter','1'],['verse','1']])await loc('br-'+id).selectOption(value);
 await loc('br-consult').click();await status('br-status','Referencia disponible.');assert.equal(await loc('br-passage').getAttribute('lang'),'es');counts.modules++;counts.queries++;
 stage='comparator';await via(routes.comparator);await ready('comparator');await appearance();
 for(const [side,edition,verse] of [['origin','TXT-RV1909','1'],['target','TXT-SBLGNT-V1-2','2']]){
  for(const [key,value] of [['edition',edition],['book','LIB-JHN'],['chapter','1'],['verse',verse]])await loc('bc-'+side+'-'+key).selectOption(value);
 }
 await loc('bc-consult').click();await status('bc-status','Sin correspondencia verificada.');assert.match(await loc('bc-evidence').textContent(),/Sin grupo de correspondencia verificado/);assert.equal(await p.locator('#bc-target-result .bc-reading').getAttribute('lang'),'grc');counts.modules++;counts.queries++;
 stage='manuscripts';await via(routes.manuscripts);await ready('manuscripts');await appearance();
 await loc('mv-witness').selectOption('MAN-GA-P66');assert.match(await loc('mv-witness-detail').textContent(),/P\. Bodmer II/);
 await loc('mv-variant').selectOption('VAR-P943-JHN-1-18');assert.equal(await p.locator('#mv-variant-detail .mv-panel').count(),2);assert.match(await loc('mv-variant-detail').textContent(),/Atestación secundaria/);assert.equal(await p.locator('#private-evidence-list > ul > li').count(),8);counts.modules++;counts.queries+=2;
 stage='return reader';await via(routes.reader);await ready('reader');await appearance();assert.equal(await loc('br-detail').isVisible(),false);
 stage='analyzer';await go(prefix+'linguistica/');await via(routes.analyzer);await ready('analyzer');await appearance();
 await loc('ta-edition').selectOption(query.analyzerEdition);await loc('ta-book').selectOption('LIB-Lev');await loc('ta-chapter').fill('19');await loc('ta-verse').fill('28');
 await p.getByRole('button',{name:'Consultar referencia'}).click();await status('ta-status','12 ocurrencias disponibles.');assert.equal(await p.locator('#ta-words button').count(),12);await p.locator('#ta-words button').first().click();assert.ok(await loc('ta-result').isVisible());counts.modules++;counts.queries++;
 stage='lexical';await via(prefix+'linguistica/');await via(routes.lexical);await ready('lexical');await appearance();
 await loc('lc-lex-mode').selectOption('identifier');await loc('lc-lex-system').selectOption('strong');await loc('lc-lex-value').fill(query.entry);
 await p.getByRole('button',{name:'Buscar entrada',exact:true}).click();await status('lc-lex-status',' entradas.');await loc('lc-lex-results').getByRole('button').first().click();await status('lc-lex-status','Detalle de entrada disponible.');assert.ok(await loc('lc-lex-detail').isVisible());counts.queries++;
 await loc('lc-edition').selectOption(query.concordanceEdition);await loc('lc-lang').selectOption('hbo');await loc('lc-mode').selectOption('form');
 await loc('lc-frequency').click();await status('lc-con-status',' claves · ');await loc('lc-con-results').getByRole('button').first().click();await status('lc-con-status',' ocurrencias.');assert.ok(await loc('lc-con-results').locator('li').count()>0);counts.modules++;counts.queries++;
 stage='shared context privacy';
 const storage=await p.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).length,cache:(await caches.keys()).length}));
 assert.deepEqual(storage,{local:['scriptura-nexus:appearance:v1'],session:[],db:0,cache:0});assert.deepEqual(await c.cookies(),[]);
 assert.equal(counts.modules,5);assert.equal(counts.queries,7);assert.equal(counts.linkTransitions,6);assert.equal(counts.appearanceChecks,6);
 assert.ok(counts.readerChapterRequests>=3&&counts.analyzerLayerRequests>=2&&counts.lexicalFragmentRequests>0&&counts.lexicalFragmentRequests<11442&&counts.manuscriptRequests===1);
 await c.close();
 stage='public boundary';privateMode=false;
 const pub=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block',acceptDownloads:false});await pub.route('**/*',serve);const np=await pub.newPage();
 for(const [name,path] of Object.entries(routes)){
  assert.equal((await np.goto(origin+path))?.status(),200);
  for(const id of fields[name])assert.equal(await np.locator('#'+id).evaluate(e=>e instanceof HTMLFieldSetElement&&e.disabled),true);
  counts.publicBlocked++;
 }
 await pub.close();assert.deepEqual([counts.externalRequests,counts.unexpectedRequests,counts.pageErrors],[0,0,0]);assert.deepEqual(snapshot('dist'),before);
 console.log(JSON.stringify({phase:'P11.4.7.2',candidate:'success',...summary,...counts,distUnchanged:true,manualReview:false,publicModulesEnabled:0,combinedPrivateBrowserReview:true}));
}catch(e){const line=e instanceof Error?e.stack?.match(/validate-integral-private-browser-p11472\.mjs:\d+:\d+/)?.[0]:undefined;console.error('Integral private browser failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+') '+(line??''));process.exitCode=1;}
finally{if(browser)await browser.close();}
