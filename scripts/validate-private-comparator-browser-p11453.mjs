import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {createPrivateComparatorOverlay,comparatorPath,privateAssets,readerAssets} from './lib/private-comparator-overlay-p11453.mjs';
const {chromium}=createRequire(resolve(process.env.P11453_DEPS,'package.json'))('playwright');
const base=resolve('dist'),prefix='/Scriptura-Nexus/',origin='http://127.0.0.1:43153';
const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const snapshot=()=>new Map(readdirSync(base,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()).map(f=>{
 const p=join(f.parentPath,f.name);return [relative(base,p),createHash('sha256').update(readFileSync(p)).digest('hex')];
}));
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
let browser,stage='overlay';
try{
 const before=snapshot(),{files,summary,original}=await createPrivateComparatorOverlay();
 assert.equal(summary.chapters,1449);
 assert.doesNotMatch(original,/private-comparator\/init\.js|Candidato privado de comparación/);
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',acceptDownloads:false});
 const page=await c.newPage();let external=0,unexpected=0,errors=0,loads=0;
 page.on('pageerror',()=>errors++);
 await c.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.origin!==origin){external++;return route.abort();}
  if(u.search||req.method()!=='GET'){unexpected++;return route.abort();}
  const file=files.get(u.pathname);
  if(file){
   if(u.pathname.startsWith(readerAssets+'chapters/'))loads++;
   return route.fulfill({status:200,contentType:file.type,body:file.body,headers});
  }
  if(u.pathname.startsWith(prefix)&&!u.pathname.startsWith(privateAssets)&&!u.pathname.startsWith(readerAssets)){
   const p=resolve(base,decodeURIComponent(u.pathname.slice(prefix.length))),rel=relative(base,p),type=mime[extname(p)];
   if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&type&&statSync(p,{throwIfNoEntry:false})?.isFile())return route.fulfill({status:200,contentType:type,body:readFileSync(p),headers});
  }
  return route.fulfill({status:404,contentType:'text/plain',body:'Ruta no disponible',headers});
 });
 stage='startup';assert.equal((await page.goto(origin+comparatorPath))?.status(),200);
 await page.waitForFunction(()=>!document.querySelector('#bc-fields')?.disabled);
 assert.equal(loads,0);assert.equal(await page.locator('#candidate-rights h3').count(),2);
 assert.equal(await page.locator('#candidate-rights a[href="https://creativecommons.org/licenses/by/4.0/"]').count(),1);
 assert.equal(await page.locator('.sn-bible-comparator #candidate-privacy').count(),1);
 const A='TXT-RV1909',B='TXT-SBLGNT-V1-2';
 const ctrl=(s,k)=>page.locator('#bc-'+s+'-'+k);
 async function select(s,e,b,ch,v){
  await ctrl(s,'edition').selectOption(e);
  if(b){await ctrl(s,'book').selectOption(b);await ctrl(s,'chapter').selectOption(ch);await ctrl(s,'verse').selectOption(v);}
  else if(await ctrl(s,'book').isEnabled())await ctrl(s,'book').selectOption('');
 }
 async function submit(expected){
  await page.locator('#bc-consult').click();
  await page.waitForFunction(t=>document.querySelector('#bc-status')?.textContent===t,expected,{timeout:15000});
  assert.equal(await page.locator('#bc-result-title').evaluate(e=>document.activeElement===e),true);
  assert.match(await page.locator('#bc-evidence').textContent(),/Sin grupo de correspondencia verificado/);
 }
 const independent='Sin correspondencia verificada. Las lecturas son independientes.';
 stage='metadata-only probe';
 await select('origin',A,'LIB-JHN','1','1');await select('target',B);
 await submit(independent);
 assert.equal(loads,1);assert.equal(await page.locator('#bc-target-result .bc-reading').count(),0);
 assert.match(await page.locator('#bc-diagnostic').textContent(),/Etiqueta presente/);
 assert.equal(await page.locator('#bc-origin-result .bc-reading').getAttribute('lang'),'es');
 stage='explicit target';
 await select('target',B,'LIB-JHN','1','2');await submit(independent);
 assert.equal(loads,2);assert.equal(await page.locator('#bc-target-result .bc-reading').getAttribute('lang'),'grc');
 assert.match(await page.locator('#bc-target-result h4').textContent(),/1:2$/);
 assert.match(await page.locator('#bc-target-result').textContent(),/CC BY 4\.0/);
 stage='reverse';
 await select('origin',B,'LIB-JHN','1','2');await select('target',A,'LIB-JHN','1','1');
 await submit(independent);assert.equal(await page.locator('#bc-origin-result .bc-reading').getAttribute('lang'),'grc');
 assert.equal(await page.locator('#bc-target-result .bc-reading').getAttribute('lang'),'es');
 stage='coverage';
 await select('origin',A,'LIB-GEN','1','1');await select('target',B);
 await submit(independent);assert.match(await page.locator('#bc-diagnostic').textContent(),/no está incluido/);
 assert.equal(await page.locator('#bc-target-result .bc-reading').count(),0);
 stage='empty marker';
 await select('origin',A,'LIB-NUM','12','16');
 await submit('La fuente de origen contiene un marcador vacío.');
 assert.match(await page.locator('#bc-origin-result .bc-reading').textContent(),/marcador sin texto/);
 stage='same edition and result clearing';
 await select('target',A);assert.equal(await page.locator('#bc-consult').isDisabled(),true);
 assert.equal(await page.locator('#bc-origin-result .bc-reading').count(),0);
 stage='privacy';
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 assert.deepEqual(await c.cookies(),[]);assert.deepEqual([external,unexpected,errors],[0,0,0]);
 await c.close();
 assert.deepEqual(snapshot(),before);
 console.log(JSON.stringify({phase:'P11.4.5.3',candidate:'success',editions:2,chaptersVerified:1449,units:39041,browserScenarios:6,chapterRequests:loads,externalRequests:0,verifiedGroups:0,distUnchanged:true,publicationAuthorized:false,corpusPersisted:false,upload:false}));
}catch(e){console.error('Private comparator validation failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+')');process.exitCode=1;}
finally{if(browser)await browser.close();}
