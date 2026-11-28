import {normalizeSearch,type SearchEntry} from './catalog-search.ts';
export interface ReviewSearchEntry extends Omit<SearchEntry,'status'> {status:'en_revision'}
export type MixedSearchEntry=SearchEntry|ReviewSearchEntry;
export function addReviewEntry(index:readonly SearchEntry[],id:string,references:readonly string[],keywords:readonly string[]):MixedSearchEntry[]{
 if(id!=='SN-001')throw new Error('Candidato no autorizado para esta revisión');
 const current=index.find(x=>x.id===id);
 if(!current||index.filter(x=>x.id===id).length!==1)throw new Error('Identidad de catálogo inválida');
 return index.map(x=>x.id===id?{...x,status:'en_revision',terms:normalizeSearch([x.terms,...references,...keywords].join(' '))}:x);
}
