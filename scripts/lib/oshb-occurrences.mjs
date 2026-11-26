import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateLinguisticRegistry} from '../../src/lib/linguistic-contracts.ts';
import {admittedFiles} from './linguistic-admission.mjs';
const digest=value=>createHash('sha256').update(JSON.stringify(value),'utf8').digest('hex');
const makeId=(prefix,...parts)=>prefix+'-'+digest(parts);
const fileBook=Object.freeze({'LING-011':'Gen','LING-012':'Dan'});
const editionId=makeId('TXT','OSHB v.2.2','Bible.MT','6a5db284c715c18b239422e57bb89684e6a19f00');
const original=s=>typeof s==='string'&&s.trim().length>0&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd\ud800-\udfff]/u.test(s);
const language=e=>typeof e.morphRaw==='string'&&/^H[A-Za-z]/.test(e.morphRaw)?'hbo':typeof e.morphRaw==='string'&&/^A[A-Za-z]/.test(e.morphRaw)?'arc':null;
// Only verified importOshb results are passed by the production runner.
// Sidecars retain source codes and positions; only compatible known-language primary tokens enter the draft registry.
export function identifyOshb(projections,manifest){
 const admissions=admittedFiles(manifest), registry={schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]};
 const records=[],ids=new Set(),providerIds=new Set(),files=new Set(),coverageBookIds=[],languages=new Set(),counts={hbo:0,arc:0,unknown:0,segments:0,alternatives:0,alternativeWords:0,missingProviderId:0};
 const claim=id=>{assert.ok(!ids.has(id),'Identificador duplicado');ids.add(id);return id;};
 const provider=e=>{if(e.providerId===null){counts.missingProviderId++;return;}assert.ok(typeof e.providerId==='string'&&e.providerId.length&&!providerIds.has(e.providerId),'ID de proveedor duplicado o inválido');providerIds.add(e.providerId);};
 assert.ok(Array.isArray(projections)&&projections.length>0);
 const ordered=[...projections].sort((a,b)=>Object.keys(fileBook).indexOf(a.source.fileId)-Object.keys(fileBook).indexOf(b.source.fileId));
 for(const p of ordered){
  const f=admissions.find(x=>x.id===p.source.fileId);
  assert.ok(f&&fileBook[f.id]===p.book&&p.source.commit===f.commit&&p.source.sha256===f.sha256&&p.source.edition==='OSHB v.2.2'&&p.source.versification==='Bible.MT'&&!files.has(f.id),'Origen incompatible o repetido');
  files.add(f.id);
  const bookId='LIB-'+p.book;coverageBookIds.push(bookId);
  const origin=(locator,component='texto_wlc')=>({fileId:f.id,commit:f.commit,sha256:f.sha256,component,locator});
  const refSet=new Set();
  for(const chapter of p.chapters)for(const verse of chapter.verses){
   const ref=verse.reference,parts=ref.split('.');
   assert.ok(parts.length===3&&parts[0]===p.book&&chapter.reference===parts.slice(0,2).join('.')&&/^[1-9]\d*$/.test(parts[1])&&/^[1-9]\d*[a-z]?$/.test(parts[2])&&!refSet.has(ref),'Referencia inválida o repetida');
   refSet.add(ref);
   const unitId=claim(makeId('UNIT',editionId,ref));
   const side={unitId,reference:ref,events:[],alternatives:[]};
   let position=0;
   const textParts=[];
   for(const [eventIndex,e] of verse.events.entries()){
    assert.ok(original(e.form),'Forma original inválida');
    if(e.kind==='segment'){
     counts.segments++;side.events.push({kind:'segment',eventIndex,form:e.form,type:e.type,origin:origin(ref+'/event/'+eventIndex)});
     textParts.push(e.form);continue;
    }
    assert.equal(e.kind,'word');provider(e);
    const id=claim(makeId('TOK',unitId,position)),lang=language(e),loc=ref+'/event/'+eventIndex;
    const record={kind:'word',id,eventIndex,position,form:e.form,providerId:e.providerId,type:e.type,language:lang,origin:origin(loc),lemmaRaw:e.lemmaRaw,morphRaw:e.morphRaw,
      lemmaOrigin:e.lemmaRaw===null?null:origin(loc+'/lemma','anotaciones_lema'),morphOrigin:e.morphRaw===null?null:origin(loc+'/morph','anotaciones_morfologia')};
    side.events.push(record);counts[lang??'unknown']++;
    if(lang){languages.add(lang);registry.tokens.push({id,unitId,position,form:e.form,language:lang,direction:'rtl',origin:record.origin,analysisIds:[]});}
    position++;
    if(eventIndex>0&&verse.events[eventIndex-1].kind==='word')textParts.push(' ');
    else if(eventIndex>0&&verse.events[eventIndex-1].kind==='segment'&&verse.events[eventIndex-1].type!=='x-maqqef')textParts.push(' ');
    textParts.push(e.form);
   }
   assert.ok(position>0);
   registry.units.push({id:unitId,editionId,bookId,chapter:parts[1],verse:parts[2],order:registry.units.length,text:textParts.join(''),origin:origin(ref)});
   for(const [altIndex,alt] of (verse.alternatives??[]).entries()){
    assert.equal(alt.kind,'qere');counts.alternatives++;
    const readingId=claim(makeId('ALT',unitId,altIndex));
    const anchor=side.events[alt.afterEvent];
    const anchorId=anchor?.kind==='word'&&anchor.type==='x-ketiv'?anchor.id:null;
    const reading={id:readingId,kind:'qere',afterEvent:alt.afterEvent,anchorId,words:[]};
    for(const [i,e] of alt.words.entries()){
     assert.ok(original(e.form));provider(e);counts.alternativeWords++;
     const loc=ref+'/qere/'+altIndex+'/word/'+i;
     reading.words.push({id:claim(makeId('ALTWORD',readingId,i)),position:i,form:e.form,providerId:e.providerId,language:language(e),lemmaRaw:e.lemmaRaw,morphRaw:e.morphRaw,origin:origin(loc),lemmaOrigin:e.lemmaRaw===null?null:origin(loc+'/lemma','anotaciones_lema'),morphOrigin:e.morphRaw===null?null:origin(loc+'/morph','anotaciones_morfologia')});
    }
    side.alternatives.push(reading);
   }
   records.push(side);
  }
 }
 assert.ok(languages.size>0,'Sin idiomas documentados');
 registry.editions.push({id:editionId,name:'OSHB v.2.2 / WLC',languages:[...languages].sort(),version:'2.2',versificationRef:'Bible.MT',canonRef:null,coverageBookIds,fileIds:[...files]});
 assert.deepEqual(validateLinguisticRegistry(registry,admissions),[]);
 return {schemaVersion:1,registry,records,counts,pending:ordered.map(p=>({fileId:p.source.fileId,structures:p.pendingStructures})),textPolicy:'Representación derivada: espacios entre palabras, signos preservados, barras OSHB intactas; no equivale a XML original.'};
}
export function summarizeOccurrences(result){
 return {units:result.registry.units.length,tokens:result.registry.tokens.length,...result.counts,
  unanchoredAlternatives:result.records.reduce((n,u)=>n+u.alternatives.filter(a=>a.anchorId===null).length,0),
  pending:result.pending,sha256:digest(result)};
}
