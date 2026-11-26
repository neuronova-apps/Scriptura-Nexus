import type { BibleBook, TextualEdition, TextualUnit } from './textual-contracts.ts';

export interface ManuscriptDating {
  label: string;
  earliestYear: number | null;
  latestYear: number | null;
  precision: 'year' | 'decade' | 'century' | 'approximate_range' | 'broad_range' | 'undetermined';
  basisEvidenceId: string | null;
}

export interface ManuscriptCustody {
  institution: string;
  collection: string | null;
  shelfmark: string | null;
  catalogUrl: string | null;
}

export interface ManuscriptSourceRefs {
  bibliographyEditionIds: string[];
  resourceIds: string[];
  evidenceIds: string[];
}

export interface ManuscriptWitness {
  id: string;
  siglum: string | null;
  catalogIdentifier: string | null;
  dateRange: ManuscriptDating;
  language: string;
  custody: ManuscriptCustody;
  sourceRefs: ManuscriptSourceRefs;
}

export interface TextualEditionRecord {
  textualEditionId: string;
  bibliographyEditionId: string | null;
  editionRole: 'critical_text' | 'documentary_transcription' | 'historical_textual_edition' | 'translation';
  editorAuthorIds: string[];
  sourceEvidenceIds: string[];
  reviewStatus: 'pending' | 'documented';
}

export interface TextualLocus {
  textualEditionId: string;
  bookId: string | null;
  chapter: string | null;
  verse: string | null;
  unitId: string | null;
  versificationId: string | null;
  sourceLocator: string;
  referenceStatus: 'verified_reference' | 'source_native_only' | 'unresolved';
  evidenceIds: string[];
}

export interface ApparatusReference {
  textualEditionId: string;
  bibliographyEditionId: string | null;
  resourceId: string | null;
  locator: string;
  convention: string | null;
  reusePolicy: 'reference_only';
  sourceEvidenceIds: string[];
}

export interface WitnessAttestation {
  witnessId: string;
  status: 'attested' | 'uncertain' | 'not_consulted';
  witnessLocator: string | null;
  hand: {
    kind: 'original' | 'corrector' | 'unknown';
    label: string | null;
  };
  sourceEvidenceId: string;
}

export interface VariantAssessment {
  status: 'not_assessed' | 'reviewed' | 'inconclusive';
  method: string | null;
  rationale: string | null;
  reviewerRole: string | null;
  reviewedAt: string | null;
  evidenceIds: string[];
}

export interface TextualVariant {
  id: string;
  locus: TextualLocus;
  apparatus: ApparatusReference;
  readingIds: string[];
  internalEvidenceIds: string[];
  externalEvidenceIds: string[];
  assessment: VariantAssessment;
}

export interface VariantReading {
  id: string;
  variantId: string;
  readingReference: string;
  contentMode: 'reference_only';
  readingText: null;
  witnessStatus: 'documented' | 'not_documented';
  witnessAttestations: WitnessAttestation[];
  sourceEvidenceIds: string[];
}

export interface TranslationProfile {
  textualEditionId: string;
  bibliographyEditionId: string | null;
  language: string;
  translatorAuthorIds: string[];
  baseTextualEditionIds: string[];
  baseTextStatus: 'documented' | 'not_documented' | 'multiple_sources';
  alignmentIds: string[];
  alignmentPolicy: 'verified_only';
  sourceEvidenceIds: string[];
}

export interface ManuscriptRegistry {
  schemaVersion: 1;
  phase: 'P9.4.2';
  reviewedOn: string;
  baselineMain: string;
  publicationAuthorized: false;
  corpusImportAuthorized: false;
  textualContentPersisted: false;
  apparatusContentPersisted: false;
  imagesPersisted: false;
  automaticWitnessAttribution: false;
  automaticAlignment: false;
  editions: TextualEditionRecord[];
  witnesses: ManuscriptWitness[];
  variants: TextualVariant[];
  readings: VariantReading[];
  translations: TranslationProfile[];
}

