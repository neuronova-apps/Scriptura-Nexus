import data from '../data/referencias/permisos.json';
import {bibliographyRegistry} from './bibliography';
import {parsePermissions,publicationAdmissions} from './source-permissions';
const bibliography=bibliographyRegistry();
const permissions=parsePermissions(data,bibliography);
export const permissionRegistry=()=>structuredClone(permissions);
export const admittedBibliographicSources=()=>publicationAdmissions(bibliography,permissions);
