import {validateTextualProjection, type TextualProjectionReport} from './textual-contracts.ts';

export interface ReaderBookCoverage {
  bookId: string;
  name: string;
  fragmentId: string;
  resourceId: string;
  chapterCount: number;
  unitCount: number;
  emptyUnitCount: number;
  rangeMarkerCount: number;
}
export interface ReaderEditionCoverage {
  editionId: string;
  name: string;
  language: 'spa'|'grc';
  version: string;
  attribution: string;
  licenseRef: string;
  canonId: null;
  versificationId: null;
  referencePolicy: 'source_native_unmapped';
  publicationEnabled: false;
  books: ReaderBookCoverage[];
  unitCount: number;
  emptyUnitCount: number;
}
export interface ReaderCoverage {
  schemaVersion: 1;
  mode: 'internal_metadata_only';
  publicationEnabled: false;
  editions: ReaderEditionCoverage[];
}

// An internal view of verified metadata, not a public reader or corpus.
// The chapter count is not a list of source chapter labels.
export function buildReaderCoverage(input: unknown): ReaderCoverage {
  const errors = validateTextualProjection(input);
  if (errors.length) throw new Error('Proyección P9.1.3 no conforme: '+errors.join('; '));
  const report = input as TextualProjectionReport;
  const expected = new Map([['TXT-RV1909',66],['TXT-SBLGNT-V1-2',27]]);
  if (new Set(report.editions.map(e=>e.id)).size!==expected.size ||
      new Set(report.corpusManifests.map(m=>m.editionId)).size!==expected.size)
    throw new Error('Identidades de edición o manifiesto duplicadas');
  const names = new Map(report.books.map(b=>[b.id,b.names.es]));
  const editions = report.editions.map((edition): ReaderEditionCoverage => {
    const manifest = report.corpusManifests.find(m=>m.editionId===edition.id);
    const bookCount = expected.get(edition.id);
    if (!manifest || bookCount===undefined ||
        edition.coverageBookIds.length!==bookCount ||
        manifest.fragments.length!==bookCount ||
        new Set(manifest.fragments.map(f=>f.resourceId)).size!==bookCount ||
        new Set(manifest.fragments.map(f=>f.id)).size!==bookCount)
      throw new Error('Cobertura de edición o recursos divergente');
    const books = manifest.fragments.map((fragment): ReaderBookCoverage => {
      const name = names.get(fragment.bookId);
      if (!name || fragment.chapters<1 || fragment.unitCount<1)
        throw new Error('Fragmento sin identidad o cobertura');
      return {bookId:fragment.bookId,name,fragmentId:fragment.id,resourceId:fragment.resourceId,
        chapterCount:fragment.chapters,unitCount:fragment.unitCount,
        emptyUnitCount:fragment.emptyUnitCount,rangeMarkerCount:fragment.rangeMarkers};
    });
    return {editionId:edition.id,name:edition.name,language:edition.language,version:edition.version,
      attribution:manifest.license.attribution,licenseRef:edition.licenseRef,
      canonId:null,versificationId:null,referencePolicy:'source_native_unmapped',
      publicationEnabled:false,books,unitCount:manifest.integrity.unitCount,
      emptyUnitCount:manifest.integrity.emptyUnitCount};
  });
  return {schemaVersion:1,mode:'internal_metadata_only',publicationEnabled:false,editions};
}

export type ReaderBookResult =
  | {status:'edition_unavailable'}
  | {status:'book_outside_coverage'}
  | {status:'metadata_only';book:ReaderBookCoverage;publicationEnabled:false};

export function lookupReaderBook(coverage:ReaderCoverage,editionId:string,bookId:string):ReaderBookResult {
  const edition=coverage.editions.find(e=>e.editionId===editionId);
  if(!edition) return {status:'edition_unavailable'};
  const book=edition.books.find(b=>b.bookId===bookId);
  if(!book) return {status:'book_outside_coverage'};
  return {status:'metadata_only',book,publicationEnabled:false};
}
