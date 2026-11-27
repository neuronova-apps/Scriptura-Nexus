import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {get} from 'node:http';
const dep=createRequire(resolve(process.env.P11425_DEPS,'package.json'));
const {chromium}=dep('playwright');
const child=spawn(process.execPath,['scripts/preview-reader-p11425.mjs'],{stdio:['ignore','pipe','ignore']});
const lines=createInterface({input:child.stdout});
let browser,stage='startup';
try{
 const url=await Promise.race([once(lines,'line').then(([s])=>s),once(child,'exit').then(()=>{throw Error('preview exited');})]);
 assert.match(url,/^http:\/\/127\.0\.0\.1:\d+\/reader\/$/);
 const origin=new URL(url).origin;
 const status=(path,headers={})=>new Promise((resolve,reject)=>{get(origin+path,{headers},r=>{r.resume();r.on('end',()=>resolve(r.statusCode));}).on('error',reject);});
 stage='boundary';assert.equal(await status('/catalog',{Origin:'https://example.com'}),403);assert.equal(await status('/catalog',{'Sec-Fetch-Site':'cross-site'}),403);assert.equal(await status('/chapter/unknown'),404);assert.equal(await status('/'),404);
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:360,height:900},serviceWorkers:'block',acceptDownloads:false});
 const p=await c.newPage();let errors=0,external=0,loads=0;
 await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin){external++;return r.abort();}if(u.pathname.startsWith('/chapter/'))loads++;return r.continue();});
 p.on('pageerror',()=>errors++);
 stage='preview';assert.equal((await p.goto(url))?.status(),200);
 await p.waitForFunction(()=>!document.querySelector('#br-fields')?.disabled);
 assert.equal(loads,0);assert.equal(await p.locator('#preview-rights h3').count(),2);
 assert.equal(await p.locator('#preview-rights a[href="https://creativecommons.org/licenses/by/4.0/"]').count(),1);
 assert.ok(await p.getByText('Vista de revisión exclusivamente local.',{exact:false}).isVisible());
 stage='appearance';await p.locator('[data-appearance-panel] summary').click();
 await p.locator('[data-appearance-theme]').selectOption('contrast-dark');await p.locator('[data-appearance-font-scale]').selectOption('130');
 assert.equal(await p.locator('html').getAttribute('data-theme'),'contrast-dark');assert.equal(await p.locator('html').getAttribute('data-font-scale'),'130');
 await p.locator('[data-appearance-panel] summary').click();
 stage='reading';
 for(const [ed,book,ch,verse,lang] of [['TXT-RV1909','LIB-GEN','1','1','es'],['TXT-SBLGNT-V1-2','LIB-3JN','1','1','grc']]){
  for(const [id,value] of [['edition',ed],['book',book],['chapter',ch],['verse',verse]])await p.locator('#br-'+id).selectOption(value);
  await p.locator('#br-consult').click();await p.waitForFunction(()=>document.querySelector('#br-status')?.textContent==='Referencia disponible.');
  assert.equal(await p.locator('#br-passage').getAttribute('lang'),lang);
 }
 assert.equal(loads,2);assert.equal(errors,0);assert.equal(external,0);
 await c.close();console.log(JSON.stringify({phase:'P11.4.2.5.preparacion',previewSmoke:'success',editions:2,chapterRequests:loads,publicationAuthorized:false,manualValidation:'pending'}));
}catch{console.error('P11.4.2.5 preview failed at '+stage);process.exitCode=1;}
finally{if(browser)await browser.close();lines.close();child.kill();}