export interface ManuscriptValidationContext {
  textualEditions: readonly TextualEdition[];
  bibliographyEditionIds: readonly string[];
  resourceIds: readonly string[];
  authorIds: readonly string[];
  verifiedEvidenceIds: readonly string[];
  bibleBooks: readonly BibleBook[];
  textualUnits: readonly TextualUnit[];
  versificationIds: readonly string[];
  verifiedAlignmentIds: readonly string[];
}

const BASELINE_MAIN = 'f64d2953bba01f599764be0fc38e298b478c47d7';
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 &&
  !/[\u0000-\u001f\u007f\ufffd\ud800-\udfff]/u.test(value);
const nullableText = (value: unknown): value is string | null => value === null || text(value);
const exact = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const identifier = (value: unknown, prefix: string) =>
  typeof value === 'string' && new RegExp('^' + prefix + '-[A-Za-z0-9][A-Za-z0-9_-]*$').test(value);
const validDate = (value: unknown) =>
  text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const validLanguage = (value: unknown) =>
  text(value) && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value);
const validHttpsUrl = (value: unknown) => {
  if (!text(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
};
const verseLabel = (value: unknown) =>
  typeof value === 'string' && /^[0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?$/.test(value);
const yearValue = (value: unknown) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value !== 0;
const unique = (values: readonly unknown[]) => new Set(values).size === values.length;

function requireValue(errors: string[], condition: unknown, message: string): void {
  if (!condition) errors.push(message);
}

function validateRefs(
  value: unknown,
  allowed: readonly string[],
  label: string,
  errors: string[],
  minimum = 0
): string[] {
  if (!Array.isArray(value)) {
    errors.push(label + ': lista requerida');
    return [];
  }
  const refs = value as unknown[];
  requireValue(errors, refs.length >= minimum, label + ': faltan referencias');
  requireValue(errors, unique(refs), label + ': referencias duplicadas');
  for (const ref of refs) {
    requireValue(errors, text(ref) && allowed.includes(ref), label + ': referencia desconocida');
  }
  return refs.filter((ref): ref is string => typeof ref === 'string');
}

const editionMap = (context: ManuscriptValidationContext) =>
  new Map(context.textualEditions.map(edition => [edition.id, edition]));

export function validateManuscriptWitness(
  value: unknown,
  context: ManuscriptValidationContext
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'id', 'siglum', 'catalogIdentifier', 'dateRange', 'language', 'custody', 'sourceRefs'
  ])) return ['testigo: estructura inválida'];

  requireValue(errors, identifier(value.id, 'MAN'), 'testigo: ID inválido');
  requireValue(errors, nullableText(value.siglum) && nullableText(value.catalogIdentifier), 'testigo: sigla o catálogo inválidos');
  requireValue(errors, text(value.siglum) || text(value.catalogIdentifier), 'testigo: se requiere sigla o identificador de catálogo');
  requireValue(errors, validLanguage(value.language), 'testigo: idioma no válido');

  if (!record(value.dateRange) || !exact(value.dateRange, [
    'label', 'earliestYear', 'latestYear', 'precision', 'basisEvidenceId'
  ])) {
    errors.push('testigo: datación inválida');
  } else {
    const dating = value.dateRange;
    const precision = ['year', 'decade', 'century', 'approximate_range', 'broad_range', 'undetermined'];
    requireValue(errors, text(dating.label) && precision.includes(String(dating.precision)), 'testigo: precisión o etiqueta de datación inválida');
    if (dating.precision === 'undetermined') {
      requireValue(errors, dating.earliestYear === null && dating.latestYear === null && dating.basisEvidenceId === null,
        'testigo: datación indeterminada con límites o evidencia');
    } else {
      requireValue(errors, yearValue(dating.earliestYear) && yearValue(dating.latestYear) &&
        Number(dating.earliestYear) <= Number(dating.latestYear), 'testigo: intervalo cronológico inválido');
      if (dating.precision === 'year') {
        requireValue(errors, dating.earliestYear === dating.latestYear, 'testigo: precisión anual con intervalo');
      }
      requireValue(errors, text(dating.basisEvidenceId) && context.verifiedEvidenceIds.includes(String(dating.basisEvidenceId)),
        'testigo: datación sin evidencia conocida');
    }
  }

  if (!record(value.custody) || !exact(value.custody, [
    'institution', 'collection', 'shelfmark', 'catalogUrl'
  ])) {
    errors.push('testigo: custodia inválida');
  } else {
    const custody = value.custody;
    requireValue(errors, text(custody.institution) && nullableText(custody.collection) &&
      nullableText(custody.shelfmark), 'testigo: datos de custodia incompletos');
    requireValue(errors, custody.catalogUrl === null || validHttpsUrl(custody.catalogUrl),
      'testigo: URL de catálogo inválida');
    requireValue(errors, text(value.catalogIdentifier) || text(custody.shelfmark),
      'testigo: falta identificador de catálogo o shelfmark');
  }

  if (!record(value.sourceRefs) || !exact(value.sourceRefs, [
    'bibliographyEditionIds', 'resourceIds', 'evidenceIds'
  ])) {
    errors.push('testigo: procedencia inválida');
  } else {
    const bibliography = validateRefs(value.sourceRefs.bibliographyEditionIds,
      context.bibliographyEditionIds, 'testigo bibliografía', errors);
    const resources = validateRefs(value.sourceRefs.resourceIds,
      context.resourceIds, 'testigo recursos', errors);
    validateRefs(value.sourceRefs.evidenceIds, context.verifiedEvidenceIds, 'testigo evidencias', errors, 1);
    requireValue(errors, bibliography.length + resources.length > 0,
      'testigo: sin referencia bibliográfica ni recurso de procedencia');
    if (record(value.dateRange) && text(value.dateRange.basisEvidenceId)) {
      requireValue(errors, list(value.sourceRefs.evidenceIds).includes(value.dateRange.basisEvidenceId),
        'testigo: evidencia de datación fuera de la procedencia');
    }
  }
  return errors;
}

