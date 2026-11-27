import type {ManuscriptView} from '../lib/manuscript-view';
export function mountManuscripts(doc:Document,view:ManuscriptView){
 const fields=doc.querySelector<HTMLFieldSetElement>('#mv-fields'), search=doc.querySelector<HTMLInputElement>('#mv-search'),
 select=doc.querySelector<HTMLSelectElement>('#mv-witness'), variant=doc.querySelector<HTMLSelectElement>('#mv-variant'),
 witnessPanel=doc.querySelector<HTMLElement>('#mv-witness-detail'), variantPanel=doc.querySelector<HTMLElement>('#mv-variant-detail'),
 status=doc.querySelector<HTMLElement>('#mv-status'), variantStatus=doc.querySelector<HTMLElement>('#mv-variant-status');
 if(!fields||!search||!select||!variant||!witnessPanel||!variantPanel||!status||!variantStatus||!view.available)return;
 const el=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const fieldsList=(pairs:[string,string][])=>{const dl=el('dl');for(const [k,v] of pairs)dl.append(el('dt',k),el('dd',v));return dl;};
 const link=(text:string,url:string)=>{const a=el('a',text);a.href=url;return a;};
 const evidenceLabels={catalog:'Identificación de catálogo',editorial_apparatus:'Referencia a aparato editorial',secondary_report:'Atestación secundaria',direct_inspection:'Examen directo documentado'} as const;
 const evidenceList=(ids:string[])=>{const ul=el('ul');for(const id of ids){const item=view.evidence(id);if(!item)continue;const {source,evidence}=item;const li=el('li');li.append(el('p',evidenceLabels[evidence.kind]+' · '+evidence.locator),link(source.title,source.url),el('p','Consulta: '+evidence.reviewedOn+' · '+source.attribution),el('p',source.rights),link('Condiciones de uso de '+source.title,source.rightsUrl));ul.append(li);}return ul;};
 const fill=(s:HTMLSelectElement,placeholder:string,items:{id:string;label:string}[])=>{const opt=(id:string,label:string)=>{const o=el('option',label);o.value=id;return o;};s.replaceChildren(opt('',placeholder),...items.map(i=>opt(i.id,i.label)));s.disabled=items.length===0;};
 const renderWitness=()=>{const w=view.witness(select.value);witnessPanel.replaceChildren();if(!w){witnessPanel.append(el('p','Selecciona un testigo para consultar su ficha.'));return;}witnessPanel.append(el('h3',w.name),fieldsList([['Identificación',w.catalogIdentifier],['Datación',w.dating],['Idioma',w.language],['Custodia',w.institution],['Signatura',w.shelfmark??'No documentada']]),el('h4','Procedencia y evidencia'),evidenceList(w.evidenceIds));};
 const filter=()=>{const items=view.witnesses(search.value);const old=select.value;fill(select,'Selecciona un testigo',items.map(w=>({id:w.id,label:w.name+' · '+w.catalogIdentifier})));if(items.some(w=>w.id===old))select.value=old;renderWitness();status.textContent=items.length===0?'No hay testigos que coincidan con la búsqueda.':items.length===1?'1 testigo disponible.':items.length+' testigos disponibles.';};
 const renderVariant=()=>{const v=view.variant(variant.value);variantPanel.replaceChildren();if(!v){variantStatus.textContent='Selecciona una variante.';variantPanel.append(el('p','No hay una variante seleccionada.'));return;}
 variantStatus.textContent='Variante seleccionada: '+v.locus;
 variantPanel.append(el('h3',v.locus),fieldsList([['Edición textual',v.edition],['Valoración',v.assessment==='not_assessed'?'No evaluada':'No concluyente']]),el('h4','Aparato editorial (referencia externa)'),evidenceList([v.apparatusEvidenceId]));
 const grid=el('div');grid.className='mv-grid';
 for(const [i,reading] of v.readings.entries()){
  const card=el('section');card.className='mv-panel';const h=el('h4','Referencia de lectura '+(i+1));h.id='mv-reading-'+i;card.setAttribute('aria-labelledby',h.id);card.append(h,el('p',reading.reference),el('p','Referencia editorial; no es una transcripción del manuscrito.'));
  if(!reading.attestations.length)card.append(el('p','Sin atestaciones documentadas. Esto no implica ausencia de la lectura.'));
  for(const a of reading.attestations){const w=view.witness(a.witnessId);if(!w)continue;card.append(el('h5',w.name),fieldsList([['Tipo de evidencia',evidenceLabels[a.basis]],['Localizador',a.locator],['Mano',a.hand??'No verificada']]),evidenceList([a.evidenceId]));}
  card.append(el('h5','Fuentes de la referencia'),evidenceList(reading.evidenceIds));grid.append(card);
 }variantPanel.append(grid);
 };
 fields.disabled=false;search.disabled=false;
 fill(variant,'Selecciona una variante',view.variants().map(v=>({id:v.id,label:v.locus+' · '+v.edition})));
 search.addEventListener('input',filter);select.addEventListener('change',renderWitness);variant.addEventListener('change',renderVariant);filter();renderVariant();
}
