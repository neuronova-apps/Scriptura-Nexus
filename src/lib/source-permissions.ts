import type {BibliographyRegistry} from './bibliography-contracts.ts';
import type {SourceAdmission} from './publication.ts';
export type UseState='permitida'|'documentada'|'pendiente'|'restringida';
export interface Permission {resourceId:string;editionId:string;licenseId:string|null;decision:'pendiente'|'aprobada'|'rechazada';uses:{consulta:UseState;cita:UseState;reproduccion:UseState;adaptacion:UseState};reviewedAt:string;basis:string;authorizationRef:string|null;reviewerRole:string|null}
export interface PermissionRegistry {schemaVersion:1;items:Permission[]}
const obj=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const str=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0;
const exact=(x:Record<string,unknown>,keys:string[])=>Object.keys(x).length===keys.length&&Object.keys(x).every(k=>keys.includes(k));
export function validatePermissions(value:unknown,b:BibliographyRegistry):string[]{
 const errors:string[]=[];const req=(ok:unknown,msg:string)=>{if(!ok)errors.push(msg);};
 if(!obj(value)||!exact(value,['schemaVersion','items'])||value.schemaVersion!==1||!Array.isArray(value.items))return ['registro de permisos inválido'];
 const seen=new Set<string>();
 for(const x of value.items){
  if(!obj(x)||!exact(x,['resourceId','editionId','licenseId','decision','uses','reviewedAt','basis','authorizationRef','reviewerRole'])){errors.push('permiso mal formado');continue;}
  if(!str(x.resourceId)){errors.push('recurso inválido');continue;}
  req(!seen.has(x.resourceId),'permiso duplicado');seen.add(x.resourceId);
  const r=b.resources.find(r=>r.id===x.resourceId);const edition=b.editions.find(e=>e.id===x.editionId);
  const license=b.licenses.find(l=>l.id===x.licenseId);
  req(r&&edition&&r.editionId===edition.id&&r.sourceId===edition.sourceId,'recurso y edición incoherentes');
  req(x.licenseId===null||Boolean(license&&r?.licenseIds.includes(license.id)),'licencia no vinculada');
  req(str(x.decision)&&['pendiente','aprobada','rechazada'].includes(x.decision),'decisión inválida');
  req(str(x.basis)&&str(x.reviewedAt)&&/^\d{4}-\d{2}-\d{2}$/.test(x.reviewedAt)&&!Number.isNaN(Date.parse(x.reviewedAt))&&new Date(x.reviewedAt).toISOString().slice(0,10)===x.reviewedAt,'revisión inválida');
  if(!obj(x.uses)||!exact(x.uses,['consulta','cita','reproduccion','adaptacion'])||!Object.values(x.uses).every(v=>str(v)&&['permitida','documentada','pendiente','restringida'].includes(v))){errors.push('alcance inválido');continue;}
  if(x.decision==='aprobada'){
   const source=b.sources.find(s=>s.id===r?.sourceId);const work=b.works.find(w=>w.id===edition?.workId);
   const authors=work?.contributors.map(c=>b.authors.find(a=>a.id===c.authorId))??[];
   req(r?.licenseIds.length===1&&r.licenseIds[0]===x.licenseId,'licencias múltiples o alcance ambiguo');
   req(str(license?.provenance.url)&&source?.provenance.verification==='verificada'&&work?.provenance.verification==='verificada'&&authors.length>0&&authors.every(a=>a?.provenance.verification==='verificada'),'cadena de procedencia incompleta');
   req(str(x.reviewedAt)&&[r,edition,license,source,work,...authors].every(item=>item&&item.provenance.consultedAt<=String(x.reviewedAt)),'revisión anterior a la consulta documental');
   req(str(x.authorizationRef)&&str(x.reviewerRole)&&license?.provenance.verification==='verificada'&&str(license.url)&&r?.provenance.verification==='verificada'&&edition?.provenance.verification==='verificada'&&r.kind==='consulta_externa'&&r.admission!=='rechazado'&&r.admission!=='restringido','aprobación sin respaldo');
   req(x.uses.cita==='permitida'&&x.uses.adaptacion==='permitida','alcance editorial insuficiente');
  }else{req(x.authorizationRef===null&&x.reviewerRole===null,'decisión no aprobada con autorización');req(x.uses.cita!=='permitida'&&x.uses.reproduccion!=='permitida'&&x.uses.adaptacion!=='permitida','uso no aprobado');}
 }
 for(const r of b.resources)req(seen.has(r.id),'recurso sin decisión: '+r.id);
 return errors;
}
export function parsePermissions(value:unknown,b:BibliographyRegistry):PermissionRegistry{const errors=validatePermissions(value,b);if(errors.length)throw new Error(errors.join('; '));return structuredClone(value) as PermissionRegistry;}
export function publicationAdmissions(b:BibliographyRegistry,p:PermissionRegistry):SourceAdmission[]{
 const validated=parsePermissions(p,b);const result:SourceAdmission[]=[];
 for(const d of validated.items.filter(x=>x.decision==='aprobada')){
  const license=b.licenses.find(l=>l.id===d.licenseId)!;
  // Edition admission is safe only when exactly one reviewed resource represents it.
  if(b.resources.filter(r=>r.editionId===d.editionId).length!==1)throw new Error('edición con recursos ambiguos');
  for(const id of [d.editionId,d.resourceId])result.push({id,admission:'admitido',scope:'publicacion',licenseRef:license.id,attribution:license.attribution,authorizationRef:d.authorizationRef!});
 }
 return result;
}
