import {makeSections,criticalControls} from '../../src/lib/editorial-contracts.ts';
import {snapshotDigest} from '../../src/lib/publication.ts';
export const label='PRUEBA SINTÉTICA P6.5.2';
export const ctx={studyIds:['SN-001'],bibliographyIds:['BIB-900001'],resourceIds:[],authorIds:[],disciplineIds:[],traditionIds:[],admittedSources:[{id:'BIB-900001',admission:'admitido',scope:'publicacion',licenseRef:'LIC-900001',attribution:label,authorizationRef:label}]};
export function seal(s){const {digest,...payload}=s;return {...payload,digest:snapshotDigest(payload)};}
export function fixture(version='1.0.0',previousVersion=null){
 const sections=makeSections('SN-001').map(s=>({...s,applicability:'revisada',contentRef:s.id}));
 const claim={id:'AF-900001',studyId:'SN-001',sectionId:'SN-001/S10',proposition:label,type:'interpretacion_teologica',grade:'plausible',gradeJustification:label,supportingEvidenceIds:['EVD-900001'],opposingEvidenceIds:[],reasoning:label};
 return seal({schemaVersion:1,studyId:'SN-001',version,previousVersion,publishedAt:'2026-11-26',reviewId:'REV-900001',record:{schemaVersion:1,studyId:'SN-001',version,createdAt:'2026-11-26',updatedAt:'2026-11-26',objective:label,scope:label,sections,claims:[claim],conclusions:[{id:'CON-900001',studyId:'SN-001',claimIds:[claim.id],synthesis:label,grade:'plausible',gradeJustification:label,reservations:[]}],reviews:[{id:'REV-900001',studyId:'SN-001',version,date:'2026-11-26',reviewerRole:label,result:'aprobada',controls:criticalControls.map(id=>({id,result:'conforme'}))}]},relations:{schemaVersion:1,studyId:'SN-001',evidence:[{id:'EVD-900001',bibliographyId:'BIB-900001',locator:label,language:'es',kind:'parafrasis',consultedAt:'2026-11-26',verification:'verificada',permission:'autorizada'}],arguments:[{claimId:claim.id,evidenceId:'EVD-900001',role:'respalda',reasoning:label}],positions:[],relatedStudies:[]},bodies:Object.fromEntries(sections.map(s=>[s.id,label]))});
}
