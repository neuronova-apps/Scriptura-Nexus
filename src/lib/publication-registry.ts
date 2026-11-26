import registryData from '../data/publicaciones/registro.json';
import { studies } from './catalog';
import { disciplines, traditions } from './taxonomy';
import { validateRegistry, approvedSnapshot, type PublicationContext } from './publication';
import {bibliographyRegistry} from './bibliography';
import {admittedBibliographicSources} from './permissions';
const registry:unknown=registryData;
const bibliography=bibliographyRegistry();
// P7.4: independently reviewed permissions determine admission; no default authorization.
const context:PublicationContext={studyIds:studies.map(s=>s.id),bibliographyIds:bibliography.editions.filter(e=>e.provenance.verification==='verificada').map(e=>e.id),resourceIds:bibliography.resources.filter(r=>r.provenance.verification==='verificada').map(r=>r.id),authorIds:bibliography.authors.filter(a=>a.provenance.verification==='verificada').map(a=>a.id),disciplineIds:disciplines.map(d=>d.id),traditionIds:traditions.map(t=>t.id),admittedSources:admittedBibliographicSources()};
validateRegistry(registry,context);
export const getApprovedSnapshot=(id:string)=>approvedSnapshot(registry,id,context);
