import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const {chromium}=createRequire(resolve(process.env.P11425_DEPS,'package.json'))('playwright');
const child=spawn(process.execPath,['scripts/prepare-reader-candidate-p11425.mjs'],{stdio:['ignore','pipe','ignore']});
const lines=createInterface({input:child.stdout});let browser,stage='startup';
try{
 const summary=await Promise.race([once(lines,'line').then(([s])=>JSON.parse(s)),once(child,'exit').then(()=>{throw Error('candidate exited');})]);
 assert.deepEqual([summary.editions,summary.books,summary.chapters,summary.units,summary.publicationAuthorized,summary.corpusPersisted],[2,93,1449,39041,false,false]);
 const origin=new URL(summary.url).origin;assert.match(summary.url,/^http:\/\/127\.0\.0\.1:\d+\/Scriptura-Nexus\/biblia\/lector\/$/);
 browser=await chromium.launch({headless:true});
 const c=await browser.newContext({viewport:{width:360,height:900},serviceWorkers:'block',acceptDownloads:false});
 const p=await c.newPage();let external=0,loads=0,errors=0,unexpected=0;
 await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin){external++;return r.abort();}if(u.search||r.request().method()!=='GET'){unexpected++;return r.abort();}if(u.pathname.includes('/reader-data/chapters/'))loads++;return r.continue();});
 p.on('pageerror',()=>errors++);
 stage='page and lazy loading';assert.equal((await p.goto(summary.url))?.status(),200);
 await p.waitForFunction(()=>!document.querySelector('#br-fields')?.disabled);
 assert.equal(loads,0);assert.equal(await p.locator('#candidate-rights h3').count(),2);assert.equal(await p.locator('#candidate-rights a[href="https://creativecommons.org/licenses/by/4.0/"]').count(),1);
 assert.ok(await p.locator('#candidate-privacy').isVisible());
 stage='reading';
 for(const [ed,book,ch,verse,lang,status] of [['TXT-RV1909','LIB-GEN','1','1','es','Referencia disponible.'],['TXT-SBLGNT-V1-2','LIB-3JN','1','1','grc','Referencia disponible.'],['TXT-RV1909','LIB-NUM','12','16','es','La fuente contiene este marcador sin texto.']]){
  for(const [id,value] of [['edition',ed],['book',book],['chapter',ch],['verse',verse]])await p.locator('#br-'+id).selectOption(value);
  await p.locator('#br-consult').click();await p.waitForFunction(s=>document.querySelector('#br-status')?.textContent===s,status);
  assert.equal(await p.locator('#br-passage').getAttribute('lang'),lang);
 }
 assert.equal(loads,3);
 stage='privacy';
 const storage=await p.evaluate(async()=>({local:Object.keys(localStorage).sort(),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).length,cache:(await caches.keys()).length}));
 assert.ok(storage.local.every(x=>x==='scriptura-nexus:appearance:v1'));assert.deepEqual(storage.session,[]);assert.equal(storage.db,0);assert.equal(storage.cache,0);assert.deepEqual(await c.cookies(),[]);
 assert.deepEqual([external,errors,unexpected],[0,0,0]);
 stage='boundary';assert.equal((await c.request.get(origin+'/Scriptura-Nexus/biblia/lector/reader-data/unknown.json.gz')).status(),404);
 await c.close();console.log(JSON.stringify({phase:'P11.4.2.5.candidato_controlado',staticCandidate:'success',editions:2,chaptersVerified:1449,chapterRequests:loads,externalRequests:0,queryStorage:false,privacyBrowserChecks:'success',realMobileValidated:false,publicationAuthorized:false,corpusPersisted:false}));
}catch{console.error('Candidate validation failed at '+stage);process.exitCode=1;}
finally{if(browser)await browser.close();lines.close();child.kill();}
