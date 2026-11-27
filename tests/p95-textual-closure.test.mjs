import test from 'node:test';
import assert from 'node:assert/strict';
import {auditTextualClosure,loadClosureInputs} from '../scripts/audit-textual-closure-p95.mjs';
const reject=mutate=>{const input=loadClosureInputs();mutate(input);assert.throws(()=>auditTextualClosure(input));};
test('P9.5: conciliación del inventario completo, derechos y muestra referencial',()=>{
 const result=auditTextualClosure(loadClosureInputs());assert.equal(result.fragments,93);assert.equal(result.chaptersByEdition,1449);assert.equal(result.units,39041);assert.equal(result.emptyMarkers,18);assert.equal(result.verifiedAlignments,0);assert.equal(result.publicationAuthorized,false);assert.equal(result.manuscriptReferencePilot.witnesses,2);
});
test('P9.5: decisiones de admisión ligadas a huellas',()=>{reject(x=>x.admission.decisions[0].license.type='otra');reject(x=>x.projection.admissionManifestSha256='a'.repeat(64));});
test('P9.5: cobertura y fragmentos consistentes',()=>{reject(x=>x.projection.editions[0].coverageBookIds.pop());reject(x=>x.projection.corpusManifests[0].fragments[0].unitCount++);reject(x=>x.projection.corpusManifests[0].fragments[0].resourceId=x.projection.corpusManifests[0].fragments[1].resourceId);});
test('P9.5: no ampliar archivos ni perder huellas de origen',()=>{reject(x=>x.projection.corpusManifests[0].resources[0].path='extra.usfm');reject(x=>x.projection.corpusManifests[1].resources[0].sha256='a'.repeat(64));reject(x=>x.projection.corpusManifests[0].resources[0].component='aparato');});
test('P9.5: atribución, licencia y versión conservadas',()=>{reject(x=>x.projection.editions[1].attribution='sin autor');reject(x=>x.projection.corpusManifests[0].license.licenseRef='otra');reject(x=>x.projection.editions[1].sourceRevision.commit='otro');});
test('P9.5: ningún canon, versificación o alineación inferidos',()=>{reject(x=>x.projection.editions[0].canonId='CAN-unknown');reject(x=>x.projection.editions[1].versificationId='VER-unknown');reject(x=>x.alignment.alignments.push({id:'ALI-fake'}));});
test('P9.5: derechos independientes de manuscritos y ediciones',()=>{reject(x=>x.candidates.candidates[0].reuse.images=true);reject(x=>x.pilot.sourceFilesAdmitted=1);reject(x=>x.pilot.readingRepresentation[0].directManuscriptInspection=true);});
test('P9.5: barreras y registros públicos vacíos',()=>{reject(x=>x.projection.controls.publicationAuthorized=true);reject(x=>x.historic.witnesses.push({id:'MAN-fake'}));reject(x=>x.pilot.registry.automaticWitnessAttribution=true);reject(x=>x.linguistic.units.push({id:'UNIT-fake'}));reject(x=>x.publications.snapshots.push({id:'PUB-fake'}));});
