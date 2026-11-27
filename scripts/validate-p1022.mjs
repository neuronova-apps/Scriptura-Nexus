import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadP1021,validateP1021} from './validate-p1021.mjs';
const oldPath='docs/P10/registro-flujo-p1021.json';
const recordPath='docs/P10/registro-fuentes-p1022.json';
const text=x=>typeof x==='string'&&x.trim().length>0;
const keys=(x,k)=>assert.deepEqual(Object.keys(x).sort(),k.split(' ').sort());
const ids=Array.from({length:15},(_,i)=>'P1022-R'+String(i+1).padStart(2,'0'));
const chapterCodes=[['LEV19','DEU14'],['GEN14','LEV27','MAL03','MAT23','2CO09'],['ACT02','ACT10','ACT19',['1CO12','1CO13','1CO14']],['PSA022','MAT27','MRK15'],['JHN01']];
const statuses=['documentada_y_admision_previa','identidad_y_condiciones_documentadas','identidad_documentada_acceso_pendiente','referencia_documental_consultada','referencia_identificada_pendiente_lectura_integral','documentacion_previa_verificada'];
export function loadP1022(){return {previousBytes:readFileSync(oldPath),record:JSON.parse(readFileSync(recordPath,'utf8'))};}
export function validateP1022({previousBytes,record:r}){
 const p=JSON.parse(previousBytes);
 const hash=createHash('sha1').update(Buffer.from('blob '+previousBytes.length+'\0')).update(previousBytes).digest('hex');
 assert.equal(hash,'d68fd95d2862b7f1cbb21abae08e140d71ab4b8b');
 keys(r,'schemaVersion phase baseMain previousRecordBlob consultedOn publicationAuthorized corpusImportAuthorized sourceVerificationScope sources pilots');
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.2.2');assert.equal(r.baseMain,'60ce481da3553806867fb225bd5143bef2f6584f');
 assert.equal(r.previousRecordBlob,hash);assert.equal(r.consultedOn,'2026-11-26');assert.equal(r.publicationAuthorized,false);assert.equal(r.corpusImportAuthorized,false);
 assert.equal(r.sourceVerificationScope,'identidad_localizacion_y_condiciones_documentadas_sin_validacion_de_conclusiones');
 assert.deepEqual(r.sources.map(s=>s.id),ids);
 for(const s of r.sources){
  keys(s,'id sourceId title authority url locator verification rights limit');
  assert.match(s.sourceId,/^F(02|03|05|10|17|23|25|26|27)$/);assert.ok([s.title,s.authority,s.locator,s.rights,s.limit].every(text));
  assert.equal(new URL(s.url).protocol,'https:');assert.ok(statuses.includes(s.verification));
 }
 assert.deepEqual(r.sources.filter(s=>s.verification==='documentada_y_admision_previa').map(s=>s.id),ids.slice(0,2));
 assert.deepEqual(r.sources.filter(s=>s.verification==='documentacion_previa_verificada').map(s=>s.id),['P1022-R13']);
 assert.deepEqual(r.pilots.map(x=>x.id),p.pilots.map(x=>x.id));let refs=0,pages=0,needs=0,selected=0,conditional=0;
 for(const [i,x] of r.pilots.entries()){
  const b=p.pilots[i];keys(x,'id references needs methods evidenceIds conclusions');
  assert.deepEqual(x.evidenceIds,[]);assert.deepEqual(x.conclusions,[]);
  assert.deepEqual(x.references.map(y=>y.reference),b.candidateReferences.map(y=>y.reference));
  for(const [j,y] of x.references.entries()){
   keys(y,'reference sourceId chapterUrls status exactVerseAndContextVerified');
   assert.equal(y.sourceId,ids[0]);assert.equal(y.status,'capitulos_localizados');assert.equal(y.exactVerseAndContextVerified,false);
   assert.deepEqual(y.chapterUrls,[chapterCodes[i][j]].flat().map(c=>'https://ebible.org/spaRV1909/'+c+'.htm'));refs++;pages+=y.chapterUrls.length;
  }
  assert.deepEqual(x.needs.map(y=>y.need),b.sourceNeeds.map(y=>y.need));
  for(const y of x.needs){
   keys(y,'need sourceIds status gap');assert.equal(y.status,'cobertura_parcial_pendiente');assert.ok(text(y.gap));assert.ok(y.sourceIds.length>0);
   assert.equal(new Set(y.sourceIds).size,y.sourceIds.length);assert.ok(y.sourceIds.every(id=>ids.includes(id)));needs++;
  }
  assert.deepEqual(x.methods.map(({id,status})=>({id,status})),b.methods);
  for(const y of x.methods){
   keys(y,'id status decision reason');assert.ok(text(y.reason));
   if(y.status==='pendiente_de_evidencia'){assert.equal(y.decision,'pertinencia_provisional_justificada');selected++;}
   else{assert.equal(y.status,'pendiente_de_pertinencia');assert.equal(y.decision,'evaluacion_condicionada');conditional++;}
  }
 }
 assert.deepEqual([refs,pages,needs,selected,conditional],[15,17,20,67,23]);
 return {phase:r.phase,sources:15,pilots:5,references:refs,chapterPages:pages,needsPending:needs,methodsProvisional:selected,methodsConditional:conditional,evidence:0,publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){validateP1021(loadP1021());console.log(JSON.stringify(validateP1022(loadP1022())));}
