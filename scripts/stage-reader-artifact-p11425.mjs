// Temporary isolated staging only. No writes into dist, no upload and no public listener.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {cpSync,mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,statSync} from 'node:fs';
import {join,resolve,relative,isAbsolute,dirname,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {createCandidate} from './prepare-reader-candidate-p11425.mjs';
import {snapshot,compareScope,verifyReaderData,overlayDigests} from './lib/reader-artifact-scope.mjs';
import {loadArtifactPlan,validateArtifactPlan} from './validate-reader-artifact-plan-p11425.mjs';
const prefix='/Scriptura-Nexus/',reader=prefix+'biblia/lector/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.gz':'application/octet-stream','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
let temp,server,stage='plan',cleaned=false;
function cleanup(){if(cleaned)return;cleaned=true;server?.closeAllConnections();server?.close();if(temp)rmSync(temp,{recursive:true,force:true});}
process.once('SIGINT',()=>{cleanup();process.exit(0);});process.once('SIGTERM',()=>{cleanup();process.exit(0);});process.once('exit',cleanup);
try{
 validateArtifactPlan(loadArtifactPlan());
 const baseline=resolve('dist'),before=snapshot(baseline);
 stage='candidate';const {overlay,summary}=await createCandidate();
 stage='copy';temp=mkdtempSync(join(tmpdir(),'sn-reader-stage-'));const dest=join(temp,'site');cpSync(baseline,dest,{recursive:true,errorOnExist:true,force:false});
 const expected=overlayDigests(overlay);
 for(const [url,f] of overlay){const rel=url.slice(prefix.length)+(url.endsWith('/')?'index.html':'');assert.ok(expected.has(rel));const target=join(dest,rel);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,f.body,{flag:rel==='biblia/lector/index.html'?'w':'wx'});}
 stage='scope';const after=snapshot(dest),scope=compareScope(before,after,expected);
 const v=verifyReaderData(dest);assert.deepEqual([...expected.keys()].sort(),[...v.allowed].sort());
 assert.deepEqual(snapshot(baseline),before,'ordinary build mutated');
 const send=(res,status,bytes,type)=>{const b=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);res.writeHead(status,{'Content-Type':type,'Content-Length':b.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(b);};
 stage='serve';
 server=createServer((req,res)=>{try{
  if(req.method!=='GET'||req.headers.host!=='127.0.0.1:'+server.address().port||['cross-site','same-site'].includes(req.headers['sec-fetch-site'])||(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host))return send(res,403,'Acceso local únicamente','text/plain');
  const u=new URL(req.url,'http://'+req.headers.host);if(u.search||!u.pathname.startsWith(prefix))return send(res,404,'Ruta no disponible','text/plain');
  const rel=decodeURIComponent(u.pathname.slice(prefix.length))+(u.pathname.endsWith('/')?'index.html':'');
  if(!after.has(rel))return send(res,404,'Ruta no disponible','text/plain');
  const file=resolve(dest,rel),check=relative(dest,file);
  if(check.startsWith('..')||isAbsolute(check)||!statSync(file).isFile())return send(res,404,'Ruta no disponible','text/plain');
  return send(res,200,readFileSync(file),mime[extname(file)]||'application/octet-stream');
 }catch{if(!res.headersSent)send(res,500,'No se pudo verificar el recurso','text/plain');else res.destroy();}});
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 console.log(JSON.stringify({...summary,...scope,stagedArtifact:true,temporaryFiles:true,upload:false,baselineIntact:true,url:'http://127.0.0.1:'+server.address().port+reader}));
}catch(e){cleanup();console.error('Private staging failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+'); no upload');process.exitCode=1;}
