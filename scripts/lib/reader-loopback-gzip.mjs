// Bounded gzip transport for the isolated Node audit (not the browser or public API).
import {get} from 'node:http';
import {gunzipSync} from 'node:zlib';
export function readLoopbackGzip(origin,path,{maxGzipBytes=256000,maxJsonBytes=8*1024*1024,expectedGzipBytes,expectedJsonBytes}={}){
 const base=new URL(origin),url=new URL(path,base);
 if(base.protocol!=='http:'||base.hostname!=='127.0.0.1'||url.origin!==base.origin||url.username||url.password)throw Error('invalid loopback origin');
 return new Promise((resolve,reject)=>{
  const request=get(url,{agent:false,headers:{'Accept-Encoding':'gzip','Connection':'close'}},res=>{
   const length=Number(res.headers['content-length']);
   if(res.statusCode!==200||res.headers['content-encoding']!=='gzip'||!Number.isSafeInteger(length)||length<=0||length>maxGzipBytes||(expectedGzipBytes!==undefined&&length!==expectedGzipBytes)){
    res.destroy();reject(Error('invalid compressed response'));return;
   }
   const chunks=[];let size=0;
   res.on('error',()=>reject(Error('response error')));
   res.on('aborted',()=>reject(Error('response aborted')));
   res.on('data',chunk=>{size+=chunk.length;if(size>length){res.destroy();reject(Error('response size'));return;}chunks.push(chunk);});
   res.on('end',()=>{
    try{
     if(!res.complete||size!==length)throw Error('incomplete response');
     const packed=Buffer.concat(chunks),raw=gunzipSync(packed,{maxOutputLength:maxJsonBytes});
     if(expectedJsonBytes!==undefined&&raw.length!==expectedJsonBytes)throw Error('decoded size');
     resolve({raw,packed});
    }catch{reject(Error('invalid gzip or size'));}
   });
  });
  request.setTimeout(15000,()=>request.destroy(Error('loopback timeout')));
  request.on('error',()=>reject(Error('loopback request failed')));
 });
}
