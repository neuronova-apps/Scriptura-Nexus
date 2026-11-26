import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  parseManuscriptRegistry,
  validateManuscriptRegistry,
  validateManuscriptWitness,
  validateTextualLocus,
  validateApparatusReference,
  validateTranslationProfile
} from '../src/lib/manuscript-contracts.ts';

const marker = 'FIXTURE SINTÉTICA P9.4.2; no representa un manuscrito ni una lectura real';
const hash = 'a'.repeat(64);
const criticalId = 'TXT-SYNTH-CRITICAL';
const translationId = 'TXT-SYNTH-TRANSLATION';
const witnessId = 'MAN-SYNTH-001';
const variantId = 'VAR-SYNTH-001';
const readingA = 'LEC-SYNTH-001';
const readingB = 'LEC-SYNTH-002';

const criticalEdition = {
  id: criticalId, sourceId: 'F99', name: marker, language: 'grc',
  kind: 'edicion_critica', version: 'fixture-v1', provider: 'Proveedor sintético',
  resourceIds: ['REC-SYNTH-TEXT', 'REC-SYNTH-APPARATUS'], canonId: null,
  versificationId: null, coverageBookIds: ['LIB-GEN'],
  referencePolicy: 'source_native_unmapped', licenseRef: 'LIC-SYNTH',
  attribution: marker, sourceRevision: {commit: 'b'.repeat(40)}
};
const translationEdition = {
  ...criticalEdition, id: translationId, name: marker, language: 'spa',
  kind: 'traduccion', resourceIds: ['REC-SYNTH-TRANSLATION']
};
const book = {id: 'LIB-GEN', code: 'GEN', names: {es: 'Génesis (fixture)'}, aliases: ['GEN']};
const unit = {
  id: 'UNIT-SYNTH-001', editionId: criticalId, bookId: book.id,
  chapter: '1', verse: '1', order: 0, text: marker,
  resourceId: 'REC-SYNTH-TEXT', sourceLocator: marker,
  sourceSegmentSha256: hash, textSha256: hash
};
const context = {
  textualEditions: [criticalEdition, translationEdition],
  bibliographyEditionIds: ['BIB-SYNTH-CRITICAL', 'BIB-SYNTH-TRANSLATION'],
  resourceIds: ['REC-SYNTH-TEXT', 'REC-SYNTH-APPARATUS', 'REC-SYNTH-WITNESS', 'REC-SYNTH-TRANSLATION'],
  authorIds: ['AUT-SYNTH-EDITOR', 'AUT-SYNTH-TRANSLATOR'],
  verifiedEvidenceIds: ['EVD-SYNTH-001', 'EVD-SYNTH-002', 'EVD-SYNTH-003'],
  bibleBooks: [book],
  textualUnits: [unit],
  versificationIds: [],
  verifiedAlignmentIds: []
};

const editionRecords = [
  {
    textualEditionId: criticalId, bibliographyEditionId: 'BIB-SYNTH-CRITICAL',
    editionRole: 'critical_text', editorAuthorIds: ['AUT-SYNTH-EDITOR'],
    sourceEvidenceIds: ['EVD-SYNTH-001'], reviewStatus: 'documented'
  },
  {
    textualEditionId: translationId, bibliographyEditionId: 'BIB-SYNTH-TRANSLATION',
    editionRole: 'translation', editorAuthorIds: ['AUT-SYNTH-TRANSLATOR'],
    sourceEvidenceIds: ['EVD-SYNTH-002'], reviewStatus: 'documented'
  }
];

const witness = {
  id: witnessId, siglum: 'SIGLUM-SYNTH', catalogIdentifier: 'CAT-SYNTH-001',
  dateRange: {
    label: 'Datación amplia sintética, siglos IV–V',
    earliestYear: 300, latestYear: 500, precision: 'broad_range',
    basisEvidenceId: 'EVD-SYNTH-001'
  },
  language: 'grc',
  custody: {
    institution: 'Institución de prueba', collection: 'Colección sintética',
    shelfmark: 'MS-SYNTH-001', catalogUrl: 'https://example.invalid/catalog'
  },
  sourceRefs: {
    bibliographyEditionIds: ['BIB-SYNTH-CRITICAL'],
    resourceIds: ['REC-SYNTH-WITNESS'],
    evidenceIds: ['EVD-SYNTH-001']
  }
};

