import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const {chromium}=createRequire(resolve(process.env.P11425_DEPS,'package.json'))('playwright');
const staged=process.argv.slice(2).join(' ')==='--staged-artifact';
if(process.argv.length>2&&!staged)throw Error('Unknown validation mode');
const child=spawn(process.execPath,[staged?'scripts/stage-reader-artifact-p11425.mjs':'scripts/prepare-reader-candidate-p11425.mjs'],{stdio:['ignore','pipe','inherit']});
const lines=createInterface({input:child.stdout});let browser,stage='startup';
try{
 const summary=await Promise.race([once(lines,'line').then(([s])=>JSON.parse(s)),once(child,'exit').then(()=>{throw Error('candidate exited');})]);
 assert.deepEqual([summary.editions,summary.books,summary.chapters,summary.units,summary.publicationAuthorized,summary.corpusPersisted],[2,93,1449,39041,false,false]);
 if(staged){assert.equal(summary.stagedArtifact,true);assert.equal(summary.temporaryFiles,true);assert.equal(summary.upload,false);assert.equal(summary.baselineIntact,true);assert.equal(summary.addedFiles,1456);assert.equal(summary.replacedFiles,1);assert.equal(summary.unchangedFiles,summary.baselineFiles-1);}
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
 stage='layout containment';
 assert.equal(await p.locator('main#contenido > .site-main-inner').count(),1);
 assert.equal(await p.locator('main#contenido > *').count(),1);
 assert.equal(await p.locator('.sn-bible-reader #candidate-rights').count(),1);
 assert.equal(await p.locator('.sn-bible-reader #candidate-privacy').count(),1);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.ok(await p.locator('#br-consult').evaluate(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth+1;}));
 stage='reading';
 for(const [ed,book,ch,verse,lang,status] of [['TXT-RV1909','LIB-GEN','1','1','es','Referencia disponible.'],['TXT-SBLGNT-V1-2','LIB-3JN','1','1','grc','Referencia disponible.'],['TXT-RV1909','LIB-NUM','12','16','es','La fuente contiene este marcador sin texto.']]){
  const label=ed+'/'+book+'/'+ch+'/'+verse;
  for(const [id,value] of [['edition',ed],['book',book],['chapter',ch],['verse',verse]]){
   stage='selection '+label+' '+id;
   const field=p.locator('#br-'+id);await field.selectOption(value,{timeout:10000});assert.equal(await field.inputValue(),value);
  }
  stage='submit '+label;assert.equal(await p.locator('#br-consult').isEnabled(),true);
  await p.locator('#br-consult').click({timeout:10000});
  stage='result '+label;
  // Fail immediately on a recognized verification error, rather than waiting for a success that cannot arrive.
  const terminal=await p.waitForFunction(()=>{const s=document.querySelector('#br-status')?.textContent;return s==='Referencia disponible.'?'available':s==='La fuente contiene este marcador sin texto.'?'empty_marker':s==='No se pudo verificar el fragmento. Intenta nuevamente.'?'verification_error':false;},null,{timeout:15000});
  const outcome=await terminal.jsonValue();await terminal.dispose();
  console.log(JSON.stringify({check:'candidate reference',id:label,outcome,chapterRequests:loads}));
  assert.equal(outcome,status==='Referencia disponible.'?'available':'empty_marker');
  stage='language '+label;assert.equal(await p.locator('#br-passage').getAttribute('lang'),lang);
  assert.equal(await p.locator('#br-detail').isVisible(),true);
  if(outcome==='empty_marker')assert.equal(await p.locator('#br-passage').textContent(),'Marcador sin texto en la fuente.');
 }
 assert.equal(loads,3);
 stage='appearance';
 await p.locator('[data-appearance-panel] summary').click();
 await p.locator('[data-appearance-theme]').selectOption('contrast-dark');await p.locator('[data-appearance-font-scale]').selectOption('130');
 assert.equal(await p.locator('html').getAttribute('data-theme'),'contrast-dark');assert.equal(await p.locator('html').getAttribute('data-font-scale'),'130');
 await p.locator('[data-appearance-panel] summary').click();
 stage='privacy';
 const storage=await p.evaluate(async()=>({local:Object.keys(localStorage).sort(),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).length,cache:(await caches.keys()).length}));
 assert.deepEqual(storage.local,['scriptura-nexus:appearance:v1']);assert.deepEqual(storage.session,[]);assert.equal(storage.db,0);assert.equal(storage.cache,0);assert.deepEqual(await c.cookies(),[]);
 assert.deepEqual([external,errors,unexpected],[0,0,0]);
 stage='boundary';assert.equal((await c.request.get(origin+'/Scriptura-Nexus/biblia/lector/reader-data/unknown.json.gz')).status(),404);
 await c.close();console.log(JSON.stringify({phase:staged?'P11.4.2.5.verificacion_artefacto':'P11.4.2.5.candidato_controlado',staticCandidate:'success',...(staged?{stagedArtifact:'success',baselineFiles:summary.baselineFiles,unchangedFiles:summary.unchangedFiles,addedFiles:summary.addedFiles,replacedFiles:summary.replacedFiles,temporaryFiles:true,upload:false}:{}),editions:2,chaptersVerified:1449,chapterRequests:loads,externalRequests:0,queryStorage:false,privacyBrowserChecks:'success',realMobileValidated:false,publicationAuthorized:false,corpusPersisted:false}));
}catch(e){console.error('Candidate validation failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+')');process.exitCode=1;}
finally{if(browser)await browser.close();lines.close();const exited=child.exitCode!==null||child.signalCode!==null?Promise.resolve():once(child,'exit');child.kill();await exited;}
