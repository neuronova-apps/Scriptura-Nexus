import registryData from '../data/publicaciones/registro.json';
import { studies } from './catalog';
import { disciplines, traditions } from './taxonomy';
import { validateRegistry, approvedSnapshot, type PublicationRegistry, type PublicationContext } from './publication';
const registry:PublicationRegistry=registryData;
// P7 must connect independently reviewed bibliography, authors and admitted resources.
// Empty allowlists fail closed: no source is presently admitted for publication.
const context:PublicationContext={studyIds:studies.map(s=>s.id),bibliographyIds:[],resourceIds:[],authorIds:[],disciplineIds:disciplines.map(d=>d.id),traditionIds:traditions.map(t=>t.id),admittedSources:[]};
validateRegistry(registry,context);
export const getApprovedSnapshot=(id:string)=>approvedSnapshot(registry,id,context);