const locus = {
  textualEditionId: criticalId, bookId: book.id, chapter: '1', verse: '1',
  unitId: unit.id, versificationId: null, sourceLocator: 'Localizador sintético del aparato',
  referenceStatus: 'verified_reference', evidenceIds: ['EVD-SYNTH-001']
};
const apparatus = {
  textualEditionId: criticalId, bibliographyEditionId: 'BIB-SYNTH-CRITICAL',
  resourceId: 'REC-SYNTH-APPARATUS', locator: 'Localizador sintético del aparato',
  convention: 'Convención de prueba', reusePolicy: 'reference_only',
  sourceEvidenceIds: ['EVD-SYNTH-001']
};
const variant = {
  id: variantId, locus, apparatus, readingIds: [readingA, readingB],
  internalEvidenceIds: ['EVD-SYNTH-001'], externalEvidenceIds: ['EVD-SYNTH-002'],
  assessment: {
    status: 'not_assessed', method: null, rationale: null,
    reviewerRole: null, reviewedAt: null, evidenceIds: []
  }
};
const readings = [
  {
    id: readingA, variantId, readingReference: 'Referencia sintética A',
    contentMode: 'reference_only', readingText: null, witnessStatus: 'documented',
    witnessAttestations: [{
      witnessId, status: 'attested', witnessLocator: 'Localizador sintético A',
      hand: {kind: 'original', label: null}, sourceEvidenceId: 'EVD-SYNTH-001'
    }],
    sourceEvidenceIds: ['EVD-SYNTH-001']
  },
  {
    id: readingB, variantId, readingReference: 'Referencia sintética B',
    contentMode: 'reference_only', readingText: null, witnessStatus: 'documented',
    witnessAttestations: [{
      witnessId, status: 'uncertain', witnessLocator: 'Localizador sintético B',
      hand: {kind: 'corrector', label: 'Mano correctora sintética'},
      sourceEvidenceId: 'EVD-SYNTH-002'
    }],
    sourceEvidenceIds: ['EVD-SYNTH-002']
  }
];
const translation = {
  textualEditionId: translationId, bibliographyEditionId: 'BIB-SYNTH-TRANSLATION',
  language: 'spa', translatorAuthorIds: ['AUT-SYNTH-TRANSLATOR'],
  baseTextualEditionIds: [criticalId], baseTextStatus: 'documented',
  alignmentIds: [], alignmentPolicy: 'verified_only',
  sourceEvidenceIds: ['EVD-SYNTH-002']
};
const registry = () => ({
  schemaVersion: 1, phase: 'P9.4.2', reviewedOn: '2026-11-26',
  baselineMain: 'f64d2953bba01f599764be0fc38e298b478c47d7',
  publicationAuthorized: false, corpusImportAuthorized: false,
  textualContentPersisted: false, apparatusContentPersisted: false,
  imagesPersisted: false, automaticWitnessAttribution: false,
  automaticAlignment: false,
  editions: structuredClone(editionRecords), witnesses: [structuredClone(witness)],
  variants: [structuredClone(variant)], readings: structuredClone(readings),
  translations: [structuredClone(translation)]
});
const reject = mutate => {
  const value = registry();
  mutate(value);
  assert.ok(validateManuscriptRegistry(value, context).length > 0);
};

test('P9.4.2: el registro vacío metadata-only cumple y conserva las barreras', () => {
  const value = registry();
  value.editions = [];
  value.witnesses = [];
  value.variants = [];
  value.readings = [];
  value.translations = [];
  assert.deepEqual(validateManuscriptRegistry(value, context), []);
  assert.equal(value.publicationAuthorized, false);
  assert.equal(value.corpusImportAuthorized, false);
  assert.equal(value.textualContentPersisted, false);
});

test('P9.4.2: fixture sintética valida las relaciones ENT19, ENT31, ENT32 y ENT33', () => {
  assert.deepEqual(validateManuscriptRegistry(registry(), context), []);
});

test('P9.4.2: el testigo exige sigla o identificador y cadena de procedencia', () => {
  const value = structuredClone(witness);
  value.siglum = null;
  value.catalogIdentifier = null;
  assert.ok(validateManuscriptWitness(value, context).length);
  value.siglum = 'SIGLUM-SYNTH';
  value.sourceRefs.evidenceIds = [];
  assert.ok(validateManuscriptWitness(value, context).length);
});

test('P9.4.2: la datación indeterminada no puede conservar años ni evidencia', () => {
  const value = structuredClone(witness);
  value.dateRange.precision = 'undetermined';
  value.dateRange.basisEvidenceId = null;
  assert.ok(validateManuscriptWitness(value, context).length);
  value.dateRange.earliestYear = null;
  value.dateRange.latestYear = null;
  assert.deepEqual(validateManuscriptWitness(value, context), []);
});

