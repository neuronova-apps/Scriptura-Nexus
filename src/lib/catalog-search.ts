export interface SearchSource {
  id: string; title: string; question: string; status: string; primaryAxisId: string;
  relatedAxisIds: string[]; initialReferences: string[];
}
export interface SearchEntry {
  id: string; title: string; question: string; status: 'planificado'; axis: string; terms: string;
}
export const SEARCH_INDEX_VERSION = 1;
export const PAGE_SIZE = 12;
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
export function createSearchIndex(studies: readonly SearchSource[], axes: readonly {id:string;name:string}[]): SearchEntry[] {
  const names = new Map(axes.map(axis => [axis.id, axis.name]));
  // P5.4 only admits public planned catalog metadata. Future approved snapshots require P6.
  return studies.filter(study => study.status === 'planificado').map(study => ({
    id: study.id, title: study.title, question: study.question, status: 'planificado',
    axis: names.get(study.primaryAxisId) ?? study.primaryAxisId,
    terms: normalizeSearch([study.id, study.title, study.question, study.primaryAxisId,
      names.get(study.primaryAxisId) ?? '', ...study.initialReferences].join(' ')),
  })).sort((a,b) => a.id.localeCompare(b.id));
}
export function searchCatalog(index: readonly SearchEntry[], query: string): SearchEntry[] {
  const q = normalizeSearch(query);
  if (!q) return [];
  const compactId = q.replace(/ /g,'');
  const exactId = /^sn\d{3}$/.test(compactId);
  if (exactId) return index.filter(entry => entry.id.toLowerCase().replace('-','') === compactId);
  const tokens = q.split(' ');
  const ranked = index.filter(entry => tokens.every(token => entry.terms.includes(token))).map(entry => ({
    entry, score: normalizeSearch(entry.title) === q ? 3 : normalizeSearch(entry.title).includes(q) ? 2 : tokens.every(token => normalizeSearch(entry.title).includes(token)) ? 1 : 0
  }));
  return ranked.sort((a,b) => b.score-a.score || a.entry.id.localeCompare(b.entry.id)).map(item => item.entry);
}
