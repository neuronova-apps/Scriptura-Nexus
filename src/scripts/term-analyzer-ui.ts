import {createAnalyzerSession,languageNames,statusLabels} from '../lib/term-analyzer-view';
import type {Analyzer} from '../lib/term-analyzer-view';
import type {Origin,Language} from '../lib/linguistic-contracts';
const books:Record<string,string>={'LIB-Gen':'Génesis','LIB-Dan':'Daniel','LIB-3John':'3 Juan'};
export function mountAnalyzer(doc:Document,engine:Analyzer){
 const form=doc.querySelector<HTMLFormElement>('#ta-form'),fields=doc.querySelector<HTMLFieldSetElement>('#ta-fields'),edition=doc.querySelector<HTMLSelectElement>('#ta-edition'),book=doc.querySelector<HTMLSelectElement>('#ta-book'),chapter=doc.querySelector<HTMLInputElement>('#ta-chapter'),verse=doc.querySelector<HTMLInputElement>('#ta-verse'),word=doc.querySelector<HTMLSelectElement>('#ta-occurrence'),words=doc.querySelector<HTMLElement>('#ta-words'),status=doc.querySelector<HTMLElement>('#ta-status'),resultStatus=doc.querySelector<HTMLElement>('#ta-result-status'),result=doc.querySelector<HTMLElement>('#ta-result');
 if(!form||!fields||!edition||!book||!chapter||!verse||!word||!words||!status||!resultStatus||!result)return;
 const session=createAnalyzerSession(engine),coverage=session.coverage();
 const el=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const node=doc.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
 const option=(value:string,label:string)=>{const o=el('option',label);o.value=value;return o;};
 const original=(form:string,language:Language)=>{const b=el('bdi',form);b.lang=language;b.dir=language==='grc'?'ltr':'rtl';b.className='ta-original';return b;};
 const origin=(o:Origin)=>el('p','Fuente: '+o.fileId+' · '+o.component+' · '+o.locator+' · revisión '+o.commit);
 const clearResult=()=>{result.replaceChildren();result.hidden=true;resultStatus.textContent='Selecciona una ocurrencia de la referencia consultada.';};
 const clearWords=()=>{word.replaceChildren(option('','Sin ocurrencias disponibles'));word.disabled=true;words.replaceChildren();words.hidden=true;clearResult();};
 const reset=()=>{session.reset();clearWords();status.textContent='Selecciona y consulta una referencia.';};
 const selectBook=()=>{reset();const e=coverage.find(c=>c.editionId===edition.value);book.replaceChildren(option('','Selecciona un libro'),...(e?.bookIds??[]).map(id=>option(id,books[id]??id)));chapter.value='';verse.value='';};
 function show(id:string){
  clearResult();
  if(!id){for(const b of words.querySelectorAll('button'))b.setAttribute('aria-pressed','false');return;}
  const a=session.choose(id);
  if(a.status!=='disponible'){resultStatus.textContent=statusLabels[a.status];return;}
  word.value=id;
  for(const b of words.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.tokenId===id));
  resultStatus.textContent='Análisis de la posición '+(a.token.position+1)+' disponible.';
  const title=el('h3','Forma original');const formLine=el('p');formLine.append(original(a.token.form,a.token.language),doc.createTextNode(' · '+languageNames[a.token.language]+' · posición '+(a.token.position+1)));
  result.append(title,formLine,el('p',a.edition.name+' · '+a.edition.version+' · '+(books[a.reference.bookId]??a.reference.bookId)+' '+a.reference.chapter+':'+a.reference.verse),origin(a.token.origin),el('h3','Lema'),el('p',statusLabels[a.lexical.state as keyof typeof statusLabels]??a.lexical.state));
  if(a.lexical.raw!==null)result.append(el('p','Código original del proveedor: '+a.lexical.raw));
  if(a.lexical.origin)result.append(origin(a.lexical.origin));
  for(const c of a.lexical.components){const p=el('p','Componente '+(c.position+1)+': '+c.code+' · ');if(c.lemma?.form)p.append(original(c.lemma.form,c.lemma.language));else p.append(doc.createTextNode('Forma de lema no disponible'));result.append(p);if(c.lemma)result.append(origin(c.lemma.origin));}
  for(const d of a.lexical.direct){const p=el('p');if(d.lemma.form)p.append(original(d.lemma.form,d.lemma.language));else p.textContent='Forma de lema no disponible';result.append(p,origin(d.lemma.origin));}
  result.append(el('h3','Morfología'),el('p',statusLabels[a.morphology.state as keyof typeof statusLabels]??a.morphology.state));
  for(const m of a.morphology.analyses){result.append(el('p',m.system+' '+m.version+' · '+m.code));const features=Object.entries(m.features);if(features.length){const dl=el('dl');for(const [k,v] of features)dl.append(el('dt',k),el('dd',v));result.append(dl);}else result.append(el('p','Rasgos no interpretados o no disponibles.'));result.append(origin(m.origin));}
  result.append(el('h3','Identificadores léxicos'),el('p',a.identifiers.length?'Identificadores documentados: '+a.identifiers.map(i=>i.system+' '+i.code).join('; '):'No disponibles.'),el('h3','Significados y variantes'),el('p','Significados no disponibles. Variantes no evaluadas en este análisis.'));
  result.hidden=false;
 }
 if(!coverage.length)return;
 edition.replaceChildren(option('','Selecciona una edición'),...coverage.map(e=>option(e.editionId,e.name+' · '+e.version)));
 fields.disabled=false;selectBook();
 edition.addEventListener('change',selectBook);
 for(const c of [book,chapter,verse])c.addEventListener('input',reset);
 form.addEventListener('submit',event=>{
  event.preventDefault();clearWords();
  const selection=session.consult({editionId:edition.value,bookId:book.value,chapter:chapter.value.trim(),verse:verse.value.trim()});
  status.textContent=statusLabels[selection.status];
  if(selection.status!=='disponible'||!selection.occurrences.length)return;
  status.textContent=selection.occurrences.length+' ocurrencias disponibles.';
  word.replaceChildren(option('','Selecciona una ocurrencia'),...selection.occurrences.map(t=>option(t.id,(t.position+1)+' · '+t.form+' · '+languageNames[t.language])));
  word.disabled=false;
  words.dir=selection.occurrences.every(t=>t.direction==='rtl')?'rtl':'ltr';
  for(const t of selection.occurrences){const b=el('button');b.type='button';b.className='ta-word';b.dataset.tokenId=t.id;b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Posición '+(t.position+1)+', '+languageNames[t.language]+', '+t.form);b.append(original(t.form,t.language));b.addEventListener('click',()=>show(t.id));words.append(b);}
  words.hidden=false;
 });
 word.addEventListener('change',()=>show(word.value));
}