export function validateTextualEditionRecord(
  value: unknown,
  context: ManuscriptValidationContext
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'textualEditionId', 'bibliographyEditionId', 'editionRole',
    'editorAuthorIds', 'sourceEvidenceIds', 'reviewStatus'
  ])) return ['edición: estructura inválida'];

  const edition = editionMap(context).get(String(value.textualEditionId));
  requireValue(errors, identifier(value.textualEditionId, 'TXT') && Boolean(edition),
    'edición: ENT19 desconocida');
  requireValue(errors, value.bibliographyEditionId === null ||
    (text(value.bibliographyEditionId) && context.bibliographyEditionIds.includes(value.bibliographyEditionId)),
    'edición: referencia bibliográfica desconocida');
  const roles = ['critical_text', 'documentary_transcription', 'historical_textual_edition', 'translation'];
  requireValue(errors, roles.includes(String(value.editionRole)), 'edición: función editorial inválida');
  if (edition) {
    requireValue(errors, value.editionRole === 'translation'
      ? edition.kind === 'traduccion'
      : edition.kind === 'edicion_critica', 'edición: función incompatible con ENT19');
  }
  validateRefs(value.editorAuthorIds, context.authorIds, 'edición responsables', errors);
  validateRefs(value.sourceEvidenceIds, context.verifiedEvidenceIds, 'edición evidencias', errors, 1);
  requireValue(errors, ['pending', 'documented'].includes(String(value.reviewStatus)),
    'edición: estado de revisión inválido');
  return errors;
}

