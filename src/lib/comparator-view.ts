import {createReaderView, type ReaderRelease, type ReaderRef, type ReaderResult} from './reader-view.ts';
// The public adapter remains empty until P11.4. This projection does not admit documentary evidence.
export type Relation='one_to_one'|'one_to_many'|'many_to_one'|'many_to_many';
export interface ComparisonEvidence {id:string;sourceRef:string;sourceRevision:string;locator:string;reviewedBy:string;reviewedOn:string;verification:'verified'}
export interface ComparisonGroup {id:string;source:ReaderRef[];target:ReaderRef[];relationship:Relation;verification:'verified';evidence:ComparisonEvidence[]}
export type ComparatorRelease={reading:ReaderRelease;groups:ComparisonGroup[]};
export const emptyComparatorRelease=():ComparatorRelease=>({reading:{publicationAuthorized:false,editions:[]},groups:[]});
export const comparisonStatus={
 edition_unavailable:'No hay una edición disponible para esta consulta.',
 same_edition:'Selecciona dos ediciones distintas.',
 source_unavailable:'Referencia de origen no disponible.',
 target_unavailable:'Referencia de destino no disponible.',
 source_empty_marker:'La fuente de origen contiene un marcador vacío.',
 target_empty_marker:'La fuente de destino contiene un marcador vacío.',
 not_aligned:'Sin correspondencia verificada. Las lecturas son independientes.',
 target_outside_verified_group:'El destino elegido está fuera del grupo documentado. No se sustituye la selección.',
 verified_alignment:'Correspondencia documental verificada.'
} as const;
type Reading=Extract<ReaderResult,{unit:unknown}>;
export interface ComparisonResult {
 status:keyof typeof comparisonStatus;
 source:ReaderResult|null;target:ReaderResult|null;literalProbe:ReaderResult['status']|null;
 group:{id:string;relationship:Relation;evidence:ComparisonEvidence[];source:Reading[];target:Reading[];sameLanguage:boolean;literalTextEquality:boolean|null}|null;
}
const key=(r:ReaderRef)=>JSON.stringify([r.editionId,r.bookId,r.chapter,r.verse]);
const relation=(left:number,right:number):Relation=>left===1?(right===1?'one_to_one':'one_to_many'):(right===1?'many_to_one':'many_to_many');
export function createComparatorView(release:ComparatorRelease){
 const view=createReaderView(release.reading);
 if(release.reading.publicationAuthorized!==true&&release.groups.length)throw new Error('Publicación no autorizada');
 const groups=structuredClone(release.groups);
 const seen=new Set<string>(),claims=new Set<string>();
 const index=new Map<string,{group:ComparisonGroup;reverse:boolean}>();
 const groupKey=(r:ReaderRef,destination:string)=>JSON.stringify([key(r),destination]);
 const locateGroup=(rows:ReaderRef[])=>rows.map(r=>{
  const found=view.locate(r);
  if(found.status!=='available'||!('unit' in found))throw new Error('Extremo de alineación no disponible');
  return found;
 });
 const validateSide=(rows:ReaderRef[])=>{
  if(!rows.length||rows.some(r=>r.editionId!==rows[0].editionId)||new Set(rows.map(key)).size!==rows.length)throw new Error('Extremos inválidos');
  locateGroup(rows);
  const e=rows[0].editionId;
  const ranks=new Map<string,number>();let i=0;
  for(const b of view.books(e))for(const chapter of view.chapters(e,b.id))for(const verse of view.verses(e,b.id,chapter))ranks.set(key({editionId:e,bookId:b.id,chapter,verse}),i++);
  if(rows.some((r,j)=>j>0&&ranks.get(key(rows[j-1]))!>=ranks.get(key(r))!))throw new Error('Orden de extremos inválido');
 };
 for(const g of groups){
  if(!g.id||seen.has(g.id)||g.verification!=='verified'||!g.evidence.length||new Set(g.evidence.map(e=>e.id)).size!==g.evidence.length||
   g.evidence.some(e=>e.verification!=='verified'||![e.id,e.sourceRef,e.sourceRevision,e.locator,e.reviewedBy,e.reviewedOn].every(v=>typeof v==='string'&&v.trim())))throw new Error('Evidencia revisada requerida');
  validateSide(g.source);validateSide(g.target);
  if(g.source[0].editionId===g.target[0].editionId||g.relationship!==relation(g.source.length,g.target.length))throw new Error('Cardinalidad o edición inválida');
  for(const [rows,destination,reverse] of [[g.source,g.target[0].editionId,false],[g.target,g.source[0].editionId,true]] as const){
   for(const r of rows){const k=groupKey(r,destination);if(claims.has(k))throw new Error('Grupo solapado');claims.add(k);index.set(k,{group:g,reverse});}
  }
  seen.add(g.id);
 }
 function compare(source:ReaderRef,destination:string,target?:ReaderRef):ComparisonResult{
  const result:ComparisonResult={status:'not_aligned',source:null,target:null,literalProbe:null,group:null};
  const editions=view.editions();
  if(!editions.some(e=>e.id===source.editionId)||!editions.some(e=>e.id===destination))return {...result,status:'edition_unavailable'};
  if(source.editionId===destination)return {...result,status:'same_edition'};
  result.source=view.locate(source);
  if(target)result.target=target.editionId===destination?view.locate(target):{status:'edition_unavailable'};
  if(!('unit' in result.source))return {...result,status:'source_unavailable'};
  result.literalProbe=view.locate({...source,editionId:destination}).status;
  if(result.source.status==='empty_marker')return {...result,status:'source_empty_marker'};
  if(result.target&&!('unit' in result.target))return {...result,status:'target_unavailable'};
  if(result.target?.status==='empty_marker')return {...result,status:'target_empty_marker'};
  const mapped=index.get(groupKey(source,destination));
  if(!mapped)return result;
  const {group:g,reverse}=mapped;
  const lhs=reverse?g.target:g.source,rhs=reverse?g.source:g.target;
  if(target&&!rhs.some(r=>key(r)===key(target)))return {...result,status:'target_outside_verified_group'};
  const left=locateGroup(lhs),right=locateGroup(rhs),sameLanguage=left[0].edition.language===right[0].edition.language;
  return {...result,status:'verified_alignment',group:{id:g.id,relationship:relation(lhs.length,rhs.length),evidence:structuredClone(g.evidence),source:left,target:right,sameLanguage,
    literalTextEquality:sameLanguage?JSON.stringify(left.map(r=>r.unit.text))===JSON.stringify(right.map(r=>r.unit.text)):null}};
 }
 return {view,compare};
}
export type ComparatorView=ReturnType<typeof createComparatorView>;
