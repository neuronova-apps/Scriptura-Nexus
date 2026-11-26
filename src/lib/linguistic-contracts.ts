// P8.2.1: a model independent of source formats. No data is admitted by this module.
export type Language='hbo'|'arc'|'grc';
export type Component='texto_wlc'|'anotaciones_lema'|'anotaciones_morfologia'|'codigo_morfologico'|'descripcion_gramatical'|'texto_griego'|'identificadores_lexicos'|'sentidos_lexicos';
export interface AdmittedFile {id:string;commit:string;sha256:string;allowedComponents:readonly Component[]}
export interface Origin {fileId:string;commit:string;sha256:string;component:Component;locator:string}
export interface Edition {id:string;name:string;languages:Language[];version:string;versificationRef:string;canonRef:string|null;coverageBookIds:string[];fileIds:string[]}
export interface Unit {id:string;editionId:string;bookId:string;chapter:string;verse:string;order:number;text:string;origin:Origin}
export interface Token {id:string;unitId:string;position:number;form:string;language:Language;direction:'rtl'|'ltr';origin:Origin;analysisIds:string[]}
export interface Lemma {id:string;language:Language;form:string|null;homograph:string|null;providerKey:string;system:string;origin:Origin}
export interface LexicalIdentifier {id:string;system:string;version:string;code:string;lemmaIds:string[];relation:'documentada'|'alternativa'|'indeterminada';origin:Origin}
export interface MorphAnalysis {id:string;tokenId:string;lemmaId:string|null;system:string;version:string;code:string;features:Record<string,string>;state:'documentado'|'alternativo'|'sin_interpretar';origin:Origin}
export interface MorphCode {id:string;system:string;version:string;code:string;language:Language;description:string|null;origin:Origin}
export interface LinguisticRegistry {schemaVersion:1;editions:Edition[];units:Unit[];tokens:Token[];lemmas:Lemma[];identifiers:LexicalIdentifier[];analyses:MorphAnalysis[];morphCodes:MorphCode[]}
const obj=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const str=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0;
const list=(v:unknown):unknown[]=>Array.isArray(v)?v:[];
const rows=(v:unknown)=>list(v).filter(obj);
const exact=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const one=(v:unknown,options:readonly string[])=>str(v)&&options.includes(v);
const natural=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const id=(v:unknown,prefix:string)=>str(v)&&new RegExp('^'+prefix+'-[A-Za-z0-9][A-Za-z0-9_-]*$').test(v);
const lang=(v:unknown):v is Language=>one(v,['hbo','arc','grc']);
const hash=(v:unknown,n:number)=>str(v)&&new RegExp('^[a-f0-9]{'+n+'}$').test(v);
const original=(v:unknown)=>str(v)&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd\ud800-\udfff]/u.test(v);
const components=['texto_wlc','anotaciones_lema','anotaciones_morfologia','codigo_morfologico','descripcion_gramatical','texto_griego','identificadores_lexicos','sentidos_lexicos'] as const;
const groups={editions:'TXT',units:'UNIT',tokens:'TOK',lemmas:'LEM',identifiers:'LEXID',analyses:'MOR',morphCodes:'MCODE'} as const;
export function validateLinguisticRegistry(value:unknown,admissions:readonly AdmittedFile[]):string[]{
 const errors:string[]=[];const req=(ok:unknown,message:string)=>{if(!ok)errors.push(message);};
 const files=new Map<string,AdmittedFile>();
 for(const f of admissions){req(id(f.id,'LING')&&hash(f.commit,40)&&hash(f.sha256,64)&&!files.has(f.id)&&Array.isArray(f.allowedComponents)&&f.allowedComponents.length>0&&new Set(f.allowedComponents).size===f.allowedComponents.length&&f.allowedComponents.every(c=>one(c,components)),'admisión inválida o duplicada');files.set(f.id,f);}
 if(!obj(value)||!exact(value,['schemaVersion',...Object.keys(groups)])||value.schemaVersion!==1)return [...errors,'registro lingüístico inválido'];
 const by:Record<keyof typeof groups,Map<string,Record<string,unknown>>>= {editions:new Map(),units:new Map(),tokens:new Map(),lemmas:new Map(),identifiers:new Map(),analyses:new Map(),morphCodes:new Map()};
 for(const [group,prefix] of Object.entries(groups) as [keyof typeof groups,string][]){
  req(Array.isArray(value[group]),group+': lista requerida');
  for(const x of list(value[group])){if(!obj(x)||!id(x.id,prefix)||!str(x.id)){errors.push(group+': registro o ID inválido');continue;}req(!by[group].has(x.id),group+': ID duplicado');by[group].set(x.id,x);}
 }
 const ref=(v:unknown,g:keyof typeof groups)=>str(v)&&by[g].has(v);
 const refs=(v:unknown,g:keyof typeof groups)=>Array.isArray(v)&&new Set(v).size===v.length&&v.every(x=>ref(x,g));
 const fields=(x:Record<string,unknown>,keys:string[],name:string)=>req(exact(x,keys),name+': campos inválidos');
 const origin=(v:unknown,allowed:readonly Component[],label:string)=>{
  if(!obj(v)||!exact(v,['fileId','commit','sha256','component','locator'])||!str(v.fileId)||!str(v.locator)||!str(v.component)){errors.push(label+': procedencia inválida');return;}
  const f=files.get(v.fileId);
  req(f&&f.commit===v.commit&&f.sha256===v.sha256&&one(v.component,allowed)&&one(v.component,f.allowedComponents),label+': componente, versión o archivo no admitido');
 };
 const bookKey=(v:unknown)=>id(v,'LIB');
 const distinct=(v:unknown)=>Array.isArray(v)&&v.length>0&&new Set(v).size===v.length;
 const originFile=(v:unknown)=>obj(v)&&str(v.fileId)?v.fileId:'';
 for(const x of rows(value.editions)){
  fields(x,['id','name','languages','version','versificationRef','canonRef','coverageBookIds','fileIds'],'edición');
  req(str(x.name)&&str(x.version)&&str(x.versificationRef)&&(x.canonRef===null||id(x.canonRef,'CAN'))&&distinct(x.languages)&&list(x.languages).every(lang)&&distinct(x.coverageBookIds)&&list(x.coverageBookIds).every(bookKey)&&distinct(x.fileIds)&&list(x.fileIds).every(f=>str(f)&&files.has(f)),'edición inválida');
 }
 const unitKeys=new Set<string>(),orders=new Set<string>();
 for(const x of rows(value.units)){
  fields(x,['id','editionId','bookId','chapter','verse','order','text','origin'],'unidad');
  const e=str(x.editionId)?by.editions.get(x.editionId):undefined;
  req(e&&bookKey(x.bookId)&&list(e.coverageBookIds).includes(x.bookId)&&str(x.chapter)&&/^\d+$/.test(x.chapter)&&str(x.verse)&&/^[0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?$/.test(x.verse)&&natural(x.order)&&original(x.text)&&list(e.fileIds).includes(originFile(x.origin)),'unidad fuera de cobertura o inválida');
  origin(x.origin,['texto_wlc','texto_griego'],'unidad');const k=JSON.stringify([x.editionId,x.bookId,x.chapter,x.verse]),o=JSON.stringify([x.editionId,x.order]);req(!unitKeys.has(k)&&!orders.has(o),'unidad o orden duplicado');unitKeys.add(k);orders.add(o);
 }
 const positions=new Set<string>();
 for(const x of rows(value.tokens)){
  fields(x,['id','unitId','position','form','language','direction','origin','analysisIds'],'token');
  const u=str(x.unitId)?by.units.get(x.unitId):undefined;
  const e=u&&str(u.editionId)?by.editions.get(u.editionId):undefined;
  req(u&&e&&natural(x.position)&&original(x.form)&&lang(x.language)&&list(e.languages).includes(x.language)&&x.direction===(x.language==='grc'?'ltr':'rtl')&&originFile(x.origin)===originFile(u.origin)&&refs(x.analysisIds,'analyses'),'token inválido o sin unidad');
  origin(x.origin,['texto_wlc','texto_griego'],'token');
  const k=JSON.stringify([x.unitId,x.position]);req(!positions.has(k),'posición duplicada');positions.add(k);
  for(const a of list(x.analysisIds))if(str(a))req(by.analyses.get(a)?.tokenId===x.id,'análisis de otro token');
 }
 const lemmaKeys=new Set<string>();
 for(const x of rows(value.lemmas)){
  fields(x,['id','language','form','homograph','providerKey','system','origin'],'lema');
  req(lang(x.language)&&(x.form===null||original(x.form))&&(x.homograph===null||str(x.homograph))&&str(x.providerKey)&&str(x.system),'lema inválido');
  origin(x.origin,['anotaciones_lema'],'lema');const o=obj(x.origin)?x.origin:{};const k=JSON.stringify([x.language,x.system,x.providerKey,x.homograph,o.commit]);req(!lemmaKeys.has(k),'lema proveedor duplicado');lemmaKeys.add(k);
 }
 for(const x of rows(value.identifiers)){
  fields(x,['id','system','version','code','lemmaIds','relation','origin'],'identificador');
  req(str(x.system)&&str(x.version)&&str(x.code)&&refs(x.lemmaIds,'lemmas')&&one(x.relation,['documentada','alternativa','indeterminada']),'identificador inválido');
  if(x.system==='Strong'){req(str(x.code)&&/^[HG][0-9]+$/.test(x.code),'Strong estándar inválido; extensiones requieren sistema propio');for(const l of list(x.lemmaIds))if(str(l)&&str(x.code))req(x.code.startsWith('G')?by.lemmas.get(l)?.language==='grc':by.lemmas.get(l)?.language!=='grc','prefijo Strong incompatible');}
  if(x.relation==='documentada')req(list(x.lemmaIds).length>0,'correspondencia sin lema');
  origin(x.origin,['identificadores_lexicos'],'identificador');
 }
 for(const x of rows(value.analyses)){
  fields(x,['id','tokenId','lemmaId','system','version','code','features','state','origin'],'análisis');
  const t=str(x.tokenId)?by.tokens.get(x.tokenId):undefined;
  req(t&&list(t.analysisIds).includes(x.id)&&(x.lemmaId===null||ref(x.lemmaId,'lemmas')&&str(x.lemmaId)&&by.lemmas.get(x.lemmaId)?.language===t.language)&&str(x.system)&&str(x.version)&&str(x.code)&&x.system!=='Strong'&&obj(x.features)&&Object.entries(x.features).every(([k,v])=>str(k)&&str(v))&&one(x.state,['documentado','alternativo','sin_interpretar']),'análisis inválido');
  if(x.state==='sin_interpretar')req(obj(x.features)&&Object.keys(x.features).length===0,'rasgos inferidos sin interpretación');
  origin(x.origin,['anotaciones_morfologia'],'análisis');
 }
 const codeKeys=new Set<string>();
 for(const x of rows(value.morphCodes)){
  fields(x,['id','system','version','code','language','description','origin'],'código morfológico');
  req(str(x.system)&&x.system!=='Strong'&&str(x.version)&&str(x.code)&&lang(x.language)&&(x.description===null||str(x.description)),'código morfológico inválido');
  origin(x.origin,x.description===null?['codigo_morfologico']:['descripcion_gramatical'],'código morfológico');
  const k=JSON.stringify([x.system,x.version,x.code,x.language]);req(!codeKeys.has(k),'código morfológico duplicado');codeKeys.add(k);
 }
 return errors;
}
export function parseLinguisticRegistry(value:unknown,admissions:readonly AdmittedFile[]):LinguisticRegistry{
 const errors=validateLinguisticRegistry(value,admissions);if(errors.length)throw new Error(errors.join('; '));return structuredClone(value) as LinguisticRegistry;
}
// Search aliases are derived only; never replace the original form.
export function searchAlias(form:string):string{return form.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();}