export function validateTextualLocus(
  value: unknown,
  context: ManuscriptValidationContext
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'textualEditionId', 'bookId', 'chapter', 'verse', 'unitId',
    'versificationId', 'sourceLocator', 'referenceStatus', 'evidenceIds'
  ])) return ['locus: estructura inválida'];

  const edition = editionMap(context).get(String(value.textualEditionId));
  requireValue(errors, Boolean(edition), 'locus: edición textual desconocida');
  requireValue(errors, text(value.sourceLocator), 'locus: localizador de origen requerido');
  validateRefs(value.evidenceIds, context.verifiedEvidenceIds, 'locus evidencias', errors, 1);

  const status = value.referenceStatus;
  requireValue(errors, ['verified_reference', 'source_native_only', 'unresolved'].includes(String(status)),
    'locus: estado de referencia inválido');
  if (status === 'verified_reference') {
    requireValue(errors, text(value.bookId) && context.bibleBooks.some(book => book.id === value.bookId),
      'locus: libro desconocido');
    requireValue(errors, text(value.chapter) && /^[1-9][0-9]*$/.test(String(value.chapter)) &&
      verseLabel(value.verse), 'locus: capítulo o versículo inválido');
    requireValue(errors, value.versificationId === null ||
      (text(value.versificationId) && context.versificationIds.includes(value.versificationId)),
      'locus: versificación desconocida');
    if (value.unitId !== null) {
      const unit = context.textualUnits.find(item => item.id === value.unitId);
      requireValue(errors, Boolean(unit && unit.editionId === value.textualEditionId &&
        unit.bookId === value.bookId && unit.chapter === value.chapter && unit.verse === value.verse),
        'locus: unidad ENT23 no coincide exactamente con la referencia');
    }
  } else {
    requireValue(errors, value.bookId === null && value.chapter === null && value.verse === null &&
      value.unitId === null && value.versificationId === null,
      'locus: no debe completar coordenadas no verificadas');
  }
  return errors;
}

export function validateApparatusReference(
  value: unknown,
  context: ManuscriptValidationContext
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'textualEditionId', 'bibliographyEditionId', 'resourceId', 'locator',
    'convention', 'reusePolicy', 'sourceEvidenceIds'
  ])) return ['aparato: estructura inválida'];

  const edition = editionMap(context).get(String(value.textualEditionId));
  requireValue(errors, Boolean(edition && edition.kind === 'edicion_critica'),
    'aparato: requiere una edición textual crítica conocida');
  requireValue(errors, value.bibliographyEditionId === null ||
    (text(value.bibliographyEditionId) && context.bibliographyEditionIds.includes(value.bibliographyEditionId)),
    'aparato: edición bibliográfica desconocida');
  requireValue(errors, value.resourceId === null ||
    (text(value.resourceId) && context.resourceIds.includes(value.resourceId)),
    'aparato: recurso desconocido');
  requireValue(errors, value.bibliographyEditionId !== null || value.resourceId !== null,
    'aparato: se requiere una referencia bibliográfica o un recurso');
  requireValue(errors, text(value.locator) && nullableText(value.convention),
    'aparato: localizador o convención inválidos');
  requireValue(errors, value.reusePolicy === 'reference_only',
    'aparato: P9.4.2 solo admite referencia externa');
  validateRefs(value.sourceEvidenceIds, context.verifiedEvidenceIds, 'aparato evidencias', errors, 1);
  return errors;
}

function validateAttestation(
  value: unknown,
  context: ManuscriptValidationContext,
  readingEvidenceIds: readonly string[]
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'witnessId', 'status', 'witnessLocator', 'hand', 'sourceEvidenceId'
  ])) return ['lectura: atestación de testigo inválida'];

  requireValue(errors, identifier(value.witnessId, 'MAN'), 'lectura: ID de testigo inválido');
  requireValue(errors, nullableText(value.witnessLocator), 'lectura: localizador del testigo inválido');
  requireValue(errors, context.verifiedEvidenceIds.includes(String(value.sourceEvidenceId)),
    'lectura: evidencia de atestación desconocida');
  requireValue(errors, readingEvidenceIds.includes(String(value.sourceEvidenceId)),
    'lectura: evidencia de atestación no declarada en la lectura');
  requireValue(errors, ['attested', 'uncertain', 'not_consulted'].includes(String(value.status)),
    'lectura: estado de atestación inválido');

  if (!record(value.hand) || !exact(value.hand, ['kind', 'label'])) {
    errors.push('lectura: mano o corrección inválida');
  } else {
    requireValue(errors, ['original', 'corrector', 'unknown'].includes(String(value.hand.kind)) &&
      nullableText(value.hand.label), 'lectura: tipo de mano inválido');
    if (value.hand.kind === 'corrector') {
      requireValue(errors, text(value.hand.label), 'lectura: corrección sin identificación');
    } else {
      requireValue(errors, value.hand.label === null, 'lectura: etiqueta de mano no aplicable');
    }
  }

  if (value.status === 'not_consulted') {
    requireValue(errors, value.witnessLocator === null &&
      record(value.hand) && value.hand.kind === 'unknown' && value.hand.label === null,
      'lectura: un testigo no consultado no puede tener localizador o mano afirmados');
  } else {
    requireValue(errors, text(value.witnessLocator), 'lectura: atestación sin localizador');
  }
  return errors;
}

