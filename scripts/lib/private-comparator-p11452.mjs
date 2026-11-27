// P11.4.5.2: private comparison contract. No public route imports this module.
import {createIsolatedFragmentReader} from '../../src/lib/reader-fragment-view.ts';
const expected=['TXT-RV1909','TXT-SBLGNT-V1-2'];
const validRef=r=>r&&['editionId','bookId','chapter','verse'].every(k=>typeof r[k]==='string'&&r[k].length>0);
const copyRef=r=>({editionId:r.editionId,bookId:r.bookId,chapter:r.chapter,verse:r.verse});
export function createPrivateComparator(catalog,load,registry){
 if(!registry||registry.schemaVersion!==1||registry.phase!=='P9.3.1'||registry.scope!=='unit'||registry.publicationAuthorized!==false||!Array.isArray(registry.evidence)||registry.evidence.length||!Array.isArray(registry.alignments)||registry.alignments.length)throw new Error('Registro ENT30 no admitido en P11.4.5.2');
 const view=createIsolatedFragmentReader(catalog,load);
 const ids=view.editions().map(e=>e.id);
 if(ids.length!==2||!expected.every(e=>ids.includes(e)))throw new Error('Ediciones fuera del alcance privado');
 // A label probe uses metadata only. It cannot report textual availability or equivalence.
 function probe(ref,destination){
  if(!view.books(destination).some(b=>b.id===ref.bookId))return 'book_outside_coverage';
  if(!view.chapters(destination,ref.bookId).includes(ref.chapter))return 'chapter_not_found';
  return view.verses(destination,ref.bookId,ref.chapter).includes(ref.verse)?'label_present':'reference_not_found';
 }
 async function compare(source,destination,target){
  if(!validRef(source)||typeof destination!=='string'||(target!==undefined&&!validRef(target)))throw new TypeError('Referencia inválida');
  const s=copyRef(source),t=target===undefined?undefined:copyRef(target);
  const result={status:'not_aligned',source:null,target:null,literalProbe:null,group:null};
  if(!ids.includes(s.editionId)||!ids.includes(destination))return {...result,status:'edition_unavailable'};
  if(s.editionId===destination)return {...result,status:'same_edition'};
  // Sequential lookups keep the existing bounded single-chapter cache.
  result.source=await view.locate(s);
  if(t)result.target=t.editionId===destination?await view.locate(t):{status:'edition_unavailable'};
  if(!('unit' in result.source))return {...result,status:'source_unavailable'};
  result.literalProbe=probe(s,destination);
  if(result.source.status==='empty_marker')return {...result,status:'source_empty_marker'};
  if(result.target&&!('unit' in result.target))return {...result,status:'target_unavailable'};
  if(result.target?.status==='empty_marker')return {...result,status:'target_empty_marker'};
  return result;
 }
 return {view,compare};
}
