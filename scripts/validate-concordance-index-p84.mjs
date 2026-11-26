import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadVerifiedAnalyzerData} from './lib/term-analyzer-validation-data.mjs';
import {createConcordance} from '../src/lib/concordance.ts';
let stage='sources';
try{
 const {registry:r,admissions,supplements}=await loadVerifiedAnalyzerData();
 stage='build-index';const c=createConcordance(r,admissions,supplements);
 const units=new Map(r.units.map(x=>[x.id,x])),lemmas=new Map(r.lemmas.map(x=>[x.id,x])),analyses=new Map(r.analyses.map(x=>[x.id,x])),extra=new Map(supplements.map(x=>[x.tokenId,x]));
 const expected=new Map();
 const add=(q,key,t)=>{
  const id=JSON.stringify(q);let g=expected.get(id);if(!g){g={q,keys:new Map()};expected.set(id,g);}
  const list=g.keys.get(key)??[];list.push(t);g.keys.set(key,list);
 };
 for(const t of r.tokens){
  const u=units.get(t.unitId);
  const ids=new Set([...(extra.get(t.id)?.lexical.components.flatMap(x=>x.lemmaId?[x.lemmaId]:[])??[]),...t.analysisIds.flatMap(id=>analyses.get(id).lemmaId?[analyses.get(id).lemmaId]:[])]);
  const keys=new Map();for(const id of ids){const l=lemmas.get(id);keys.set(JSON.stringify([l.system,l.providerKey]),l);}
  const base={editionId:u.editionId,language:t.language};
  for(const scope of [base,{...base,bookId:u.bookId}]){
   add({...scope,mode:'form'},t.form,t);
   for(const id of ids)add({...scope,mode:'lemma'},id,t);
   for(const l of keys.values())add({...scope,mode:'provider',system:l.system},l.providerKey,t);
  }
 }
 stage='exhaustive';
 const cmp=(a,b)=>a<b?-1:a>b?1:0;
 const hash=createHash('sha256'),byMode={form:{keys:0,postings:0},lemma:{keys:0,postings:0},provider:{keys:0,postings:0}};
 let scopeCount=0,queries=0,postings=0,formEditionPostings=0,formBookPostings=0,editionKeys=0,bookKeys=0;
 for(const {q,keys} of [...expected.values()].sort((a,b)=>cmp(JSON.stringify(a.q),JSON.stringify(b.q)))){
  const ranking=[...keys].map(([key,hits])=>({key,count:hits.length})).sort((a,b)=>b.count-a.count||cmp(a.key,b.key));
  const sum=ranking.reduce((n,x)=>n+x.count,0);
  let offset=0,seen=0;
  do{
   const f=c.frequency({...q,offset,limit:100});
   assert.equal(f.status,'disponible');assert.equal(f.totalKeys,keys.size);assert.equal(f.totalPostings,sum);
   for(const entry of f.entries){assert.deepEqual(entry,ranking[seen++]);hash.update(JSON.stringify([q,entry]));}
   offset=f.nextOffset;
  }while(offset!==null);
  assert.equal(seen,ranking.length);scopeCount++;
  if(q.bookId===undefined)editionKeys+=keys.size;else bookKeys+=keys.size;
  if(q.mode==='form'){if(q.bookId===undefined)formEditionPostings+=sum;else formBookPostings+=sum;}
  for(const [key,list] of keys){
   const keyQuery=q.mode==='lemma'?{lemmaId:key}:{value:key};
   const ordered=list.slice().sort((a,b)=>units.get(a.unitId).order-units.get(b.unitId).order||a.position-b.position);
   assert.equal(new Set(ordered.map(t=>t.id)).size,ordered.length);
   let off=0,n=0;
   do{
    const result=c.search({...q,...keyQuery,offset:off,limit:100});
    assert.equal(result.status,'disponible');assert.equal(result.total,ordered.length);
    for(const hit of result.occurrences){const t=ordered[n++];assert.ok(t&&t.id===hit.tokenId&&t.form===hit.form&&t.language===hit.language&&t.origin.sha256===hit.origin.sha256);hash.update(JSON.stringify(hit.tokenId));}
    off=result.nextOffset;
   }while(off!==null);
   assert.equal(n,ordered.length);queries++;postings+=n;byMode[q.mode].keys++;byMode[q.mode].postings+=n;
  }
 }
 stage='reconcile';
 assert.equal(r.tokens.length,26750);assert.equal(formEditionPostings,26750);assert.equal(formBookPostings,26750);assert.equal(queries,editionKeys+bookKeys);
 for(const e of c.coverage())for(const language of e.languages){assert.equal(c.frequency({editionId:e.editionId,language,mode:'provider',system:'Strong'}).status,'sistema_no_disponible');}
 assert.equal(c.frequency({editionId:'TXT-none',language:'hbo',mode:'form'}).totalKeys,null);
 console.log(JSON.stringify({mode:'P8.4.5-internal-only',editions:r.editions.length,units:r.units.length,occurrences:r.tokens.length,frequencyScopes:scopeCount,editionKeys,bookKeys,verifiedQueries:queries,postingsChecked:postings,formEditionPostings,formBookPostings,byMode,sha256:hash.digest('hex'),persisted:0,published:0,crossVersionLinks:0,semanticEquivalences:0},null,2));
}catch{throw new Error('P8.4.5 validation failed at '+stage+'; corpus omitted');}
