export interface FragmentDescriptor{path:string;jsonBytes:number;gzipBytes:number;sha256:string;gzipSha256:string}
const require=(ok:unknown):void=>{if(!ok)throw new Error('No se pudo verificar el recurso privado.');};
const hash=/^[a-f0-9]{64}$/;
const pathPattern=/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.json\.gz$/;
function validDescriptor(v:unknown):v is FragmentDescriptor{
 if(!v||typeof v!=='object')return false;const x=v as Record<string,unknown>;
 return Object.keys(x).length===5&&Object.keys(x).sort().join('|')==='gzipBytes|gzipSha256|jsonBytes|path|sha256'&&typeof x.path==='string'&&pathPattern.test(x.path)&&Number.isSafeInteger(x.jsonBytes)&&Number(x.jsonBytes)>0&&Number(x.jsonBytes)<=8388608&&Number.isSafeInteger(x.gzipBytes)&&Number(x.gzipBytes)>0&&Number(x.gzipBytes)<=256000&&typeof x.sha256==='string'&&hash.test(x.sha256)&&typeof x.gzipSha256==='string'&&hash.test(x.gzipSha256);
}
async function digest(bytes:Uint8Array){const copy=new ArrayBuffer(bytes.byteLength);new Uint8Array(copy).set(bytes);const out=new Uint8Array(await crypto.subtle.digest('SHA-256',copy));return [...out].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function gunzip(bytes:Uint8Array,max:number){
 const reader=new Blob([bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;require(size<=max);chunks.push(value);}}
 finally{reader.releaseLock();}
 const out=new Uint8Array(size);let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.byteLength;}return out;
}
export async function openPrivateFragmentSource(manifestUrl:string,assetBase:string,fetcher:typeof fetch=fetch){
 const base=new URL(assetBase,document.baseURI);if(!base.pathname.endsWith('/'))base.pathname+='/';
 const manifestURL=new URL(manifestUrl,document.baseURI);require(base.origin===manifestURL.origin);
 const response=await fetcher(manifestURL,{cache:'no-store',credentials:'omit',mode:'same-origin',redirect:'error'});require(response.ok&&new URL(response.url||manifestURL.href).origin===base.origin);
 const manifest=await response.json();require(manifest&&manifest.schemaVersion===1&&manifest.mode==='isolated_lexical_concordance'&&manifest.publicationAuthorized===false&&validDescriptor(manifest.catalog)&&manifest.catalog.path==='catalog.json.gz');
 const cache=new Map<string,Promise<unknown>>();
 const load=async(spec:FragmentDescriptor):Promise<any>=>{
  require(validDescriptor(spec));const key=spec.path+'|'+spec.gzipSha256;const old=cache.get(key);if(old)return old;
  const pending=(async()=>{
   const url=new URL(spec.path,base);require(url.origin===base.origin&&url.pathname.startsWith(base.pathname));
   const r=await fetcher(url,{cache:'no-store',credentials:'omit',mode:'same-origin',redirect:'error'});require(r.ok&&new URL(r.url||url.href).origin===base.origin);
   const compressed=new Uint8Array(await r.arrayBuffer());require(compressed.byteLength===spec.gzipBytes&&await digest(compressed)===spec.gzipSha256);
   const raw=await gunzip(compressed,8388608);require(raw.byteLength===spec.jsonBytes&&await digest(raw)===spec.sha256);
   return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));
  })();
  cache.set(key,pending);if(cache.size>24){const first=cache.keys().next().value;if(first!==undefined&&first!==key)cache.delete(first);}
  try{return await pending;}catch{cache.delete(key);throw new Error('No se pudo verificar el recurso privado.');}
 };
 const catalog=await load(manifest.catalog);
 require(catalog&&catalog.schemaVersion===1&&catalog.mode==='isolated_lexical_concordance'&&catalog.publicationAuthorized===false&&Array.isArray(catalog.groups)&&Array.isArray(catalog.coverage)&&Array.isArray(catalog.lexicalSystems)&&Array.isArray(catalog.lexicalLanguages)&&catalog.chapterCatalog&&catalog.lemmaCatalog&&catalog.lexicalSummaryBuckets);
 return {catalog,load,close:()=>cache.clear()};
}
