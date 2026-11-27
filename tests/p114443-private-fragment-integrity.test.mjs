import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {openPrivateFragmentSource} from '../src/lib/private-fragment-loader.ts';
import {createPrivateLookup,bucketFor,groupKey} from '../src/lib/lexical-fragment-runtime.ts';
const origin='https://scriptura.test',baseURI=origin+'/Scriptura-Nexus/index.html',privateRoot='/Scriptura-Nexus/private/';
globalThis.document={baseURI};
const sha=x=>createHash('sha256').update(x).digest('hex');
function makeAsset(path,value){
 const raw=Buffer.from(JSON.stringify(value)),bytes=gzipSync(raw,{level:6});
 return {spec:{path,jsonBytes:raw.length,gzipBytes:bytes.length,sha256:sha(raw),gzipSha256:sha(bytes)},raw,bytes};
}
const placeholder=path=>({path,jsonBytes:1,gzipBytes:1,sha256:'a'.repeat(64),gzipSha256:'b'.repeat(64)});
function fixture({manifestAuthorized=false,catalogAuthorized=false}={}){
 const assets=new Map(),calls=[];
 const catalog={schemaVersion:1,mode:'isolated_lexical_concordance',publicationAuthorized:catalogAuthorized,groups:[],coverage:[],lexicalSystems:['index'],lexicalLanguages:['hbo'],chapterCatalog:placeholder('analyzer-catalog.json.gz'),lemmaCatalog:placeholder('lemma-catalog.json.gz'),lexicalSummaryBuckets:{},details:{}};
 const cat=makeAsset('catalog.json.gz',catalog);assets.set(cat.spec.path,cat);
 const manifest={schemaVersion:1,mode:'isolated_lexical_concordance',publicationAuthorized:manifestAuthorized,catalog:cat.spec};
 const fetcher=async(input,init={})=>{
  const url=new URL(String(input),baseURI);calls.push({path:url.pathname,init});
  if(url.pathname===privateRoot+'manifest.json')return new Response(JSON.stringify(manifest),{status:200,headers:{'Content-Type':'application/json'}});
  const path=url.pathname.slice(privateRoot.length),item=assets.get(path);
  return item?new Response(item.bytes,{status:200}):new Response('missing',{status:404});
 };
 return {assets,calls,catalog,manifest,fetcher,open:()=>openPrivateFragmentSource(privateRoot+'manifest.json',privateRoot,fetcher)};
}
test('manifiesto y catálogo se verifican; las solicitudes no usan cookies ni caché persistente',async()=>{
 const f=fixture(),sample=makeAsset('records/sample.json.gz',{label:'integridad',count:3});f.assets.set(sample.spec.path,sample);
 const source=await f.open();assert.equal(source.catalog.publicationAuthorized,false);
 const [a,b]=await Promise.all([source.load(sample.spec),source.load(sample.spec)]);
 assert.deepEqual(a,{label:'integridad',count:3});assert.deepEqual(b,a);
 assert.equal(f.calls.filter(x=>x.path===privateRoot+'records/sample.json.gz').length,1);
 for(const call of f.calls){assert.equal(call.init.cache,'no-store');assert.equal(call.init.credentials,'omit');assert.equal(call.init.mode,'same-origin');assert.equal(call.init.redirect,'error');}
 source.close();await source.load(sample.spec);assert.equal(f.calls.filter(x=>x.path===privateRoot+'records/sample.json.gz').length,2);
});
test('rechaza publicación habilitada y cualquier origen distinto',async()=>{
 const a=fixture({manifestAuthorized:true});await assert.rejects(a.open(),/No se pudo verificar el recurso privado/);
 const b=fixture();await assert.rejects(openPrivateFragmentSource(privateRoot+'manifest.json','https://otro.test/private/',b.fetcher),/No se pudo verificar el recurso privado/);
 const c=fixture({catalogAuthorized:true});await assert.rejects(c.open(),/No se pudo verificar el recurso privado/);
});
test('rechaza rutas relativas y límites excedidos antes de descargar',async()=>{
 const f=fixture(),sample=makeAsset('records/safe.json.gz',{ok:true});f.assets.set(sample.spec.path,sample);const source=await f.open(),before=f.calls.length;
 await assert.rejects(source.load({...sample.spec,path:'../secret.json.gz'}),/No se pudo verificar el recurso privado/);
 await assert.rejects(source.load({...sample.spec,gzipBytes:256001}),/No se pudo verificar el recurso privado/);
 await assert.rejects(source.load({...sample.spec,jsonBytes:8388609}),/No se pudo verificar el recurso privado/);
 assert.equal(f.calls.length,before);
});
test('detecta alteración de bytes comprimidos y del contenido descomprimido',async()=>{
 const f=fixture(),source=await f.open();
 const compressed=makeAsset('records/compressed.json.gz',{value:1}),badBytes=Buffer.from(compressed.bytes);badBytes[0]^=1;f.assets.set(compressed.spec.path,{...compressed,bytes:badBytes});
 await assert.rejects(source.load(compressed.spec),/No se pudo verificar el recurso privado/);
 const raw=makeAsset('records/raw.json.gz',{value:2}),badSpec={...raw.spec,sha256:'0'.repeat(64)};f.assets.set(raw.spec.path,raw);
 await assert.rejects(source.load(badSpec),/No se pudo verificar el recurso privado/);
});
test('limita el tamaño expandido incluso ante un descriptor que declara un tamaño menor',async()=>{
 const f=fixture(),source=await f.open(),raw=Buffer.from(JSON.stringify('x'.repeat(8388608+1))),bytes=gzipSync(raw);
 const spec={path:'records/expanded.json.gz',jsonBytes:8388608,gzipBytes:bytes.length,sha256:sha(raw),gzipSha256:sha(bytes)};
 f.assets.set(spec.path,{bytes});await assert.rejects(source.load(spec),/No se pudo verificar el recurso privado/);
});
test('mantiene una caché acotada a 24 fragmentos y vuelve a descargar el elemento desalojado',async()=>{
 const f=fixture(),source=await f.open(),assets=[];
 for(let i=0;i<25;i++){const x=makeAsset('records/item-'+i+'.json.gz',{i});assets.push(x);f.assets.set(x.spec.path,x);await source.load(x.spec);}
 const path=privateRoot+assets[0].spec.path;assert.equal(f.calls.filter(x=>x.path===path).length,1);
 await source.load(assets[0].spec);assert.equal(f.calls.filter(x=>x.path===path).length,2);
});
test('las claves exactas se consultan mediante cubetas sin incorporarlas a las rutas',async()=>{
 const q={kind:'concordance',editionId:'TXT-test',language:'grc',mode:'form'},key='λόγος',bucket=bucketFor(key),paths=[];
 const catalog={schemaVersion:1,mode:'isolated_lexical_concordance',publicationAuthorized:false,groups:[{query:q,manifest:{path:'groups/g/manifest.json.gz'}}],details:{}};
 const load=async d=>{
  paths.push(d.path);
  if(d.path==='groups/g/manifest.json.gz')return {group:groupKey(q),kind:'concordance',buckets:{[bucket]:{path:'groups/g/bucket-'+bucket+'.json.gz'}},pages:[]};
  return {group:groupKey(q),bucket,rows:[[key,[10001]]]};
 };
 const lookup=createPrivateLookup(catalog,load),result=await lookup.lookup(q,key);
 assert.deepEqual(result.refs,[10001]);assert.ok(paths.every(p=>!p.includes(key)));
 const mismatch=await lookup.lookup(q,'λογος');assert.equal(mismatch.total,0);
});
test('el transporte no introduce almacenamiento persistente ni cookies',()=>{
 const source=readFileSync(new URL('../src/lib/private-fragment-loader.ts',import.meta.url),'utf8');
 assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|document\.cookie|caches\.open/);
});