export function validateVariantReading(
  value: unknown,
  context: ManuscriptValidationContext,
  witnessIds: readonly string[],
  variantIds: readonly string[]
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'id', 'variantId', 'readingReference', 'contentMode', 'readingText',
    'witnessStatus', 'witnessAttestations', 'sourceEvidenceIds'
  ])) return ['lectura: estructura inválida'];

  requireValue(errors, identifier(value.id, 'LEC'), 'lectura: ID inválido');
  requireValue(errors, identifier(value.variantId, 'VAR') && variantIds.includes(String(value.variantId)),
    'lectura: variante desconocida');
  requireValue(errors, text(value.readingReference), 'lectura: referencia de lectura requerida');
  requireValue(errors, value.contentMode === 'reference_only' && value.readingText === null,
    'lectura: P9.4.2 no permite persistir transcripciones');
  requireValue(errors, ['documented', 'not_documented'].includes(String(value.witnessStatus)),
    'lectura: estado de testigos inválido');
  const evidenceIds = validateRefs(value.sourceEvidenceIds, context.verifiedEvidenceIds,
    'lectura evidencias', errors, 1);
  if (!Array.isArray(value.witnessAttestations)) {
    errors.push('lectura: atestaciones requeridas');
  } else {
    const attestations = value.witnessAttestations as unknown[];
    requireValue(errors, unique(attestations.map(item => record(item) ? item.witnessId : null)),
      'lectura: testigo duplicado');
    if (value.witnessStatus === 'documented') {
      requireValue(errors, attestations.length > 0, 'lectura: testigos declarados sin atestación');
    } else {
      requireValue(errors, attestations.length === 0, 'lectura: testigos no documentados con atestaciones');
    }
    for (const attestation of attestations) {
      errors.push(...validateAttestation(attestation, context, evidenceIds));
      if (record(attestation)) {
        requireValue(errors, witnessIds.includes(String(attestation.witnessId)),
          'lectura: testigo no registrado');
      }
    }
  }
  return errors;
}

function validateAssessment(
  value: unknown,
  availableEvidenceIds: readonly string[]
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'status', 'method', 'rationale', 'reviewerRole', 'reviewedAt', 'evidenceIds'
  ])) return ['variante: valoración inválida'];

  requireValue(errors, ['not_assessed', 'reviewed', 'inconclusive'].includes(String(value.status)),
    'variante: estado de valoración inválido');
  const evidence = validateRefs(value.evidenceIds, availableEvidenceIds,
    'valoración evidencias', errors);
  if (value.status === 'not_assessed') {
    requireValue(errors, value.method === null && value.rationale === null &&
      value.reviewerRole === null && value.reviewedAt === null && evidence.length === 0,
      'variante: valoración pendiente con conclusiones o datos de revisión');
  } else {
    requireValue(errors, text(value.method) && text(value.rationale) &&
      text(value.reviewerRole) && validDate(value.reviewedAt),
      'variante: valoración sin método, fundamento, responsable o fecha');
    requireValue(errors, evidence.length > 0, 'variante: valoración sin evidencia');
  }
  return errors;
}