test('P9.4.2: un locus verificado debe coincidir exactamente con ENT23', () => {
  const value = structuredClone(locus);
  value.verse = '2';
  assert.ok(validateTextualLocus(value, context).length);
});

test('P9.4.2: un locus nativo no puede recibir coordenadas inferidas', () => {
  const value = structuredClone(locus);
  value.referenceStatus = 'source_native_only';
  value.bookId = null;
  value.chapter = null;
  value.verse = null;
  value.unitId = null;
  value.versificationId = null;
  assert.deepEqual(validateTextualLocus(value, context), []);
  value.bookId = 'LIB-GEN';
  assert.ok(validateTextualLocus(value, context).length);
});

test('P9.4.2: el aparato exige edición crítica, procedencia y solo referencia externa', () => {
  assert.deepEqual(validateApparatusReference(apparatus, context), []);
  const value = {...structuredClone(apparatus), textualEditionId: translationId};
  assert.ok(validateApparatusReference(value, context).length);
  value.textualEditionId = criticalId;
  value.reusePolicy = 'full_text';
  assert.ok(validateApparatusReference(value, context).length);
});

test('P9.4.2: una variante necesita dos lecturas y evidencia interna o externa', () => {
  reject(value => { value.variants[0].readingIds = [readingA]; });
  reject(value => {
    value.variants[0].internalEvidenceIds = [];
    value.variants[0].externalEvidenceIds = [];
  });
});

test('P9.4.2: las lecturas se enlazan en ambas direcciones y no quedan huérfanas', () => {
  reject(value => { value.readings[0].variantId = 'VAR-UNKNOWN'; });
  reject(value => { value.variants[0].readingIds = [readingA]; });
});

test('P9.4.2: no se persiste texto de lectura ni se atribuye una ausencia', () => {
  reject(value => { value.readings[0].readingText = 'texto de prueba'; });
  reject(value => {
    value.readings[0].witnessStatus = 'not_documented';
    value.readings[0].witnessAttestations = [value.readings[0].witnessAttestations[0]];
  });
});

test('P9.4.2: una mano correctora requiere identificación explícita', () => {
  reject(value => { value.readings[1].witnessAttestations[0].hand.label = null; });
});

test('P9.4.2: una traducción debe ser ENT19 traducción y declarar su texto base', () => {
  assert.deepEqual(validateTranslationProfile(translation, context, editionRecords), []);
  reject(value => { value.translations[0].textualEditionId = criticalId; });
  reject(value => {
    value.translations[0].baseTextStatus = 'documented';
    value.translations[0].baseTextualEditionIds = [];
  });
  reject(value => {
    value.translations[0].baseTextStatus = 'not_documented';
    value.translations[0].baseTextualEditionIds = [criticalId];
  });
});

test('P9.4.2: una traducción solo puede usar alineaciones verificadas', () => {
  reject(value => { value.translations[0].alignmentIds = ['ALI-NOT-VERIFIED']; });
});

test('P9.4.2: las referencias desconocidas y los campos adicionales se rechazan', () => {
  reject(value => { value.witnesses[0].sourceRefs.resourceIds = ['REC-UNKNOWN']; });
  reject(value => { value.editions[0].privateNotes = marker; });
});

test('P9.4.2: la publicación, importación y alineación automática permanecen bloqueadas', () => {
  reject(value => { value.publicationAuthorized = true; });
  reject(value => { value.corpusImportAuthorized = true; });
  reject(value => { value.automaticAlignment = true; });
  reject(value => { value.imagesPersisted = true; });
});

test('P9.4.2: el parser devuelve una copia independiente', () => {
  const value = registry();
  const parsed = parseManuscriptRegistry(value, context);
  parsed.witnesses[0].siglum = 'CAMBIO LOCAL';
  assert.equal(value.witnesses[0].siglum, witness.siglum);
});

test('P9.4.2: el registro versionado conserva listas vacías y barreras', () => {
  const stored = JSON.parse(readFileSync('docs/P9/registro-manuscritos-p942.json', 'utf8'));
  assert.deepEqual(validateManuscriptRegistry(stored, context), []);
  for (const key of ['editions', 'witnesses', 'variants', 'readings', 'translations']) {
    assert.deepEqual(stored[key], []);
  }
});

test('P9.4.2: una evidencia consultada o pendiente fuera de la lista verificada no respalda registros', () => {
  const restrictedContext = {...context, verifiedEvidenceIds: ['EVD-SYNTH-003']};
  assert.ok(validateManuscriptRegistry(registry(), restrictedContext).length > 0);
});
