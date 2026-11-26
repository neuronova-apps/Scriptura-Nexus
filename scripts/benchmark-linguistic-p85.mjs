// P8.5.2: private data only; aggregate timing and sizes, no corpus output.
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {loadVerifiedAnalyzerData} from './lib/term-analyzer-validation-data.mjs';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
import {createConcordance} from '../src/lib/concordance.ts';
import {createLexicalQuery} from '../src/lib/lexical-query.ts';
const round=n=>Math.round(n*1000)/1000;
const stats=xs=>{const s=[...xs].sort((a,b)=>a-b);return {samples:s.length,p50ms:round(s[Math.ceil(s.length*.5)-1]),p95ms:round(s[Math.ceil(s.length*.95)-1]),maxMs:round(s.at(-1))};};
const memory=()=>{global.gc?.();const x=process.memoryUsage();return {heapUsedMiB:round(x.heapUsed/1048576),rssMiB:round(x.rss/1048576)};};
const timing=(fn,n=30)=>{for(let i=0;i<3;i++)fn(i);const samples=[];for(let i=0;i<n;i++){const t=performance.now();fn(i);samples.push(performance.now()-t);}return stats(samples);};
const size=x=>gzipSync(Buffer.from(JSON.stringify(x)),{level:6}).length;
const py=`
import importlib.util,json
s=importlib.util.spec_from_file_location('model','scripts/project-lexical-model-p84.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
roots,ds,_=m.load_verified()
model=m.project(roots,ds,True);m.validate_model(model,ds,True)
assert m.digest(model)=='26c8e8897f24c1991180cbbf0c0796afa130a6f6a088b1039cf69f137fe73f62'
print(json.dumps({'model':model,'admissions':[{k:d[k] for k in ('id','commit','sha256','allowedComponents','selectors')} for d in ds]},ensure_ascii=False,separators=(',',':')))
`;
let stage='source';
try{
 const data=await loadVerifiedAnalyzerData();
 const lexData=JSON.parse(execFileSync('python3',['-c',py],{encoding:'utf8',timeout:240000,maxBuffer:128*1024*1024,stdio:['ignore','pipe','pipe']}));
 assert.equal(data.registry.tokens.length,26750);assert.equal(lexData.model.entries.length,30740);
 const initial=memory(),construction={},measure=(name,fn)=>{const start=performance.now(),v=fn();construction[name]=round(performance.now()-start);return v;};
 stage='construct';
 const a=measure('analyzer',()=>createTermAnalyzer(data.registry,data.admissions,data.supplements));
 const c=measure('concordance',()=>createConcordance(data.registry,data.admissions,data.supplements));
 const l=measure('lexicon',()=>createLexicalQuery(lexData.model,lexData.admissions));
 const retained=memory();
 const queryCases=[],freqCases=[],lexCases=[],analysisCases=[];
 const units=new Map(data.registry.units.map(u=>[u.id,u]));
 for(const lang of ['hbo','arc','grc']){
  const edition=c.coverage().find(e=>e.languages.includes(lang));
  const scope={editionId:edition.editionId,language:lang};
  const tokens=data.registry.tokens.filter(t=>t.language===lang);
  for(const t of [tokens[0],tokens[Math.floor(tokens.length/2)],tokens.at(-1)])analysisCases.push(t.id);
  for(const mode of ['form','lemma','provider']){
   const fq={...scope,mode,...(mode==='provider'?{system:lang==='grc'?'MorphGNT-lemma':'OSHB-lemma'}:{})};
   const f=c.frequency({...fq,limit:100});assert.ok(f.entries.length);
   freqCases.push({...fq,limit:100});
   const k=f.entries[0].key, q={...fq,...(mode==='lemma'?{lemmaId:k}:{value:k}),limit:100};
   const hits=c.search(q);assert.ok(hits.occurrences.length);
   queryCases.push(q,{...q,bookId:hits.occurrences[0].bookId});
   if(hits.nextOffset!==null)queryCases.push({...q,offset:hits.nextOffset});
  }
 }
 for(const lang of ['hbo','arc']){const f=lexData.model.forms.find(x=>x.language===lang);lexCases.push({mode:'form',language:lang,value:f.form,limit:100});}
 lexCases.push({mode:'form',language:'grc',value:'α',limit:100});
 for(const system of ['index','strong','bdb']){const e=lexData.model.entries.find(x=>x.system===system);lexCases.push({mode:'identifier',system,value:e.providerKey,limit:100});}
 const detailCases=['index','strong','bdb'].map(s=>lexData.model.entries.find(e=>e.system===s).id);
 // Include entry with most definitions and one with most relations; counts only, no content logged.
 for(const [rows,key] of [[lexData.model.definitions,'entryId'],[lexData.model.links,'sourceEntryId']]){
  const counts=new Map();for(const row of rows)if(row[key])counts.set(row[key],(counts.get(row[key])??0)+1);
  const max=[...counts].sort((a,b)=>b[1]-a[1])[0];if(max)detailCases.push(max[0]);
 }
 const suites={
  analyze:analysisCases.map(id=>()=>a.analyze(id)),
  select:analysisCases.map(id=>{const t=data.registry.tokens.find(t=>t.id===id),u=units.get(t.unitId);return ()=>a.select({editionId:u.editionId,bookId:u.bookId,chapter:u.chapter,verse:u.verse});}),
  concordance:queryCases.map(q=>()=>c.search(q)),frequency:freqCases.map(q=>()=>c.frequency(q)),
  lexicalSearch:lexCases.map(q=>()=>l.search(q)),lexicalDetail:detailCases.map(id=>()=>l.detail(id))
 };
 stage='benchmark';
 const queries={};let maxFragmentBytes=0;
 for(const [name,cases] of Object.entries(suites)){
  let max=0;for(const fn of cases)max=Math.max(max,size(fn()));
  maxFragmentBytes=Math.max(maxFragmentBytes,max);
  queries[name]={cases:cases.length,...timing(i=>cases[i%cases.length](),60),maxGzipBytes:max};
 }
 // Validate exact equality with the prior implementation at the pinned base, supplied
 // by CI from git show into a temporary code file next to this module (no corpus).
 stage='comparison';
 const oldPath=process.env.P852_BASELINE_MODULE;assert.ok(oldPath);
 const {createLexicalQuery:prior}=await import(oldPath);
 const old=prior(lexData.model,lexData.admissions);
 for(const q of lexCases)assert.deepEqual(old.search(q),l.search(q));
 for(const id of detailCases)assert.deepEqual(old.detail(id),l.detail(id));
 assert.deepEqual(old.available(),l.available());
 // Same cases, alternating order, batch measurements to reduce timer noise.
 const before=[],after=[];
 for(let i=0;i<10;i++){for(const q of lexCases){old.search(q);l.search(q);}}
 for(let r=0;r<30;r++){
  const run=engine=>{const t=performance.now();for(let i=0;i<20;i++)for(const q of lexCases)engine.search(q);return (performance.now()-t)/(20*lexCases.length);};
  if(r%2===0){before.push(run(old));after.push(run(l));}else{after.push(run(l));before.push(run(old));}
 }
 console.log(JSON.stringify({mode:'P8.5.2-private-benchmark',node:process.version,occurrences:data.registry.tokens.length,lexicalEntries:lexData.model.entries.length,constructionMs:construction,memoryBeforeEngines:initial,memoryWithThreeEngines:retained,queries,maxFragmentGzipBytes:maxFragmentBytes,fragmentBudgetBytes:250*1024,fragmentSamplePass:maxFragmentBytes<=250*1024,comparison:{baseline:'145290def901b3c1567828279715c426259a7b3c',cases:lexCases.length,batchSize:20*lexCases.length,baselinePerQuery:stats(before),optimizedPerQuery:stats(after),responsesEqual:true},published:0,persisted:0},null,2));
}catch{throw new Error('P8.5.2 private benchmark failed at '+stage+'; data omitted');}
