import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {createPrivateManuscriptOverlay,manuscriptPath,manuscriptAssets} from './lib/private-manuscript-overlay-p11463.mjs';
const {chromium}=createRequire(resolve(process.env.P11463_DEPS,'package.json'))('playwright');
const base=resolve('dist'),prefix='/Scriptura-Nexus/',origin='http://127.0.0.1:43163';
const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const snapshot=()=>new Map(readdirSync(base,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()).map(f=>{const p=join(f.parentPath,f.name);return [relative(base,p),createHash('sha256').update(readFileSync(p)).digest('hex')];}));
let browser,stage='overlay';
try{
 const before=snapshot(),{files,original,spec,summary}=createPrivateManuscriptOverlay();
 assert.deepEqual([summary.witnesses,summary.variants,summary.readings,summary.resources,summary.evidence],[2,1,2,7,8]);
 assert.doesNotMatch(original,/private-manuscript\/init\.js|MAN-GA-P66|VAR-P943-JHN-1-18/);
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:320,height:900},serviceWorkers:'block',acceptDownloads:false});
 const p=await c.newPage();let external=0,unexpected=0,errors=0,loads=0,checks=0;
 p.on('pageerror',()=>errors++);
 await c.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.origin!==origin){external++;return route.abort();}
  if(u.search||req.method()!=='GET'){unexpected++;return route.abort();}
  const f=files.get(u.pathname);
  if(f){
   if(u.pathname===manuscriptAssets+'references.json'){loads++;const h=await req.allHeaders();assert.ok(!h.cookie&&!h.referer);}
   return route.fulfill({status:200,contentType:f.type,body:f.body,headers});
  }
  if(u.pathname.startsWith(prefix)&&!u.pathname.startsWith(manuscriptAssets)){
   const local=resolve(base,decodeURIComponent(u.pathname.slice(prefix.length))),rel=relative(base,local),type=mime[extname(local)];
   if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&type&&statSync(local,{throwIfNoEntry:false})?.isFile())return route.fulfill({status:200,contentType:type,body:readFileSync(local),headers});
  }
  return route.fulfill({status:404,contentType:'text/plain',body:'Ruta no disponible',headers});
 });
 stage='startup';assert.equal((await p.goto(origin+manuscriptPath))?.status(),200);
 await p.waitForFunction(()=>!document.querySelector('#mv-fields')?.disabled);
 const search=p.locator('#mv-search'),witness=p.locator('#mv-witness'),variant=p.locator('#mv-variant'),detail=p.locator('#mv-witness-detail'),vd=p.locator('#mv-variant-detail'),directory=p.locator('#private-evidence-list');
 assert.match(await p.locator('#mv-status').textContent(),/2 testigos/);assert.equal(loads,1);checks++;
 stage='P66';await search.fill('bodmer');assert.match(await p.locator('#mv-status').textContent(),/1 testigo disponible/);
 await witness.selectOption('MAN-GA-P66');assert.match(await detail.textContent(),/P\. Bodmer II/);assert.match(await detail.textContent(),/Referencia bibliográfica/);
 assert.equal(await detail.getByRole('link',{name:'CSNTM: GA P66, P. Bodmer II',exact:true}).getAttribute('href'),'https://manuscripts.csntm.org/manuscript/View/GA_P66_Bodmer');checks++;
 stage='GA 02';await search.fill('British Library');await witness.selectOption('MAN-GA-02');assert.match(await detail.textContent(),/Royal MS 1 D VIII/);assert.match(await detail.textContent(),/Siglo V/);checks++;
 stage='empty search';await search.fill('sin coincidencia');assert.equal(await witness.isDisabled(),true);assert.doesNotMatch(await detail.textContent(),/Royal MS 1 D VIII/);checks++;
 stage='variant';await variant.selectOption('VAR-P943-JHN-1-18');assert.equal(await vd.locator('.mv-panel').count(),2);
 for(const t of ['John 1:18','No evaluada','SBLGNT v1.2','Atestación secundaria','No verificada','no es una transcripción','folio y línea no comprobados'])assert.ok((await vd.textContent()).includes(t),'Missing documentary distinction');
 assert.doesNotMatch(await vd.textContent(),/Examen directo documentado|undefined/);checks++;
 stage='evidence directory';assert.equal(await directory.locator(':scope > ul > li').count(),8);
 for(const t of ['Identificación de edición textual','Identificación de catálogo','Referencia bibliográfica','Referencia a aparato editorial','Atestación secundaria'])assert.ok((await directory.textContent()).includes(t));
 assert.doesNotMatch(await directory.textContent(),/undefined|Examen directo documentado/);
 assert.equal(await directory.locator('a').count(),16);
 assert.ok(await directory.locator('a').evaluateAll(links=>links.every(a=>a.protocol==='https:'&&a.referrerPolicy==='no-referrer')));checks++;
 stage='reset and privacy';await variant.selectOption('');assert.equal(await vd.locator('.mv-panel').count(),0);await search.fill('');assert.match(await p.locator('#mv-status').textContent(),/2 testigos/);
 assert.equal(await p.evaluate(()=>localStorage.length+sessionStorage.length),0);assert.deepEqual(await c.cookies(),[]);assert.deepEqual([external,unexpected,errors],[0,0,0]);assert.equal(loads,1);checks++;
 stage='narrow layout';await witness.selectOption('MAN-GA-P66');await variant.selectOption('VAR-P943-JHN-1-18');
 assert.equal(await p.evaluate(()=>{const root=document.querySelector('.sn-manuscript-view');return document.documentElement.scrollWidth<=innerWidth+1&&root.scrollWidth<=root.clientWidth+1;}),true);checks++;
 await c.close();
 stage='public boundary';const nojs=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});
 await nojs.route(origin+manuscriptPath,r=>r.fulfill({status:200,contentType:'text/html',body:original,headers}));await nojs.route('**/*',r=>r.request().url()===origin+manuscriptPath?r.fallback():r.abort());
 const np=await nojs.newPage();await np.goto(origin+manuscriptPath);
 for(const id of ['mv-search','mv-witness','mv-variant'])assert.equal(await np.locator('#'+id).isDisabled(),true);
 assert.equal(await np.locator('#private-evidence-list').count(),0);await nojs.close();
 assert.deepEqual(snapshot(),before);
 console.log(JSON.stringify({phase:'P11.4.6.3',candidate:'success',...summary,browserScenarios:checks,projectionRequests:loads,projectionBytes:spec.bytes,externalRequests:external,pageErrors:errors,distUnchanged:true,publicAdapterConnected:false,manualReview:false}));
}catch(e){const line=e instanceof Error?e.stack?.match(/validate-private-manuscript-browser-p11463\.mjs:\d+:\d+/)?.[0]:undefined;console.error('Private manuscript validation failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+') '+(line??''));process.exitCode=1;}
finally{if(browser)await browser.close();}
