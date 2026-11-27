// P9.5: reconcile prior decisions and projections without reading or emitting biblical text.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {validateManuscriptPilot} from '../src/lib/manuscript-pilot.ts';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const keys=['editions','witnesses','variants','readings','translations'];
const gates=['publicationAuthorized','corpusImportAuthorized','textualContentPersisted','apparatusContentPersisted','imagesPersisted','automaticWitnessAttribution','automaticAlignment'];
export function loadClosureInputs(){
 const admissionBytes=readFileSync('docs/P9/admisiones-ediciones-p912.json');
 return {admissionBytes,admission:JSON.parse(admissionBytes),projection:read('docs/P9/proyeccion-ediciones-p913.json'),alignment:read('docs/P9/alineaciones-p931.json'),candidates:read('docs/P9/candidatos-manuscritos-p941.json'),historic:read('docs/P9/registro-manuscritos-p942.json'),pilot:read('docs/P9/muestra-manuscritos-p943.json'),linguistic:read('src/data/linguistica/registro.json'),publications:read('src/data/publicaciones/registro.json')};
}
const sorted=items=>[...items].sort();
const nonblank=v=>typeof v==='string'&&v.trim().length>0;
const sum=(rows,key)=>rows.reduce((n,x)=>n+x[key],0);
export function auditTextualClosure({admissionBytes,admission:a,projection:p,alignment,candidates,historic,pilot,linguistic,publications}){
 assert.deepEqual(a,JSON.parse(admissionBytes),'Decisión y bytes de admisión no coinciden');
 assert.equal(p.admissionManifestSha256,sha(admissionBytes),'Huella de admisión no coincide');
 assert.deepEqual(a.publication,{authorized:false,gate:'P11.4',publicCorpusPersisted:false,publicRegistriesRemainEmpty:true});
 assert.deepEqual(sorted(a.decisions.map(x=>x.id)),['ED-C01','ED-C02']);
 assert.ok(a.deferred.every(x=>x.status!=='admitido'));
 assert.equal(a.deferred.find(x=>x.sourceId==='F19')?.status,'sin_ampliacion');
 assert.deepEqual(p.controls,{alignmentsCreated:0,canonAssignments:0,corpusTextPersisted:false,publicRegistryChanged:false,publicationAuthorized:false,sourceTextEmitted:false,versificationAssignments:0});
 assert.deepEqual(p.entityCounts,{ENT19:2,ENT20:0,ENT21:0,ENT22:66,ENT23:39041,ENT37:2});
 assert.equal(p.mode,'in_memory_validation_only');
 const specs=[{id:'TXT-RV1909',decision:'ED-C01',kind:'traduccion',language:'spa',license:'LIC-ED-C01-PUBLIC-DOMAIN-DECLARED',books:66,chapters:1189,units:31102,empty:18},{id:'TXT-SBLGNT-V1-2',decision:'ED-C02',kind:'edicion_critica',language:'grc',license:'LIC-CC-BY-4.0',books:27,chapters:260,units:7939,empty:0}];
 assert.deepEqual(sorted(p.editions.map(x=>x.id)),sorted(specs.map(x=>x.id)));
 assert.deepEqual(sorted(p.corpusManifests.map(x=>x.editionId)),sorted(specs.map(x=>x.id)));
 assert.equal(p.books.length,66);assert.equal(new Set(p.books.map(b=>b.id)).size,66);
 const allResources=new Set(),allFragments=new Set(),summary=[];
 for(const s of specs){
  const d=a.decisions.find(x=>x.id===s.decision),e=p.editions.find(x=>x.id===s.id),m=p.corpusManifests.find(x=>x.editionId===s.id);
  assert.equal(d.admissionStatus,'admitido');assert.equal(d.projectPublication.approved,false);assert.equal(d.projectPublication.gate,'P11.4');assert.equal(d.scope.canonId,null);assert.equal(d.scope.versificationId,null);assert.equal(d.scope.alignmentAllowed,false);
  assert.equal(e.sourceId,d.sourceId);assert.equal(e.kind,s.kind);assert.equal(e.language,s.language);assert.equal(e.kind,d.type);assert.equal(e.language,d.language);
  assert.equal(e.canonId,null);assert.equal(e.versificationId,null);assert.equal(e.referencePolicy,'source_native_unmapped');
  assert.equal(e.licenseRef,s.license);assert.equal(m.license.licenseRef,s.license);assert.equal(m.license.publicationApproved,false);assert.equal(m.license.attribution,e.attribution);assert.ok(nonblank(e.attribution));assert.ok(nonblank(d.license.url));
  assert.equal(m.publicationEnabled,false);assert.equal(m.persistence,'metadata_only');
  if(s.decision==='ED-C01'){
   assert.equal(d.license.type,'Public Domain');assert.equal(d.license.territorialLegalOpinion,false);
   assert.equal(m.license.type,'Public Domain declarado por distribuidor');assert.equal(e.sourceRevision.archiveSha256,d.sourceArchive.sha256);
   assert.match(e.attribution,/Reina y Valera/);assert.match(e.attribution,/eBible/);
  }else{
   assert.equal(d.license.type,'CC BY 4.0');assert.equal(m.license.type,d.license.type);assert.equal(e.sourceRevision.commit,d.sourceCommit);
   assert.equal(e.version,d.version);for(const credit of ['Michael W. Holmes','Society of Biblical Literature','Logos Bible Software','CC BY 4.0'])assert.ok(e.attribution.includes(credit)&&d.attribution.suggestedCredit.includes(credit));
  }
  const sourceFiles=s.decision==='ED-C01'?d.sourceArchive.files:d.sourceFiles;
  assert.equal(sourceFiles.length,s.books);assert.equal(m.resources.length,s.books);assert.equal(m.fragments.length,s.books);assert.equal(e.coverageBookIds.length,s.books);
  assert.deepEqual(e.resourceIds,m.resources.map(x=>x.id));assert.deepEqual(e.coverageBookIds,m.fragments.map(x=>x.bookId));
  assert.equal(new Set(e.coverageBookIds).size,s.books);assert.ok(e.coverageBookIds.every(id=>p.books.some(b=>b.id===id)));
  const byPath=new Map(sourceFiles.map(f=>[f.path,f]));assert.equal(byPath.size,s.books);
  const byResource=new Map(m.resources.map(x=>[x.id,x]));assert.equal(byResource.size,s.books);
  assert.equal(new Set(m.resources.map(x=>x.path)).size,s.books);
  assert.equal(new Set(m.fragments.map(x=>x.resourceId)).size,s.books);
  for(const resource of m.resources){
   assert.ok(!allResources.has(resource.id));allResources.add(resource.id);const f=byPath.get(resource.path);assert.ok(f,'Archivo no admitido');
   assert.equal(resource.component,'texto_fuente');assert.equal(resource.sourceId,d.sourceId);assert.equal(resource.licenseRef,s.license);assert.equal(resource.sha256,f.sha256);assert.equal(resource.bytes,f.bytes);
   assert.match(resource.sha256,/^[0-9a-f]{64}$/);
  }
  for(const f of m.fragments){
   assert.ok(!allFragments.has(f.id));allFragments.add(f.id);const resource=byResource.get(f.resourceId);assert.ok(resource);const source=byPath.get(resource.path);
   assert.equal(f.sourceFileSha256,resource.sha256);assert.equal(f.chapters,source.chapters);assert.equal(f.unitCount,source.verseMarkers);assert.match(f.projectionSha256,/^[0-9a-f]{64}$/);
  }
  assert.equal(sum(m.fragments,'chapters'),s.chapters);assert.equal(sum(m.fragments,'unitCount'),s.units);assert.equal(sum(m.fragments,'emptyUnitCount'),s.empty);
  assert.equal(m.integrity.sourceFileCount,s.books);assert.equal(m.integrity.unitCount,s.units);assert.equal(m.integrity.emptyUnitCount,s.empty);assert.match(m.integrity.projectionSha256,/^[0-9a-f]{64}$/);
  summary.push({editionId:s.id,books:s.books,chapters:s.chapters,units:s.units,emptyMarkers:s.empty,license:m.license.type,attributionPresent:true});
 }
 assert.equal(allResources.size,93);assert.equal(allFragments.size,93);
 assert.deepEqual(alignment,{schemaVersion:1,phase:'P9.3.1',scope:'unit',publicationAuthorized:false,evidence:[],alignments:[]});
 assert.equal(candidates.publicationAuthorized,false);assert.equal(candidates.corpusImportAuthorized,false);assert.equal(candidates.candidates.length,11);assert.equal(candidates.candidates.filter(x=>x.status==='external_link_only').length,5);assert.equal(candidates.candidates.filter(x=>x.status==='not_selected').length,6);
 for(const c of candidates.candidates)assert.deepEqual(c.reuse,{images:false,transcriptions:false,metadata:false,apparatus:false});
 for(const gate of gates){assert.equal(historic[gate],false);assert.equal(pilot.registry[gate],false);}
 for(const key of keys)assert.deepEqual(historic[key],[]);
 assert.deepEqual(validateManuscriptPilot(pilot,p),[]);
 assert.equal(pilot.sourceFilesAdmitted,0);assert.equal(pilot.publicationAuthorized,false);assert.equal(pilot.corpusImportAuthorized,false);
 assert.deepEqual(linguistic,{schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]});
 assert.deepEqual(publications,{schemaVersion:1,snapshots:[]});
 return {phase:'P9.5',editions:summary,fragments:93,chaptersByEdition:1449,units:39041,emptyMarkers:18,verifiedAlignments:0,manuscriptReferencePilot:{witnesses:2,variants:1,readingReferences:2,secondaryAttestations:2,resources:7,evidence:8,sourceFilesAdmitted:0},publicationAuthorized:false,publicRegistriesEmpty:true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{console.log(JSON.stringify(auditTextualClosure(loadClosureInputs()),null,2));}catch(error){console.error('P9.5 metadata reconciliation failed: '+error.message);process.exitCode=1;}
}
