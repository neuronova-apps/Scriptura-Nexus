import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {root,assets,startAnalyzerPreview,validateStaticOverlay} from '../scripts/prepare-analyzer-candidate-p11435.mjs';
test('private server exposes only same-origin overlay and existing permitted static resources',async t=>{
 const dir=mkdtempSync(join(tmpdir(),'sn-analyzer-test-'));
 const overlay=new Map([[root,{body:Buffer.from('private test'),type:'text/html; charset=utf-8'}],[assets+'catalog.json.gz',{body:Buffer.from([1,2,3]),type:'application/octet-stream'}]]);
 mkdirSync(join(dir,'_astro'));writeFileSync(join(dir,'_astro','test.css'),'body{}');writeFileSync(join(dir,'secret.json'),'{}');
 const {server,origin,url}=await startAnalyzerPreview(overlay,dir);
 t.after(()=>{server.closeAllConnections();server.close();rmSync(dir,{recursive:true,force:true});});
 let r=await fetch(url);assert.equal(r.status,200);assert.equal(await r.text(),'private test');assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('referrer-policy'),'no-referrer');
 r=await fetch(origin+assets+'catalog.json.gz');assert.deepEqual(new Uint8Array(await r.arrayBuffer()),Uint8Array.from([1,2,3]));
 assert.equal((await fetch(origin+'/Scriptura-Nexus/_astro/test.css')).status,200);
 for(const path of [assets+'missing.json.gz',root+'?q=example','/Scriptura-Nexus/secret.json','/outside'])assert.equal((await fetch(origin+path)).status,404);
 assert.equal((await fetch(url,{method:'POST'})).status,403);
 assert.equal((await fetch(url,{headers:{Origin:'https://example.invalid'}})).status,403);
 assert.equal((await fetch(url,{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
});
test('incomplete or authorized catalog cannot pass private artifact validation',()=>{
 const c={catalog:{publicationAuthorized:false,chapters:[]},assets:new Map(),catalogSpec:{}};
 assert.throws(()=>validateStaticOverlay(c,new Map()));
 c.catalog.publicationAuthorized=true;assert.throws(()=>validateStaticOverlay(c,new Map()));
});
