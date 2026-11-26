import { validateManuscriptRegistry, type ManuscriptValidationContext } from './manuscript-contracts.ts';
import type { TextualProjectionReport } from './textual-contracts.ts';

type Row = Record<string, unknown>;
const obj = (v: unknown): v is Row => v !== null && typeof v === 'object' && !Array.isArray(v);
const rows = (v: unknown): Row[] => Array.isArray(v) ? v.filter(obj) : [];
const exact = (v: Row, keys: readonly string[]) => Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const str = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && !/[\u0000-\u001f\u007f]/u.test(v);
const ids = (v: unknown, expected: readonly string[]) => Array.isArray(v) && v.length === expected.length && new Set(v).size === v.length && expected.every(x => v.includes(x));
const rev = '736fdc76158950c3d04b949b7e013ca14305145a';
const root = 'https://github.com/Faithlife/SBLGNT/blob/' + rev + '/';
const sources: Record<string, readonly [string,string,string,string|null,string|null]> = {
  'REC-P943-SBL-ABOUT': ['F03',root+'About.md',root+'README.md',rev,'930258324114fc7520b482fcc57786b841191759'],
  'REC-P943-SBL-APP': ['F03',root+'data/sblgntapp/text/John.txt',root+'LICENSE',rev,'1cc4af0bdc3fca51b38be7ef100431c58f086ccd'],
  'REC-P943-P66': ['F23','https://manuscripts.csntm.org/manuscript/View/GA_P66_Bodmer','https://www.csntm.org/terms-of-use-copyright/',null,null],
  'REC-P943-A': ['F23','https://manuscripts.csntm.org/manuscript/View/GA_02','https://www.csntm.org/terms-of-use-copyright/',null,null],
  'REC-P943-BL': ['F23','https://searcharchives.bl.uk/catalog/040-002353500','https://www.bl.uk/terms',null,null],
  'REC-P943-IGNTP-P66': ['F23','https://epapers.bham.ac.uk/id/eprint/1759/','https://epapers.bham.ac.uk/id/eprint/1759/','Depósito de 2013, ID 1759',null],
  'REC-P943-WRIGHT': ['F27','https://bible.org/article/jesus-%CE%B8%CE%B5%CF%8C%CF%82-god-textual-examination','https://bible.org/article/linking-bibleorg','Publicación web del 2 de abril de 2007',null]
};
const evidenceScope: Record<string, readonly [string,string]> = {
  'EVD-P943-ED':['REC-P943-SBL-ABOUT','edition_identity'],
  'EVD-P943-APP':['REC-P943-SBL-APP','edition_apparatus'],
  'EVD-P943-P66':['REC-P943-P66','catalog_identity'],
  'EVD-P943-A':['REC-P943-A','catalog_identity'],
  'EVD-P943-BL':['REC-P943-BL','catalog_identity'],
  'EVD-P943-IGNTP':['REC-P943-IGNTP-P66','bibliographic_reference'],
  'EVD-P943-WRIGHT-P66':['REC-P943-WRIGHT','secondary_attestation'],
  'EVD-P943-WRIGHT-A':['REC-P943-WRIGHT','secondary_attestation']
};
const readingScope = {
  'LEC-P943-JHN-1-18-A': ['MAN-GA-P66','EVD-P943-WRIGHT-P66','Lado izquierdo de la entrada del aparato de SBLGNT, John 1:18'],
  'LEC-P943-JHN-1-18-B': ['MAN-GA-02','EVD-P943-WRIGHT-A','Lado derecho de la entrada del aparato de SBLGNT, John 1:18']
} as const;
const editionId = 'TXT-SBLGNT-V1-2';
const variantId = 'VAR-P943-JHN-1-18';

