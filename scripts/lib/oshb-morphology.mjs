import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateLinguisticRegistry} from '../../src/lib/linguistic-contracts.ts';
import {admittedFiles,verifyImportBytes} from './linguistic-admission.mjs';
const digest=v=>createHash('sha256').update(JSON.stringify(v),'utf8').digest('hex');
// Independently expressed Spanish labels, based on the fixed OSHB grammar reference.
const pos={A:'adjetivo',C:'conjunción',D:'adverbio',N:'sustantivo',P:'pronombre',R:'preposición',S:'sufijo',T:'partícula',V:'verbo'};
const types={A:{a:'adjetivo',c:'cardinal',g:'gentilicio',o:'ordinal'},N:{c:'común',g:'gentilicio',p:'propio'},P:{d:'demostrativo',f:'indefinido',i:'interrogativo',p:'personal',r:'relativo'},R:{d:'artículo definido'},S:{d:'direccional',h:'he paragógica',n:'nun paragógica',p:'pronominal'},T:{a:'afirmación',d:'artículo definido',e:'exhortación',i:'interrogativa',j:'interjección',m:'demostrativa',n:'negativa',o:'marca de objeto directo',r:'relativa'}};
const stems={hbo:{q:'qal',N:'niphal',p:'piel',P:'pual',h:'hiphil',H:'hophal',t:'hithpael',o:'polel',O:'polal',r:'hithpolel',m:'poel',M:'poal',k:'palel',K:'pulal',Q:'qal pasivo',l:'pilpel',L:'polpal',f:'hithpalpel',D:'nithpael',j:'pealal',i:'pilel',u:'hothpaal',c:'tiphil',v:'hishtaphel',w:'nithpalel',y:'nithpoel',z:'hithpoel'},arc:{q:'peal',Q:'peil',u:'hithpeel',p:'pael',P:'ithpaal',M:'hithpaal',a:'aphel',h:'haphel',s:'saphel',e:'shaphel',H:'hophal',i:'ithpeel',t:'hishtaphel',v:'ishtaphel',w:'hithaphel',o:'polel',z:'ithpoel',r:'hithpolel',f:'hithpalpel',b:'hephal',c:'tiphel',m:'poel',l:'palpel',L:'ithpalpel',O:'ithpolel',G:'ittaphal'}};
const conj={p:'qatal',q:'weqatal',i:'yiqtol',w:'wayyiqtol',h:'cohortativo',j:'yusivo',v:'imperativo',r:'participio activo',s:'participio pasivo',a:'infinitivo absoluto',c:'infinitivo constructo'};
const persons={'1':'primera','2':'segunda','3':'tercera'};
const genders={b:'ambos',c:'común',f:'femenino',m:'masculino'};
const numbers={d:'dual',p:'plural',s:'singular'};
const states={a:'absoluto',c:'constructo',d:'determinado'};
const own=(o,k)=>Object.hasOwn(o,k);
function component(code,language,position){
 const fields={},unknownFields=[];
 let i=0,valid=true;
 const take=(key,table)=>{
  const v=code[i++];
  if(v==='x'){unknownFields.push(key);return;}
  if(v===undefined||!own(table,v)){valid=false;return;}
  fields[key]=table[v];
 };
 const category=code[i++];
 if(!own(pos,category))return {position,code,state:'unresolved',features:{},unknownFields:[]};
 fields.categoria=pos[category];
 if(category==='V'){
  take('patron',stems[language]);const form=code[i];take('conjugacion',conj);
  if(['r','s'].includes(form)){take('genero',genders);take('numero',numbers);take('estado',states);}
  else if(!['a','c'].includes(form)){take('persona',persons);take('genero',genders);take('numero',numbers);}
 }else if(['A','N'].includes(category)){
  take('tipo',types[category]);
  if(category!=='N'||code[1]!=='p'||i<code.length){take('genero',genders);take('numero',numbers);take('estado',states);}
 }else if(category==='P'){
  take('tipo',types.P);if(i<code.length){take('persona',persons);take('genero',genders);take('numero',numbers);}
 }else if(category==='S'){
  take('tipo',types.S);if(code[1]==='p'){take('persona',persons);take('genero',genders);take('numero',numbers);}
 }else if(category==='T'||category==='R'&&i<code.length){take('tipo',types[category]);}
 if(i!==code.length||code.endsWith('x'))valid=false;
 return {position,code,state:valid?(unknownFields.length?'partial':'documented'):'unresolved',features:valid?fields:{},unknownFields:valid?unknownFields:[]};
}
export function decodeMorphology(raw){
 if(raw===null)return {language:null,state:'absent',components:[]};
 assert.equal(typeof raw,'string');
 const language=raw[0]==='H'?'hbo':raw[0]==='A'?'arc':null;
 if(!language)return {language:null,state:'unresolved',components:[]};
 const components=raw.slice(1).split('/').map((c,i)=>component(c,language,i));
 return {language,state:components.every(c=>c.state==='documented')?'documented':components.every(c=>c.state==='unresolved')?'unresolved':'partial',components};
}
export function organizeMorphology(occurrences,lexical,manifest){
 const admissions=admittedFiles(manifest),registry=structuredClone(lexical.registry);
 assert.equal(registry.analyses.length,0);assert.equal(registry.morphCodes.length,0);
 const files=new Map(admissions.map(f=>[f.id,f])),tokens=new Map(registry.tokens.map(t=>[t.id,t]));
 const lexicalLinks=new Map(lexical.links.map(x=>[x.occurrenceId,x]));
 const links=[],seen=new Set(),counts={primary:0,alternative:0,absent:0,documented:0,partial:0,unresolved:0,registryAnalyses:0};
 function visit(w,unitId,layer){
  assert.ok(!seen.has(w.id));seen.add(w.id);counts[layer]++;
  const link=lexicalLinks.get(w.id);assert.ok(link&&link.unitId===unitId&&link.layer===layer&&link.language===w.language);
  const decoded=decodeMorphology(w.morphRaw);
  if(w.morphRaw!==null){
   const o=w.morphOrigin,f=files.get(o?.fileId);
   assert.ok(f&&['LING-011','LING-012'].includes(f.id)&&f.allowedComponents.includes('anotaciones_morfologia')&&o.component==='anotaciones_morfologia'&&o.commit===f.commit&&o.sha256===f.sha256&&typeof o.locator==='string'&&o.locator.length,'Origen morfológico inválido');
  }
  const compatible=decoded.language!==null&&decoded.language===w.language;
  const state=decoded.state==='absent'?'absent':compatible?decoded.state:'unresolved';
  counts[state]++;
  const record={occurrenceId:w.id,unitId,layer,language:w.language,raw:w.morphRaw,origin:w.morphOrigin,state,components:compatible?decoded.components:[],analysisId:null};
  if(layer==='primary'&&w.language!==null&&w.morphRaw!==null&&w.morphRaw.trim()){
   const t=tokens.get(w.id);assert.ok(t&&t.unitId===unitId&&t.language===w.language);
   // Composite features remain indexed by component; never assume lemma/morph positions align.
   const features={};
   if(state==='documented')for(const c of record.components)for(const [k,v] of Object.entries(c.features))features['c'+c.position+'.'+k]=v;
   const id='MOR-'+digest(['OSHB', '2.2',w.id,w.morphRaw]);
   registry.analyses.push({id,tokenId:w.id,lemmaId:null,system:'OSHB',version:'2.2',code:w.morphRaw,features,state:state==='documented'?'documentado':'sin_interpretar',origin:{...w.morphOrigin}});
   t.analysisIds.push(id);record.analysisId=id;counts.registryAnalyses++;
  }
  links.push(record);
 }
 for(const u of occurrences.records){
  for(const e of u.events)if(e.kind==='word')visit(e,u.unitId,'primary');
  for(const a of u.alternatives)for(const w of a.words)visit(w,u.unitId,'alternative');
 }
 assert.equal(links.length,lexical.links.length);
 assert.equal(counts.primary+counts.alternative,counts.absent+counts.documented+counts.partial+counts.unresolved);
 assert.deepEqual(validateLinguisticRegistry(registry,admissions),[]);
 return {schemaVersion:1,registry,links,counts,policy:'OSHB codes only; no contextual tense, voice, semantics or automatic TEHMC equivalences.'};
}
// TEHMC: examine only first column of full occurrence-code rows, not explanations/examples.
export function auditTehmc(manifest,bytes,morphology){
 const origin=verifyImportBytes(manifest,'LING-010',bytes,['codigo_morfologico']);
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 const marker='FULL MORPHOLOGY CODES:';
 const start=text.indexOf(marker);
 assert.ok(start>=0&&text.indexOf('based on OpenScripture codes',start)>=0,'Cabecera TEHMC no reconocida');
 const keys=new Set();
 for(const line of text.slice(start).split(/\r?\n/)){
  const tab=line.indexOf('\t');if(tab<0)continue;
  const code=line.slice(0,tab);
  if(/^[HA][A-Za-z0-9]+(?:\/[A-Za-z0-9]+)*$/.test(code))keys.add(code);
 }
 assert.ok(keys.size>0);
 const oshb=new Set(morphology.links.filter(l=>l.raw!==null&&l.language!==null).flatMap(l=>[l.raw,...l.raw.slice(1).split('/').map(c=>l.raw[0]+c)]));
 const matches=[...oshb].filter(k=>keys.has(k)).sort();
 return {source:origin,table:'TEHMC full occurrence codes',uniqueCodes:keys.size,oshbKeys:oshb.size,exactCodeMatches:matches.length,unmatched:oshb.size-matches.length,matchedKeysSha256:digest(matches),semanticEquivalencesApproved:0,descriptionsImported:0};
}
export function summarizeMorphology(r){return {...r.counts,analyses:r.registry.analyses.length,sha256:digest(r)};}
