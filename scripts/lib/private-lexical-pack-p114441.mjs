import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
export const sha=b=>createHash('sha256').update(b).digest('hex');
const validPath=p=>typeof p==='string'&&/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.json\.gz$/.test(p);
export function createPrivatePack(){
 const assets=new Map(),descriptors=new Map();
 function add(path,body,d){
  assert.ok(validPath(path)&&!assets.has(path));assert.ok(d.path===path&&d.gzipBytes>0&&d.gzipBytes<=256000&&d.jsonBytes>0&&d.jsonBytes<=8388608);
  assert.ok(body.length===d.gzipBytes&&sha(body)===d.gzipSha256);
  assets.set(path,body);descriptors.set(path,d);return d;
 }
 function put(path,value){const raw=Buffer.from(JSON.stringify(value)),body=gzipSync(raw,{level:6});return add(path,body,{path,jsonBytes:raw.length,gzipBytes:body.length,sha256:sha(raw),gzipSha256:sha(body)});}
 function load(d){
  assert.deepEqual(d,descriptors.get(d.path));const b=assets.get(d.path);assert.ok(b&&b.length===d.gzipBytes&&sha(b)===d.gzipSha256);const raw=gunzipSync(b,{maxOutputLength:8388608});assert.ok(raw.length===d.jsonBytes&&sha(raw)===d.sha256);return JSON.parse(raw);
 }
 return {assets,descriptors,add,put,load};
}
