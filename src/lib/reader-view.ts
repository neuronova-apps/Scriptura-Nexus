// Presentation model: only a caller-provided, authorized release can contain reading data.
// P9.2.3 supplies an empty release to the public page. Test fixtures live outside src.
export interface ReaderUnit {
  chapter:string; verse:string; text:string; sourceLocator:string; resourceId:string;
}
export interface ReaderBook {id:string; name:string; units:ReaderUnit[]}
export interface ReaderEdition {id:string; name:string; version:string; language:'spa'|'grc'; attribution:string; license:string; source:string; books:ReaderBook[]}
export interface ReaderRef {editionId:string;bookId:string;chapter:string;verse:string}
export type ReaderRelease={publicationAuthorized:false;editions:[]} | {publicationAuthorized:true;editions:ReaderEdition[]};
export const emptyReaderRelease=():ReaderRelease=>({publicationAuthorized:false,editions:[]});
export const readerStatus={
  edition_unavailable:'No hay una edición disponible para esta consulta.',
  book_outside_coverage:'El libro no está incluido en la cobertura de esta edición.',
  chapter_not_found:'El capítulo no se encuentra en la edición seleccionada.',
  reference_not_found:'La referencia exacta no está disponible.',
  empty_marker:'La fuente contiene este marcador sin texto.',
  available:'Referencia disponible.'
} as const;
type Failure={status:'edition_unavailable'|'book_outside_coverage'|'chapter_not_found'|'reference_not_found'};
type Success={status:'available'|'empty_marker';unit:ReaderUnit;edition:Omit<ReaderEdition,'books'>;bookName:string;previous:ReaderRef|null;next:ReaderRef|null};
export type ReaderResult=Failure|Success;
export function createReaderView(release:ReaderRelease){
  if(release.publicationAuthorized!==true&&release.editions.length)throw new Error('Publicación no autorizada');
  const editions=structuredClone(release.publicationAuthorized===true?release.editions:[]);
  const unique=(ids:string[])=>new Set(ids).size===ids.length;
  if(!unique(editions.map(e=>e.id)))throw new Error('Edición duplicada');
  for(const e of editions){
    if(!e.id||!e.name||!e.version||!e.attribution||!e.license||!e.source||!['spa','grc'].includes(e.language)||!unique(e.books.map(b=>b.id)))throw new Error('Edición inválida');
    for(const b of e.books){
      if(!b.id||!b.name||!b.units.length||!unique(b.units.map(u=>u.chapter+'\u001f'+u.verse)))throw new Error('Libro o referencia duplicada');
      for(const u of b.units)if(!/^[1-9][0-9]*$/.test(u.chapter)||!/^[0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?$/.test(u.verse)||typeof u.text!=='string'||!u.sourceLocator||!u.resourceId)throw new Error('Unidad inválida');
    }
  }
  const getEdition=(id:string)=>editions.find(e=>e.id===id);
  const getBook=(e:string,b:string)=>getEdition(e)?.books.find(x=>x.id===b);
  const summarize=({books:_,...e}:ReaderEdition)=>({...e});
  function locate(ref:ReaderRef):ReaderResult{
    const e=getEdition(ref.editionId);if(!e)return {status:'edition_unavailable'};
    const b=e.books.find(x=>x.id===ref.bookId);if(!b)return {status:'book_outside_coverage'};
    if(!b.units.some(u=>u.chapter===ref.chapter))return {status:'chapter_not_found'};
    const i=b.units.findIndex(u=>u.chapter===ref.chapter&&u.verse===ref.verse);
    if(i===-1)return {status:'reference_not_found'};
    const u=b.units[i];
    const neighbor=(j:number):ReaderRef|null=>b.units[j]?{editionId:e.id,bookId:b.id,chapter:b.units[j].chapter,verse:b.units[j].verse}:null;
    return {status:u.text?'available':'empty_marker',unit:{...u},edition:summarize(e),bookName:b.name,previous:neighbor(i-1),next:neighbor(i+1)};
  }
  return {
    editions:()=>editions.map(summarize),
    books:(edition:string)=>(getEdition(edition)?.books??[]).map(({id,name})=>({id,name})),
    chapters:(edition:string,book:string)=>[...new Set((getBook(edition,book)?.units??[]).map(u=>u.chapter))],
    verses:(edition:string,book:string,chapter:string)=>(getBook(edition,book)?.units??[]).filter(u=>u.chapter===chapter).map(u=>u.verse),
    locate
  };
}
export type ReaderView=ReturnType<typeof createReaderView>;
