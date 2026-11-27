import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createConcordance} from '../../src/lib/concordance.ts';
import {createLexicalQuery} from '../../src/lib/lexical-query.ts';
import {buildAnalyzerFragments} from './build-analyzer-fragments-p11434.mjs';
import {validateIndexPlan} from './concordance-index-plan-p11443.mjs';
import {createPrivatePack,sha} from './private-lexical-pack-p114441.mjs';
import {bucketFor,groupKey,coordinate,decodeCoordinate,createPrivateLookup,QUERY_BUCKETS,DETAIL_BUCKETS,PAGE_SIZE} from './lexical-fragment-lookup-p114441.mjs';
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const py=`
import importlib.util,json
s=importlib.util.spec_from_file_location('model','scripts/project-lexical-model-p84.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
roots,ds,_=m.load_verified()
model=m.project(roots,ds,True);m.validate_model(model,ds,True)
assert m.digest(model)=='26c8e8897f24c1991180cbbf0c0796afa130a6f6a088b1039cf69f137fe73f62'
admissions=[{k:d[k] for k in ('id','commit','sha256','allowedComponents','selectors')} for d in ds]
print(json.dumps({'model':model,'admissions':admissions},ensure_ascii=False,separators=(',',':')))
`;
export function loadPrivateLexicalModel(){
 try{return JSON.parse(execFileSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['-X','utf8','-c',py],{encoding:'utf8',timeout:240000,maxBuffer:128*1024*1024,stdio:['ignore','pipe','pipe'],env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}}));}
 catch{throw Error('Private lexical projection failed');}
}
export function buildLookupGroup(pack,id,q,keys,rank=[]){
 const k=groupKey(q),buckets=new Map(),stem='groups/'+id+'/';
 for(const [key,refs] of keys){const b=bucketFor(key),rows=buckets.get(b)??[];rows.push([key,refs]);buckets.set(b,rows);}
 const specs={};
 for(const [b,rows] of [...buckets].sort((a,b)=>Number(a[0])-Number(b[0]))){rows.sort((a,b)=>cmp(a[0],b[0]));const d=pack.put(stem+'bucket-'+b+'.json.gz',{group:k,bucket:b,rows});assert.deepEqual(pack.load(d).rows,rows);specs[b]=d;}
 const pages=[];
 for(let i=0;i<rank.length;i+=PAGE_SIZE){const page=i/PAGE_SIZE,entries=rank.slice(i,i+PAGE_SIZE),d=pack.put(stem+'frequency-'+page+'.json.gz',{group:k,page,entries});assert.deepEqual(pack.load(d).entries,entries);pages.push(d);}
 const m={group:k,kind:q.kind,buckets:specs,pages,totalKeys:keys.size,totalPostings:[...keys.values()].reduce((n,x)=>n+x.length,0)};
 const manifest=pack.put(stem+'manifest.json.gz',m);assert.deepEqual(pack.load(manifest),m);
 return {query:q,manifest};
}
export async function buildLexicalConcordanceFragments(data,lexical){
 const plan=validateIndexPlan(),evidence=JSON.parse(readFileSync('docs/P11/registro-candidato-lexico-p114441.json','utf8'));
 assert.equal(evidence.gates.publicationAuthorized,false);assert.equal(evidence.observed.verifiedQueries,96493);
 const {registry:r,admissions,supplements}=data,{model,admissions:la}=lexical;
 assert.equal(r.tokens.length,78218);assert.equal(model.entries.length,30740);assert.equal(model.forms.length,10221);assert.equal(model.definitions.length,35496);
 assert.deepEqual(la.map(x=>x.id),plan.scope.historicalLexicalFiles);assert.equal(r.identifiers.length,0);
 const pack=createPrivatePack(),chap=buildAnalyzerFragments(data),coordinates=new Map(),tokenAt=new Map();
 for(const d of chap.catalog.chapters)for(const spec of [d.text,d.annotations])pack.add(spec.path,chap.assets.get(spec.path),spec);
 const chapterCatalog=pack.add('analyzer-catalog.json.gz',chap.assets.get(chap.catalogSpec.path),{...chap.catalogSpec,path:'analyzer-catalog.json.gz'});
 assert.deepEqual(pack.load(chapterCatalog),chap.catalog);
 for(const [i,d] of chap.catalog.chapters.entries()){const t=pack.load(d.text);assert.equal(t.tokens.length,d.occurrences);for(const [j,x] of t.tokens.entries()){const n=coordinate(i,j);assert.ok(!coordinates.has(x.id));coordinates.set(x.id,n);tokenAt.set(n,x.id);assert.deepEqual(decodeCoordinate(n,chap.catalog.chapters),{chapter:i,position:j});}}
 assert.equal(coordinates.size,78218);
 const c=createConcordance(r,admissions,supplements),l=createLexicalQuery(model,la);
 const units=new Map(r.units.map(u=>[u.id,u])),lemmas=new Map(r.lemmas.map(x=>[x.id,x])),analyses=new Map(r.analyses.map(x=>[x.id,x])),extra=new Map(supplements.map(x=>[x.tokenId,x]));
 const refs=new Map();
 function add(q,key,value){const k=groupKey(q);let g=refs.get(k);if(!g){g={q,keys:new Map()};refs.set(k,g);}const v=g.keys.get(key)??[];v.push(value);g.keys.set(key,v);}
 // Source order matches the already validated engine. Build an independent posting reference.
 for(const t of [...r.tokens].sort((a,b)=>cmp(units.get(a.unitId).editionId,units.get(b.unitId).editionId)||units.get(a.unitId).order-units.get(b.unitId).order||a.position-b.position)){
  const u=units.get(t.unitId),n=coordinates.get(t.id);assert.ok(n!==undefined);
  const ids=new Set([...(extra.get(t.id)?.lexical.components.flatMap(x=>x.lemmaId?[x.lemmaId]:[])??[]),...t.analysisIds.flatMap(id=>analyses.get(id).lemmaId?[analyses.get(id).lemmaId]:[])]);
  const providers=new Map();for(const id of ids){const x=lemmas.get(id);providers.set(JSON.stringify([x.system,x.providerKey]),x);}
  const base={kind:'concordance',editionId:u.editionId,language:t.language};
  for(const scope of [base,{...base,bookId:u.bookId}]){add({...scope,mode:'form'},t.form,n);for(const id of ids)add({...scope,mode:'lemma'},id,n);for(const x of providers.values())add({...scope,mode:'provider',system:x.system},x.providerKey,n);}
 }
 assert.equal(refs.size,36);
 const catalog={schemaVersion:1,mode:'isolated_lexical_concordance',publicationAuthorized:false,coverage:c.coverage(),lexicalSystems:l.available(),lexicalLanguages:['hbo','arc'],groups:[],details:{},chapterCatalog,lexicalAdmissions:la};
 let queries=0,postings=0,lexicalKeys=0,lexicalRefs=0,groupId=0;
 const byMode={form:{keys:0,postings:0},lemma:{keys:0,postings:0},provider:{keys:0,postings:0}};
 for(const {q,keys} of [...refs.values()].sort((a,b)=>cmp(groupKey(a.q),groupKey(b.q)))){
  const {kind,...query}=q,rank=[...keys].map(([key,x])=>({key,count:x.length})).sort((a,b)=>b.count-a.count||cmp(a.key,b.key));
  const total=rank.reduce((n,x)=>n+x.count,0);
  for(let offset=0;offset<rank.length;offset+=100){const f=c.frequency({...query,offset,limit:100});assert.equal(f.status,'disponible');assert.equal(f.totalKeys,keys.size);assert.equal(f.totalPostings,total);assert.deepEqual(f.entries,rank.slice(offset,offset+100));}
  for(const [key,values] of keys){assert.equal(new Set(values).size,values.length);const k=query.mode==='lemma'?{lemmaId:key}:{value:key};for(let offset=0;offset<values.length;offset+=100){const found=c.search({...query,...k,offset,limit:100});assert.equal(found.status,'disponible');assert.equal(found.total,values.length);assert.deepEqual(found.occurrences.map(x=>x.tokenId),values.slice(offset,offset+100).map(n=>tokenAt.get(n)));}queries++;postings+=values.length;byMode[q.mode].keys++;byMode[q.mode].postings+=values.length;}
  catalog.groups.push(buildLookupGroup(pack,groupId++,q,keys,rank));
 }
 assert.equal(queries,96493);assert.equal(postings,463364);assert.deepEqual(byMode,evidence.observed.byMode);
 refs.clear();
 const entries=new Map(model.entries.map(e=>[e.id,e]));
 for(const e of model.entries)add({kind:'lexical',mode:'identifier',system:e.system},e.providerKey,e.id);
 for(const f of model.forms)add({kind:'lexical',mode:'form',language:f.language},f.form,f.entryId);
 assert.equal(refs.size,5);
 for(const {q,keys} of [...refs.values()].sort((a,b)=>cmp(groupKey(a.q),groupKey(b.q)))){
  const {kind,...query}=q;
  for(const [key,values] of keys){const ids=[...new Set(values)].sort((a,b)=>cmp(entries.get(a).providerKey,entries.get(b).providerKey)||cmp(a,b));keys.set(key,ids);for(let offset=0;offset<ids.length;offset+=100){const result=l.search({...query,value:key,offset,limit:100});assert.equal(result.status,'disponible');assert.equal(result.total,ids.length);assert.deepEqual(result.entries.map(e=>e.id),ids.slice(offset,offset+100));}lexicalKeys++;lexicalRefs+=ids.length;}
  catalog.groups.push(buildLookupGroup(pack,groupId++,q,keys));
 }
 const detailBuckets=new Map();let forms=0,definitions=0,links=0;
 for(const e of model.entries){const d=l.detail(e.id);assert.ok(d);assert.deepEqual(d.entry,e);forms+=d.forms.length;definitions+=d.definitions.length;links+=d.links.length;const b=bucketFor(e.id,DETAIL_BUCKETS),v=detailBuckets.get(b)??[];v.push(d);detailBuckets.set(b,v);}
 assert.equal(forms,10221);assert.equal(definitions,35496);
 for(const [b,entries] of [...detailBuckets].sort((a,b)=>Number(a[0])-Number(b[0]))){entries.sort((a,b)=>cmp(a.entry.id,b.entry.id));const d=pack.put('details/bucket-'+b+'.json.gz',{bucket:b,entries});assert.deepEqual(pack.load(d).entries,entries);catalog.details[b]=d;}
 const catalogSpec=pack.put('catalog.json.gz',catalog);assert.deepEqual(pack.load(catalogSpec),catalog);
 // Exercise actual asynchronous lookup over decoded fragments; no whole-model transfer.
 const calls=[];const adapter=createPrivateLookup(catalog,async d=>{calls.push(d.path);return pack.load(d);});
 assert.equal(calls.length,0);
 for(const g of catalog.groups){const m=pack.load(g.manifest),d=Object.values(m.buckets)[0],p=pack.load(d),[key,values]=p.rows[0];calls.length=0;const v=await adapter.lookup(g.query,key,0,20);assert.equal(v.status,'available');assert.equal(v.total,values.length);assert.deepEqual(v.refs,values.slice(0,20));assert.ok(calls.length<=2);
  const missing=await adapter.lookup(g.query,'__SN_PRIVATE_NO_SUCH_KEY__');assert.equal(missing.total,0);
  if(g.query.kind==='concordance'){const {kind,...q}=g.query,expected=c.frequency({...q,offset:95,limit:20});const f=await adapter.frequency(g.query,95,20);assert.deepEqual(f.entries,expected.entries);assert.equal(f.total,expected.totalKeys);assert.equal(f.totalPostings,expected.totalPostings);}
 }
 const d=await adapter.detail(model.entries[0].id);assert.deepEqual(d,l.detail(model.entries[0].id));
 const inventory=[...pack.descriptors.values()].map(x=>({path:x.path,jsonBytes:x.jsonBytes,sha256:x.sha256})).sort((a,b)=>cmp(a.path,b.path));
 const manifestSha256=sha(Buffer.from(JSON.stringify(inventory)));
 const sizes=[...pack.descriptors.values()];
 return {catalog,catalogSpec,assets:pack.assets,descriptors:pack.descriptors,summary:{phase:'P11.4.4.4.1',books:7,chapters:168,chapterLayers:336,occurrences:78218,concordanceGroups:36,concordanceQueries:queries,postingsChecked:postings,lexicalGroups:5,lexicalKeys,lexicalRefs,lexicalEntries:30740,forms,definitions,links,fragmentFiles:sizes.length,catalogGzipBytes:catalogSpec.gzipBytes,maxGzipBytes:Math.max(...sizes.map(x=>x.gzipBytes)),maxJsonBytes:Math.max(...sizes.map(x=>x.jsonBytes)),totalGzipBytes:sizes.reduce((n,x)=>n+x.gzipBytes,0),manifestSha256,publicationAuthorized:false,corpusPersisted:false,browserCandidate:false}};
}
