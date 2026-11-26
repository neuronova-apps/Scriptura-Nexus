import data from '../data/referencias/biblioteca.json';
import {traditions} from './taxonomy';
import {parseBibliography} from './bibliography-contracts';
const registry=parseBibliography(data,traditions.map(t=>t.id));
export const bibliographyRegistry=()=>structuredClone(registry);

