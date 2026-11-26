import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateLinguisticRegistry} from '../../src/lib/linguistic-contracts.ts';
const digest=x=>createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
const id=(prefix,...x)=>prefix+'-'+digest(x);
const exact=(o,keys)=>o&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const text=s=>typeof s==='string'&&s.trim().length>0&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd\ud800-\udfff]/u.test(s);
const greek=s=>text(s)&&/[\u0370-\u03ff\u1f00-\u1fff]/u.test(s);
const pos={ 'A-':'adjetivo','C-':'conjunción','D-':'adverbio','I-':'interjección','N-':'sustantivo','P-':'preposición',RA:'artículo definido',RD:'pronombre demostrativo',RI:'pronombre interrogativo o indefinido',RP:'pronombre personal',RR:'pronombre relativo','V-':'verbo','X-':'partícula'};
const fields=[['persona',{'1':'primera','2':'segunda','3':'tercera'}],['tiempo',{P:'presente',I:'imperfecto',F:'futuro',A:'aoristo',X:'perfecto',Y:'pluscuamperfecto'}],['voz',{A:'activa',M:'media',P:'pasiva'}],['modo',{I:'indicativo',D:'imperativo',S:'subjuntivo',O:'optativo',N:'infinitivo',P:'participio'}],['caso',{N:'nominativo',G:'genitivo',D:'dativo',A:'acusativo'}],['numero',{S:'singular',P:'plural'}],['genero',{M:'masculino',F:'femenino',N:'neutro'}],['grado',{C:'comparativo',S:'superlativo'}]];
export function decodeGreek(posCode,parsing){
 assert.ok(typeof parsing==='string'&&parsing.length===8);
 if(!Object.hasOwn(pos,posCode))return {state:'sin_interpretar',features:{}};
 const features={categoria:pos[posCode]};
 for(const [i,[name,table]] of fields.entries()){
  const c=parsing[i];if(c==='-')continue;
  if(!Object.hasOwn(table,c))return {state:'sin_interpretar',features:{}};
  features[name]=table[c];
 }
 return {state:'documentado',features};
}
export function greekAdmissions(m){
 assert.equal(m.schemaVersion,1);assert.equal(m.scope,'3John-validation-only');assert.equal(m.publication,false);
 assert.ok(m.authorization?.basis&&m.authorization?.date==='2026-11-26');
 assert.deepEqual(m.deferred,['GRK-C03']);
 assert.deepEqual(m.files.map(f=>f.id),['LING-013','LING-014']);
 for(const [i,f] of m.files.entries()){
  assert.equal(f.review,'aprobado');
  assert.equal(f.candidateId,'GRK-C0'+(i+1));
  assert.deepEqual(f.allowedComponents,i===0?['texto_griego']:['anotaciones_lema','anotaciones_morfologia']);
  assert.equal(f.license,i===0?'CC BY 4.0':'CC BY-SA 3.0');
  assert.ok(f.attribution&&f.approvalRef==='docs/P8/12-admision-griega.md'&&f.conditions.length);
  assert.match(f.commit,/^[a-f0-9]{40}$/);assert.match(f.sha256,/^[a-f0-9]{64}$/);
 }
 return m.files.map(f=>({id:f.id,commit:f.commit,sha256:f.sha256,allowedComponents:[...f.allowedComponents]}));
}
export function projectGreek(rows,manifest,{fixedBaseline=true}={}){
 const admissions=greekAdmissions(manifest),[source,annotation]=admissions;
 const origin=(f,component,locator)=>({fileId:f.id,commit:f.commit,sha256:f.sha256,component,locator});
 const registry={schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]};
 const editionId=id('TXT','SBLGNT','1.2',source.commit);
 registry.editions.push({id:editionId,name:'SBLGNT',version:'1.2',languages:['grc'],versificationRef:'SBLGNT-3John',canonRef:null,coverageBookIds:['LIB-3John'],fileIds:admissions.map(f=>f.id)});
 const byVerse=new Map(),lemmas=new Map(),missing=[];
 let documented=0,unresolved=0;
 for(const r of rows){
  assert.ok(exact(r,['verse','position','form','annotation'])&&Number.isSafeInteger(r.verse)&&r.verse>=1&&Number.isSafeInteger(r.position)&&r.position>=1&&greek(r.form));
  let unit=byVerse.get(r.verse);
  if(!unit){
   assert.equal(r.verse,byVerse.size+1,'Versículo fuera de orden');
   unit={id:id('UNIT',editionId,r.verse),editionId,bookId:'LIB-3John',chapter:'1',verse:String(r.verse),order:byVerse.size,text:'',origin:origin(source,'texto_griego','3Jn.1.'+r.verse),forms:[]};
   byVerse.set(r.verse,unit);
  }
  assert.equal(r.position,unit.forms.length+1,'Posición discontinua o duplicada');
  const ref='3Jn.1.'+r.verse+'/word/'+r.position,tokenId=id('TOK',unit.id,r.position-1);
  unit.forms.push(r.form);
  const token={id:tokenId,unitId:unit.id,position:r.position-1,form:r.form,language:'grc',direction:'ltr',origin:origin(source,'texto_griego',ref),analysisIds:[]};
  if(r.annotation===null)missing.push({reference:'3Jn.1.'+r.verse,position:r.position,reason:'sin correspondencia exacta de forma'});
  else{
   const a=r.annotation;
   assert.ok(exact(a,['pos','parsing','lemma'])&&greek(a.lemma)&&text(a.pos)&&text(a.parsing),'Anotación fuera del alcance');
   const loc='2501'+String(r.verse).padStart(2,'0')+'/word/'+r.position;
   const lemmaId=id('LEM','MorphGNT','6.12',annotation.commit,a.lemma);
   if(!lemmas.has(lemmaId))lemmas.set(lemmaId,{id:lemmaId,language:'grc',form:a.lemma,homograph:null,providerKey:a.lemma,system:'MorphGNT-lemma',origin:origin(annotation,'anotaciones_lema',loc+'/lemma')});
   const raw=a.pos+' '+a.parsing,decoded=decodeGreek(a.pos,a.parsing),analysisId=id('MOR','MorphGNT','6.12',tokenId,raw);
   registry.analyses.push({id:analysisId,tokenId,lemmaId,system:'MorphGNT',version:'6.12',code:raw,...decoded,origin:origin(annotation,'anotaciones_morfologia',loc+'/morph')});
   token.analysisIds.push(analysisId);
   if(decoded.state==='documentado')documented++;else unresolved++;
  }
  registry.tokens.push(token);
 }
 registry.units=[...byVerse.values()].map(({forms,...u})=>({...u,text:forms.join(' ')}));
 registry.lemmas=[...lemmas.values()];
 assert.deepEqual(validateLinguisticRegistry(registry,admissions),[]);
 assert.equal(registry.tokens.length,registry.analyses.length+missing.length);
 assert.equal(registry.analyses.length,documented+unresolved);
 if(fixedBaseline){assert.equal(registry.units.length,15);assert.equal(registry.tokens.length,219);assert.equal(registry.analyses.length,216);assert.equal(missing.length,3);}
 return {registry,missing,summary:{units:registry.units.length,tokens:registry.tokens.length,lemmas:registry.lemmas.length,analyses:registry.analyses.length,documented,unresolved,missing:missing.length,identifiers:0,published:0,sha256:digest({registry,missing})}};
}
