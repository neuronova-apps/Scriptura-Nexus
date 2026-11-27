import data from '../data/catalogo/perfiles-relaciones-p1014.json';
import { basePath } from './site';

export const profileDefinitions = data.profiles;
export const pendingProfile = 'pendiente';
const assigned = new Map(data.assignments.map(a=>[a.studyId,a.profiles]));
const definitions = new Map(data.profiles.map(p=>[p.id,p]));
const relationNames = new Map(data.relationTypes.map(t=>[t.id,t.name]));
export function profilesForStudy(id:string) {
  return (assigned.get(id)??[]).flatMap(key=>{const profile=definitions.get(key);return profile?[profile]:[];});
}
export function plannedRelations(id:string, catalog:readonly {id:string;title:string}[], base:string) {
  const titles=new Map(catalog.map(s=>[s.id,s.title]));
  return data.links.flatMap(link=>{
    const other=link.a===id?link.b:link.b===id?link.a:null;
    if(!other || !titles.has(other))return [];
    return [{id:other,title:titles.get(other)!,href:basePath(base,'estudios/'+other+'/'),kind:link.kind,label:relationNames.get(link.kind)??link.kind,reason:link.reason}];
  }).sort((a,b)=>a.id.localeCompare(b.id));
}
