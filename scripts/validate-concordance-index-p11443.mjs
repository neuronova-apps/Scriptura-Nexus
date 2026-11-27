import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateIndexPlan} from './lib/concordance-index-plan-p11443.mjs';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {createConcordance} from '../src/lib/concordance.ts';
let stage='sources';
try{
 const plan=validateIndexPlan();
 const {registry:r,admissions,supplements,withheld}=await loadExpandedAnalyzerData();
 assert.equal(withheld,198);assert.equal(r.identifiers.length,0);assert.equal(r.units.length,5162);assert.equal(r.editions.length,2);
 stage='build-index';const c=createConcordance(r,admissions,supplements);
 const units=new Map(r.units.map(x=>[x.id,x])),lemmas=new Map(r.lemmas.map(x=>[x.id,x])),analyses=new Map(r.analyses.map(x=>[x.id,x])),extra=new Map(supplements.map(x=>[x.tokenId,x]));
 const expected=new Map(),books={},languageCounts={hbo:0,arc:0,grc:0};let annotated=0;
 const tokenIds=new Set();
 const add=(q,key,t)=>{
  const id=JSON.stringify(q);let g=expected.get(id);if(!g){g={q,keys:new Map()};expected.set(id,g);}
  const list=g.keys.get(key)??[];list.push(t);g.keys.set(key,list);
 };
 for(const t of r.tokens){
  const u=units.get(t.unitId);assert.ok(u&&!tokenIds.has(t.id));tokenIds.add(t.id);const b=u.bookId.slice(4);books[b]=(books[b]??0)+1;languageCounts[t.language]++;
  const ids=new Set([...(extra.get(t.id)?.lexical.components.flatMap(x=>x.lemmaId?[x.lemmaId]:[])??[]),...t.analysisIds.flatMap(id=>analyses.get(id).lemmaId?[analyses.get(id).lemmaId]:[])]);
  if(ids.size)annotated++;
  const keys=new Map();for(const id of ids){const l=lemmas.get(id);keys.set(JSON.stringify([l.system,l.providerKey]),l);}
  const base={editionId:u.editionId,language:t.language};
  for(const scope of [base,{...base,bookId:u.bookId}]){
   add({...scope,mode:'form'},t.form,t);
   for(const id of ids)add({...scope,mode:'lemma'},id,t);
   for(const l of keys.values())add({...scope,mode:'provider',system:l.system},l.providerKey,t);
  }
 }
 assert.deepEqual(books,plan.scope.bookOccurrences);assert.deepEqual(languageCounts,plan.observed.sample.languageCounts);assert.equal(annotated,76732);assert.equal(r.tokens.length-annotated,1486);
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
   assert.equal(f.nextOffset,offset+100<keys.size?offset+100:null);
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
    for(const hit of result.occurrences){const t=ordered[n++];assert.ok(t);const u=units.get(t.unitId);assert.deepEqual([hit.tokenId,hit.form,hit.language,hit.direction,hit.editionId,hit.bookId,hit.chapter,hit.verse,hit.unitId,hit.unitOrder,hit.position],[t.id,t.form,t.language,t.direction,u.editionId,u.bookId,u.chapter,u.verse,u.id,u.order,t.position]);assert.deepEqual(hit.origin,t.origin);
     const ids=new Set([...(extra.get(t.id)?.lexical.components.flatMap(x=>x.lemmaId?[x.lemmaId]:[])??[]),...t.analysisIds.flatMap(id=>analyses.get(id).lemmaId?[analyses.get(id).lemmaId]:[])]);
     assert.deepEqual([...new Set(hit.lemmas.map(l=>l.lemmaId))].sort(),[...ids].sort());
     for(const l of hit.lemmas){const original=lemmas.get(l.lemmaId);assert.ok(original);assert.deepEqual([l.system,l.providerKey,l.form,l.origin],[original.system,original.providerKey,original.form,original.origin]);}
     hash.update(JSON.stringify(hit.tokenId));}
    assert.equal(result.nextOffset,off+100<ordered.length?off+100:null);
    off=result.nextOffset;
   }while(off!==null);
   assert.equal(n,ordered.length);queries++;postings+=n;byMode[q.mode].keys++;byMode[q.mode].postings+=n;
  }
 }
 stage='reconcile';
 assert.equal(r.tokens.length,78218);assert.equal(formEditionPostings,78218);assert.equal(formBookPostings,78218);assert.equal(queries,editionKeys+bookKeys);
 for(const e of c.coverage())for(const language of e.languages){assert.equal(c.frequency({editionId:e.editionId,language,mode:'provider',system:'Strong'}).status,'sistema_no_disponible');}
 assert.equal(c.frequency({editionId:'TXT-none',language:'hbo',mode:'form'}).totalKeys,null);
 let absenceChecks=0;
 for(const e of c.coverage())for(const language of e.languages){
  const q={editionId:e.editionId,language,mode:'form'};
  const missing=c.search({...q,value:'__SN_P11443_NO_MATCH__'});assert.equal(missing.status,'disponible');assert.equal(missing.total,0);
  const unavailable=c.search({...q,bookId:'LIB-NotInScope',value:'__SN_P11443_NO_MATCH__'});assert.equal(unavailable.status,'libro_fuera_de_cobertura');assert.equal(unavailable.total,null);
  const noLemma=c.search({editionId:e.editionId,language,mode:'lemma',lemmaId:'LEM-no-such-id'});assert.equal(noLemma.status,'lema_no_disponible');assert.equal(noLemma.total,null);
  const noStrong=c.search({editionId:e.editionId,language,mode:'provider',system:'Strong',value:'G1'});assert.equal(noStrong.status,'sistema_no_disponible');assert.equal(noStrong.total,null);
  absenceChecks+=4;
 }
 console.log(JSON.stringify({phase:'P11.4.4.3',mode:'private-exhaustive-concordance',booksVerified:Object.keys(books).length,bookOccurrences:books,languageCounts,occurrencesWithAdmittedLemma:annotated,occurrencesWithoutAdmittedLemma:r.tokens.length-annotated,absenceChecks,publicationAuthorized:false,editions:r.editions.length,units:r.units.length,occurrences:r.tokens.length,frequencyScopes:scopeCount,editionKeys,bookKeys,verifiedQueries:queries,postingsChecked:postings,formEditionPostings,formBookPostings,byMode,sha256:hash.digest('hex'),persisted:0,published:0,crossVersionLinks:0,semanticEquivalences:0},null,2));
}catch{throw new Error('P11.4.4.3 validation failed at '+stage+'; corpus omitted');}
