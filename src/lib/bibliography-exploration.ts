import type {BibliographyRegistry,Work} from './bibliography-contracts.ts';
export const documentTypes:Record<Work['kind'],string>={documento_oficial:'Documento oficial',opinion_personal:'Opinión personal',estudio_academico:'Estudio académico',texto_historico:'Texto histórico',obra_referencia:'Obra de referencia',otro:'Otro documento'};
export const languageLabels:Record<string,string>={es:'Español',en:'Inglés',la:'Latín',grc:'Griego antiguo',he:'Hebreo'};
export const roleLabels={autor:'Autor',autor_institucional:'Autor institucional',editor:'Editor',traductor:'Traductor',atribucion_discutida:'Atribución discutida o tradicional'};
export const normalizeDocumentSearch=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function documentaryEntries(registry:BibliographyRegistry){
 return registry.editions.flatMap(edition=>{
  const work=registry.works.find(w=>w.id===edition.workId);
  if(!work||work.provenance.verification!=='verificada'||edition.provenance.verification!=='verificada')return [];
  const contributors=work.contributors.map(c=>({author:registry.authors.find(a=>a.id===c.authorId),role:c.role}));
  if(contributors.some(c=>!c.author||c.author.provenance.verification!=='verificada'))return [];
  const authors=contributors.flatMap(c=>c.author?[{...c.author,role:c.role}]:[]);
  const source=registry.sources.find(s=>s.id===edition.sourceId&&s.provenance.verification==='verificada');
  const resources=registry.resources.filter(r=>r.editionId===edition.id&&r.sourceId===edition.sourceId&&r.kind==='consulta_externa'&&r.admission!=='rechazado'&&r.provenance.verification==='verificada');
  if(!source||!resources.length)return [];
  return [{edition,work,authors,source,resources,traditionIds:[...new Set(authors.flatMap(a=>a.traditions.map(t=>t.traditionId)))].sort()}];
 }).sort((a,b)=>a.edition.id.localeCompare(b.edition.id));
}
export function documentSearchText(parts:readonly string[]){return normalizeDocumentSearch(parts.join(' '));}
export function matchesDocumentFilter(search:string,traditions:readonly string[],kind:string,language:string,query:string,tradition:string,type:string,lang:string):boolean{
 const terms=normalizeDocumentSearch(query).split(/\s+/).filter(Boolean);
 return terms.every(t=>search.includes(t))&&(!tradition||(tradition==='sin_atribucion'?traditions.length===0:traditions.includes(tradition)))&&(!type||kind===type)&&(!lang||language===lang);
}
