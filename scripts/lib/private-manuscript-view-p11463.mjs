// Isolated presentation only. Input must come from the pinned projection.
const clone=x=>structuredClone(x);
export function createIsolatedManuscriptView(input){
 if(!input||input.mode!=='isolated_reference_only'||input.publicationAuthorized!==false)throw Error('Invalid private manuscript projection');
 const projected=clone(input);
 if(!Array.isArray(projected.witnesses)||!Array.isArray(projected.variants)||!Array.isArray(projected.sources)||!Array.isArray(projected.evidence)||projected.witnesses.length!==2||projected.variants.length!==1||projected.sources.length!==7||projected.evidence.length!==8)throw Error('Invalid private manuscript scope');
 const {witnesses,variants,sources,evidence}=projected;
 const query=value=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('es').trim();
 const view={
  available:true,
  evidenceIds:()=>evidence.map(e=>e.id),
  witnesses:(search='')=>clone(witnesses.filter(w=>query([w.name,w.catalogIdentifier,w.institution,w.dating,w.language,w.shelfmark??''].join(' ')).includes(query(search)))),
  variants:()=>clone(variants.map(v=>({id:v.id,locus:v.locus,edition:v.edition}))),
  witness:id=>clone(witnesses.find(w=>w.id===id)??null),
  variant:id=>clone(variants.find(v=>v.id===id)??null),
  evidence:id=>{const e=evidence.find(x=>x.id===id);return e?clone({evidence:e,source:sources.find(s=>s.id===e.sourceId)}):null;}
 };

 return view;
}
