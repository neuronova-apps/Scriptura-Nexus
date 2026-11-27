import assert from 'node:assert/strict';
import {loadExpandedAnalyzerData,loadAdmission} from './lib/linguistic-expansion-p11433.mjs';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
let stage='sources';
try{
 const data=await loadExpandedAnalyzerData(),r=loadAdmission();stage='engine';
 const engine=createTermAnalyzer(data.registry,data.admissions,data.supplements);
 const coverage=engine.coverage();assert.equal(coverage.length,2);assert.deepEqual(coverage.flatMap(e=>e.bookIds).sort(),r.scope.books.map(x=>'LIB-'+x).sort());
 const unitTokens=new Map();for(const t of data.registry.tokens){const list=unitTokens.get(t.unitId)??[];list.push(t);unitTokens.set(t.unitId,list);}
 stage='all references';let occurrences=0,missingNewGreek=0;const states={},books={};
 for(const u of data.registry.units){
  const ref={editionId:u.editionId,bookId:u.bookId,chapter:u.chapter,verse:u.verse},found=engine.select(ref);
  assert.equal(found.status,'disponible');const ts=unitTokens.get(u.id);assert.equal(found.occurrences.length,ts.length);
  for(const [i,t] of found.occurrences.entries()){
   assert.equal(t.id,ts[i].id);assert.equal(t.form,ts[i].form);
   const a=engine.analyze(t.id);assert.equal(a.status,'disponible');assert.equal(a.token.form,t.form);assert.deepEqual(a.reference,ref);assert.equal(a.meaning.state,'no_disponible');assert.deepEqual(a.identifiers,[]);assert.equal(a.alternatives.state,'no_evaluadas');
   occurrences++;books[u.bookId]=(books[u.bookId]??0)+1;states[t.language+':'+a.morphology.state]=(states[t.language+':'+a.morphology.state]??0)+1;
   if(['LIB-Acts','LIB-1Cor'].includes(u.bookId)&&a.morphology.state==='ausente'){assert.equal(a.lexical.direct.length,0);missingNewGreek++;}
  }
 }
 assert.equal(occurrences,78218);assert.equal(missingNewGreek,198);
 stage='pilot references';const cases=[];
 const pilot=r.verifiedProjection;assert.equal(pilot.candidateOccurrences,51468);
 const refs=[['Lev','19','28',12,0],['Deut','14','1',12,0],['Acts','2','4',16,0],['Acts','10','46',12,0],['Acts','19','6',18,1],['1Cor','12','10',14,0],['1Cor','13','8',14,0],['1Cor','14','2',16,0]];
 for(const [b,ch,v,n,missing] of refs){
  const bookId='LIB-'+b,e=coverage.find(x=>x.bookIds.includes(bookId)),s=engine.select({editionId:e.editionId,bookId,chapter:ch,verse:v});
  assert.equal(s.status,'disponible');assert.equal(s.occurrences.length,n);
  if(e.languages.includes('grc'))assert.equal(s.occurrences.filter(t=>engine.analyze(t.id).morphology.state==='ausente').length,missing);
  else assert.ok(s.occurrences.every(t=>engine.analyze(t.id).lexical.raw!==null));
  cases.push({book:b,chapter:ch,verse:v,occurrences:n,missingGreekAnnotations:missing});
 }
 stage='boundaries';assert.equal(engine.select({editionId:coverage[0].editionId,bookId:'LIB-Exod',chapter:'1',verse:'1'}).status,'fuera_de_cobertura');
 assert.equal(engine.analyze('TOK-unknown').status,'ocurrencia_no_disponible');
 console.log(JSON.stringify({phase:r.phase,editions:coverage.length,books,units:data.registry.units.length,occurrences,states,withheldNewGreek:missingNewGreek,typographicWords:data.typography.length,pilotReferences:cases,technicalAdmissions:r.newTechnicalAdmissions,publicationAuthorized:false,publicRegistryEmpty:true,corpusPersisted:false}));
}catch(e){console.error('P11.4.3.3 failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+'); source data omitted');process.exitCode=1;}
