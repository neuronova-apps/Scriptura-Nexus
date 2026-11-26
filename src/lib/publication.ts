import { sha256 } from './publication-digest.mjs';
import { type EditorialRecord, validateEditorial } from './editorial-contracts.ts';
import { type RelationSet, type RelationContext, validateRelations } from './editorial-relations.ts';
export interface SourceAdmission {id:string; admission:'admitido'; scope:'publicacion'; licenseRef:string; attribution:string; authorizationRef:string}
export interface PublicationContext extends RelationContext {admittedSources:readonly SourceAdmission[]}
export interface Snapshot {schemaVersion:1; studyId:string; version:string; previousVersion:string|null; publishedAt:string; reviewId:string; record:EditorialRecord; relations:RelationSet; bodies:Record<string,string>; digest:string}
export interface PublicationRegistry {schemaVersion:1; snapshots:Snapshot[]}
const nonempty=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0;
const civilDate=(x:unknown)=>nonempty(x)&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
function canonical(value:unknown):string {
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value!==null&&typeof value==='object'){const o=value as Record<string,unknown>;return '{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+canonical(o[k])).join(',')+'}';}
 const json=JSON.stringify(value);if(json===undefined)throw new Error('Valor no serializable');return json;
}
export function snapshotDigest(value:Omit<Snapshot,'digest'>):string{return sha256(canonical(value));}
function versionGreater(a:string,b:string):boolean{const x=a.split('.').map(BigInt),y=b.split('.').map(BigInt);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;}
export function validateSnapshot(s:Snapshot,ctx:PublicationContext):string[]{
 const errors:string[]=[];const req=(ok:unknown,msg:string)=>{if(!ok)errors.push(msg);};
 try{
  req(s&&typeof s==='object'&&!Array.isArray(s),'snapshot inválido');
  req(Object.keys(s).every(k=>['schemaVersion','studyId','version','previousVersion','publishedAt','reviewId','record','relations','bodies','digest'].includes(k)),'campo de snapshot no permitido');
  req(s.schemaVersion===1&&s.studyId===s.record.studyId&&s.version===s.record.version,'identidad o versión incoherente');
  req(civilDate(s.publishedAt),'fecha de publicación inválida');
  const structure=validateEditorial(s.record,{studyIds:ctx.studyIds,evidenceIds:s.relations.evidence.map(e=>e.id)});
  errors.push(...structure);
  if(structure.length)return errors;
  errors.push(...validateRelations(s.relations,s.record,ctx));
  const review=s.record.reviews.find(r=>r.id===s.reviewId);
  req(review?.result==='aprobada'&&review.version===s.version&&review.date>=s.record.updatedAt&&review.date<=s.publishedAt,'revisión aprobada de esta versión requerida');
  req(!s.record.reviews.some(r=>r.result!=='aprobada'&&r.date>=(review?.date??'')),'revisión posterior o simultánea no aprobada');
  req(s.record.claims.length>0&&s.record.conclusions.length>0&&s.relations.evidence.length>0,'investigación sin afirmaciones, conclusiones o evidencias');
  req(s.bodies!==null&&typeof s.bodies==='object'&&!Array.isArray(s.bodies),'cuerpos inválidos');
  const refs=new Set<string>();
  for(const section of s.record.sections){
   req(section.applicability==='revisada'||section.applicability==='no_aplicable','sección sin revisión u omisión justificada: '+section.id);
   if([1,2,17,19,20].includes(section.order))req(section.applicability==='revisada','sección obligatoria omitida: '+section.id);
   if(section.applicability==='revisada'){
    req(section.contentRef===section.id&&Object.hasOwn(s.bodies,section.id)&&nonempty(s.bodies[section.id]),'cuerpo no resuelto: '+section.id);refs.add(section.id);
   }else req(section.contentRef===undefined,'omisión con cuerpo');
  }
  req(Object.keys(s.bodies).every(k=>refs.has(k)),'cuerpo no autorizado o huérfano');
  for(const c of s.record.claims)req(c.supportingEvidenceIds.length+c.opposingEvidenceIds.length>0,'afirmación sin evidencia: '+c.id);
  for(const e of s.relations.evidence){
   req(e.verification==='verificada'&&e.permission==='autorizada','evidencia no verificada o no autorizada: '+e.id);
   for(const id of [e.bibliographyId,e.resourceId].filter(nonempty)){
    const matches=ctx.admittedSources.filter(a=>a.id===id);
    req(matches.length===1&&matches[0].admission==='admitido'&&matches[0].scope==='publicacion'&&nonempty(matches[0].licenseRef)&&nonempty(matches[0].attribution)&&nonempty(matches[0].authorizationRef),'fuente sin admisión documentada: '+id);
   }
  }
  const {digest,...payload}=s;req(/^[a-f0-9]{64}$/.test(digest)&&digest===snapshotDigest(payload),'integridad SHA-256 inválida');
 }catch{errors.push('snapshot mal formado o no serializable');}
 return errors;
}
export function validateRegistry(value:unknown,ctx:PublicationContext):asserts value is PublicationRegistry{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Registro de publicación inválido');
 const registry=value as PublicationRegistry;
 if(!registry||registry.schemaVersion!==1||!Array.isArray(registry.snapshots)||Object.keys(registry).some(k=>!['schemaVersion','snapshots'].includes(k)))throw new Error('Registro de publicación inválido');
 const latest=new Map<string,Snapshot>();
 const seen=new Set<string>();
 for(const s of registry.snapshots){
  const errors=validateSnapshot(s,ctx);if(errors.length)throw new Error(errors.join('; '));
  const key=s.studyId+'/'+s.version;if(seen.has(key))throw new Error('Versión duplicada');seen.add(key);
  const prev=latest.get(s.studyId);
  if(s.previousVersion!==(prev?.version??null)||prev&&(!versionGreater(s.version,prev.version)||s.publishedAt<prev.publishedAt))throw new Error('Cadena de versiones inválida');
  latest.set(s.studyId,s);
 }
}
export function appendSnapshot(registry:PublicationRegistry,snapshot:Snapshot,ctx:PublicationContext):PublicationRegistry{
 validateRegistry(registry,ctx);
 const next:PublicationRegistry={schemaVersion:1,snapshots:[...structuredClone(registry.snapshots),structuredClone(snapshot)]};
 validateRegistry(next,ctx);return next;
}
export function approvedSnapshot(registry:PublicationRegistry,studyId:string,ctx:PublicationContext):Snapshot|undefined{
 validateRegistry(registry,ctx);const s=registry.snapshots.filter(x=>x.studyId===studyId).at(-1);return s?structuredClone(s):undefined;
}
