// Private reference-only projection. Never imported by public routes.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createIsolatedManuscriptView} from './private-manuscript-view-p11463.mjs';
import {validateManuscriptPilot} from '../../src/lib/manuscript-pilot.ts';
const pins={
 pilot:['docs/P9/muestra-manuscritos-p943.json','3c283e6bd9f0d4aab2ba939e0667753fae1b8053'],
 projection:['docs/P9/proyeccion-ediciones-p913.json','ff6ef60588416089b26afcc6160df74956b496df'],
 inventory:['docs/P9/candidatos-manuscritos-p941.json','8e60a5b3ad1bafe0199a954594c4e2c98521ab50']
};
const need=(ok)=>{if(!ok)throw Error('Proyección documental privada no válida');};
const clone=x=>structuredClone(x);
const hash=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const parse=(key,bytes)=>{need(Buffer.isBuffer(bytes)&&hash(bytes)===pins[key][1]);return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));};
export function loadPrivateManuscriptInputs(){return Object.fromEntries(Object.entries(pins).map(([key,[path]])=>[key,readFileSync(new URL('../../'+path,import.meta.url))]));}
const safeLink=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const kinds={edition_identity:'edition_identity',edition_apparatus:'editorial_apparatus',catalog_identity:'catalog',bibliographic_reference:'bibliographic_reference',secondary_attestation:'secondary_report'};
const credit={
 'REC-P943-SBL-ABOUT':'Michael W. Holmes; Society of Biblical Literature y Logos Bible Software, SBLGNT v1.2.',
 'REC-P943-SBL-APP':'Michael W. Holmes; Society of Biblical Literature y Logos Bible Software, SBLGNT v1.2.',
 'REC-P943-P66':'CSNTM; referencia al ejemplar P. Bodmer II custodiado por Bibliotheca Bodmeriana.',
 'REC-P943-A':'CSNTM; referencia al ejemplar GA 02 custodiado por British Library.',
 'REC-P943-BL':'British Library, Royal MS 1 D VIII.',
 'REC-P943-IGNTP-P66':'IGNTP, depósito de 2013, ID 1759.',
 'REC-P943-WRIGHT':'Brian J. Wright (2007), artículo citado en Bible.org.'
};
export function projectPrivateManuscripts(inputs){
 const pilot=parse('pilot',inputs.pilot),projection=parse('projection',inputs.projection),inventory=parse('inventory',inputs.inventory);
 need(validateManuscriptPilot(pilot,projection).length===0);
 need(inventory.publicationAuthorized===false&&inventory.corpusImportAuthorized===false&&inventory.candidates.length===11&&inventory.candidates.every(c=>Object.values(c.reuse).every(v=>v===false)));
 need(pilot.publicationAuthorized===false&&pilot.corpusImportAuthorized===false&&pilot.sourceFilesAdmitted===0);
 const reg=pilot.registry;
 const sources=pilot.resources.map(s=>{
  need(s.use==='reference_only'&&safeLink(s.url)&&safeLink(s.rightsUrl)&&Object.hasOwn(credit,s.id));
  return {id:s.id,title:s.title,url:s.url,rightsUrl:s.rightsUrl,rights:s.rights,attribution:credit[s.id]};
 });
 const evidence=pilot.evidence.map(e=>{
  need(Object.hasOwn(kinds,e.kind)&&e.verification==='verified_reference');
  return {id:e.id,sourceId:e.resourceId,locator:e.locator,kind:kinds[e.kind],reviewedOn:e.reviewedOn};
 });
 const witnesses=reg.witnesses.map(w=>({id:w.id,name:w.siglum,catalogIdentifier:w.catalogIdentifier,dating:w.dateRange.label,language:w.language==='grc'?'Griego (grc)':w.language,institution:w.custody.institution,shelfmark:w.custody.shelfmark,evidenceIds:w.sourceRefs.evidenceIds}));
 const variants=reg.variants.map(v=>{
  need(v.locus.referenceStatus==='source_native_only'&&v.locus.unitId===null&&v.locus.versificationId===null&&v.assessment.status==='not_assessed'&&v.apparatus.reusePolicy==='reference_only');
  return {id:v.id,locus:v.locus.sourceLocator,edition:'SBLGNT v1.2 (edición crítica)',apparatusEvidenceId:v.apparatus.sourceEvidenceIds[0],assessment:v.assessment.status,readings:v.readingIds.map(id=>{
   const r=reg.readings.find(x=>x.id===id),rep=pilot.readingRepresentation.find(x=>x.readingId===id);
   need(r&&rep&&r.readingText===null&&r.contentMode==='reference_only'&&rep.attestationBasis==='secondary_report'&&!rep.directManuscriptInspection&&!rep.apparatusProvidesWitnesses&&!rep.folioVerified&&!rep.handVerified);
   return {id:r.id,reference:r.readingReference,evidenceIds:r.sourceEvidenceIds,attestations:r.witnessAttestations.map(t=>{
    need(t.status==='attested'&&t.hand.kind==='unknown'&&t.hand.label===null&&evidence.find(e=>e.id===t.sourceEvidenceId)?.kind==='secondary_report');
    return {witnessId:t.witnessId,evidenceId:t.sourceEvidenceId,basis:'secondary_report',locator:t.witnessLocator,hand:null};
   })};
  })};
 });
 return clone({mode:'isolated_reference_only',publicationAuthorized:false,witnesses,variants,sources,evidence});
}
// This view is deliberately distinct from a public ManuscriptRelease. It never
// changes publicationAuthorized; available means available in the isolated view.
export function createPrivateManuscriptCandidate(inputs=loadPrivateManuscriptInputs()){
 const projected=projectPrivateManuscripts(inputs);
 const view=createIsolatedManuscriptView(projected);
 return {projection:clone(projected),view};
}
