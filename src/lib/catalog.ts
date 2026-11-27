import data from '../data/catalogo/estudios.json';
import expansion from '../data/catalogo/ampliacion-p1013.json';
// Keep the original P5 catalog immutable; the approved P10.1.3 layer supplies new metadata and five revisions.
// Normalize the common shape at the boundary: a planned study may have no initial references.
export type CatalogEntry = Omit<(typeof data.items)[number], 'referenceSelectionPending'> & { referenceSelectionPending?: string };
const revisions = new Map<string, CatalogEntry>(expansion.extensions.map(study => [study.id, study]));
export const studies: CatalogEntry[] = [...data.items.map(study => revisions.get(study.id) ?? study), ...expansion.items];
export function getStudy(id: string) { return studies.find(study => study.id === id); }
export function studiesByAxis(id: string) { return studies.filter(study => study.primaryAxisId === id); }
export function relatedStudiesByAxis(id: string) { return studies.filter(study => study.relatedAxisIds.includes(id)); }
