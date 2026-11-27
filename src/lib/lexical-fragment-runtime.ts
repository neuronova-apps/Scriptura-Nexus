export const QUERY_BUCKETS=256,DETAIL_BUCKETS=1024,PAGE_SIZE=100,STRIDE=10000;
const require=(ok:unknown):void=>{if(!ok)throw new Error('Fragmento privado no válido');};
export type PrivateGroupQuery=
 | {kind:'lexical';mode:'form';language:string}
 | {kind:'lexical';mode:'identifier';system:string}
 | {kind:'concordance';editionId:string;language:string;bookId?:string;mode:'form'|'lemma'|'provider';system?:string};
export function bucketFor(key:string,count=QUERY_BUCKETS):string{
 require(typeof key==='string'&&Number.isSafeInteger(count)&&count>0&&(count&(count-1))===0);
 let h=2166136261;for(let i=0;i<key.length;i++)h=Math.imul(h^key.charCodeAt(i),16777619);
 return String((h>>>0)%count);
}
export function groupKey(q:PrivateGroupQuery):string{
 if(q.kind==='lexical')return JSON.stringify(['lexical',q.mode,q.mode==='form'?q.language:q.system]);
 return JSON.stringify(['concordance',q.editionId,q.language,q.bookId??null,q.mode,q.mode==='provider'?q.system:null]);
}
export function coordinate(chapter:number,position:number):number{
 require(Number.isSafeInteger(chapter)&&chapter>=0&&chapter<10000&&Number.isSafeInteger(position)&&position>=0&&position<STRIDE);return chapter*STRIDE+position;
}
export function decodeCoordinate(value:number,chapters:readonly {occurrences:number}[]):{chapter:number;position:number}{
 require(Number.isSafeInteger(value)&&value>=0);const chapter=Math.floor(value/STRIDE),position=value%STRIDE;
 require(chapters[chapter]&&position<chapters[chapter].occurrences);return {chapter,position};
}
export function exactRow(rows:unknown,key:string):unknown[]|null{
 require(Array.isArray(rows));let hit:unknown[]|null=null;
 for(const row of rows){require(Array.isArray(row)&&row.length===2&&typeof row[0]==='string'&&Array.isArray(row[1]));if(row[0]===key){require(hit===null);hit=row[1];}}
 return hit;
}
export function pageWindow(total:number,offset=0,limit=20){
 require(Number.isSafeInteger(total)&&total>=0&&Number.isSafeInteger(offset)&&offset>=0&&Number.isSafeInteger(limit)&&limit>0&&limit<=100);
 return {total,offset,limit,nextOffset:offset+limit<total?offset+limit:null};
}
export function createPrivateLookup(catalog:any,load:(descriptor:any)=>Promise<any>){
 require(catalog?.schemaVersion===1&&catalog.mode==='isolated_lexical_concordance'&&catalog.publicationAuthorized===false&&Array.isArray(catalog.groups)&&catalog.details);
 const groups=new Map<string,any>(catalog.groups.map((g:any)=>[groupKey(g.query),g] as [string,any]));require(groups.size===catalog.groups.length);
 let groupCache:{key:string;value:any}|null=null;
 async function group(q:PrivateGroupQuery){
  const k=groupKey(q),g=groups.get(k);if(!g)return null;
  if(groupCache?.key===k)return groupCache.value;
  const m=await load(g.manifest);require(m.group===k&&m.kind===g.query.kind&&m.buckets&&Array.isArray(m.pages));
  groupCache={key:k,value:m};return m;
 }
 async function lookup(q:PrivateGroupQuery,key:string,offset=0,limit=20){
  require(typeof key==='string'&&key.trim().length>0&&key.length<=1024);pageWindow(0,offset,limit);
  const m=await group(q);if(!m)return {status:'scope_unavailable' as const,...pageWindow(0,offset,limit),total:null,refs:[] as unknown[]};
  const b=bucketFor(key),d=m.buckets[b];let list:unknown[]=[];
  if(d){const p=await load(d);require(p.group===m.group&&p.bucket===b);list=exactRow(p.rows,key)??[];}
  return {status:'available' as const,...pageWindow(list.length,offset,limit),refs:list.slice(offset,offset+limit)};
 }
 async function frequency(q:PrivateGroupQuery,offset=0,limit=20){
  pageWindow(0,offset,limit);const m=await group(q);
  if(!m||m.kind!=='concordance')return {status:'scope_unavailable' as const,...pageWindow(0,offset,limit),total:null,totalPostings:null,entries:[] as unknown[]};
  const window=pageWindow(m.totalKeys,offset,limit),entries:unknown[]=[];
  for(let start=offset;start<Math.min(offset+limit,m.totalKeys);){
   const index=Math.floor(start/PAGE_SIZE),p=await load(m.pages[index]);require(p.group===m.group&&p.page===index&&Array.isArray(p.entries));
   const pos=start%PAGE_SIZE,take=Math.min(p.entries.length-pos,offset+limit-start);require(take>0);entries.push(...p.entries.slice(pos,pos+take));start+=take;
  }
  return {status:'available' as const,...window,totalPostings:m.totalPostings,entries};
 }
 async function detail(id:string){
  require(typeof id==='string'&&/^LENTRY-[a-f0-9]{64}$/.test(id));const b=bucketFor(id,DETAIL_BUCKETS),d=catalog.details[b];if(!d)return null;
  const p=await load(d);require(p.bucket===b&&Array.isArray(p.entries));const matches=p.entries.filter((x:any)=>x.entry?.id===id);require(matches.length<=1);return matches[0]??null;
 }
 return Object.freeze({lookup,frequency,detail,hasGroup:(q:PrivateGroupQuery)=>groups.has(groupKey(q))});
}
