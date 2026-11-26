export type TextualLanguage='spa'|'grc';
export type TextualEditionKind='traduccion'|'edicion_critica';
export interface TextualEdition {id:string;sourceId:string;name:string;language:TextualLanguage;kind:TextualEditionKind;version:string;provider:string;resourceIds:string[];canonId:null;versificationId:null;coverageBookIds:string[];referencePolicy:'source_native_unmapped';licenseRef:string;attribution:string;sourceRevision:{archiveSha256?:string;commit?:string}}
export interface CanonBook {bookId:string;order:number;sourceRef:string}
export interface CanonContract {id:string;name:string;traditionOrContext:string;books:CanonBook[];sourceRefs:string[];status:'pendiente_revision'|'aprobado'}
export interface VersificationRule {sourceChapter:string;sourceVerse:string;targetChapter:string|null;targetVerse:string|null;relationship:'one_to_one'|'one_to_many'|'many_to_one'|'unresolved';evidenceRef:string|null}
export interface VersificationContract {id:string;name:string;version:string;sourceEditionId:string;rules:VersificationRule[];sourceRefs:string[];status:'pendiente_revision'|'aprobado'}
export interface BibleBook {id:string;code:string;names:{es:string};aliases:string[]}
export interface TextualUnit {id:string;editionId:string;bookId:string;chapter:string;verse:string;order:number;text:string;resourceId:string;sourceLocator:string;sourceSegmentSha256:string;textSha256:string}
export interface CorpusResource {id:string;sourceFileId:string;sourceId:string;path:string;bytes:number;sha256:string;component:'texto_fuente';licenseRef:string}
export interface CorpusFragment {id:string;bookId:string;resourceId:string;chapters:number;unitCount:number;emptyUnitCount:number;wordElements:number|null;rangeMarkers:number;emptyUnitLocators:string[];excludedStructures:Record<string,number>;sourceFileSha256:string;projectionSha256:string}
export interface CorpusManifest {id:string;editionId:string;dataVersion:string;resources:CorpusResource[];fragments:CorpusFragment[];integrity:{algorithm:'SHA-256';sourceFileCount:number;unitCount:number;emptyUnitCount:number;projectionSha256:string};license:{licenseRef:string;type:string;attribution:string;publicationApproved:false};persistence:'metadata_only';publicationEnabled:false}
export interface TextualProjectionReport {schemaVersion:1;phase:'P9.1.3';mode:'in_memory_validation_only';baselineMain:string;admissionManifestSha256:string;editions:TextualEdition[];books:BibleBook[];corpusManifests:CorpusManifest[];entityCounts:{ENT19:number;ENT20:number;ENT21:number;ENT22:number;ENT23:number;ENT37:number};controls:{corpusTextPersisted:false;sourceTextEmitted:false;publicRegistryChanged:false;canonAssignments:0;versificationAssignments:0;alignmentsCreated:0;publicationAuthorized:false};textPolicies:{rv1909:string;sblgnt:string}}
const record=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const list=(v:unknown):unknown[]=>Array.isArray(v)?v:[];
const str=(v:unknown)=>typeof v==='string'&&v.trim().length>0;
const hash=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const id=(v:unknown,prefix:string)=>typeof v==='string'&&new RegExp('^'+prefix+'-[A-Za-z0-9][A-Za-z0-9_-]*$').test(v);
const natural=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const unique=(v:unknown[])=>new Set(v).size===v.length;
const noControl=(v:unknown)=>typeof v==='string'&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd\ud800-\udfff]/u.test(v);
const verseLabel=(v:unknown)=>typeof v==='string'&&/^[0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?$/.test(v);
const exact=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
export function validateCanonContract(value:unknown,knownBooks:readonly BibleBook[]):string[]{
 const e:string[]=[];if(!record(value)||!exact(value,['id','name','traditionOrContext','books','sourceRefs','status']))return ['canon: estructura inválida'];
 if(!id(value.id,'CAN')||!str(value.name)||!str(value.traditionOrContext)||!['pendiente_revision','aprobado'].includes(String(value.status)))e.push('canon: identidad o estado inválido');
 const rows=list(value.books);if(!rows.length)e.push('canon: libros ausentes');
 const seen=new Set<string>(),orders=new Set<number>(),known=new Set(knownBooks.map(x=>x.id));
 for(const x of rows){if(!record(x)||!exact(x,['bookId','order','sourceRef'])||!str(x.bookId)||!known.has(String(x.bookId))||!natural(x.order)||x.order===0||!str(x.sourceRef)){e.push('canon: libro inválido');continue;}if(seen.has(String(x.bookId))||orders.has(Number(x.order)))e.push('canon: libro u orden duplicado');seen.add(String(x.bookId));orders.add(Number(x.order));}
 if(!Array.isArray(value.sourceRefs)||!unique(list(value.sourceRefs))||!list(value.sourceRefs).every(str))e.push('canon: procedencia inválida');
 if(value.status==='aprobado'&&(!rows.length||!list(value.sourceRefs).length))e.push('canon: aprobación sin fuente');
 return e;
}
export function validateVersificationContract(value:unknown,editionIds:readonly string[]):string[]{
 const e:string[]=[];if(!record(value)||!exact(value,['id','name','version','sourceEditionId','rules','sourceRefs','status']))return ['versificación: estructura inválida'];
 if(!id(value.id,'VER')||!str(value.name)||!str(value.version)||!editionIds.includes(String(value.sourceEditionId))||!['pendiente_revision','aprobado'].includes(String(value.status)))e.push('versificación: identidad o edición inválida');
 if(!Array.isArray(value.rules))e.push('versificación: reglas inválidas');
 else for(const x of value.rules){if(!record(x)||!exact(x,['sourceChapter','sourceVerse','targetChapter','targetVerse','relationship','evidenceRef'])||!str(x.sourceChapter)||!verseLabel(x.sourceVerse)||!(x.targetChapter===null||str(x.targetChapter))||!(x.targetVerse===null||verseLabel(x.targetVerse))||!['one_to_one','one_to_many','many_to_one','unresolved'].includes(String(x.relationship))||!(x.evidenceRef===null||str(x.evidenceRef))){e.push('versificación: regla inválida');continue;}if(x.relationship==='unresolved'&&(x.targetChapter!==null||x.targetVerse!==null))e.push('versificación: correspondencia no resuelta con destino');if(x.relationship!=='unresolved'&&(!str(x.targetChapter)||!verseLabel(x.targetVerse)||!str(x.evidenceRef)))e.push('versificación: correspondencia sin destino o evidencia');}
 if(!Array.isArray(value.sourceRefs)||!unique(list(value.sourceRefs))||!list(value.sourceRefs).every(str))e.push('versificación: procedencia inválida');
 if(value.status==='aprobado'&&(!list(value.rules).length||!list(value.sourceRefs).length))e.push('versificación: aprobación sin reglas o fuentes');
 return e;
}
export function validateTextualUnit(value:unknown,edition:TextualEdition,books:readonly BibleBook[],resources:readonly CorpusResource[]):string[]{
 const e:string[]=[];const keys=['id','editionId','bookId','chapter','verse','order','text','resourceId','sourceLocator','sourceSegmentSha256','textSha256'];
 if(!record(value)||!exact(value,keys))return ['unidad: estructura inválida'];
 if(!id(value.id,'UNIT')||value.editionId!==edition.id||!edition.coverageBookIds.includes(String(value.bookId))||!books.some(b=>b.id===value.bookId))e.push('unidad: edición o libro fuera de cobertura');
 if(!str(value.chapter)||!/^[1-9][0-9]*$/.test(String(value.chapter))||!verseLabel(value.verse)||!natural(value.order)||!noControl(value.text))e.push('unidad: referencia, orden o texto inválido');
 if(!edition.resourceIds.includes(String(value.resourceId))||!resources.some(r=>r.id===value.resourceId))e.push('unidad: recurso fuera de edición');
 if(!str(value.sourceLocator)||!hash(value.sourceSegmentSha256)||!hash(value.textSha256))e.push('unidad: localizador o huella inválida');
 return e;
}
export function validateTextualProjection(value:unknown):string[]{
 const e:string[]=[];const req=(ok:unknown,msg:string)=>{if(!ok)e.push(msg);};
 if(!record(value)||!exact(value,['schemaVersion','phase','mode','baselineMain','admissionManifestSha256','editions','books','corpusManifests','entityCounts','controls','textPolicies']))return ['proyección: estructura superior inválida'];
 req(value.schemaVersion===1&&value.phase==='P9.1.3'&&value.mode==='in_memory_validation_only','proyección: versión o modo inválido');
 req(value.baselineMain==='13776e1d81692ab0336929ca282c9bfaf420ee37'&&hash(value.admissionManifestSha256),'proyección: línea base o manifiesto inválido');
 const editions=list(value.editions).filter(record),books=list(value.books).filter(record),manifests=list(value.corpusManifests).filter(record);
 req(editions.length===2&&books.length===66&&manifests.length===2,'proyección: cobertura de entidades inválida');
 const byEdition=new Map(editions.map(x=>[String(x.id),x]));
 const bookIds=books.map(x=>x.id);req(unique(bookIds)&&books.every(x=>id(x.id,'LIB')&&/^[A-Z0-9]{3}$/.test(String(x.code))&&record(x.names)&&str(x.names.es)&&Array.isArray(x.aliases)&&unique(list(x.aliases))),'ENT22: libro inválido o duplicado');
 let totalUnits=0;
 for(const ed of editions){
  req(id(ed.id,'TXT')&&['F05','F03'].includes(String(ed.sourceId))&&str(ed.name)&&['spa','grc'].includes(String(ed.language))&&['traduccion','edicion_critica'].includes(String(ed.kind))&&str(ed.version)&&str(ed.provider),'ENT19: identidad inválida');
  req(Array.isArray(ed.resourceIds)&&unique(list(ed.resourceIds))&&Array.isArray(ed.coverageBookIds)&&unique(list(ed.coverageBookIds))&&list(ed.coverageBookIds).every(x=>bookIds.includes(x)),'ENT19: cobertura o recursos inválidos');
  req(ed.canonId===null&&ed.versificationId===null&&ed.referencePolicy==='source_native_unmapped','ENT19: canon o versificación asignados sin aprobación');
  req(str(ed.licenseRef)&&str(ed.attribution)&&record(ed.sourceRevision),'ENT19: licencia o procedencia inválida');
 }
 for(const manifest of manifests){
  const ed=byEdition.get(String(manifest.editionId));req(Boolean(ed)&&id(manifest.id,'COR'),'ENT37: edición o ID inválido');
  req(manifest.dataVersion==='p9.1.3-projection-v1'&&manifest.persistence==='metadata_only'&&manifest.publicationEnabled===false,'ENT37: persistencia o publicación habilitada');
  const resources=list(manifest.resources).filter(record),fragments=list(manifest.fragments).filter(record);
  const edResourceIds=ed&&Array.isArray(ed.resourceIds)?ed.resourceIds:[];
  const edBookIds=ed&&Array.isArray(ed.coverageBookIds)?ed.coverageBookIds:[];
  req(resources.length===fragments.length&&resources.length===edResourceIds.length,'ENT37: cardinalidad de recursos');
  const resourceIds=resources.map(x=>x.id);req(unique(resourceIds)&&resources.every(x=>id(x.id,'REC')&&str(x.sourceFileId)&&str(x.sourceId)&&str(x.path)&&natural(x.bytes)&&Number(x.bytes)>0&&hash(x.sha256)&&x.component==='texto_fuente'&&str(x.licenseRef)),'ENT37: recurso inválido');
  req(JSON.stringify(resourceIds)===JSON.stringify(edResourceIds),'ENT37: orden de recursos divergente');
  let units=0,empty=0;
  const fragmentBooks=fragments.map(x=>x.bookId);req(unique(fragmentBooks)&&JSON.stringify(fragmentBooks)===JSON.stringify(edBookIds),'ENT37: cobertura de fragmentos divergente');
  for(const f of fragments){
   const r=resources.find(x=>x.id===f.resourceId);
   req(id(f.id,'FRAG')&&bookIds.includes(String(f.bookId))&&Boolean(r)&&f.sourceFileSha256===r?.sha256&&natural(f.chapters)&&natural(f.unitCount)&&natural(f.emptyUnitCount)&&Number(f.emptyUnitCount)<=Number(f.unitCount)&&Array.isArray(f.emptyUnitLocators)&&unique(list(f.emptyUnitLocators))&&list(f.emptyUnitLocators).length===Number(f.emptyUnitCount)&&record(f.excludedStructures)&&Object.values(f.excludedStructures).every(natural)&&(f.wordElements===null||natural(f.wordElements))&&natural(f.rangeMarkers)&&hash(f.projectionSha256),'ENT37: fragmento inválido');
   units+=Number(f.unitCount)||0;empty+=Number(f.emptyUnitCount)||0;
  }
  const integrity=record(manifest.integrity)?manifest.integrity:{};
  req(integrity.algorithm==='SHA-256'&&integrity.sourceFileCount===resources.length&&integrity.unitCount===units&&integrity.emptyUnitCount===empty&&hash(integrity.projectionSha256),'ENT37: integridad global inválida');
  req(units>0,'ENT37: sin unidades');totalUnits+=units;
  const license=record(manifest.license)?manifest.license:{};
  req(str(license.licenseRef)&&license.licenseRef===ed?.licenseRef&&str(license.type)&&str(license.attribution)&&license.publicationApproved===false,'ENT37: licencia inválida');
 }
 const counts=record(value.entityCounts)?value.entityCounts:{};
 req(counts.ENT19===2&&counts.ENT20===0&&counts.ENT21===0&&counts.ENT22===66&&counts.ENT23===totalUnits&&counts.ENT37===2,'conteo ENT19–23/37 divergente');
 const controls=record(value.controls)?value.controls:{};
 req(controls.corpusTextPersisted===false&&controls.sourceTextEmitted===false&&controls.publicRegistryChanged===false&&controls.canonAssignments===0&&controls.versificationAssignments===0&&controls.alignmentsCreated===0&&controls.publicationAuthorized===false,'barrera de publicación o persistencia alterada');
 const policies=record(value.textPolicies)?value.textPolicies:{};
 req(str(policies.rv1909)&&str(policies.sblgnt),'política de transformación ausente');
 req(!Object.hasOwn(value,'units')&&!Object.hasOwn(value,'tokens')&&!Object.hasOwn(value,'alignments'),'el informe no debe contener corpus, tokens ni alineaciones');
 return e;
}