export function validateTextualVariant(
  value: unknown,
  context: ManuscriptValidationContext,
  editionRecordIds: readonly string[],
  readingIds: readonly string[]
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'id', 'locus', 'apparatus', 'readingIds', 'internalEvidenceIds',
    'externalEvidenceIds', 'assessment'
  ])) return ['variante: estructura inválida'];

  requireValue(errors, identifier(value.id, 'VAR'), 'variante: ID inválido');
  const locusErrors = validateTextualLocus(value.locus, context);
  const apparatusErrors = validateApparatusReference(value.apparatus, context);
  errors.push(...locusErrors, ...apparatusErrors);
  if (record(value.locus) && record(value.apparatus)) {
    requireValue(errors, value.locus.textualEditionId === value.apparatus.textualEditionId,
      'variante: locus y aparato pertenecen a ediciones distintas');
    requireValue(errors, editionRecordIds.includes(String(value.locus.textualEditionId)),
      'variante: edición sin ficha ENT19 documentada');
  }
  const readings = validateRefs(value.readingIds, readingIds, 'variante lecturas', errors, 2);
  const internal = validateRefs(value.internalEvidenceIds, context.verifiedEvidenceIds,
    'variante evidencia interna', errors);
  const external = validateRefs(value.externalEvidenceIds, context.verifiedEvidenceIds,
    'variante evidencia externa', errors);
  requireValue(errors, internal.length + external.length > 0,
    'variante: sin evidencia interna ni externa');
  errors.push(...validateAssessment(value.assessment, [...internal, ...external]));
  return errors;
}

export function validateTranslationProfile(
  value: unknown,
  context: ManuscriptValidationContext,
  editionRecords: readonly TextualEditionRecord[]
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'textualEditionId', 'bibliographyEditionId', 'language', 'translatorAuthorIds',
    'baseTextualEditionIds', 'baseTextStatus', 'alignmentIds', 'alignmentPolicy',
    'sourceEvidenceIds'
  ])) return ['traducción: estructura inválida'];

  const edition = editionMap(context).get(String(value.textualEditionId));
  const editionRecord = editionRecords.find(item => item.textualEditionId === value.textualEditionId);
  requireValue(errors, Boolean(edition && edition.kind === 'traduccion' &&
    editionRecord?.editionRole === 'translation'), 'traducción: requiere ENT19 y ficha de función traducción');
  requireValue(errors, value.bibliographyEditionId === null ||
    (text(value.bibliographyEditionId) && context.bibliographyEditionIds.includes(value.bibliographyEditionId)),
    'traducción: edición bibliográfica desconocida');
  if (editionRecord) {
    requireValue(errors, editionRecord.bibliographyEditionId === value.bibliographyEditionId,
      'traducción: referencia bibliográfica distinta de la ficha de edición');
  }
  requireValue(errors, validLanguage(value.language) && edition?.language === value.language,
    'traducción: idioma distinto del registro ENT19');
  validateRefs(value.translatorAuthorIds, context.authorIds, 'traducción responsables', errors);
  const bases = validateRefs(value.baseTextualEditionIds,
    context.textualEditions.map(item => item.id), 'traducción texto base', errors);
  requireValue(errors, !bases.includes(String(value.textualEditionId)),
    'traducción: no puede ser su propio texto base');
  if (value.baseTextStatus === 'not_documented') {
    requireValue(errors, bases.length === 0, 'traducción: texto base no documentado con fuentes asignadas');
  } else if (value.baseTextStatus === 'documented') {
    requireValue(errors, bases.length === 1, 'traducción: se requiere un texto base documentado');
  } else if (value.baseTextStatus === 'multiple_sources') {
    requireValue(errors, bases.length >= 2, 'traducción: se requieren varias fuentes base');
  } else {
    errors.push('traducción: estado del texto base inválido');
  }
  validateRefs(value.alignmentIds, context.verifiedAlignmentIds,
    'traducción alineaciones verificadas', errors);
  requireValue(errors, value.alignmentPolicy === 'verified_only',
    'traducción: solo se permiten alineaciones verificadas');
  validateRefs(value.sourceEvidenceIds, context.verifiedEvidenceIds,
    'traducción evidencias', errors, 1);
  return errors;
}

