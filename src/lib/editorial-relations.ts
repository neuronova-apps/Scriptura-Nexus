import { validateEditorial, comparisonScopes, type EditorialRecord } from './editorial-contracts.ts';
import { basePath } from './site.ts';
export interface Evidence {id:string; bibliographyId?:string; resourceId?:string; locator:string; language:string; kind:'cita'|'parafrasis'|'traduccion_propia'|'observacion'; consultedAt:string; verification:'pendiente'|'consultada'|'verificada'; permission:'pendiente'|'autorizada'|'restringida'; excerpt?:string}
export interface ArgumentLink {claimId:string; evidenceId:string; role:'respalda'|'refuta'|'contextualiza'; reasoning:string; comparisonScope:typeof comparisonScopes[number]; comparisonJustification:string}
export interface Position {id:string; studyId:string; traditionId:string; disciplineIds:string[]; authorId:string; claimIds:string[]; evidenceIds:string[]; scope:string; authority:string; assumptions:string; limitations:string}
export interface StudyLink {targetStudyId:string; reason:string}
export interface RelationSet {schemaVersion:1; studyId:string; evidence:Evidence[]; arguments:ArgumentLink[]; positions:Position[]; relatedStudies:StudyLink[]}
export interface RelationContext {studyIds:readonly string[]; bibliographyIds:readonly string[]; resourceIds:readonly string[]; authorIds:readonly string[]; disciplineIds:readonly string[]; traditionIds:readonly string[]; resourceEditionIds?:Readonly<Record<string,string>>}
export function validateRelations(value:unknown,record:EditorialRecord,context:RelationContext):string[]{
 const errors:string[]=[];
 const obj=(x:unknown):x is Record<string,unknown>=>typeof x==='object'&&x!==null&&!Array.isArray(x);
 const str=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0;
 const req=(ok:unknown,msg:string)=>{if(!ok)errors.push(msg);};
 const list=(x:unknown):unknown[]=>Array.isArray(x)?x:[];
 const one=(x:unknown,allowed:readonly string[])=>str(x)&&allowed.includes(x);
 const keys=(x:Record<string,unknown>,allowed:string[])=>{for(const k of Object.keys(x))req(allowed.includes(k),'campo no permitido: '+k);};
 const refs=(x:unknown,allowed:readonly string[],label:string,required=false)=>{req(Array.isArray(x),label+' lista requerida');const a=list(x);req(!required||a.length>0,label+' vacío');req(new Set(a).size===a.length,label+' duplicados');for(const id of a)req(one(id,allowed),label+' referencia desconocida');};
 const validDate=(x:unknown)=>str(x)&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
 if(!obj(value))return ['relaciones inválidas'];
 if(!obj(record))return ['registro editorial inválido'];
 keys(value,['schemaVersion','studyId','evidence','arguments','positions','relatedStudies']);
 req(value.schemaVersion===1&&value.studyId===record.studyId&&context.studyIds.includes(record.studyId),'identidad de relaciones inválida');
 for(const k of ['evidence','arguments','positions','relatedStudies'])req(Array.isArray(value[k]),k+' lista requerida');
 const evidenceIds:string[]=[];
 for(const e of list(value.evidence)){
  if(!obj(e)){errors.push('evidencia inválida');continue;}
  keys(e,['id','bibliographyId','resourceId','locator','language','kind','consultedAt','verification','permission','excerpt']);
  req(str(e.id)&&/^EVD-\d+$/.test(e.id)&&!evidenceIds.includes(e.id),'ID evidencia inválido o duplicado');if(str(e.id))evidenceIds.push(e.id);
  req(e.bibliographyId!==undefined||e.resourceId!==undefined,'evidencia sin fuente');
  if(e.bibliographyId!==undefined)req(one(e.bibliographyId,context.bibliographyIds),'edición desconocida');
  if(e.resourceId!==undefined)req(one(e.resourceId,context.resourceIds),'recurso desconocido');
  if(context.resourceEditionIds&&str(e.bibliographyId)&&str(e.resourceId))req(context.resourceEditionIds[e.resourceId]===e.bibliographyId,'edición y recurso de evidencia incoherentes');
  req(str(e.locator)&&str(e.language)&&validDate(e.consultedAt),'localizador, idioma o fecha inválidos');
  req(one(e.kind,['cita','parafrasis','traduccion_propia','observacion']),'tipo de evidencia inválido');
  req(one(e.verification,['pendiente','consultada','verificada'])&&one(e.permission,['pendiente','autorizada','restringida']),'estado de evidencia inválido');
  if(e.excerpt!==undefined)req(str(e.excerpt)&&e.permission==='autorizada','fragmento sin permiso');
 }
 const editorialErrors=validateEditorial(record,{studyIds:context.studyIds,evidenceIds});
 errors.push(...editorialErrors);if(editorialErrors.length)return errors;
 const claims=Array.isArray(record.claims)?record.claims:[];
 const claimIds=claims.map(c=>c.id);
 const pairs=new Set<string>();
 for(const l of list(value.arguments)){
  if(!obj(l)){errors.push('argumento inválido');continue;}
  keys(l,['claimId','evidenceId','role','reasoning','comparisonScope','comparisonJustification']);
  req(one(l.comparisonScope,comparisonScopes)&&str(l.comparisonJustification),'alcance canónico o justificación inválida');
  req(one(l.claimId,claimIds)&&one(l.evidenceId,evidenceIds)&&str(l.reasoning)&&one(l.role,['respalda','refuta','contextualiza']),'vínculo argumental inválido');
  const key=[l.claimId,l.evidenceId,l.role].join('|');req(!pairs.has(key),'vínculo duplicado');pairs.add(key);
  const c=claims.find(c=>c.id===l.claimId);
  if(c&&str(l.evidenceId)){
   if(l.role==='respalda')req(c.supportingEvidenceIds.includes(l.evidenceId),'respaldo no declarado');
   if(l.role==='refuta')req(c.opposingEvidenceIds.includes(l.evidenceId),'objeción no declarada');
  }
 }
 for(const c of claims){
  for(const id of c.supportingEvidenceIds)req(pairs.has([c.id,id,'respalda'].join('|')),'respaldo sin razonamiento vinculado');
  for(const id of c.opposingEvidenceIds)req(pairs.has([c.id,id,'refuta'].join('|')),'objeción sin razonamiento vinculado');
 }
 const posIds=new Set<string>();
 for(const p of list(value.positions)){
  if(!obj(p)){errors.push('postura inválida');continue;}
  keys(p,['id','studyId','traditionId','disciplineIds','authorId','claimIds','evidenceIds','scope','authority','assumptions','limitations']);
  req(str(p.id)&&/^POS-\d+$/.test(p.id)&&!posIds.has(p.id),'ID postura inválido o duplicado');if(str(p.id))posIds.add(p.id);
  req(p.studyId===record.studyId&&one(p.traditionId,context.traditionIds)&&one(p.authorId,context.authorIds),'atribución desconocida');
  refs(p.disciplineIds,context.disciplineIds,'disciplinas',true);refs(p.claimIds,claimIds,'afirmaciones',true);refs(p.evidenceIds,evidenceIds,'evidencia de atribución',true);
  req(str(p.scope)&&str(p.authority)&&str(p.assumptions)&&str(p.limitations),'postura sin alcance, autoridad o límites');
 }
 const targets=new Set<string>();
 for(const r of list(value.relatedStudies)){
  if(!obj(r)){errors.push('referencia cruzada inválida');continue;}
  keys(r,['targetStudyId','reason']);
  req(one(r.targetStudyId,context.studyIds)&&r.targetStudyId!==record.studyId&&str(r.reason),'destino o motivo inválido');
  if(str(r.targetStudyId)){req(!targets.has(r.targetStudyId),'destino duplicado');targets.add(r.targetStudyId);}
 }
 return errors;
}
export interface CatalogStudy {id:string;title:string;primaryAxisId:string;relatedAxisIds:readonly string[]}
export function catalogRelations(study:CatalogStudy,catalog:readonly CatalogStudy[],base:string){
 const axes=new Set([study.primaryAxisId,...study.relatedAxisIds]);
 return catalog.filter(s=>s.id!==study.id).map(s=>({id:s.id,title:s.title,sharedAxes:[...new Set([s.primaryAxisId,...s.relatedAxisIds])].filter(id=>axes.has(id)).sort(),href:basePath(base,'estudios/'+s.id+'/')})).filter(s=>s.sharedAxes.length>0).sort((a,b)=>b.sharedAxes.length-a.sharedAxes.length||a.id.localeCompare(b.id));
}
export function relationAnchor(id:string):string {
 if(!/^(EVD|AF|POS|CON)-\d+$/.test(id))throw new Error('ID de relación inválido');
 return 'rel-'+id;
}
