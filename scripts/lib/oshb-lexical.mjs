import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateLinguisticRegistry} from '../../src/lib/linguistic-contracts.ts';
import {admittedFiles} from './linguistic-admission.mjs';
const digest=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
const system='OSHB-lemma';
const version='2.2';
const sourceCommit='6a5db284c715c18b239422e57bb89684e6a19f00';

// Preserve provider codes exactly. A numeric base is not an approved Strong mapping.
export function splitLemma(raw){
 if(raw===null)return {state:'absent',parts:[]};
 assert.equal(typeof raw,'string');
 const parts=raw.split('/').map((code,position)=>{
  const m=/^([0-9]+)(?: ([a-f]))?(\+)?$/.exec(code);
  if(m)return {position,code,kind:'numeric',base:m[1],homograph:m[2]??null,extension:m[3]??null};
  if(/^[a-z]$/.test(code))return {position,code,kind:'alphabetic',base:null,homograph:null,extension:null};
  return {position,code,kind:'unresolved',base:null,homograph:null,extension:null};
 });
 return {state:parts.some(p=>p.kind==='unresolved')?'partial':'parsed',parts};
}

export function organizeLexical(occurrences,manifest){
 const admissions=admittedFiles(manifest),registry=structuredClone(occurrences.registry);
 assert.equal(registry.lemmas.length,0);assert.equal(registry.identifiers.length,0);
 const admitted=new Map(admissions.map(x=>[x.id,x]));
 const tokens=new Map(registry.tokens.map(t=>[t.id,t]));
 const seen=new Set(),lemmas=new Map(),links=[],counts={primary:0,alternative:0,absent:0,partial:0,unknownLanguage:0,components:0,unresolvedComponents:0,numeric:0,alphabetic:0,extended:0,homograph:0};
 function visit(w,unitId,layer){
  assert.ok(!seen.has(w.id),'Ocurrencia léxica duplicada');seen.add(w.id);counts[layer]++;
  const p=splitLemma(w.lemmaRaw);
  if(p.state==='absent')counts.absent++;
  if(p.state==='partial')counts.partial++;
  if(w.language===null)counts.unknownLanguage++;
  if(layer==='primary'&&w.language!==null){const t=tokens.get(w.id);assert.ok(t&&t.unitId===unitId&&t.language===w.language);}
  if(w.lemmaRaw!==null){
   const o=w.lemmaOrigin,f=admitted.get(o?.fileId);
   assert.ok(f&&f.commit===sourceCommit&&o.commit===f.commit&&o.sha256===f.sha256&&o.component==='anotaciones_lema'&&f.allowedComponents.includes(o.component)&&typeof o.locator==='string'&&o.locator.length,'Anotación léxica sin admisión');
  }
  const components=p.parts.map(part=>{
   counts.components++;
   if(part.kind==='unresolved')counts.unresolvedComponents++;
   else counts[part.kind]++;
   if(part.extension!==null)counts.extended++;
   if(part.homograph!==null)counts.homograph++;
   let lemmaId=null;
   if(part.kind==='numeric'&&w.language!==null){
    assert.ok(['hbo','arc'].includes(w.language));
    lemmaId='LEM-'+digest([system,version,sourceCommit,w.language,part.code]);
    if(!lemmas.has(lemmaId))lemmas.set(lemmaId,{id:lemmaId,language:w.language,form:null,homograph:part.homograph,providerKey:part.code,system,origin:{...w.lemmaOrigin}});
   }
   return {...part,lemmaId,strongCandidate:part.kind==='numeric'?'H'+part.base:null,
     strongState:part.kind==='numeric'?'pending-evidence-and-admission':'not-applicable'};
  });
  links.push({occurrenceId:w.id,unitId,layer,language:w.language,raw:w.lemmaRaw,origin:w.lemmaOrigin,state:p.state,components});
 }
 for(const u of occurrences.records){
  for(const e of u.events)if(e.kind==='word')visit(e,u.unitId,'primary');
  for(const a of u.alternatives)for(const w of a.words)visit(w,u.unitId,'alternative');
 }
 registry.lemmas=[...lemmas.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 const byId=new Map(registry.lemmas.map(l=>[l.id,l]));
 for(const link of links)for(const c of link.components)if(c.lemmaId){
  const lemma=byId.get(c.lemmaId);
  assert.ok(lemma&&lemma.language===link.language&&lemma.providerKey===c.code);
 }
 assert.equal(links.length,counts.primary+counts.alternative);
 assert.equal(counts.primary,occurrences.counts.hbo+occurrences.counts.arc+occurrences.counts.unknown);
 assert.equal(counts.alternative,occurrences.counts.alternativeWords);
 assert.equal(counts.components,counts.numeric+counts.alphabetic+counts.unresolvedComponents);
 assert.deepEqual(validateLinguisticRegistry(registry,admissions),[]);
 return {schemaVersion:1,registry,links,counts,policy:'Provider lexical keys only; Strong candidates are not admitted identifiers; lemma forms unknown.'};
}
export function summarizeLexical(r){
 const primary=new Set(),alternative=new Set();
 for(const l of r.links)for(const c of l.components)if(c.lemmaId)(l.layer==='primary'?primary:alternative).add(c.lemmaId);
 return {...r.counts,lemmas:r.registry.lemmas.length,primaryLemmaKeys:primary.size,alternativeLemmaKeys:alternative.size,
  admittedIdentifiers:r.registry.identifiers.length,sha256:digest(r)};
}
