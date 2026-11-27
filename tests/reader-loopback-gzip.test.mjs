import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {gzipSync} from 'node:zlib';
import {readLoopbackGzip} from '../scripts/lib/reader-loopback-gzip.mjs';
const raw=Buffer.from('{"synthetic":true}'),packed=gzipSync(raw);
async function withServer(handler,fn){
 const s=createServer(handler);await new Promise(r=>s.listen(0,'127.0.0.1',r));
 try{await fn('http://127.0.0.1:'+s.address().port);}finally{await new Promise(r=>s.close(r));}
}
function send(res,body=packed,length=body.length,encoding='gzip'){
 res.writeHead(200,{'Content-Length':length,'Content-Encoding':encoding,'Connection':'close'});res.end(body);
}
test('loopback gzip: repeated closed connections preserve actual compressed and decoded bytes',async()=>{
 await withServer((q,r)=>{assert.equal(q.headers['accept-encoding'],'gzip');send(r);},async origin=>{
  for(let i=0;i<20;i++){const result=await readLoopbackGzip(origin,'/chapter',{expectedGzipBytes:packed.length,expectedJsonBytes:raw.length});assert.deepEqual(result.raw,raw);assert.deepEqual(result.packed,packed);}
 });
});
test('loopback gzip: reject wrong size, encoding, gzip and bounded decompression',async()=>{
 await withServer((q,r)=>{if(q.url==='/plain')send(r,raw,raw.length,'identity');else if(q.url==='/bad')send(r,Buffer.from('bad'));else send(r);},async origin=>{
  await assert.rejects(readLoopbackGzip(origin,'/chapter',{maxGzipBytes:1}));
  await assert.rejects(readLoopbackGzip(origin,'/chapter',{maxJsonBytes:1}));
  await assert.rejects(readLoopbackGzip(origin,'/chapter',{expectedJsonBytes:1}));
  await assert.rejects(readLoopbackGzip(origin,'/plain'));
  await assert.rejects(readLoopbackGzip(origin,'/bad'));
 });
});
test('loopback gzip: reject external origins and redirects',async()=>{
 assert.throws(()=>readLoopbackGzip('https://example.com','/chapter'));
 assert.throws(()=>readLoopbackGzip('http://127.0.0.1:9','https://example.com'));
 await withServer((q,r)=>{r.writeHead(302,{Location:'https://example.com'});r.end();},async origin=>await assert.rejects(readLoopbackGzip(origin,'/chapter')));
});
