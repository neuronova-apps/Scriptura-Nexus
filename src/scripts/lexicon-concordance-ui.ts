import type {createLexicalQuery,LexicalQuery} from '../lib/lexical-query.ts';
import type {createConcordance,ConcordanceQuery,FrequencyQuery} from '../lib/concordance.ts';
import type {Language,Origin} from '../lib/linguistic-contracts.ts';
import {languageNames,statusLabels} from '../lib/term-analyzer-view.ts';
type LexicalEngine=ReturnType<typeof createLexicalQuery>;
type ConcordanceEngine=ReturnType<typeof createConcordance>;
type Maybe<T>=T|Promise<T>;
type Lexicon={
 available:LexicalEngine['available'];
 detail:(id:string)=>Maybe<ReturnType<LexicalEngine['detail']>>;
 search:(q:LexicalQuery)=>Maybe<ReturnType<LexicalEngine['search']>>;
};
type Concordance={
 coverage:ConcordanceEngine['coverage'];
 search:(q:ConcordanceQuery)=>Maybe<ReturnType<ConcordanceEngine['search']>>;
 frequency:(q:FrequencyQuery)=>Maybe<ReturnType<ConcordanceEngine['frequency']>>;
};
const books:Record<string,string>={'LIB-Gen':'Génesis','LIB-Lev':'Levítico','LIB-Deut':'Deuteronomio','LIB-Dan':'Daniel','LIB-Acts':'Hechos','LIB-1Cor':'1 Corintios','LIB-3John':'3 Juan'};
const systems={index:'Índice léxico de Open Scriptures',strong:'Strong hebreo',bdb:'Brown-Driver-Briggs'} as const;
const labels:Record<string,string>={sin_recursos:'No hay recursos léxicos disponibles.',recurso_no_disponible:'Diccionario no disponible.',lengua_no_disponible:'No hay formas léxicas disponibles en esta lengua.',edicion_no_disponible:'Edición no disponible.',lengua_fuera_de_cobertura:'Lengua fuera de cobertura.',libro_fuera_de_cobertura:'Libro fuera de cobertura.',lema_no_disponible:'Lema no disponible.',sistema_no_disponible:'Sistema de proveedor no disponible en esta edición y lengua.'};
function settle<T>(value:Maybe<T>,done:(value:T)=>void,failed:()=>void){
 if(value&&typeof (value as Promise<T>).then==='function')void Promise.resolve(value).then(done,failed);else done(value as T);
}
export function mountLexiconConcordance(doc:Document,lexicon:Lexicon,engine:Concordance){
 const get=<T extends HTMLElement>(id:string)=>doc.getElementById(id) as T|null;
 const el=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const opt=(value:string,label:string)=>{const n=el('option',label);n.value=value;return n;};
 const original=(form:string,language:Language)=>{const n=el('bdi',form);n.lang=language;n.dir=language==='grc'?'ltr':'rtl';n.className='ta-original';return n;};
 const source=(o:Origin&{selector?:string})=>el('p','Fuente: '+o.fileId+' · '+o.component+' · '+o.locator+(o.selector?' · '+o.selector:'')+' · revisión '+o.commit+' · SHA-256 '+o.sha256);
 const button=(text:string,action:()=>void)=>{const b=el('button',text);b.type='button';b.className='sn-button sn-button--secondary';b.addEventListener('click',action);return b;};
 const lf=get<HTMLFormElement>('lc-lex-form'),lfields=get<HTMLFieldSetElement>('lc-lex-fields'),lm=get<HTMLSelectElement>('lc-lex-mode'),ll=get<HTMLSelectElement>('lc-lex-lang'),ls=get<HTMLSelectElement>('lc-lex-system'),lv=get<HTMLInputElement>('lc-lex-value'),lstatus=get('lc-lex-status'),lr=get('lc-lex-results'),ld=get('lc-lex-detail'),lp=get('lc-lex-pager'),lprev=get<HTMLButtonElement>('lc-lex-prev'),lnext=get<HTMLButtonElement>('lc-lex-next');
 if(lf&&lfields&&lm&&ll&&ls&&lv&&lstatus&&lr&&ld&&lp&&lprev&&lnext&&lexicon.available().length){
  let active:LexicalQuery|null=null,offset=0,next:number|null=null,request=0,detailRequest=0;
  const clear=()=>{request++;detailRequest++;active=null;offset=0;next=null;lr.replaceChildren();lr.hidden=true;ld.replaceChildren();ld.hidden=true;lp.hidden=true;lstatus.textContent='Selecciona una modalidad e introduce la clave exacta.';};
  const mode=()=>{clear();ll.disabled=lm.value!=='form';ls.disabled=lm.value!=='identifier';};
  const show=(id:string)=>{
   const current=++detailRequest;ld.replaceChildren();ld.hidden=true;lstatus.textContent='Cargando detalle de la entrada…';
   const finish=(d:ReturnType<LexicalEngine['detail']>)=>{
    if(current!==detailRequest)return;ld.replaceChildren();
    if(!d){lstatus.textContent='La entrada solicitada no está disponible.';return;}
    ld.append(el('h3','Entrada: '+systems[d.entry.system]+' · '+d.entry.providerKey),el('p','Lengua: '+(d.entry.language?languageNames[d.entry.language]:'No especificada en el componente autorizado')),source(d.entry.origin));
    for(const f of d.forms){const p=el('p');p.append(original(f.form,f.language));ld.append(p,source(f.origin));}
    ld.append(el('h4','Definiciones documentadas'));
    if(!d.definitions.length)ld.append(el('p','No hay definiciones directas disponibles en esta entrada.'));
    for(const v of d.definitions){const p=el('p',v.text);p.lang=v.language;ld.append(p,source(v.origin));}
    ld.append(el('h4','Referencias del proveedor'));
    for(const l of d.links){ld.append(el('p',l.kind+' · '+l.rawCode+' · '+(l.state==='documentado'?'Referencia documentada':'Sin resolver')+(l.targetKey?' · destino '+l.targetKey:'')),source(l.origin));if(l.rule)ld.append(el('p','Regla de representación: '+l.rule));if(l.targetEntryId&&l.targetEntryId!==id){const target=l.targetEntryId;ld.append(button('Consultar entrada relacionada',()=>show(target)));}}
    if(!d.links.length)ld.append(el('p','No hay referencias documentadas en esta entrada.'));
    ld.append(el('p','Las referencias no establecen sinonimia ni significado contextual.'));
    ld.hidden=false;ld.focus();lstatus.textContent='Detalle de entrada disponible.';
   };
   const failed=()=>{if(current===detailRequest)lstatus.textContent='No se pudo cargar el detalle. Intenta nuevamente.';};
   settle(lexicon.detail(id),finish,failed);
  };
  const render=()=>{
   if(!active)return;const current=++request,query={...active,offset,limit:20};lr.replaceChildren();lr.hidden=true;ld.replaceChildren();ld.hidden=true;lp.hidden=true;lstatus.textContent='Consultando el índice léxico…';
   const finish=(r:ReturnType<LexicalEngine['search']>)=>{
    if(current!==request)return;
    if(r.status!=='disponible'){lstatus.textContent=labels[r.status]??'Consulta no disponible.';return;}
    next=r.nextOffset;lstatus.textContent=r.total+' entradas. '+(r.total?'Página desde '+(offset+1)+'.':'Sin coincidencias exactas.');
    const list=el('ul');for(const entry of r.entries){const li=el('li');li.append(button(systems[entry.system]+' · '+entry.providerKey,()=>show(entry.id)));list.append(li);}lr.append(list);lr.hidden=false;lp.hidden=r.total===0;lprev.disabled=offset===0;lnext.disabled=next===null;
   };
   const failed=()=>{if(current===request)lstatus.textContent='No se pudo completar la consulta. Intenta nuevamente.';};
   settle(lexicon.search(query),finish,failed);
  };
  ls.replaceChildren(...lexicon.available().map(s=>opt(s,systems[s])));lfields.disabled=false;mode();
  lm.addEventListener('change',mode);for(const c of [ll,ls,lv]){c.addEventListener('input',clear);c.addEventListener('change',clear);}
  lf.addEventListener('submit',e=>{e.preventDefault();clear();if(!lv.value.trim()){lstatus.textContent='Introduce una clave.';return;}active=lm.value==='form'?{mode:'form',language:ll.value as Language,value:lv.value}:{mode:'identifier',system:ls.value as keyof typeof systems,value:lv.value};render();});
  lprev.addEventListener('click',()=>{offset=Math.max(0,offset-20);render();if(lprev.disabled)lstatus.focus();});lnext.addEventListener('click',()=>{if(next!==null){offset=next;render();if(lnext.disabled)lstatus.focus();}});
 }
 const cf=get<HTMLFormElement>('lc-con-form'),fields=get<HTMLFieldSetElement>('lc-con-fields'),ed=get<HTMLSelectElement>('lc-edition'),lang=get<HTMLSelectElement>('lc-lang'),book=get<HTMLSelectElement>('lc-book'),cm=get<HTMLSelectElement>('lc-mode'),sys=get<HTMLSelectElement>('lc-system'),value=get<HTMLInputElement>('lc-value'),freq=get<HTMLButtonElement>('lc-frequency'),cs=get('lc-con-status'),cr=get('lc-con-results'),cp=get('lc-con-pager'),prev=get<HTMLButtonElement>('lc-con-prev'),nextButton=get<HTMLButtonElement>('lc-con-next');
 const coverage=engine.coverage();
 if(!cf||!fields||!ed||!lang||!book||!cm||!sys||!value||!freq||!cs||!cr||!cp||!prev||!nextButton||!coverage.length)return;
 let active:{kind:'search';q:ConcordanceQuery}|{kind:'frequency';q:FrequencyQuery}|null=null,offset=0,next:number|null=null,request=0;
 const clear=()=>{request++;active=null;offset=0;next=null;cr.replaceChildren();cr.hidden=true;cp.hidden=true;cs.textContent='Selecciona los filtros y consulta.';};
 const changeEdition=()=>{clear();const e=coverage.find(x=>x.editionId===ed.value);lang.replaceChildren(opt('','Selecciona una lengua'),...(e?.languages??[]).map(l=>opt(l,languageNames[l])));book.replaceChildren(opt('','Todos los libros de la cobertura'),...(e?.bookIds??[]).map(b=>opt(b,books[b]??b)));};
 const scope=()=>({editionId:ed.value,language:lang.value as Language,...(book.value?{bookId:book.value}:{})});
 const render=()=>{
  if(!active)return;const current=++request;cr.replaceChildren();cr.hidden=true;cp.hidden=true;cs.textContent=active.kind==='frequency'?'Consultando frecuencias…':'Buscando ocurrencias…';
  const finish=(r:any)=>{
   if(current!==request)return;
   if(r.status!=='disponible'){cs.textContent=labels[r.status]??'Consulta no disponible.';return;}
   next=r.nextOffset;
   if(active?.kind==='frequency'){
    cs.textContent=r.totalKeys+' claves · '+r.totalPostings+' referencias acumuladas por clave. No son necesariamente ocurrencias únicas.';
    const list=el('ol');list.start=offset+1;
    for(const row of r.entries){const li=el('li');const key=row.key;const b=button('Consultar '+key+' ('+row.count+')',()=>{value.value=key;clear();active={kind:'search',q:query(key)};render();cs.focus();});b.dir='auto';li.append(b);list.append(li);}cr.append(list);
   }else{
    cs.textContent=r.total+' ocurrencias.'+(r.total?' Página desde '+(offset+1)+'.':' Sin coincidencias exactas.');
    const list=el('ol');list.start=offset+1;
    for(const t of r.occurrences){const li=el('li');const p=el('p'),languageLabel=languageNames[t.language as Language]??String(t.language),stateLabel=statusLabels[t.lexicalState as keyof typeof statusLabels]??String(t.lexicalState);p.append(original(t.form,t.language),doc.createTextNode(' · '+(books[t.bookId]??t.bookId)+' '+t.chapter+':'+t.verse+' · posición '+(t.position+1)));li.append(p,el('p',languageLabel+' · '+stateLabel),source(t.origin));for(const l of t.lemmas){li.append(el('p','Lema: '+l.lemmaId+' · '+l.system+' · '+l.providerKey),source(l.annotationOrigin));}if(!t.lemmas.length)li.append(el('p','Lema no disponible.'));list.append(li);}cr.append(list);
   }
   cr.hidden=false;cp.hidden=false;prev.disabled=offset===0;nextButton.disabled=next===null;
  };
  const failed=()=>{if(current===request)cs.textContent='No se pudo cargar la consulta. Intenta nuevamente.';};
  const pending=active.kind==='frequency'?engine.frequency({...active.q,offset,limit:20}):engine.search({...active.q,offset,limit:20});
  settle(pending,finish,failed);
 };
 const query=(key:string):ConcordanceQuery=>cm.value==='lemma'?{...scope(),mode:'lemma',lemmaId:key}:cm.value==='provider'?{...scope(),mode:'provider',system:sys.value,value:key}:{...scope(),mode:'form',value:key};
 const frequency=():FrequencyQuery=>cm.value==='provider'?{...scope(),mode:'provider',system:sys.value}:{...scope(),mode:cm.value==='lemma'?'lemma':'form'};
 ed.replaceChildren(opt('','Selecciona una edición'),...coverage.map(e=>opt(e.editionId,e.name+' · '+e.version)));fields.disabled=false;changeEdition();sys.disabled=true;
 ed.addEventListener('change',changeEdition);cm.addEventListener('change',()=>{clear();sys.disabled=cm.value!=='provider';});
 for(const c of [lang,book,sys,value]){c.addEventListener('input',clear);c.addEventListener('change',clear);}
 cf.addEventListener('submit',e=>{e.preventDefault();clear();if(!cf.reportValidity()||!value.value.trim()){cs.textContent='Selecciona edición, lengua y clave exacta.';return;}active={kind:'search',q:query(value.value)};render();});
 freq.addEventListener('click',()=>{clear();if(!cf.reportValidity())return;active={kind:'frequency',q:frequency()};render();});
 prev.addEventListener('click',()=>{offset=Math.max(0,offset-20);render();if(prev.disabled)cs.focus();});nextButton.addEventListener('click',()=>{if(next!==null){offset=next;render();if(nextButton.disabled)cs.focus();}});
}
