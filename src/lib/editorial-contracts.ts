import { studySections } from './methodology.ts';
export const editorialStates = ['planificado','en_investigacion','borrador','en_revision','publicado','actualizado'] as const;
export const sectionStates = ['pendiente','aplicable','no_aplicable','analizada','revisada'] as const;
export const grades = ['explicito','solidamente_fundamentado','plausible','discutido','indeterminado'] as const;
export const claimTypes = ['mandamiento_explicito','principio_aplicable','disposicion_antiguo_pacto','practica_historico_cultural','interpretacion_teologica','tradicion_denominacional','conviccion_personal','cuestion_discutida_indeterminada'] as const;
export const reviewResults = ['pendiente','aprobada','rechazada'] as const;
export const controlResults = ['conforme','no_conforme','no_aplicable','pendiente'] as const;
export const criticalControls = ['fuentes','exactitud_textual','licencias','privacidad','aprobacion'] as const;
export type EditorialState = typeof editorialStates[number];
export type SectionState = typeof sectionStates[number];
export type Grade = typeof grades[number];
export interface Section { id:string; order:number; title:string; applicability:SectionState; justification?:string; contentRef?:string; evidenceIds:string[] }
export interface Claim { id:string; studyId:string; sectionId:string; proposition:string; type:typeof claimTypes[number]; grade:Grade; gradeJustification:string; supportingEvidenceIds:string[]; opposingEvidenceIds:string[]; reasoning:string }
export interface Conclusion { id:string; studyId:string; claimIds:string[]; synthesis:string; grade:Grade; gradeJustification:string; reservations:string[] }
export interface ReviewControl { id:string; result:typeof controlResults[number]; justification?:string }
export interface Review { id:string; studyId:string; version:string; date:string; reviewerRole:string; result:typeof reviewResults[number]; controls:ReviewControl[] }
export interface EditorialRecord { schemaVersion:1; studyId:string; version:string; createdAt:string; updatedAt:string; objective:string; scope:string; sections:Section[]; claims:Claim[]; conclusions:Conclusion[]; reviews:Review[] }
export interface ValidationContext { studyIds:readonly string[]; evidenceIds:readonly string[] }
const transitions:Record<EditorialState,readonly EditorialState[]> = {
  planificado:['en_investigacion'], en_investigacion:['borrador'], borrador:['en_investigacion','en_revision'],
  en_revision:['en_investigacion','borrador','publicado','actualizado'], publicado:['en_investigacion'], actualizado:['en_investigacion']
};
export function canTransition(from:EditorialState,to:EditorialState):boolean { return transitions[from]?.includes(to) ?? false; }
export function makeSections(studyId:string):Section[] {
  return studySections.map((title,i)=>({id:studyId+'/S'+String(i+1).padStart(2,'0'),order:i+1,title,applicability:'pendiente',evidenceIds:[]}));
}
export function validateEditorial(value:unknown,context:ValidationContext):string[] {
  const errors:string[]=[];
  const obj=(x:unknown):x is Record<string,unknown>=>typeof x==='object'&&x!==null&&!Array.isArray(x);
  const str=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0;
  const arr=(x:unknown):unknown[]=>Array.isArray(x)?x:[];
  const enumHas=(xs:readonly string[],x:unknown)=>typeof x==='string'&&xs.includes(x);
  const date=(x:unknown)=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
  const version=(x:unknown)=>typeof x==='string'&&/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(x);
  const require=(ok:unknown,msg:string)=>{if(!ok)errors.push(msg);};
  const keys=(x:Record<string,unknown>,allowed:string[],label:string)=>{for(const k of Object.keys(x))require(allowed.includes(k),label+': campo no permitido '+k);};
  const ids=(x:unknown,allowed:readonly string[],label:string,nonempty=false)=>{
    require(Array.isArray(x),label+': lista requerida'); const list=arr(x);
    require(!nonempty||list.length>0,label+': lista vacía');
    require(new Set(list).size===list.length,label+': duplicados');
    for(const id of list)require(str(id)&&allowed.includes(id),label+': referencia desconocida '+String(id));
  };
  if(!obj(value))return ['Registro editorial inválido'];
  keys(value,['schemaVersion','studyId','version','createdAt','updatedAt','objective','scope','sections','claims','conclusions','reviews'],'estudio');
  const studyId=value.studyId;
  require(value.schemaVersion===1,'schemaVersion inválida');
  require(str(studyId)&&/^SN-\d{3,}$/.test(studyId)&&context.studyIds.includes(studyId),'estudio desconocido');
  require(version(value.version),'versión inválida');
  require(date(value.createdAt)&&date(value.updatedAt)&&String(value.updatedAt)>=String(value.createdAt),'fechas inválidas');
  require(str(value.objective)&&str(value.scope),'objetivo y alcance requeridos');
  const expected=makeSections(String(studyId));
  require(Array.isArray(value.sections)&&value.sections.length===20,'20 secciones requeridas');
  for(const [i,s] of arr(value.sections).entries()){
    if(!obj(s)){errors.push('sección inválida');continue;}
    keys(s,['id','order','title','applicability','justification','contentRef','evidenceIds'],'sección');
    const e=expected[i];require(e&&s.id===e.id&&s.order===e.order&&s.title===e.title,'posición de sección inválida');
    require(enumHas(sectionStates,s.applicability),'estado de sección inválido');
    if(s.applicability==='no_aplicable')require(str(s.justification),'omisión sin justificación');
    if(s.applicability==='analizada'||s.applicability==='revisada')require(str(s.contentRef),'contenido analizado sin referencia');
    if(s.contentRef!==undefined)require(str(s.contentRef),'referencia de contenido inválida');
    ids(s.evidenceIds,context.evidenceIds,'evidencia de sección');
  }
  const claimIds:string[]=[];
  for(const field of ['claims','conclusions','reviews'])require(Array.isArray(value[field]),field+': lista requerida');
  for(const c of arr(value.claims)){
    if(!obj(c)){errors.push('afirmación inválida');continue;}
    keys(c,['id','studyId','sectionId','proposition','type','grade','gradeJustification','supportingEvidenceIds','opposingEvidenceIds','reasoning'],'afirmación');
    require(str(c.id)&&/^AF-\d+$/.test(c.id)&&!claimIds.includes(c.id),'ID afirmación inválido o duplicado');
    if(str(c.id))claimIds.push(c.id);
    require(c.studyId===studyId&&expected.some(s=>s.id===c.sectionId),'afirmación huérfana');
    require(str(c.proposition)&&str(c.reasoning)&&str(c.gradeJustification),'afirmación sin razonamiento');
    require(enumHas(claimTypes,c.type)&&enumHas(grades,c.grade),'tipo o grado inválido');
    ids(c.supportingEvidenceIds,context.evidenceIds,'evidencia a favor');
    ids(c.opposingEvidenceIds,context.evidenceIds,'evidencia en contra');
    if(c.grade==='explicito'||c.grade==='solidamente_fundamentado')require(arr(c.supportingEvidenceIds).length>0,'grado fuerte sin evidencia');
  }
  const conclusionIds=new Set<string>();
  for(const c of arr(value.conclusions)){
    if(!obj(c)){errors.push('conclusión inválida');continue;}
    keys(c,['id','studyId','claimIds','synthesis','grade','gradeJustification','reservations'],'conclusión');
    require(str(c.id)&&/^CON-\d+$/.test(c.id)&&!conclusionIds.has(c.id),'ID conclusión inválido o duplicado');
    if(str(c.id))conclusionIds.add(c.id);
    require(c.studyId===studyId&&str(c.synthesis)&&str(c.gradeJustification)&&enumHas(grades,c.grade),'conclusión inválida');
    ids(c.claimIds,claimIds,'afirmaciones de conclusión',true);
    require(Array.isArray(c.reservations)&&c.reservations.every(str),'reservas inválidas');
  }
  const reviewIds=new Set<string>();
  for(const r of arr(value.reviews)){
    if(!obj(r)){errors.push('revisión inválida');continue;}
    keys(r,['id','studyId','version','date','reviewerRole','result','controls'],'revisión');
    require(str(r.id)&&/^REV-\d+$/.test(r.id)&&!reviewIds.has(r.id),'ID revisión inválido o duplicado');
    if(str(r.id))reviewIds.add(r.id);
    require(r.studyId===studyId&&r.version===value.version&&date(r.date)&&str(r.reviewerRole)&&enumHas(reviewResults,r.result),'revisión sin vínculo válido');
    require(Array.isArray(r.controls),'controles requeridos');
    const controls=new Map<string,unknown>();
    for(const c of arr(r.controls)){
      if(!obj(c)){errors.push('control inválido');continue;}
      keys(c,['id','result','justification'],'control');
      require(str(c.id)&&!controls.has(c.id)&&enumHas(controlResults,c.result),'control inválido o duplicado');
      if(str(c.id))controls.set(c.id,c.result);
      if(c.result!=='conforme')require(str(c.justification),'control sin justificación');
      if(r.result==='aprobada')require(c.result==='conforme'||c.result==='no_aplicable','aprobación con control pendiente o no conforme');
    }
    if(r.result==='aprobada')for(const id of criticalControls)require(controls.get(id)==='conforme','aprobación sin control crítico '+id);
  }
  return errors;
}
// P6.1 only defines structural contracts. Publication remains disabled until P6.4.
export function publicationEnabled():false { return false; }
