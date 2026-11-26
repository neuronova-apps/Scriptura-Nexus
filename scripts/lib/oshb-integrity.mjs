import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateLinguisticRegistry} from '../../src/lib/linguistic-contracts.ts';
import {admittedFiles} from './linguistic-admission.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
const baseline={Gen:{chapters:50,verses:1533,words:20612,segments:4670},Dan:{chapters:12,verses:357,words:5919,segments:1077}};
const expected={units:1890,tokens:26531,hbo:22930,arc:3601,alternatives:132,alternativeWords:133,lemmas:2595,components:36749,documented:26331,partial:326,unresolved:7};
const index=rows=>{const map=new Map();for(const r of rows){assert.ok(!map.has(r.id),'ID duplicado');map.set(r.id,r);}return map;};
const incr=(o,k)=>{o[k]=(o[k]??0)+1;};
export function auditIntegrity(projections,occurrences,lexical,morphology,manifest,{fixedBaseline=false}={}){
 const admissions=admittedFiles(manifest);
 const registry=morphology.registry;
 assert.deepEqual(validateLinguisticRegistry(registry,admissions),[]);
 const units=index(registry.units),tokens=index(registry.tokens),lemmas=index(registry.lemmas),analyses=index(registry.analyses);
 const primarySeen=new Set(),allWords=new Set(),unitSeen=new Set(),providerIds=new Set(),analysisSeen=new Set(),lemmaSeen=new Set();
 const linkMap=rows=>{const m=new Map();for(const l of rows){assert.ok(!m.has(l.occurrenceId));m.set(l.occurrenceId,l);}return m;};
 const lex=linkMap(lexical.links),morph=linkMap(morphology.links);
 const side=new Map(occurrences.records.map(r=>[r.reference,r]));assert.equal(side.size,occurrences.records.length);
 const books={},unicode={forms:0,codePoints:0,combiningMarks:0,nonNfc:0},pendingMorph=[],variantIssues=[],structureInventory=[];
 const count={units:0,tokens:0,hbo:0,arc:0,unknown:0,alternatives:0,alternativeWords:0,lemmas:lemmas.size,components:0,documented:0,partial:0,unresolved:0,absent:0,segments:0,missingProviderId:0};
 function checkForm(source,target){
  assert.equal(target,source,'Forma original modificada');
  assert.ok(typeof target==='string'&&target.trim()&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd\ud800-\udfff]/u.test(target),'Unicode inválido');
  assert.equal(Buffer.from(target,'utf8').toString('utf8'),target);
  unicode.forms++;unicode.codePoints+=[...target].length;
  unicode.combiningMarks+=(target.match(/\p{M}/gu)??[]).length;
  if(target!==target.normalize('NFC'))unicode.nonNfc++;
 }
 function checkWord(source,w,unit,layer,position){
  assert.ok(!allWords.has(w.id));allWords.add(w.id);
  checkForm(source.form,w.form);
  for(const k of ['providerId','lemmaRaw','morphRaw'])assert.equal(w[k],source[k],k+' alterado');
  if(source.providerId===null)count.missingProviderId++;
  else{assert.ok(!providerIds.has(source.providerId),'ID proveedor duplicado');providerIds.add(source.providerId);}
  const l=lex.get(w.id),m=morph.get(w.id);
  assert.ok(l&&m&&l.unitId===unit.id&&m.unitId===unit.id&&l.layer===layer&&m.layer===layer,'Relación huérfana');
  assert.equal(l.raw,w.lemmaRaw);assert.equal(m.raw,w.morphRaw);
  assert.equal(l.language,w.language);assert.equal(m.language,w.language);
  assert.deepEqual(l.origin,w.lemmaOrigin);assert.deepEqual(m.origin,w.morphOrigin);
  assert.ok(w.origin.fileId===unit.origin.fileId&&w.origin.commit===unit.origin.commit&&w.origin.sha256===unit.origin.sha256);
  if(l.raw!==null)assert.equal(l.components.map(c=>c.code).join('/'),l.raw);
  for(const [i,c] of l.components.entries()){
   count.components++;assert.equal(c.position,i);
   if(c.lemmaId){const le=lemmas.get(c.lemmaId);assert.ok(le&&le.providerKey===c.code&&le.language===w.language);lemmaSeen.add(le.id);}
  }
  if(m.components.length)assert.equal(m.components.map(c=>c.code).join('/'),m.raw.slice(1));
  assert.ok(['documented','partial','unresolved','absent'].includes(m.state));count[m.state]++;
  if(m.state!=='documented')pendingMorph.push({reference:unit.origin.locator,occurrenceId:w.id,layer,language:w.language,code:m.raw,state:m.state,components:m.components.filter(c=>c.state!=='documented').map(c=>({position:c.position,code:c.code,state:c.state,unknownFields:c.unknownFields})),reason:m.state==='absent'?'sin anotación':m.state==='partial'?'componentes o valores pendientes':'código no resuelto'});
  if(layer==='primary'){
   assert.equal(w.position,position);count[w.language??'unknown']++;
   const t=tokens.get(w.id);
   if(w.language!==null){assert.ok(t&&t.unitId===unit.id&&t.position===position&&t.language===w.language);assert.equal(t.form,w.form);assert.deepEqual(t.origin,w.origin);primarySeen.add(t.id);count.tokens++;}
   else assert.equal(t,undefined);
   if(m.analysisId!==null){const a=analyses.get(m.analysisId);assert.ok(a&&t&&a.tokenId===t.id&&t.analysisIds.includes(a.id)&&a.code===m.raw);assert.deepEqual(a.origin,m.origin);assert.ok(!analysisSeen.has(a.id));analysisSeen.add(a.id);}
   if(t)assert.deepEqual(t.analysisIds,m.analysisId===null?[]:[m.analysisId]);
  }else{count.alternativeWords++;assert.equal(w.position,position);assert.equal(tokens.has(w.id),false);assert.equal(m.analysisId,null);}
 }
 for(const p of projections){
  assert.ok(!Object.hasOwn(books,p.book));
  const b={chapters:p.chapters.length,verses:0,words:0,segments:0};books[p.book]=b;
  const coverage=[];
  for(const [ci,ch] of p.chapters.entries()){
   assert.equal(ch.reference,p.book+'.'+(ci+1),'Capítulo discontinuo');
   coverage.push({chapter:ch.reference,verses:ch.verses.length});
   for(const v of ch.verses){
    b.verses++;count.units++;
    const r=side.get(v.reference),u=units.get(r?.unitId);
    assert.ok(r&&u&&!unitSeen.has(u.id)&&u.origin.locator===v.reference&&u.origin.fileId===p.source.fileId&&u.order===count.units-1,'Unidad incoherente');
    unitSeen.add(u.id);assert.equal(r.events.length,v.events.length);
    let position=0;
    for(const [i,e] of v.events.entries()){
     const w=r.events[i];assert.equal(w.eventIndex,i);assert.equal(w.kind,e.kind);assert.equal(w.type,e.type);
     if(e.kind==='segment'){checkForm(e.form,w.form);b.segments++;count.segments++;}
     else{checkWord(e,w,u,'primary',position++);b.words++;}
    }
    assert.equal(r.alternatives.length,(v.alternatives??[]).length);
    for(const [i,a] of (v.alternatives??[]).entries()){
     const q=r.alternatives[i];count.alternatives++;
     assert.equal(q.afterEvent,a.afterEvent);assert.equal(q.words.length,a.words.length);
     const anchor=r.events[a.afterEvent];
     if(q.anchorId===null)variantIssues.push({reference:v.reference,id:q.id,reason:'anclaje pendiente'});
     else assert.ok(anchor&&anchor.id===q.anchorId&&anchor.type==='x-ketiv');
     for(const [j,w] of a.words.entries())checkWord(w,q.words[j],u,'alternative',j);
    }
   }
  }
  structureInventory.push({book:p.book,coverage,pending:p.pendingStructures});
  if(fixedBaseline)assert.deepEqual(b,baseline[p.book]);
 }
 assert.equal(unitSeen.size,units.size);assert.equal(primarySeen.size,tokens.size);assert.equal(analysisSeen.size,analyses.size);assert.equal(lemmaSeen.size,lemmas.size);
 assert.equal(allWords.size,lex.size);assert.equal(allWords.size,morph.size);
 assert.equal(registry.identifiers.length,0);assert.equal(registry.morphCodes.length,0);
 if(fixedBaseline){assert.deepEqual(Object.keys(books),['Gen','Dan']);for(const [k,v] of Object.entries(expected))assert.equal(count[k],v,'Regresión de línea base: '+k);}
 const pendingGroups={};for(const m of pendingMorph)incr(pendingGroups,JSON.stringify([m.language,m.code,m.state,m.reason]));
 const grouped=Object.entries(pendingGroups).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,occurrences])=>({key:JSON.parse(key),occurrences}));
 return {schemaVersion:1,books,counts:count,unicode,structureInventory,pendingMorph,grouped,variantIssues,unresolvedPolicy:'No se corrigen códigos por inferencia; notas no admitidas no se copian.',integrity:'verified'};
}
export function summarizeIntegrity(a){
 return {books:a.books,counts:a.counts,unicode:a.unicode,structures:a.structureInventory.map(({book,pending})=>({book,pending})),pendingMorphology:a.pendingMorph.length,pendingCodeGroups:a.grouped,unanchoredVariants:a.variantIssues.length,sha256:hash(a)};
}
