import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {decodeStaticGzip,loadStaticGzip} from '../scripts/lib/reader-static-gzip.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=new TextEncoder().encode('synthetic comparator integrity fixture');
const packed=new Uint8Array(gzipSync(raw));
const spec={gzipBytes:packed.length,jsonBytes:raw.length,gzipSha256:sha(packed),sha256:sha(raw)};
const origin='http://127.0.0.1:43154',url=origin+'/private/fragment.json.gz';
test('exact bytes and both digests are required',async()=>{
 assert.deepEqual(await decodeStaticGzip(packed,spec),raw);
 const changed=packed.slice();changed[changed.length-1]^=1;
 for(const [p,d] of [[changed,spec],[packed,{...spec,gzipSha256:'0'.repeat(64)}],[packed,{...spec,sha256:'0'.repeat(64)}],[packed.slice(0,-1),spec]])await assert.rejects(decodeStaticGzip(p,d));
});
test('compressed and inflated lengths are bounded',async()=>{
 for(const d of [{...spec,gzipBytes:256001},{...spec,jsonBytes:8*1024*1024+1},{...spec,jsonBytes:raw.length-1},{...spec,jsonBytes:raw.length+1}])await assert.rejects(decodeStaticGzip(packed,d));
});
test('same origin and no query, fragment or embedded credentials before request',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return new Response(packed);};
 for(const bad of ['https://example.invalid/fragment',url+'?reference=synthetic',url+'#synthetic','http://u:p@127.0.0.1:43154/private/fragment'])await assert.rejects(loadStaticGzip(bad,spec,origin,fetcher));
 assert.equal(calls,0);
});
test('fetch flags, failure, retry, invalid response encoding and length',async()=>{
 const ok=async(u,opts)=>{assert.equal(u.href,url);assert.deepEqual(opts,{method:'GET',redirect:'error',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});return new Response(packed);};
 await assert.rejects(loadStaticGzip(url,spec,origin,async()=>{throw Error('network');}));
 await assert.rejects(loadStaticGzip(url,spec,origin,async()=>new Response('',{status:503})));
 await assert.rejects(loadStaticGzip(url,spec,origin,async()=>new Response(packed,{headers:{'Content-Encoding':'gzip'}})));
 await assert.rejects(loadStaticGzip(url,spec,origin,async()=>new Response(packed.slice(0,-1))));
 assert.deepEqual(await loadStaticGzip(url,spec,origin,ok),raw);
});
test('historical evidence and publication boundaries remain intact',()=>{
 const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
 const r=read('docs/P11/registro-integridad-comparador-p11454.json'),c=read('docs/P11/registro-candidato-comparador-p11453.json'),l=read('docs/P11/registro-liberacion-lexicos-p114444.json'),a=read('docs/P9/alineaciones-p931.json');
 assert.equal(r.previousEvidence.chaptersVerified,c.chapters);assert.equal(r.previousEvidence.units,c.units);assert.deepEqual(r.progress,c.progress);
 assert.equal(r.publicationAuthorized,false);assert.equal(r.publicAdapterConnected,false);assert.equal(r.corpusPersisted,false);assert.equal(r.upload,false);
 assert.equal(r.planned.screenReaderManual,false);assert.equal(r.planned.physicalDeviceManual,false);
 assert.deepEqual(a.alignments,[]);assert.deepEqual(a.evidence,[]);assert.equal(a.publicationAuthorized,false);
 assert.equal(l.canPublish,false);assert.equal(l.exclusions.dodson,'not_included_pending_separate_approval');assert.deepEqual(r.excluded,c.excluded);
});
