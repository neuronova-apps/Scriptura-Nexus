import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadP101,validateP101} from './validate-p101.mjs';
import {loadOperationalCatalog} from './validate-p1013.mjs';
const path='docs/P10/delimitacion-pilotos-p101.json';
export const loadP1021=()=>({bytes:readFileSync(path),record:JSON.parse(readFileSync('docs/P10/registro-flujo-p1021.json','utf8')),catalog:loadOperationalCatalog()});
export function validateP1021({bytes,record:r,catalog}){
 const d=JSON.parse(bytes);
 const hash=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 assert.equal(hash,'97ba28642507d9895b7ceaa29eef76c36681aea3');
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.2.1');
 assert.equal(r.baseMain,'c22f47de5b087f2fceb7b6ae21f7fc5df53219ca');
 assert.deepEqual(r.approval,{scope:'delimitaciones_individuales',date:'2026-11-26',request:'¿Apruebas las delimitaciones de SN-001, SN-015, SN-008, SN-021 y SN-040, tal como están documentadas, para proceder con P10.2.1?',response:'entendido, iniciar con lo indicado',sourceBlob:hash});
 assert.equal(r.publicationAuthorized,false);
 assert.deepEqual(r.pilots.map(p=>p.id),['SN-001','SN-015','SN-008','SN-021','SN-040']);
 assert.equal(catalog.length,80);
 assert.ok(catalog.every(s=>s.status==='planificado'&&s.publishedVersion===null&&s.evidenceIds.length===0));
 for(const p of r.pilots){
  const s=d.pilots.find(x=>x.id===p.id);
  assert.deepEqual(p,{id:s.id,methods:Array.from({length:18},(_,i)=>{const id='M'+String(i+1).padStart(2,'0');return {id,status:s.methods.includes(id)?'pendiente_de_evidencia':'pendiente_de_pertinencia'};}),sections:Array.from({length:20},(_,i)=>({id:s.id+'/S'+String(i+1).padStart(2,'0'),status:'pendiente'})),sourceNeeds:s.evidenceNeeds.map(need=>({need,status:'pendiente_de_verificacion'})),candidateReferences:s.candidateReferences.map(reference=>({reference,status:'orientativa_no_verificada'})),evidenceIds:[],conclusions:[]});
 }
 return {phase:r.phase,pilots:5,methodPositions:90,sectionPositions:100,sourceNeeds:r.pilots.reduce((n,p)=>n+p.sourceNeeds.length,0),references:r.pilots.reduce((n,p)=>n+p.candidateReferences.length,0),publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){validateP101(loadP101());console.log(JSON.stringify(validateP1021(loadP1021())));}
