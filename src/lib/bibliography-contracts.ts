import type {Evidence} from './editorial-relations.ts';
export const verificationStates=['pendiente','consultada','verificada'] as const;
export const sourceClasses=['A','B','C'] as const;
export type Verification=typeof verificationStates[number];
export interface Provenance {locator:string;url?:string;consultedAt:string;verification:Verification}
export interface Author {id:string;name:string;kind:'persona'|'institucion';traditions:{traditionId:string;basis:Provenance}[];provenance:Provenance}
export interface Work {id:string;title:string;contributors:{authorId:string;role:'autor'|'autor_institucional'|'editor'|'traductor'|'atribucion_discutida'}[];kind:'documento_oficial'|'opinion_personal'|'estudio_academico'|'texto_historico'|'obra_referencia'|'otro';authority:string;language:string;dateLabel?:string;provenance:Provenance}
export interface Edition {id:string;workId:string;edition:string;yearLabel:string;publisher:string;language:string;sourceId:string;url?:string;doi?:string;isbn?:string;provenance:Provenance}
export interface InventorySource {id:string;name:string;class:typeof sourceClasses[number];provider:string;conditions:string;phases:string[];url?:string;provenance:Provenance}
export interface Resource {id:string;sourceId:string;editionId?:string;versionRef:string;originUrl:string;kind:'consulta_externa'|'archivo';admission:'candidato'|'en_revision'|'admitido'|'restringido'|'rechazado';licenseIds:string[];filePath?:string;checksum?:string;provenance:Provenance}
export interface License {id:string;identifier:string;holder:string;url?:string;attribution:string;restrictions:string;scope:string;provenance:Provenance}
export interface BibliographyRegistry {schemaVersion:1;authors:Author[];works:Work[];editions:Edition[];sources:InventorySource[];resources:Resource[];licenses:License[];evidence:Evidence[]}
const obj=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const str=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0;
const arr=(x:unknown):unknown[]=>Array.isArray(x)?x:[];
const one=(x:unknown,values:readonly string[])=>str(x)&&values.includes(x);
const date=(x:unknown)=>str(x)&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const url=(x:unknown)=>{if(!str(x))return false;try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const language=(x:unknown)=>str(x)&&/^[a-z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/.test(x);
export function validateBibliography(value:unknown,traditionIds:readonly string[]):string[]{
 const errors:string[]=[];const req=(ok:unknown,msg:string)=>{if(!ok)errors.push(msg);};
 const keys=(x:Record<string,unknown>,allowed:string[],label:string)=>{for(const k of Object.keys(x))req(allowed.includes(k),label+': campo no permitido '+k);};
 const fields=(x:Record<string,unknown>,names:string[],label:string)=>{for(const k of names)req(str(x[k]),label+': '+k+' requerido');};
 const optionalUrl=(x:unknown)=>x===undefined||url(x);
 const prov=(x:unknown,label:string)=>{if(!obj(x)){errors.push(label+': procedencia requerida');return;}
  keys(x,['locator','url','consultedAt','verification'],label);
  req(str(x.locator)&&date(x.consultedAt)&&one(x.verification,verificationStates)&&optionalUrl(x.url),label+': procedencia inválida');
 };
 if(!obj(value))return ['registro bibliográfico inválido'];
 const groups={authors:'AUT',works:'OBR',editions:'BIB',sources:'F',resources:'REC',licenses:'LIC',evidence:'EVD'} as const;
 keys(value,['schemaVersion',...Object.keys(groups)],'registro');req(value.schemaVersion===1,'versión de esquema inválida');
 const ids:Record<string,string[]>={};
 for(const [group,prefix] of Object.entries(groups)){
  req(Array.isArray(value[group]),group+': lista requerida');ids[group]=[];
  for(const item of arr(value[group])){
   if(!obj(item)){errors.push(group+': registro inválido');continue;}
   const pattern=prefix==='F'?/^F\d{2,}$/:new RegExp('^'+prefix+'-\\d+$');
   req(str(item.id)&&pattern.test(item.id)&&!ids[group].includes(item.id),group+': ID inválido o duplicado');
   if(str(item.id))ids[group].push(item.id);
  }
 }
 const refs=(x:unknown,allowed:readonly string[],label:string,required=false)=>{req(Array.isArray(x),label+': lista requerida');const list=arr(x);req(!required||list.length>0,label+': lista vacía');req(new Set(list).size===list.length&&list.every(id=>one(id,allowed)),label+': duplicado o referencia desconocida');};
 for(const x of arr(value.authors).filter(obj)){
  keys(x,['id','name','kind','traditions','provenance'],'autor');fields(x,['name'],'autor');req(one(x.kind,['persona','institucion']),'tipo de autor inválido');prov(x.provenance,'autor');
  req(Array.isArray(x.traditions),'tradiciones requeridas');const seen=new Set<unknown>();
  for(const t of arr(x.traditions)){if(!obj(t)){errors.push('atribución inválida');continue;}keys(t,['traditionId','basis'],'atribución');req(one(t.traditionId,traditionIds)&&!seen.has(t.traditionId),'tradición desconocida o duplicada');seen.add(t.traditionId);prov(t.basis,'atribución');req(obj(t.basis)&&t.basis.verification==='verificada','atribución sin verificación');}
 }
 for(const x of arr(value.works).filter(obj)){
  keys(x,['id','title','contributors','kind','authority','language','dateLabel','provenance'],'obra');fields(x,['title','authority'],'obra');
  req(one(x.kind,['documento_oficial','opinion_personal','estudio_academico','texto_historico','obra_referencia','otro'])&&language(x.language),'tipo o idioma de obra inválido');
  req(x.dateLabel===undefined||str(x.dateLabel),'fecha de obra inválida');prov(x.provenance,'obra');
  req(Array.isArray(x.contributors)&&x.contributors.length>0,'obra sin contribuyentes');const seen=new Set<string>();
  for(const c of arr(x.contributors)){if(!obj(c)){errors.push('contribuyente inválido');continue;}keys(c,['authorId','role'],'contribuyente');const key=String(c.authorId)+'/'+String(c.role);req(one(c.authorId,ids.authors)&&one(c.role,['autor','autor_institucional','editor','traductor','atribucion_discutida'])&&!seen.has(key),'contribuyente desconocido o duplicado');seen.add(key);}
 }
 for(const x of arr(value.editions).filter(obj)){
  keys(x,['id','workId','edition','yearLabel','publisher','language','sourceId','url','doi','isbn','provenance'],'edición');fields(x,['edition','yearLabel','publisher'],'edición');
  req(one(x.workId,ids.works)&&one(x.sourceId,ids.sources)&&language(x.language)&&optionalUrl(x.url),'referencia o idioma de edición inválido');
  req(x.doi===undefined||(str(x.doi)&&/^10\.\d{4,9}\/\S+$/.test(x.doi)),'DOI inválido');
  req(x.isbn===undefined||(str(x.isbn)&&/^(?:\d{9}[\dX]|\d{13})$/.test(x.isbn.replace(/-/g,''))),'ISBN inválido');prov(x.provenance,'edición');
 }
 for(const x of arr(value.sources).filter(obj)){
  keys(x,['id','name','class','provider','conditions','phases','url','provenance'],'fuente');fields(x,['name','provider','conditions'],'fuente');
  req(one(x.class,sourceClasses)&&optionalUrl(x.url),'clase o URL inválida');refs(x.phases,['P7','P8','P9','investigacion'],'fases',true);prov(x.provenance,'fuente');
 }
 for(const x of arr(value.licenses).filter(obj)){
  keys(x,['id','identifier','holder','url','attribution','restrictions','scope','provenance'],'licencia');fields(x,['identifier','holder','attribution','restrictions','scope'],'licencia');req(optionalUrl(x.url),'URL de licencia inválida');prov(x.provenance,'licencia');
 }
 for(const x of arr(value.resources).filter(obj)){
  keys(x,['id','sourceId','editionId','versionRef','originUrl','kind','admission','licenseIds','filePath','checksum','provenance'],'recurso');fields(x,['versionRef'],'recurso');
  req(one(x.sourceId,ids.sources)&&(x.editionId===undefined||one(x.editionId,ids.editions))&&url(x.originUrl),'origen de recurso inválido');
  req(one(x.kind,['consulta_externa','archivo'])&&one(x.admission,['candidato','en_revision','admitido','restringido','rechazado']),'tipo o admisión inválidos');
  refs(x.licenseIds,ids.licenses,'licencias');prov(x.provenance,'recurso');
  if(x.editionId!==undefined){const e=arr(value.editions).filter(obj).find(e=>e.id===x.editionId);req(e?.sourceId===x.sourceId,'fuente de recurso y edición incoherente');}
  if(x.kind==='archivo'){req(str(x.filePath)&&!x.filePath.startsWith('/')&&!x.filePath.includes('\\')&&!x.filePath.split('/').some(p=>p==='..'||p==='.'||p==='')&&!/[:?#]/.test(x.filePath)&&str(x.checksum)&&/^[a-f0-9]{64}$/.test(x.checksum),'archivo o SHA-256 inválido');}
  if(x.kind==='consulta_externa')req(x.filePath===undefined&&x.checksum===undefined,'consulta externa con archivo');
  // P7.4 owns actual admission; this contract cannot authorize distribution.
  req(x.admission!=='admitido','admisión real reservada a P7.4');
 }
 for(const x of arr(value.evidence).filter(obj)){
  keys(x,['id','bibliographyId','resourceId','locator','language','kind','consultedAt','verification','permission','excerpt'],'evidencia');
  req(x.bibliographyId!==undefined||x.resourceId!==undefined,'evidencia sin fuente');
  if(x.bibliographyId!==undefined)req(one(x.bibliographyId,ids.editions),'edición de evidencia desconocida');
  if(x.resourceId!==undefined)req(one(x.resourceId,ids.resources),'recurso de evidencia desconocido');
  if(x.bibliographyId!==undefined&&x.resourceId!==undefined){const resource=arr(value.resources).filter(obj).find(r=>r.id===x.resourceId);req(resource?.editionId===x.bibliographyId,'edición y recurso de evidencia incoherentes');}
  req(str(x.locator)&&language(x.language)&&date(x.consultedAt)&&one(x.kind,['cita','parafrasis','traduccion_propia','observacion'])&&one(x.verification,verificationStates)&&one(x.permission,['pendiente','autorizada','restringida']),'evidencia inválida');
  if(x.verification==='verificada'){
   for(const [group,id] of [['editions',x.bibliographyId],['resources',x.resourceId]] as const)if(id!==undefined){const origin=arr(value[group]).filter(obj).find(r=>r.id===id);req(obj(origin?.provenance)&&origin.provenance.verification==='verificada','evidencia con procedencia no verificada');}
  }
  req(x.permission!=='autorizada'&&x.excerpt===undefined,'permiso de publicación reservado a P7.4');
 }
 return errors;
}
export function parseBibliography(value:unknown,traditionIds:readonly string[]):BibliographyRegistry{
 const errors=validateBibliography(value,traditionIds);if(errors.length)throw new Error(errors.join('; '));return structuredClone(value) as BibliographyRegistry;
}
