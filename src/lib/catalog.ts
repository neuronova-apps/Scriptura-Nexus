import data from '../data/catalogo/estudios.json';
export const studies = data.items;
export function getStudy(id: string) { return studies.find(study => study.id === id); }
export function studiesByAxis(id: string) { return studies.filter(study => study.primaryAxisId === id); }
export function relatedStudiesByAxis(id: string) { return studies.filter(study => study.relatedAxisIds.includes(id)); }
