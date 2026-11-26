import {comparisonStatus,type ComparatorView,type Relation} from '../lib/comparator-view';
import {readerStatus,type ReaderResult,type ReaderRef} from '../lib/reader-view';
const relations:Record<Relation,string>={one_to_one:'Uno a uno',one_to_many:'Uno a varios',many_to_one:'Varios a uno',many_to_many:'Varios a varios'};
export function mountComparator(doc:Document,engine:ComparatorView){
 const form=doc.querySelector<HTMLFormElement>('#bc-form'),submit=doc.querySelector<HTMLButtonElement>('#bc-consult'),
 fields=doc.querySelector<HTMLFieldSetElement>('#bc-fields'),status=doc.querySelector<HTMLElement>('#bc-status'),
 heading=doc.querySelector<HTMLElement>('#bc-result-title'),origin=doc.querySelector<HTMLElement>('#bc-origin-result'),
 dest=doc.querySelector<HTMLElement>('#bc-target-result'),evidence=doc.querySelector<HTMLElement>('#bc-evidence'),
 diagnostic=doc.querySelector<HTMLElement>('#bc-diagnostic');
 const controls=(side:string)=>['edition','book','chapter','verse'].map(k=>doc.querySelector<HTMLSelectElement>('#bc-'+side+'-'+k));
 const left=controls('origin'),right=controls('target');
 if(!form||!submit||!fields||!status||!heading||!origin||!dest||!evidence||!diagnostic||left.some(x=>!x)||right.some(x=>!x))return;
 const l=left as HTMLSelectElement[],r=right as HTMLSelectElement[];
 const all=engine.view.editions();
 const el=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const fill=(s:HTMLSelectElement,placeholder:string,items:{id:string;name:string}[])=>{
  const option=(v:string,label:string)=>{const o=el('option',label);o.value=v;return o;};
  s.replaceChildren(option('',placeholder),...items.map(i=>option(i.id,i.name)));s.disabled=!items.length;
 };
 const labels=(v:string[])=>v.map(id=>({id,name:id}));
 const ref=(s:HTMLSelectElement[]):ReaderRef=>({editionId:s[0].value,bookId:s[1].value,chapter:s[2].value,verse:s[3].value});
 const ready=()=>l.every(s=>!!s.value)&&!!r[0].value&&l[0].value!==r[0].value&&(r.slice(1).every(s=>!s.value)||r.slice(1).every(s=>!!s.value));
 const clear=()=>{
  origin.replaceChildren(el('p','Selecciona y consulta la referencia de origen.'));
  dest.replaceChildren(el('p','Selecciona una referencia de destino o consulta una correspondencia documentada.'));
  evidence.replaceChildren(el('p','No se ha consultado una correspondencia.'));
  diagnostic.textContent='';status.textContent=l[0].value&&l[0].value===r[0].value?comparisonStatus.same_edition:'Selecciona las ediciones y referencias.';submit.disabled=!ready();
 };
 const updateVerses=(s:HTMLSelectElement[])=>{fill(s[3],'Selecciona un versículo',labels(engine.view.verses(s[0].value,s[1].value,s[2].value)));clear();};
 const updateChapters=(s:HTMLSelectElement[])=>{fill(s[2],'Selecciona un capítulo',labels(engine.view.chapters(s[0].value,s[1].value)));updateVerses(s);};
 const updateBooks=(s:HTMLSelectElement[])=>{fill(s[1],s===r?'Sin selección (consultar correspondencia)':'Selecciona un libro',engine.view.books(s[0].value));updateChapters(s);};
 const render=(parent:HTMLElement,items:ReaderResult[],empty:string)=>{
  parent.replaceChildren();
  if(!items.length){parent.append(el('p',empty));return;}
  for(const item of items){
   if(!('unit' in item)){parent.append(el('p',readerStatus[item.status]));continue;}
   const e=item.edition,u=item.unit;
   parent.append(el('h4',item.bookName+' '+u.chapter+':'+u.verse),el('p',e.name+' · '+e.version));
   const text=el('p',item.status==='empty_marker'?readerStatus.empty_marker:u.text);text.className='bc-reading';
   text.lang=item.status==='empty_marker'||e.language==='spa'?'es':'grc';text.dir='ltr';parent.append(text);
   const dl=el('dl');for(const [k,v] of [['Idioma',e.language==='spa'?'Español':'Griego'],['Recurso',u.resourceId],['Localizador',u.sourceLocator],['Fuente',e.source],['Licencia',e.license],['Atribución',e.attribution]])dl.append(el('dt',k),el('dd',v));
   parent.append(dl);
  }
 };
 form.addEventListener('submit',event=>{
  event.preventDefault();if(fields.disabled||!ready())return;
  const x=engine.compare(ref(l),r[0].value,r[1].value?ref(r):undefined);
  status.textContent=comparisonStatus[x.status];
  diagnostic.textContent=x.literalProbe?'Consulta de la misma etiqueta en destino: '+readerStatus[x.literalProbe]+' Esto no constituye una alineación.':'';
  render(origin,x.group?.source??(x.source?[x.source]:[]),'Sin lectura de origen.');
  render(dest,x.group?.target??(x.target?[x.target]:[]),'Sin destino seleccionado ni correspondencia verificada.');
  evidence.replaceChildren();
  if(x.group){
   evidence.append(el('p',relations[x.group.relationship]),el('p',x.group.sameLanguage?(x.group.literalTextEquality?'Secuencias de texto literalmente iguales.':'Secuencias de texto literalmente diferentes.'):'Idiomas distintos: no se evalúa igualdad literal.'));
   for(const ev of x.group.evidence){const dl=el('dl');for(const [k,v] of [['Evidencia',ev.id],['Fuente',ev.sourceRef],['Revisión',ev.sourceRevision],['Localizador',ev.locator],['Revisado por',ev.reviewedBy],['Fecha',ev.reviewedOn]])dl.append(el('dt',k),el('dd',v));evidence.append(dl);}
  }else evidence.append(el('p','Sin grupo de correspondencia verificado para esta consulta.'));
  heading.focus();
 });
 if(all.length<2)return;
 for(const s of [l,r]){
  fill(s[0],'Selecciona una edición',all.map(e=>({id:e.id,name:e.name+' · '+e.version})));
  updateBooks(s);
  s[0].addEventListener('change',()=>updateBooks(s));s[1].addEventListener('change',()=>updateChapters(s));s[2].addEventListener('change',()=>updateVerses(s));s[3].addEventListener('change',clear);
 }
 fields.disabled=false;clear();
}
