// Candidate static asset decoder: no external requests, redirect or unbounded inflation.
const req=ok=>{if(!ok)throw Error('Invalid candidate asset');};
const hex=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',Uint8Array.from(b).buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function bounded(stream,expected){
 req(stream&&Number.isSafeInteger(expected)&&expected>0&&expected<=8*1024*1024);
 const reader=stream.getReader(),out=new Uint8Array(expected);let offset=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;req(value instanceof Uint8Array&&offset+value.length<=expected);out.set(value,offset);offset+=value.length;}req(offset===expected);return out;}
 catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}
}
export async function decodeStaticGzip(packed,d){
 req(packed instanceof Uint8Array&&Number.isSafeInteger(d.gzipBytes)&&d.gzipBytes>0&&d.gzipBytes<=256000&&packed.length===d.gzipBytes&&await hex(packed)===d.gzipSha256);
 req(Number.isSafeInteger(d.jsonBytes)&&d.jsonBytes>0&&d.jsonBytes<=8*1024*1024);
 const raw=await bounded(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip')),d.jsonBytes);
 req(await hex(raw)===d.sha256);return raw;
}
export async function loadStaticGzip(url,d,origin,fetcher=fetch){
 const target=new URL(url);req(target.origin===origin&&!target.username&&!target.password&&!target.search&&!target.hash);
 req(Number.isSafeInteger(d.gzipBytes)&&d.gzipBytes>0&&d.gzipBytes<=256000);
 const response=await fetcher(target,{method:'GET',redirect:'error',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
 req(response.ok&&!response.redirected&&(!response.url||new URL(response.url).href===target.href)&&(!response.headers.get('content-encoding')||response.headers.get('content-encoding')==='identity'));
 return decodeStaticGzip(await bounded(response.body,d.gzipBytes),d);
}
