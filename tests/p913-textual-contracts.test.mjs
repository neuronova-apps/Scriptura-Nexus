import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCanonContract,validateVersificationContract,validateTextualUnit,validateTextualProjection} from '../src/lib/textual-contracts.ts';
const hash='a'.repeat(64);
const book={id:'LIB-GEN',code:'GEN',names:{es:'Génesis'},aliases:['GEN']};
const book2={id:'LIB-JHN',code:'JHN',names:{es:'Juan'},aliases:['JHN','John']};
const edition={id:'TXT-RV1909',sourceId:'F05',name:'Reina-Valera 1909',language:'spa',kind:'traduccion',version:'spaRV1909',provider:'eBible.org',resourceIds:['REC-ED-C01-GEN'],canonId:null,versificationId:null,coverageBookIds:['LIB-GEN'],referencePolicy:'source_native_unmapped',licenseRef:'LIC-ED-C01-PUBLIC-DOMAIN-DECLARED',attribution:'Reina y Valera',sourceRevision:{archiveSha256:hash}};
const resource={id:'REC-ED-C01-GEN',sourceFileId:'ED-C01:GEN',sourceId:'F05',path:'01-GENspaRV1909.usfm',bytes:10,sha256:hash,component:'texto_fuente',licenseRef:edition.licenseRef};
const unit={id:'UNIT-a1',editionId:edition.id,bookId:book.id,chapter:'1',verse:'1a',order:0,text:'En el principio.',resourceId:resource.id,sourceLocator:'GEN.1.1a',sourceSegmentSha256:hash,textSha256:hash};
const fragment={id:'FRAG-ED-C01-GEN',bookId:book.id,resourceId:resource.id,chapters:1,unitCount:1,emptyUnitCount:0,wordElements:null,rangeMarkers:0,emptyUnitLocators:[],excludedStructures:{footnotes:0,crossReferences:0,figures:0,sidebars:0},sourceFileSha256:hash,projectionSha256:hash};
const manifest={id:'COR-RV1909-P913',editionId:edition.id,dataVersion:'p9.1.3-projection-v1',resources:[resource],fragments:[fragment],integrity:{algorithm:'SHA-256',sourceFileCount:1,unitCount:1,emptyUnitCount:0,projectionSha256:hash},license:{licenseRef:edition.licenseRef,type:'Public Domain',attribution:'Reina y Valera',publicationApproved:false},persistence:'metadata_only',publicationEnabled:false};
const greekEdition={...edition,id:'TXT-SBLGNT-V1-2',sourceId:'F03',name:'SBLGNT',language:'grc',kind:'edicion_critica',version:'v1.2',provider:'Faithlife/SBLGNT',resourceIds:['REC-ED-C02-JHN'],coverageBookIds:['LIB-JHN'],licenseRef:'LIC-CC-BY-4.0',sourceRevision:{commit:'a'.repeat(40)}};
const greekResource={...resource,id:'REC-ED-C02-JHN',sourceId:'F03',sourceFileId:'ED-C02:John',licenseRef:'LIC-CC-BY-4.0'};
const greekFragment={...fragment,id:'FRAG-ED-C02-JHN',bookId:'LIB-JHN',resourceId:greekResource.id};
const greekManifest={...manifest,id:'COR-SBLGNT-V1-2-P913',editionId:greekEdition.id,resources:[greekResource],fragments:[greekFragment],integrity:{...manifest.integrity,sourceFileCount:1},license:{licenseRef:'LIC-CC-BY-4.0',type:'CC BY 4.0',attribution:'SBLGNT',publicationApproved:false}};
const report={schemaVersion:1,phase:'P9.1.3',mode:'in_memory_validation_only',baselineMain:'13776e1d81692ab0336929ca282c9bfaf420ee37',admissionManifestSha256:hash,editions:[edition,greekEdition],books:[book,book2,...Array.from({length:64},(_,i)=>({id:'LIB-X'+i,code:String(i).padStart(3,'0'),names:{es:'Libro '+i},aliases:['X'+i]}))],corpusManifests:[manifest,greekManifest],entityCounts:{ENT19:2,ENT20:0,ENT21:0,ENT22:66,ENT23:2,ENT37:2},controls:{corpusTextPersisted:false,sourceTextEmitted:false,publicRegistryChanged:false,canonAssignments:0,versificationAssignments:0,alignmentsCreated:0,publicationAuthorized:false},textPolicies:{rv1909:'USFM main-text v1',sblgnt:'SBLGNT XML v1'}};
test('ENT20 canon contract requires ordered known books and source',()=>{
 const c={id:'CAN-TEST',name:'Canon de prueba',traditionOrContext:'contexto documentado',books:[{bookId:book.id,order:1,sourceRef:'EVD-1'}],sourceRefs:['EVD-1'],status:'pendiente_revision'};
 assert.deepEqual(validateCanonContract(c,[book]),[]);
 assert.ok(validateCanonContract({...c,books:[{...c.books[0],bookId:'LIB-UNKNOWN'}]},[book]).length);
 assert.ok(validateCanonContract({...c,status:'aprobado',sourceRefs:[]},[book]).length);
});
test('ENT21 versification contract requires evidence for mappings',()=>{
 const v={id:'VER-TEST',name:'Versificación de prueba',version:'1',sourceEditionId:edition.id,rules:[{sourceChapter:'1',sourceVerse:'1',targetChapter:null,targetVerse:null,relationship:'unresolved',evidenceRef:null}],sourceRefs:[],status:'pendiente_revision'};
 assert.deepEqual(validateVersificationContract(v,[edition.id]),[]);
 assert.ok(validateVersificationContract({...v,rules:[{...v.rules[0],relationship:'one_to_one',targetChapter:'1',targetVerse:'1'}]},[edition.id]).length);
 assert.ok(validateVersificationContract({...v,sourceEditionId:'TXT-UNKNOWN'},[edition.id]).length);
});
test('ENT23 preserves source labels, Unicode, source locator and hashes',()=>{
 assert.deepEqual(validateTextualUnit(unit,edition,[book],[resource]),[]);
 assert.ok(validateTextualUnit({...unit,verse:'1/2'},edition,[book],[resource]).length);
 assert.ok(validateTextualUnit({...unit,text:'texto\ufffd'},edition,[book],[resource]).length);
 assert.ok(validateTextualUnit({...unit,resourceId:'REC-OTHER'},edition,[book],[resource]).length);
});
test('ENT19–23/37 report respects no-canon, no-versification, no-corpus and no-publication gates',()=>{
 assert.deepEqual(validateTextualProjection(report),[]);
 assert.ok(validateTextualProjection({...report,editions:[{...edition,canonId:'CAN-66'},greekEdition]}).length);
 assert.ok(validateTextualProjection({...report,editions:[{...edition,versificationId:'VER-1'},greekEdition]}).length);
 assert.ok(validateTextualProjection({...report,corpusManifests:[{...manifest,publicationEnabled:true},greekManifest]}).length);
 assert.ok(validateTextualProjection({...report,units:[unit]}).length);
 assert.ok(validateTextualProjection({...report,entityCounts:{...report.entityCounts,ENT23:1}}).length);
});