export function validateManuscriptRegistry(
  value: unknown,
  context: ManuscriptValidationContext
): string[] {
  const errors: string[] = [];
  if (!record(value) || !exact(value, [
    'schemaVersion', 'phase', 'reviewedOn', 'baselineMain',
    'publicationAuthorized', 'corpusImportAuthorized', 'textualContentPersisted',
    'apparatusContentPersisted', 'imagesPersisted', 'automaticWitnessAttribution',
    'automaticAlignment', 'editions', 'witnesses', 'variants', 'readings', 'translations'
  ])) return ['registro P9.4.2: estructura inválida'];

  requireValue(errors, value.schemaVersion === 1 && value.phase === 'P9.4.2',
    'registro P9.4.2: versión o fase inválida');
  requireValue(errors, validDate(value.reviewedOn), 'registro P9.4.2: fecha inválida');
  requireValue(errors, value.baselineMain === BASELINE_MAIN, 'registro P9.4.2: línea base incorrecta');
  for (const gate of [
    'publicationAuthorized', 'corpusImportAuthorized', 'textualContentPersisted',
    'apparatusContentPersisted', 'imagesPersisted', 'automaticWitnessAttribution',
    'automaticAlignment'
  ]) requireValue(errors, value[gate] === false, 'registro P9.4.2: barrera alterada ' + gate);

  const arrays = ['editions', 'witnesses', 'variants', 'readings', 'translations'];
  for (const key of arrays) requireValue(errors, Array.isArray(value[key]), 'registro P9.4.2: lista inválida ' + key);
  if (arrays.some(key => !Array.isArray(value[key]))) return errors;

  const editions = list(value.editions) as TextualEditionRecord[];
  const witnesses = list(value.witnesses) as ManuscriptWitness[];
  const variants = list(value.variants) as TextualVariant[];
  const readings = list(value.readings) as VariantReading[];
  const translations = list(value.translations) as TranslationProfile[];

  const editionIds = editions.map(item => record(item) ? item.textualEditionId : null);
  const witnessIds = witnesses.map(item => record(item) ? item.id : null);
  const variantIds = variants.map(item => record(item) ? item.id : null);
  const readingIds = readings.map(item => record(item) ? item.id : null);
  const translationIds = translations.map(item => record(item) ? item.textualEditionId : null);
  for (const [ids, label] of [
    [editionIds, 'ediciones'], [witnessIds, 'testigos'], [variantIds, 'variantes'],
    [readingIds, 'lecturas'], [translationIds, 'traducciones']
  ] as const) requireValue(errors, unique(ids), 'registro P9.4.2: IDs duplicados en ' + label);

  for (const item of editions) errors.push(...validateTextualEditionRecord(item, context));
  for (const item of witnesses) errors.push(...validateManuscriptWitness(item, context));
  for (const item of variants) errors.push(...validateTextualVariant(item, context, editionIds as string[], readingIds as string[]));
  for (const item of readings) errors.push(...validateVariantReading(item, context, witnessIds as string[], variantIds as string[]));
  for (const item of translations) errors.push(...validateTranslationProfile(item, context, editions));

  const readingMap = new Map(readings.filter(record).map(item => [String(item.id), item]));
  const variantMap = new Map(variants.filter(record).map(item => [String(item.id), item]));
  for (const variant of variants.filter(record)) {
    for (const readingId of list(variant.readingIds)) {
      const reading = readingMap.get(String(readingId));
      requireValue(errors, Boolean(reading && reading.variantId === variant.id),
        'registro P9.4.2: lectura no vinculada bidireccionalmente');
    }
  }
  for (const reading of readings.filter(record)) {
    const variant = variantMap.get(String(reading.variantId));
    requireValue(errors, Boolean(variant && list(variant.readingIds).includes(reading.id)),
      'registro P9.4.2: lectura huérfana');
  }
  for (const item of translations) {
    requireValue(errors, !witnessIds.includes(item.textualEditionId),
      'registro P9.4.2: una traducción no puede ser testigo manuscrito');
  }
  return errors;
}

export function parseManuscriptRegistry(
  value: unknown,
  context: ManuscriptValidationContext
): ManuscriptRegistry {
  const errors = validateManuscriptRegistry(value, context);
  if (errors.length) throw new Error(errors.join('; '));
  return structuredClone(value) as ManuscriptRegistry;
}
