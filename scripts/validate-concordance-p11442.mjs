import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {createConcordance} from '../src/lib/concordance.ts';
let stage='sources';
try{
 const {registry:r,admissions,supplements}=await loadExpandedAnalyzerData();
 stage='model';const c=createConcordance(r,admissions,supplements);
 const u=new Map(r.units.map(x=>[x.id,x])),l=new Map(r.lemmas.map(x=>[x.id,x])),a=new Map(r.analyses.map(x=>[x.id,x])),s=new Map(supplements.map(x=>[x.tokenId,x]));
 const groups=new Map();const qmap=new Map();const languageCounts={hbo:0,arc:0,grc:0};let annotated=0;
 // Independent reference counts from admitted records, with deduplication per token.
 const add=(q,t)=>{const k=JSON.stringify(q);qmap.set(k,q);const list=groups.get(k)??[];list.push(t);groups.set(k,list);};
 for(const t of r.tokens){
  const unit=u.get(t.unitId);const common={editionId:unit.editionId,language:t.language};
  languageCounts[t.language]++;
  add({...common,mode:'form',value:t.form},t);
  const ids=new Set([...(s.get(t.id)?.lexical.components.flatMap(x=>x.lemmaId?[x.lemmaId]:[])??[]),...t.analysisIds.flatMap(id=>a.get(id).lemmaId?[a.get(id).lemmaId]:[])]);
  if(ids.size)annotated++;
  for(const id of ids)add({...common,mode:'lemma',lemmaId:id},t);
  const provider=new Map();for(const id of ids){const x=l.get(id);provider.set(JSON.stringify([x.system,x.providerKey]),x);}
  for(const x of provider.values())add({...common,mode:'provider',system:x.system,value:x.providerKey},t);
 }
 stage='reference cases';
 const plan=JSON.parse(readFileSync('docs/P11/registro-propuesta-lexica-p11442.json','utf8'));
 assert.equal(plan.decision.publicationAuthorized,false);assert.equal(plan.decision.automaticCorpusLinks,false);
 assert.equal(r.tokens.length,78218);assert.equal(r.units.length,5162);assert.equal(r.editions.length,2);
 const books={};for(const t of r.tokens){const b=u.get(t.unitId).bookId.slice(4);books[b]=(books[b]??0)+1;}
 assert.deepEqual(books,plan.concordance.bookOccurrences);assert.equal(languageCounts.grc,25443);assert.equal(languageCounts.hbo+languageCounts.arc,52775);
 assert.equal(r.identifiers.length,0);assert.equal(new Set(r.tokens.map(t=>t.id)).size,78218);
 // Deterministic sample of 3 query types x 3 languages, up to 12 cases each:
 // most frequent, least frequent, and evenly spaced exact keys; full pagination.
 const hash=createHash('sha256');let queries=0,occurrences=0,bookQueries=0;
 const samples=new Map();
 for(const [key,q] of qmap){const g=q.language+':'+q.mode;const ar=samples.get(g)??[];ar.push(key);samples.set(g,ar);}
 for(const keys of samples.values()){
  keys.sort((x,y)=>groups.get(y).length-groups.get(x).length||(x<y?-1:x>y?1:0));
  const picked=new Set([keys[0],keys.at(-1)]);
  for(let i=0;i<10;i++)picked.add(keys[Math.floor(i*(keys.length-1)/9)]);
  for(const k of picked){
   const q=qmap.get(k);const expected=groups.get(k).slice().sort((x,y)=>u.get(x.unitId).order-u.get(y.unitId).order||x.position-y.position);
   const found=[];let offset=0;
   do{
    const result=c.search({...q,offset,limit:100});
    assert.equal(result.status,'disponible');assert.equal(result.total,expected.length);
    for(const hit of result.occurrences){
     const t=expected[found.length];assert.ok(t&&hit.tokenId===t.id&&hit.form===t.form&&hit.language===t.language&&hit.direction===t.direction&&hit.origin.sha256===t.origin.sha256);
     found.push(hit.tokenId);hash.update(JSON.stringify(hit),'utf8');
    }
    offset=result.nextOffset;
   }while(offset!==null);
   assert.equal(found.length,expected.length);assert.equal(new Set(found).size,found.length);
   const bookId=u.get(expected[0].unitId).bookId;
   assert.equal(c.search({...q,bookId,limit:1}).total,expected.filter(t=>u.get(t.unitId).bookId===bookId).length);bookQueries++;
   queries++;occurrences+=found.length;
  }
 }
 stage='book coverage';
 let booksVerified=0;
 for(const book of plan.concordance.books){
  const t=r.tokens.find(t=>u.get(t.unitId).bookId==='LIB-'+book);assert.ok(t);
  const unit=u.get(t.unitId),q={editionId:unit.editionId,language:t.language,bookId:unit.bookId,mode:'form',value:t.form};
  const expected=r.tokens.filter(x=>x.language===t.language&&x.form===t.form&&u.get(x.unitId).bookId===unit.bookId&&u.get(x.unitId).editionId===unit.editionId);
  const actual=c.search({...q,limit:100});assert.equal(actual.status,'disponible');assert.equal(actual.total,expected.length);assert.ok(actual.occurrences.length>0);booksVerified++;
 }
 assert.equal(booksVerified,7);
 stage='absence';
 for(const e of c.coverage())for(const language of e.languages){assert.equal(c.search({editionId:e.editionId,language,mode:'provider',system:'Strong',value:'H1'}).status,'sistema_no_disponible');}
 assert.equal(c.search({editionId:'TXT-none',language:'grc',mode:'form',value:'α'}).total,null);
 console.log(JSON.stringify({phase:'P11.4.4.2',mode:'private-sampled-concordance',booksVerified,bookOccurrences:books,publicationAuthorized:false,editions:r.editions.length,units:r.units.length,occurrences:r.tokens.length,languageCounts,occurrencesWithAdmittedLemma:annotated,occurrencesWithoutAdmittedLemma:r.tokens.length-annotated,queryGroups:samples.size,verifiedQueries:queries,bookQueries,returnedOccurrencesChecked:occurrences,sha256:hash.digest('hex'),crossVersionLinks:0,semanticEquivalences:0,persisted:0,published:0},null,2));
}catch{throw new Error('P11.4.4.2 validation failed at '+stage+'; source content omitted');}
