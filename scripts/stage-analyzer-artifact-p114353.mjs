// Build and verify a full private static artifact in an OS temporary directory.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {cpSync,mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync,realpathSync} from 'node:fs';
import {join,resolve,relative,isAbsolute,dirname,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {createStaticCandidate,root,prefix,assets} from './prepare-analyzer-candidate-p11435.mjs';
import {snapshot,overlayRelative,overlayDigests,compareAnalyzerScope,verifyStagedAnalyzer,analyzerHtml} from './lib/analyzer-artifact-scope-p114353.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.gz':'application/octet-stream','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
let temp,server,browser,stage='baseline',result,failed=false;
function cleanup(){server?.closeAllConnections();server?.close();if(temp&&existsSync(temp))rmSync(temp,{recursive:true,force:true});}
process.once('exit',cleanup);
process.once('SIGINT',()=>{cleanup();process.exit(130);});
process.once('SIGTERM',()=>{cleanup();process.exit(143);});
async function serve(dir,files){
 const base=realpathSync(dir),send=(res,status,b,type)=>{res.writeHead(status,{'Content-Type':type,'Content-Length':b.length,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});res.end(b);};
 server=createServer((req,res)=>{try{
  if(req.method!=='GET'||req.headers.host!=='127.0.0.1:'+server.address().port||['cross-site','same-site'].includes(req.headers['sec-fetch-site'])||(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host))return send(res,403,Buffer.from('Acceso local únicamente'),'text/plain');
  const u=new URL(req.url,'http://'+req.headers.host);if(u.search||!u.pathname.startsWith(prefix))return send(res,404,Buffer.from('Ruta no disponible'),'text/plain');
  const p=decodeURIComponent(u.pathname.slice(prefix.length))+(u.pathname.endsWith('/')?'index.html':'');
  if(!files.has(p))return send(res,404,Buffer.from('Ruta no disponible'),'text/plain');
  const f=realpathSync(resolve(base,p)),rel=relative(base,f);
  if(!rel||rel.startsWith('..')||isAbsolute(rel))return send(res,404,Buffer.from('Ruta no disponible'),'text/plain');
  const b=readFileSync(f);if(sha(b)!==files.get(p))return send(res,500,Buffer.from('Integridad no verificada'),'text/plain');
  return send(res,200,b,mime[extname(f)]||'application/octet-stream');
 }catch{if(!res.headersSent)send(res,500,Buffer.from('Recurso no disponible'),'text/plain');else res.destroy();}});
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 return 'http://127.0.0.1:'+server.address().port;
}
async function smoke(origin,candidate){
 const deps=createRequire(resolve(process.env.P114353_DEPS,'package.json')),{chromium}=deps('playwright');
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:false,viewport:{width:1280,height:900}});
 let external=0,unexpected=0,errors=0,chapters=0;
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==origin){external++;return route.abort();}if(u.search||route.request().method()!=='GET'){unexpected++;return route.abort();}if(u.pathname.startsWith(assets+'chapters/'))chapters++;return route.continue();});
 const page=await context.newPage();page.on('pageerror',()=>errors++);
 for(const path of [prefix,prefix+'biblia/lector/',prefix+'linguistica/lexicos-concordancias/'])assert.equal((await page.goto(origin+path))?.status(),200);
 assert.equal((await page.goto(origin+root))?.status(),200);
 await page.waitForFunction(()=>!document.querySelector('#ta-fields')?.disabled);
 assert.equal(chapters,0);assert.equal(await page.locator('#ta-candidate-rights h3').count(),3);
 assert.equal(await page.locator('#ta-candidate-privacy').count(),1);
 for(const [book,chapter,verse,count] of [['Lev','19','28',12],['Deut','14','1',12],['Acts','19','6',18]]){
  const d=candidate.catalog.chapters.find(d=>d.bookId==='LIB-'+book&&d.chapter===chapter);assert.ok(d);
  await page.locator('#ta-edition').selectOption(d.editionId);await page.locator('#ta-book').selectOption(d.bookId);await page.locator('#ta-chapter').fill(chapter);await page.locator('#ta-verse').fill(verse);
  await page.getByRole('button',{name:'Consultar referencia'}).click();
  await page.waitForFunction(n=>document.querySelector('#ta-status')?.textContent===n+' ocurrencias disponibles.',count);
  assert.equal(await page.locator('#ta-words button').count(),count);
  await page.locator('#ta-words button').first().focus();await page.keyboard.press('Enter');
  assert.ok(await page.locator('#ta-result').isVisible());
 }
 assert.equal(chapters,6);assert.deepEqual([external,unexpected,errors],[0,0,0]);
 const storage=await page.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).length,cache:(await caches.keys()).length}));
 assert.ok(storage.local.every(k=>k==='scriptura-nexus:appearance:v1'));assert.deepEqual([storage.session.length,storage.db,storage.cache],[0,0,0]);assert.deepEqual(await context.cookies(),[]);
 await context.close();await browser.close();browser=null;
 return {browserSmoke:true,otherRoutes:3,pilotReferences:3,chapterRequests:chapters,externalRequests:external,queryStorage:false};
}
try{
 const mode=process.argv.slice(2);assert.ok(mode.length===1&&['--verify','--browser'].includes(mode[0]));
 const baseline=resolve('dist'),before=snapshot(baseline);
 stage='candidate';const {candidate,overlay,summary}=await createStaticCandidate();
 stage='temporary copy';temp=mkdtempSync(join(tmpdir(),'sn-analyzer-stage-'));const dir=join(temp,'site');cpSync(baseline,dir,{recursive:true,errorOnExist:true,force:false});
 const expected=overlayDigests(overlay);
 for(const [url,f] of overlay){const p=overlayRelative(url),target=join(dir,p);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,f.body,{flag:p===analyzerHtml?'w':'wx'});}
 stage='artifact scope';const after=snapshot(dir),scope=compareAnalyzerScope(before,after,expected);assert.equal(scope.addedFiles,345);
 stage='disk verification';const verified=verifyStagedAnalyzer(dir,candidate,overlay);assert.equal(verified.manifestSha256,summary.manifestSha256);
 stage='baseline protection';assert.deepEqual(snapshot(baseline),before);
 let browserEvidence={browserSmoke:false};
 if(mode[0]==='--browser'){stage='staged browser';const origin=await serve(dir,after);browserEvidence=await smoke(origin,candidate);assert.equal((await fetch(origin+assets+'unknown.json.gz')).status,404);assert.equal((await fetch(origin+root+'?q=test')).status,404);}
 stage='final scope';assert.deepEqual(snapshot(dir),after);assert.deepEqual(snapshot(baseline),before);
 result={phase:'P11.4.3.5.3',...scope,...verified,...browserEvidence,baselineIntact:true,temporaryFiles:true,upload:false,publicArtifact:false,manualScreenReader:'pending',realMobileValidated:false};
}catch(e){failed=true;console.error('Private artifact verification failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+'); source data omitted');}
finally{if(browser)await browser.close().catch(()=>{});cleanup();if(temp&&existsSync(temp)){failed=true;console.error('Temporary cleanup failed');}}
if(failed)process.exitCode=1;else console.log(JSON.stringify({...result,temporaryCleaned:true,corpusPersisted:false}));
