import {readerStatus,type ReaderView,type ReaderRef,type ReaderResult} from '../lib/reader-view';
type ReaderViewLike=Omit<ReaderView,'locate'>&{locate(ref:ReaderRef):ReaderResult|Promise<ReaderResult>};
export function mountReader(doc:Document,view:ReaderViewLike){
 const form=doc.querySelector<HTMLFormElement>('#br-form'),fields=doc.querySelector<HTMLFieldSetElement>('#br-fields'),
 edition=doc.querySelector<HTMLSelectElement>('#br-edition'),book=doc.querySelector<HTMLSelectElement>('#br-book'),
 chapter=doc.querySelector<HTMLSelectElement>('#br-chapter'),verse=doc.querySelector<HTMLSelectElement>('#br-verse'),
 consult=doc.querySelector<HTMLButtonElement>('#br-consult'),prev=doc.querySelector<HTMLButtonElement>('#br-previous'),
 next=doc.querySelector<HTMLButtonElement>('#br-next'),status=doc.querySelector<HTMLElement>('#br-status'),
 heading=doc.querySelector<HTMLElement>('#br-passage-title'),passage=doc.querySelector<HTMLElement>('#br-passage'),
 source=doc.querySelector<HTMLElement>('#br-source'),detail=doc.querySelector<HTMLElement>('#br-detail');
 if(!form||!fields||!edition||!book||!chapter||!verse||!consult||!prev||!next||!status||!heading||!passage||!source||!detail)return;
 const all=view.editions();
 const option=(v:string,label:string)=>{const o=doc.createElement('option');o.value=v;o.textContent=label;return o;};
 const fill=(s:HTMLSelectElement,placeholder:string,items:{id:string;name:string}[])=>{
  s.replaceChildren(option('',placeholder),...items.map(i=>option(i.id,i.name)));s.disabled=!items.length;
 };
 const labels=(items:string[])=>items.map(v=>({id:v,name:v}));
 let before:ReaderRef|null=null,after:ReaderRef|null=null,revision=0;
 const clear=()=>{
  revision++;  before=null;after=null;prev.disabled=true;next.disabled=true;detail.hidden=true;
  passage.textContent='Selecciona y consulta una referencia.';passage.removeAttribute('lang');
  source.replaceChildren();status.textContent='Selecciona una referencia de la edición.';
  consult.disabled=![edition,book,chapter,verse].every(s=>!!s.value);
 };
 const updateVerses=()=>{fill(verse,'Selecciona un versículo',labels(view.verses(edition.value,book.value,chapter.value)));clear();};
 const updateChapters=()=>{fill(chapter,'Selecciona un capítulo',labels(view.chapters(edition.value,book.value)));updateVerses();};
 const updateBooks=()=>{fill(book,'Selecciona un libro',view.books(edition.value));updateChapters();};
 const render=(result:ReaderResult,focus:boolean)=>{
  status.textContent=readerStatus[result.status];
  if(!('unit' in result)){passage.textContent=readerStatus[result.status];return;}
  const u=result.unit,e=result.edition;
  passage.lang=e.language==='spa'?'es':'grc';passage.dir='ltr';
  passage.textContent=result.status==='empty_marker'?'Marcador sin texto en la fuente.':u.text;
  if(result.status==='empty_marker')passage.lang='es';
  const dl=doc.createElement('dl');
  for(const [k,v] of [['Edición',e.name],['Versión',e.version],['Idioma',e.language==='spa'?'Español':'Griego'],['Referencia',result.bookName+' '+u.chapter+':'+u.verse],['Localizador original',u.sourceLocator],['Recurso',u.resourceId],['Fuente',e.source],['Licencia',e.license],['Atribución',e.attribution]]){
   const dt=doc.createElement('dt'),dd=doc.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);
  }
  source.append(dl);detail.hidden=false;
  before=result.previous;after=result.next;prev.disabled=!before;next.disabled=!after;
  if(focus)heading.focus();
 };
 const read=(ref:ReaderRef,focus:boolean)=>{
  clear();const ticket=revision;
  const fail=()=>{if(ticket!==revision)return;status.textContent='No se pudo verificar el fragmento. Intenta nuevamente.';passage.textContent=status.textContent;consult.disabled=false;};
  try{const result=view.locate(ref);if(result instanceof Promise){status.textContent='Consultando referencia…';consult.disabled=true;void result.then(value=>{if(ticket===revision){consult.disabled=false;render(value,focus);}},fail).catch(fail);}else render(result,focus);}catch{fail();}
 };
 const go=(ref:ReaderRef|null)=>{if(!ref)return;edition.value=ref.editionId;updateBooks();book.value=ref.bookId;updateChapters();chapter.value=ref.chapter;updateVerses();verse.value=ref.verse;read(ref,true);};
 // No public data: preserve the accessible static state and keep every control disabled.
 form.addEventListener('submit',event=>{event.preventDefault();if(!fields.disabled&&edition.value&&book.value&&chapter.value&&verse.value)read({editionId:edition.value,bookId:book.value,chapter:chapter.value,verse:verse.value},true);});
 if(!all.length)return;
 fill(edition,'Selecciona una edición',all.map(e=>({id:e.id,name:e.name+' · '+e.version})));
 fields.disabled=false;updateBooks();
 edition.addEventListener('change',updateBooks);book.addEventListener('change',updateChapters);
 chapter.addEventListener('change',updateVerses);verse.addEventListener('change',clear);
 prev.addEventListener('click',()=>go(before));next.addEventListener('click',()=>go(after));
}
