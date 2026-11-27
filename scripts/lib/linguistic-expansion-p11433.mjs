import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {loadVerifiedAnalyzerData} from './term-analyzer-validation-data.mjs';
import {splitLemma} from './oshb-lexical.mjs';
import {decodeMorphology} from './oshb-morphology.mjs';
import {decodeGreek} from './greek-projection.mjs';
import {validateLinguisticRegistry} from '../../src/lib/linguistic-contracts.ts';
const sha=b=>createHash('sha256').update(b).digest('hex');
const id=(prefix,...parts)=>prefix+'-'+sha(JSON.stringify(parts));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const lf=b=>Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const proposalPath='docs/P11/registro-propuesta-ampliacion-linguistica-p11432.json';
const planPath='docs/P11/registro-auditoria-linguistica-p11431.json';
const recordPath='docs/P11/registro-admision-integracion-linguistica-p11433.json';
export function loadAdmission(){return json(recordPath);}
export function validateAdmission(r){
 assert.deepEqual(r,{"schemaVersion":1,"phase":"P11.4.3.3.integracion_privada","baselineMain":"109fb2ace575113ebf901d5979a235957a3e1614","proposalBlob":"f13c8125861f90d62217762e1498ccd6717b5b53","auditBlob":"c85ec9d9b6847dfbc5987cabb64528eac6651dbd","approval":{"id":"AUT-P11433-20261127-01","date":"2026-11-27","basis":"declaracion_explicita_del_responsable","statement":"Apruebo la admisión técnica de los seis archivos lingüísticos auditados y la preparación para publicación del analizador de los siete libros, respetando las licencias, atribuciones y restricciones documentadas. Continuar con P11.4.3.3."},"previousIntegration":{"pr":100,"head":"605609ad4c288b9e305050742cbac1035649087f","workflows":27,"run":46020518215,"job":140578653481,"pagesRun":46021347623,"pages":"success"},"verifiedProjection":{"candidateOccurrences":51468,"corpusPersisted":false,"greek":[{"annotationSha256":"5297f7077d030024cd68cbb2194e87b9f017cc9efbba83aaddc0bc082345fbe6","book":"Acts","eligibleAnnotations":18272,"officialWords":18412,"separateLayers":true,"textSha256":"8bc33a888a8ea77df5f25fa30f0d613d299883a05cfdf63bbd96f24346c71549","withheld":140},{"annotationSha256":"cf7befc4dcdc41c515ebeaf9f3bdd30dfa9a02cc2d6f78113ffb5b31fd1d22f4","book":"1Cor","eligibleAnnotations":6754,"officialWords":6812,"separateLayers":true,"textSha256":"e3f8ca2363779b06aaea54dc811d1fd9a32f075dae372f0dc484f44756860e5b","withheld":58}],"hebrew":[{"alternativesIncluded":false,"book":"Lev","largeLetterReferences":{"Lev.11.42":1},"largeLetterSegments":1,"lemmaAttributes":11950,"morphAttributes":11950,"primaryWords":11950,"sha256":"a81ac3d40548b72bd10f2b5dc91f3c5ec913884cf9acabe801f3ffbb3cf2a5b3","unknownLanguage":0},{"alternativesIncluded":false,"book":"Deut","largeLetterReferences":{"Deut.6.4":2},"largeLetterSegments":2,"lemmaAttributes":14294,"morphAttributes":14294,"primaryWords":14294,"sha256":"21ce2b0e3545cb44a1630c3cac0337f8e68c6500c7a0c1eb682ac05b386d967f","unknownLanguage":0}],"newAdmissions":0,"phase":"P11.4.3.2.preparacion","publicationAuthorized":false},"admitted":[{"id":"LING-019","candidateId":"P1143-H01","book":"Lev","source":"OSHB","repository":"openscriptures/morphhb","commit":"6a5db284c715c18b239422e57bb89684e6a19f00","path":"wlc/Lev.xml","bytes":1085069,"gitBlobSha1":"6025e0713ccfc79de0c90cb92ed0e8c0062d2614","sha256":"75a4a96e7b64f2145bede15ae37ac8a0b301f110d5d6b2daf9d8048adebbd2e6","allowedComponents":["texto_wlc","anotaciones_lema","anotaciones_morfologia"],"license":"WLC dominio público según proveedor; anotaciones CC BY 4.0","attribution":"Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb. WLC: dominio público según proveedor; anotaciones: CC BY 4.0.","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","conditions":"WLC declarado dominio público; anotaciones CC BY 4.0; preservar atribución y capas.","technicalAdmission":"aprobada","publication":false},{"id":"LING-020","candidateId":"P1143-H02","book":"Deut","source":"OSHB","repository":"openscriptures/morphhb","commit":"6a5db284c715c18b239422e57bb89684e6a19f00","path":"wlc/Deut.xml","bytes":1315401,"gitBlobSha1":"5317431fd1d1fb5848d7f9f1d22d0753152f9991","sha256":"aad16a6a2dcbdc6ee36d7d051e80a63bfeb69ecaae19f775ec5b6aa67fe22355","allowedComponents":["texto_wlc","anotaciones_lema","anotaciones_morfologia"],"license":"WLC dominio público según proveedor; anotaciones CC BY 4.0","attribution":"Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb. WLC: dominio público según proveedor; anotaciones: CC BY 4.0.","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","conditions":"WLC declarado dominio público; anotaciones CC BY 4.0; preservar atribución y capas.","technicalAdmission":"aprobada","publication":false},{"id":"LING-021","candidateId":"P1143-G01","book":"Acts","source":"SBLGNT","repository":"Faithlife/SBLGNT","commit":"736fdc76158950c3d04b949b7e013ca14305145a","path":"data/sblgnt/xml/Acts.xml","bytes":921255,"gitBlobSha1":"168d2faff82b0047805703dfe1892e5655c211c8","sha256":"5040d5a8570ce8f391209f228707c560e83fccc439f364d0a8baf89666025ea3","allowedComponents":["texto_griego"],"license":"CC BY 4.0","attribution":"Copyright 2010 Society of Biblical Literature and Logos Bible Software; SBLGNT v1.2. https://github.com/Faithlife/SBLGNT","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","conditions":"CC BY 4.0; texto oficial, atribución y cambios.","technicalAdmission":"aprobada","publication":false},{"id":"LING-022","candidateId":"P1143-G02","book":"Acts","source":"MorphGNT","repository":"morphgnt/sblgnt","commit":"aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d","path":"65-Ac-morphgnt.txt","bytes":1228900,"gitBlobSha1":"3aed8e1a1dd9d77b4c448a0893bd4ddee6eb6842","sha256":"04349afeba263d667698b37d39465d746530434b455fb6ac2941ec5c59fb85ca","allowedComponents":["anotaciones_lema","anotaciones_morfologia"],"license":"CC BY-SA 3.0","attribution":"Tauber, J. K., ed. (2017). MorphGNT: SBLGNT Edition, v6.12. https://github.com/morphgnt/sblgnt; DOI 10.5281/zenodo.376200","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","conditions":"CC BY-SA 3.0 para anotaciones; atribución y compartir igual; excluir columnas textuales de la proyección.","technicalAdmission":"aprobada","publication":false},{"id":"LING-023","candidateId":"P1143-G03","book":"1Cor","source":"SBLGNT","repository":"Faithlife/SBLGNT","commit":"736fdc76158950c3d04b949b7e013ca14305145a","path":"data/sblgnt/xml/1Cor.xml","bytes":342330,"gitBlobSha1":"2a0c1a309626f498d6ce76626385d9c2dbf83acd","sha256":"5a12d44dd6a9c7c236da21dc85a1d60915c54c988c59ba456f27bf528da1812b","allowedComponents":["texto_griego"],"license":"CC BY 4.0","attribution":"Copyright 2010 Society of Biblical Literature and Logos Bible Software; SBLGNT v1.2. https://github.com/Faithlife/SBLGNT","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","conditions":"CC BY 4.0; texto oficial, atribución y cambios.","technicalAdmission":"aprobada","publication":false},{"id":"LING-024","candidateId":"P1143-G04","book":"1Cor","source":"MorphGNT","repository":"morphgnt/sblgnt","commit":"aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d","path":"67-1Co-morphgnt.txt","bytes":435113,"gitBlobSha1":"28dec6618da3a378f454b6c72776286855857920","sha256":"5233a5b099e2499baed34ec2d6f53ae44545d532a7e2fb12acafcf39ff6fdbf3","allowedComponents":["anotaciones_lema","anotaciones_morfologia"],"license":"CC BY-SA 3.0","attribution":"Tauber, J. K., ed. (2017). MorphGNT: SBLGNT Edition, v6.12. https://github.com/morphgnt/sblgnt; DOI 10.5281/zenodo.376200","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","conditions":"CC BY-SA 3.0 para anotaciones; atribución y compartir igual; excluir columnas textuales de la proyección.","technicalAdmission":"aprobada","publication":false}],"scope":{"books":["Gen","Lev","Deut","Dan","Acts","1Cor","3John"],"existingOccurrences":26750,"additionalOccurrences":51468,"totalOccurrences":78218,"existingUnits":1905,"additionalUnits":3257,"totalUnits":5162,"greekAdditionalWithheld":198,"primaryOnly":true,"excludeNotesAndVariants":true,"meaningInference":false,"strongInference":false,"greekSeparateLayers":true},"preparationApproved":true,"newTechnicalAdmissions":6,"publicationAuthorized":false,"publicRegistryEmpty":true,"progress":{"completed":61,"total":69},"next":"P11.4.3.4_validacion_funcional_accesibilidad_y_alcance"});
 assert.equal(blob(lf(readFileSync(proposalPath))),r.proposalBlob);assert.equal(blob(lf(readFileSync(planPath))),r.auditBlob);
 const p=json(proposalPath),plan=json(planPath);
 for(const [i,f] of r.admitted.entries()){
  const c=p.proposedFiles[i],meta=plan.candidates[i],src=plan.sources.find(s=>s.key===c.source);
  assert.equal(f.candidateId,c.id);assert.equal(f.sha256,c.sha256);assert.equal(f.path,c.path);assert.equal(f.commit,src.commit);assert.equal(f.gitBlobSha1,meta.gitBlobSha1);assert.equal(f.bytes,meta.bytes);assert.deepEqual(f.allowedComponents,c.components);assert.equal(f.publication,false);
 }
 const pub=json('src/data/linguistica/registro.json');assert.deepEqual(pub,{schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]});
 return r.admitted.map(({id,commit,sha256,allowedComponents})=>({id,commit,sha256,allowedComponents}));
}
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hashRows=x=>sha(JSON.stringify(canonical(x)));
const key=(ch,v,pos)=>JSON.stringify([ch,v,pos]);
export function mergeExpansion(baseline,payload,r){
 const additional=validateAdmission(r);
 assert.deepEqual(payload.summary,r.verifiedProjection);assert.deepEqual(Object.keys(payload.books).sort(),['1Cor','Acts','Deut','Lev']);
 const registry=structuredClone(baseline.registry),supplements=structuredClone(baseline.supplements),admissions=[...baseline.admissions,...additional];
 assert.equal(registry.tokens.length,26750);assert.equal(registry.units.length,1905);
 const heb=registry.editions.find(e=>e.languages.includes('hbo')),grk=registry.editions.find(e=>e.languages.includes('grc'));
 assert.ok(heb&&grk);const lemmaMap=new Map(registry.lemmas.map(l=>[l.id,l])),units=new Map(),nextOrder=new Map(registry.editions.map(e=>[e.id,Math.max(-1,...registry.units.filter(u=>u.editionId===e.id).map(u=>u.order))+1]));
 const origin=(f,component,locator)=>({fileId:f.id,commit:f.commit,sha256:f.sha256,component,locator});
 const bookFile=(book,source)=>{const f=r.admitted.find(f=>f.book===book&&f.source===source);assert.ok(f);return f;};
 function addUnit(e,f,book,ch,v,component){
  const ref=book+'.'+ch+'.'+v,k=JSON.stringify([e.id,ref]);let u=units.get(k);
  if(!u){u={id:id('UNIT',e.id,ref),editionId:e.id,bookId:'LIB-'+book,chapter:ch,verse:v,order:nextOrder.get(e.id),text:'',origin:origin(f,component,ref),forms:[]};nextOrder.set(e.id,u.order+1);units.set(k,u);}
  return u;
 }
 function addToken(u,f,component,form,lang,locator){
  const position=u.forms.length;u.forms.push(form);
  const t={id:id('TOK',u.id,position),unitId:u.id,position,form,language:lang,direction:lang==='grc'?'ltr':'rtl',origin:origin(f,component,locator),analysisIds:[]};
  registry.tokens.push(t);return t;
 }
 function lemma(value){if(!lemmaMap.has(value.id))lemmaMap.set(value.id,value);else{const prev=lemmaMap.get(value.id);for(const k of ['language','form','homograph','providerKey','system'])assert.equal(prev[k],value[k]);assert.equal(prev.origin.commit,value.origin.commit);}return value.id;}
 function analysis(t,a){registry.analyses.push(a);t.analysisIds.push(a.id);}
 const typography=[];let withheld=0;
 for(const book of ['Lev','Deut']){
  const rows=payload.books[book].primary,proof=r.verifiedProjection.hebrew.find(x=>x.book===book),f=bookFile(book,'OSHB');assert.equal(hashRows(rows),proof.sha256);assert.equal(rows.length,proof.primaryWords);
  heb.coverageBookIds.push('LIB-'+book);heb.fileIds.push(f.id);
  for(const row of rows){
   const [b,ch,v]=row.ref.split('.');assert.equal(b,book);assert.ok(row.language==='hbo'||row.language==='arc');
   const u=addUnit(heb,f,book,ch,v,'texto_wlc'),loc=row.ref+'/word/'+(u.forms.length+1),t=addToken(u,f,'texto_wlc',row.form,row.language,loc);
   if(row.letterSegments)typography.push({tokenId:t.id,segments:row.letterSegments,origin:t.origin});
   const lo=origin(f,'anotaciones_lema',loc+'/lemma'),mo=origin(f,'anotaciones_morfologia',loc+'/morph');
   const lex=splitLemma(row.lemmaRaw),components=lex.parts.map(part=>({position:part.position,code:part.code,lemmaId:part.kind==='numeric'?lemma({id:id('LEM','OSHB-lemma','2.2',f.commit,row.language,part.code),language:row.language,form:null,homograph:part.homograph,providerKey:part.code,system:'OSHB-lemma',origin:lo}):null}));
   const dec=decodeMorphology(row.morphRaw),state=dec.language===row.language?dec.state:'unresolved';
   const features={};if(state==='documented')for(const c of dec.components)for(const [k,v] of Object.entries(c.features))features['c'+c.position+'.'+k]=v;
   const mid=id('MOR','OSHB','2.2',t.id,row.morphRaw);
   assert.ok(row.lemmaRaw&&row.morphRaw&&state!=='absent');
   analysis(t,{id:mid,tokenId:t.id,lemmaId:null,system:'OSHB',version:'2.2',code:row.morphRaw,features,state:state==='documented'?'documentado':'sin_interpretar',origin:mo});
   supplements.push({tokenId:t.id,lexical:{raw:row.lemmaRaw,origin:lo,components},morphology:{state,analysisId:mid}});
  }
 }
 for(const book of ['Acts','1Cor']){
  const {text,annotations}=payload.books[book],proof=r.verifiedProjection.greek.find(x=>x.book===book),f=bookFile(book,'SBLGNT'),m=bookFile(book,'MorphGNT');
  assert.equal(hashRows(text),proof.textSha256);assert.equal(hashRows(annotations),proof.annotationSha256);
  assert.equal(text.length,proof.officialWords);assert.equal(annotations.length,proof.eligibleAnnotations);
  grk.coverageBookIds.push('LIB-'+book);grk.fileIds.push(f.id,m.id);
  const by=new Map(annotations.map(a=>[key(a.chapter,a.verse,a.position),a]));assert.equal(by.size,annotations.length);
  for(const row of text){
   const u=addUnit(grk,f,book,row.chapter,row.verse,'texto_griego');assert.equal(row.position,u.forms.length+1);
   const loc=book+'.'+row.chapter+'.'+row.verse+'/word/'+row.position,t=addToken(u,f,'texto_griego',row.form,'grc',loc),k=key(row.chapter,row.verse,row.position),ann=by.get(k);
   if(!ann){withheld++;continue;}by.delete(k);
   const native=(book==='Acts'?'05':'07')+row.chapter.padStart(2,'0')+row.verse.padStart(2,'0')+'/word/'+row.position;
   const lid=lemma({id:id('LEM','MorphGNT','6.12',m.commit,ann.lemma),language:'grc',form:ann.lemma,homograph:null,providerKey:ann.lemma,system:'MorphGNT-lemma',origin:origin(m,'anotaciones_lema',native+'/lemma')});
   const code=ann.pos+' '+ann.parsing,d=decodeGreek(ann.pos,ann.parsing);
   analysis(t,{id:id('MOR','MorphGNT','6.12',t.id,code),tokenId:t.id,lemmaId:lid,system:'MorphGNT',version:'6.12',code,...d,origin:origin(m,'anotaciones_morfologia',native+'/morph')});
  }
  assert.equal(by.size,0);
 }
 // Preserve the existing edition IDs, unit orders and representative lemma origins.
 // Added Hebrew units are occurrence projections; punctuation, alternatives and typography are not inferred.
 for(const {forms,...u} of units.values())registry.units.push({...u,text:forms.join(' ')});
 registry.lemmas=[...lemmaMap.values()];grk.versificationRef='SBLGNT-native';
 assert.equal(registry.units.length,r.scope.totalUnits);assert.equal(registry.tokens.length,r.scope.totalOccurrences);assert.equal(withheld,198);assert.equal(typography.length,3);
 assert.equal(registry.identifiers.length,0);
 assert.deepEqual(validateLinguisticRegistry(registry,admissions),[]);
 return {registry,admissions,supplements,typography,withheld,scope:r.scope};
}
export async function loadExpandedAnalyzerData(){
 const r=loadAdmission();validateAdmission(r);
 const baseline=await loadVerifiedAnalyzerData();
 let payload;
 try{const raw=execFileSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['-X','utf8','scripts/load-linguistic-expansion-p11433.py'],{env:{...process.env,SN_P11433_PRIVATE_PIPE:'1',PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8',maxBuffer:32*1024*1024,timeout:180000,stdio:['ignore','pipe','pipe']});payload=JSON.parse(raw);}
 catch{throw Error('Private projection failed');}
 return mergeExpansion(baseline,payload,r);
}
