import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseBibliography} from '../src/lib/bibliography-contracts.ts';
import {parsePermissions,publicationAdmissions} from '../src/lib/source-permissions.ts';
import {loadOperationalCatalog} from './validate-p1013.mjs';
import {loadP1014,validateP1014} from './validate-p1014.mjs';
import {validateManuscriptPilot} from '../src/lib/manuscript-pilot.ts';
import {loadP1036,validateP1036} from './validate-integrated-p1036.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadP112(){return {record:read('docs/P11/registro-auditoria-documental-p112.json'),previous:readFileSync('docs/P11/registro-auditoria-tecnica-p111.json'),catalog:loadOperationalCatalog(),bibliography:read('src/data/referencias/biblioteca.json'),permissions:read('src/data/referencias/permisos.json'),traditions:read('src/data/taxonomia/tradiciones.json').items.map(x=>x.id),publication:read('src/data/publicaciones/registro.json'),linguistic:read('src/data/linguistica/registro.json'),alignment:read('docs/P9/alineaciones-p931.json'),textual:read('docs/P9/admisiones-ediciones-p912.json'),release:read('docs/P8/revision-publicacion-p85.json'),sources:read('docs/P10/registro-fuentes-p1022.json'),sample:read('docs/P9/muestra-manuscritos-p943.json'),projection:read('docs/P9/proyeccion-ediciones-p913.json')};}
export function validateP112({record:r,previous,catalog,bibliography,permissions,traditions,publication,linguistic,alignment,textual,release,sources,sample,projection}){
 assert.equal(blob(previous),'aa8d96661d243196fcfc80dd0e5b892c9e17594a');assert.equal(r.previousBlob,blob(previous));
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.2');assert.equal(r.baselineMain,'438451c40a890e8906cc637747ca8eac53146810');assert.equal(r.scope,'auditoria_documental_de_registros_y_artefacto_sin_nueva_admision');
 assert.deepEqual(r.previousIntegration,{pr:83,workflowRun:45944125508,deployRun:45945757579,deploy:'pending_confirmation',technicalJob:140324825494,successfulJobs:7,nodeTests:484,staticPages:128,localTargets:8479,anchors:3807,brokenInternalTargets:0});
 for(const k of ['publicationAuthorized','releaseScopeApproved','corpusImportAuthorized','academicAnalysisCompleted'])assert.equal(r[k],false);
 assert.equal(catalog.length,80);assert.equal(new Set(catalog.map(s=>s.id)).size,80);assert.ok(catalog.every(s=>s.status==='planificado'&&s.publishedVersion===null&&s.evidenceIds.length===0));
 const b=parseBibliography(bibliography,traditions),p=parsePermissions(permissions,b);
 assert.equal(b.authors.length,6);assert.equal(b.works.length,6);assert.equal(b.editions.length,6);assert.equal(b.sources.length,6);assert.deepEqual(b.evidence,[]);assert.equal(b.resources.length,6);assert.equal(b.licenses.length,1);
 assert.equal(p.items.length,6);assert.ok(p.items.every(x=>x.decision==='pendiente'&&x.uses.consulta==='permitida'&&x.authorizationRef===null&&x.reviewerRole===null));assert.deepEqual(publicationAdmissions(b,p),[]);
 assert.equal(publication.schemaVersion,1);assert.deepEqual(publication.snapshots,[]);
 assert.equal(linguistic.schemaVersion,1);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(linguistic[k],[]);
 assert.equal(alignment.publicationAuthorized,false);assert.deepEqual(alignment.alignments,[]);assert.deepEqual(alignment.evidence,[]);
 assert.equal(textual.publication.authorized,false);assert.equal(textual.publication.gate,'P11.4');assert.equal(textual.publication.publicCorpusPersisted,false);assert.deepEqual(textual.decisions.map(x=>[x.id,x.admissionStatus]),[['ED-C01','admitido'],['ED-C02','admitido']]);
 assert.equal(release.publication,false);assert.equal(release.newAdmissions,false);assert.equal(release.authorization,null);assert.equal(release.existing.length,9);assert.ok(release.existing.every(x=>x.publication===false&&x.releaseStatus==='pendiente_autorizacion'));
 assert.equal(release.expansion.length,3);assert.ok(release.expansion.every(x=>x.publication===false&&x.review==='propuesto_no_admitido'&&x.allowedComponents.length===0));
 assert.equal(sources.publicationAuthorized,false);assert.equal(sources.corpusImportAuthorized,false);assert.equal(sources.sources.length,15);assert.equal(sources.pilots.length,5);assert.ok(sources.pilots.every(x=>x.needs.length===4&&x.needs.every(n=>n.status==='cobertura_parcial_pendiente')&&x.evidenceIds.length===0&&x.conclusions.length===0));
 assert.deepEqual(validateManuscriptPilot(sample,projection),[]);
 const result={studies:catalog.length,planned:catalog.length,sections:catalog.length*20,published:publication.snapshots.length,bibliographicResources:b.resources.length,bibliographicLicenses:b.licenses.length,bibliographicAdmissions:publicationAdmissions(b,p).length,permissionsPending:p.items.length,pilotSources:sources.sources.length,openNeeds:sources.pilots.reduce((n,x)=>n+x.needs.length,0),technicalTextualEditions:textual.decisions.length,linguisticFileDecisions:release.existing.length,linguisticExpansionCandidates:release.expansion.length,documentarySampleResources:sample.resources.length,documentarySampleEvidence:sample.evidence.length};
 assert.deepEqual(result,{studies:80,planned:80,sections:1600,published:0,bibliographicResources:6,bibliographicLicenses:1,bibliographicAdmissions:0,permissionsPending:6,pilotSources:15,openNeeds:20,technicalTextualEditions:2,linguisticFileDecisions:9,linguisticExpansionCandidates:3,documentarySampleResources:7,documentarySampleEvidence:8});
 assert.deepEqual(r.expected,result);assert.ok(r.limitations.length===5&&r.limitations.every(x=>typeof x==='string'&&x.trim()));assert.deepEqual(r.progress,{completed:58,total:62,afterVerifiedClosure:59});assert.equal(r.next,'P11.3_tras_CI_integracion_y_despliegue');
 return result;
}
export function restrictedPath(path){
 const normalized=path.replaceAll('\\','/').toLowerCase(),base=normalized.split('/').at(-1);
 return /\.(?:pdf|docx?|epub|zip|usfm|osis|sqlite3?|db|pem|key|p12|pfx|env|logos4|lbslib|lbxlls)$/i.test(base)||/^\.env(?:\.|$)/.test(base)||/(?:^|\/)(?:borradores-privados|private-drafts|credentials|secrets)(?:\/|$)/.test(normalized);
}
const markers=['PRUEBA SINTÉTICA P6.5.5','VAR-P943-JHN-1-18','EVD-P943-','registro-cierre-p104.json','registro-validacion-integral-p1036.json','registro-auditoria-documental-p112.json'];
export function inspectPublicFile(path,content){assert.ok(!restrictedPath(path),'Extensión o nombre restringido en artefacto');if(typeof content==='string')for(const m of markers)assert.ok(!content.includes(m),'Marcador no público en artefacto');}
export function scanArtifact(dir='dist'){
 let files=0,textFiles=0;
 function walk(path){for(const e of readdirSync(path,{withFileTypes:true})){const p=join(path,e.name);if(e.isDirectory()){walk(p);continue;}assert.ok(e.isFile(),'Entrada no regular en artefacto');const isText=/\.(?:html|js|mjs|css|json|xml|txt|map|svg)$/i.test(p);inspectPublicFile(p,isText?readFileSync(p,'utf8'):null);files++;if(isText)textFiles++;}}
 walk(dir);assert.ok(files>0&&textFiles>0,'Build vacío');return {artifactFiles:files,artifactTextFiles:textFiles,restrictedPaths:0,nonpublicMarkers:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=validateP112(loadP112());validateP1014(loadP1014());validateP1036(loadP1036());
 const paths=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
 assert.ok(paths.length>0);assert.ok(paths.every(p=>!restrictedPath(p)),'Nombre o extensión restringida en árbol versionado');
 console.log(JSON.stringify({phase:'P11.2',...result,trackedPathsChecked:paths.length,...scanArtifact(),publicationAuthorized:false,manualPrivacyReview:'pending',externalUrlsRechecked:false}));
}