export function validateManuscriptPilot(value: unknown, projection: TextualProjectionReport): string[] {
  const errors: string[] = [];
  const req = (ok: unknown, reason: string) => { if (!ok) errors.push(reason); };
  if (!obj(value) || !exact(value, ['schemaVersion','phase','baselineMain','reviewedOn','scope','publicationAuthorized','corpusImportAuthorized','sourceFilesAdmitted','resources','evidence','readingRepresentation','registry'])) return ['muestra: estructura inválida'];
  req(value.schemaVersion===1 && value.phase==='P9.4.3' && value.baselineMain==='7572a0c5566d9a8f49211e029ea58deade88a702' && value.reviewedOn==='2026-11-26' && value.scope==='reference_only_pilot','muestra: identidad inválida');
  req(value.publicationAuthorized===false && value.corpusImportAuthorized===false && value.sourceFilesAdmitted===0,'muestra: barrera alterada');
  const resources=rows(value.resources), evidence=rows(value.evidence), representations=rows(value.readingRepresentation);
  req(Array.isArray(value.resources) && resources.length===value.resources.length && ids(resources.map(x=>x.id),Object.keys(sources)),'muestra: inventario de recursos alterado');
  req(Array.isArray(value.evidence) && evidence.length===value.evidence.length && ids(evidence.map(x=>x.id),Object.keys(evidenceScope)),'muestra: inventario de evidencia alterado');
  for (const r of resources) {
    const expected = Object.hasOwn(sources,String(r.id)) ? sources[String(r.id)] : undefined;
    req(exact(r,['id','sourceId','title','url','rightsUrl','rights','revision','gitBlobSha','use']) && str(r.title) && str(r.rights) && r.use==='reference_only' && expected && r.sourceId===expected[0] && r.url===expected[1] && r.rightsUrl===expected[2] && r.revision===expected[3] && r.gitBlobSha===expected[4],'muestra: origen o derechos de recurso inválidos');
  }
  for (const e of evidence) {
    const expected=Object.hasOwn(evidenceScope,String(e.id)) ? evidenceScope[String(e.id)] : undefined;
    req(exact(e,['id','resourceId','locator','kind','reviewedOn','verification']) && expected && e.resourceId===expected[0] && e.kind===expected[1] && str(e.locator) && e.reviewedOn===value.reviewedOn && e.verification==='verified_reference','muestra: evidencia inválida');
  }
  req(Array.isArray(value.readingRepresentation) && representations.length===value.readingRepresentation.length && ids(representations.map(x=>x.readingId),Object.keys(readingScope)),'muestra: representación de lecturas incompleta');
  for (const p of representations) req(exact(p,['readingId','kind','attestationBasis','directManuscriptInspection','apparatusProvidesWitnesses','folioVerified','handVerified']) && p.kind==='editorial_reference' && p.attestationBasis==='secondary_report' && p.directManuscriptInspection===false && p.apparatusProvidesWitnesses===false && p.folioVerified===false && p.handVerified===false,'muestra: representación o alcance documental alterados');
  if (!obj(value.registry)) return [...errors,'muestra: registro requerido'];
  if (errors.length) return errors;
  const context: ManuscriptValidationContext = {
    textualEditions:projection.editions,
    bibliographyEditionIds:[],resourceIds:resources.map(r=>String(r.id)),authorIds:[],
    verifiedEvidenceIds:evidence.map(e=>String(e.id)),
    bibleBooks:projection.books,textualUnits:[],versificationIds:[],verifiedAlignmentIds:[]
  };
  errors.push(...validateManuscriptRegistry(value.registry,context));
  if (errors.length) return errors;
  const reg=value.registry;
  const editions=rows(reg.editions), witnesses=rows(reg.witnesses), variants=rows(reg.variants), readings=rows(reg.readings);
  req(ids(editions.map(e=>e.textualEditionId),[editionId]) && Array.isArray(reg.translations) && reg.translations.length===0,'muestra: edición o traducción no autorizada');
  req(ids(witnesses.map(w=>w.id),['MAN-GA-P66','MAN-GA-02']) && ids(variants.map(v=>v.id),[variantId]) && ids(readings.map(r=>r.id),Object.keys(readingScope)),'muestra: alcance del piloto alterado');
  for (const w of witnesses) {
    const p66=w.id==='MAN-GA-P66';
    const refs=obj(w.sourceRefs)?w.sourceRefs:{}, custody=obj(w.custody)?w.custody:{}, dating=obj(w.dateRange)?w.dateRange:{};
    req(w.siglum===(p66?'P66':'A') && w.catalogIdentifier===(p66?'GA P66':'GA 02') && w.language==='grc' && custody.shelfmark===(p66?'P. Bodmer II':'Royal MS 1 D VIII') && custody.institution===(p66?'Bibliotheca Bodmeriana, Cologny':'British Library') && custody.catalogUrl===(p66?sources['REC-P943-P66'][1]:sources['REC-P943-BL'][1]),'muestra: identidad de testigo alterada');
    req(dating.earliestYear===(p66?101:401) && dating.latestYear===(p66?300:500) && dating.precision===(p66?'broad_range':'century') && dating.basisEvidenceId===(p66?'EVD-P943-P66':'EVD-P943-A'),'muestra: datación alterada');
    req(ids(refs.resourceIds,p66?['REC-P943-P66','REC-P943-IGNTP-P66']:['REC-P943-A','REC-P943-BL']) && ids(refs.evidenceIds,p66?['EVD-P943-P66','EVD-P943-IGNTP']:['EVD-P943-A','EVD-P943-BL']),'muestra: procedencia del testigo alterada');
  }
  for (const variant of variants) {
    const locus=obj(variant.locus)?variant.locus:{}, apparatus=obj(variant.apparatus)?variant.apparatus:{}, assessment=obj(variant.assessment)?variant.assessment:{};
    req(locus.textualEditionId===editionId && locus.referenceStatus==='source_native_only' && locus.sourceLocator==='John 1:18' && ids(locus.evidenceIds,['EVD-P943-APP']),'muestra: locus no autorizado');
    req(apparatus.textualEditionId===editionId && apparatus.resourceId==='REC-P943-SBL-APP' && apparatus.locator==='John 1:18, línea 10' && apparatus.reusePolicy==='reference_only' && ids(apparatus.sourceEvidenceIds,['EVD-P943-APP']),'muestra: aparato no autorizado');
    req(assessment.status==='not_assessed' && ids(variant.internalEvidenceIds,[]) && ids(variant.externalEvidenceIds,['EVD-P943-APP','EVD-P943-WRIGHT-P66','EVD-P943-WRIGHT-A']),'muestra: valoración o evidencia alterada');
  }
  for (const reading of readings) {
    const expected=readingScope[String(reading.id) as keyof typeof readingScope];
    const att=rows(reading.witnessAttestations);
    req(expected && reading.variantId===variantId && reading.readingReference===expected[2] && reading.readingText===null && reading.contentMode==='reference_only' && reading.witnessStatus==='documented' && ids(reading.sourceEvidenceIds,['EVD-P943-APP',expected[1]]) && att.length===1,'muestra: lectura no autorizada');
    if (!expected) continue;
    for (const a of att) {
      const hand=obj(a.hand)?a.hand:{};
      req(a.witnessId===expected[0] && a.sourceEvidenceId===expected[1] && a.status==='attested' && a.witnessLocator==='Juan 1:18, según la tabla de Wright; folio y línea no comprobados' && hand.kind==='unknown' && hand.label===null,'muestra: atribución no respaldada por la fuente secundaria');
    }
  }
  return errors;
}
