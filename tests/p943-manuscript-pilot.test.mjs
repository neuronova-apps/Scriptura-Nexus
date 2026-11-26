import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateManuscriptPilot} from '../src/lib/manuscript-pilot.ts';
const read = path => JSON.parse(readFileSync(path,'utf8'));
const pilot = read('docs/P9/muestra-manuscritos-p943.json');
const projection = read('docs/P9/proyeccion-ediciones-p913.json');
const reject = mutate => {const p=structuredClone(pilot);mutate(p);assert.ok(validateManuscriptPilot(p,projection).length>0);};
test('P9.4.3: muestra documental real y acotada conforme',()=>{
  assert.deepEqual(validateManuscriptPilot(pilot,projection),[]);
  assert.equal(pilot.registry.witnesses.length,2);
  assert.equal(pilot.registry.variants.length,1);
  assert.equal(pilot.registry.readings.length,2);
  assert.equal(pilot.evidence.length,8);
  assert.equal(pilot.resources.length,7);
});
test('P9.4.3: registro histórico P9.4.2 sigue vacío',()=>{
  const historic=read('docs/P9/registro-manuscritos-p942.json');
  for(const key of ['editions','witnesses','variants','readings','translations']) assert.deepEqual(historic[key],[]);
});
test('P9.4.3: no publicación, admisión ni persistencia de textos',()=>{
  reject(p=>p.publicationAuthorized=true);
  reject(p=>p.corpusImportAuthorized=true);
  reject(p=>p.sourceFilesAdmitted=1);
  reject(p=>p.registry.textualContentPersisted=true);
  reject(p=>p.registry.readings[0].readingText='contenido no admitido');
});
test('P9.4.3: fuentes, revisión y uso fijados',()=>{
  reject(p=>p.resources[1].gitBlobSha='inventado');
  reject(p=>p.resources[1].url='https://example.org');
  reject(p=>p.resources[1].use='redistribute');
  reject(p=>p.resources[1].revision=null);
  reject(p=>p.resources.push(p.resources[0]));
});
test('P9.4.3: evidencia exacta, localizador y procedencia',()=>{
  reject(p=>p.evidence[0].verification='pending');
  reject(p=>p.evidence[1].locator='John 1:19');
  reject(p=>p.evidence[1].resourceId=p.resources[0].id);
  reject(p=>p.evidence.pop());
});
test('P9.4.3: testigo no se confunde con edición y respeta identidad',()=>{
  reject(p=>p.registry.witnesses[0].id='TXT-SBLGNT-V1-2');
  reject(p=>p.registry.witnesses[0].custody.shelfmark='inventado');
  reject(p=>p.registry.witnesses[0].dateRange.earliestYear=200);
  reject(p=>p.registry.witnesses[1].sourceRefs.evidenceIds=['EVD-P943-P66']);
});
test('P9.4.3: locus nativo sin alineación inferida',()=>{
  reject(p=>p.registry.variants[0].locus.chapter='1');
  reject(p=>p.registry.variants[0].locus.sourceLocator='John 1:19');
  reject(p=>p.registry.automaticAlignment=true);
});
test('P9.4.3: aparato editorial no aporta atestaciones manuscritas',()=>{
  reject(p=>p.readingRepresentation[0].apparatusProvidesWitnesses=true);
  reject(p=>p.registry.readings[0].witnessAttestations[0].sourceEvidenceId='EVD-P943-APP');
  reject(p=>p.registry.variants[0].apparatus.resourceId='REC-P943-WRIGHT');
});
test('P9.4.3: testimonio secundario no implica examen directo',()=>{
  reject(p=>p.readingRepresentation[0].directManuscriptInspection=true);
  reject(p=>p.readingRepresentation[0].folioVerified=true);
  reject(p=>p.readingRepresentation[0].handVerified=true);
  reject(p=>p.registry.readings[0].witnessAttestations[0].hand.kind='original');
  reject(p=>p.registry.readings[0].witnessAttestations[0].witnessId='MAN-GA-02');
});
test('P9.4.3: no se concluye originalidad ni se altera alcance',()=>{
  reject(p=>{p.registry.variants[0].assessment={status:'reviewed',method:'mayoría',rationale:'conclusión',reviewerRole:'editor',reviewedAt:'2026-11-26',evidenceIds:['EVD-P943-APP']};});
  reject(p=>p.registry.readings.pop());
  reject(p=>p.registry.readings[0].readingReference='lectura inventada');
});
test('P9.4.3: registros nulos y campos extra rechazados',()=>{
  reject(p=>p.resources[0]=null);
  reject(p=>p.registry.witnesses[0]=null);
  reject(p=>p.readingRepresentation[0].extra='texto');
});
