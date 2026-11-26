import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRelations,catalogRelations,relationAnchor} from '../src/lib/editorial-relations.ts';
import {appendSnapshot,approvedSnapshot,validateSnapshot} from '../src/lib/publication.ts';
import {fixture,seal,ctx} from './fixtures/p6-template.mjs';
const marker='PRUEBA SINTÉTICA P6.5.3';
const catalog=JSON.parse(readFileSync('src/data/catalogo/estudios.json','utf8')).items;
const context={...ctx,studyIds:catalog.map(s=>s.id),bibliographyIds:[...ctx.bibliographyIds,'BIB-900002'],resourceIds:['REC-900003'],authorIds:['AUT-900001','AUT-900002'],disciplineIds:['DIS-900001'],traditionIds:['T01','T02','T03','T04','T05','A01'],admittedSources:[...ctx.admittedSources,...['BIB-900002','REC-900003'].map(id=>({id,admission:'admitido',scope:'publicacion',licenseRef:'LIC-900002',attribution:marker,authorizationRef:marker}))]};
function complete(){
 const s=fixture();
 const c=s.record.claims[0];
 c.proposition=marker;c.opposingEvidenceIds=['EVD-900002'];
 s.relations.evidence.push({...s.relations.evidence[0],id:'EVD-900002',bibliographyId:'BIB-900002',locator:marker},{id:'EVD-900003',resourceId:'REC-900003',locator:marker,language:'es',kind:'observacion',consultedAt:'2026-11-26',verification:'verificada',permission:'autorizada'});
 s.relations.arguments.push({claimId:c.id,evidenceId:'EVD-900002',role:'refuta',reasoning:marker},{claimId:c.id,evidenceId:'EVD-900003',role:'contextualiza',reasoning:marker});
 const alternative={...c,id:'AF-900002',grade:'discutido',supportingEvidenceIds:['EVD-900002'],opposingEvidenceIds:['EVD-900001']};
 s.record.claims.push(alternative);
 s.relations.arguments.push({claimId:alternative.id,evidenceId:'EVD-900002',role:'respalda',reasoning:marker},{claimId:alternative.id,evidenceId:'EVD-900001',role:'refuta',reasoning:marker});
 s.record.sections[9].evidenceIds=['EVD-900001','EVD-900002','EVD-900003'];
 s.record.conclusions[0].claimIds=[c.id,alternative.id];s.record.conclusions[0].reservations=[marker];
 s.relations.positions=context.traditionIds.map((traditionId,i)=>({id:'POS-'+(900001+i),studyId:s.studyId,traditionId,disciplineIds:['DIS-900001'],authorId:i%2?'AUT-900002':'AUT-900001',claimIds:[i%2?alternative.id:c.id],evidenceIds:[i%2?'EVD-900002':'EVD-900001'],scope:marker,authority:marker,assumptions:marker,limitations:marker}));
 s.relations.relatedStudies=[{targetStudyId:'SN-002',reason:marker}];
 return seal(s);
}
const reject=change=>{const s=complete();change(s);assert.ok(validateSnapshot(seal(s),context).length);};
test('P6.5.3: cadena completa aprobada con argumentos, seis marcos y reservas',()=>{
 const s=complete();assert.deepEqual(validateRelations(s.relations,s.record,context),[]);assert.deepEqual(validateSnapshot(s,context),[]);
 const approved=approvedSnapshot(appendSnapshot({schemaVersion:1,snapshots:[]},s,context),s.studyId,context);
 assert.equal(approved.relations.positions.length,6);assert.deepEqual(approved.record.conclusions[0].reservations,[marker]);
 const evidence=new Set(approved.relations.evidence.map(e=>e.id));
 for(const conclusion of approved.record.conclusions)for(const id of conclusion.claimIds){const claim=approved.record.claims.find(c=>c.id===id);assert.ok(claim);for(const ev of [...claim.supportingEvidenceIds,...claim.opposingEvidenceIds])assert.ok(evidence.has(ev));}
});
test('P6.5.3: roles distintos y trazabilidad bidireccional',()=>{
 const s=complete();assert.deepEqual(new Set(s.relations.arguments.filter(a=>a.claimId==='AF-900001').map(a=>a.role)),new Set(['respalda','refuta','contextualiza']));
 reject(s=>s.relations.arguments=s.relations.arguments.filter(a=>a.role!=='refuta'));
 reject(s=>s.relations.arguments[0].role='contextualiza');
 reject(s=>s.relations.arguments[0].claimId='AF-999999');
});
test('P6.5.3: referencias huérfanas de secciones y conclusiones',()=>{
 reject(s=>s.record.sections[9].evidenceIds.push('EVD-999999'));
 reject(s=>s.record.claims[0].sectionId='SN-002/S10');
 reject(s=>s.record.conclusions[0].claimIds.push('AF-999999'));
 reject(s=>s.record.conclusions[0].claimIds=[]);
 reject(s=>s.record.conclusions[0].gradeJustification='');
});
test('P6.5.3: atribución documentada y diversidad sin inferencias',()=>{
 for(const field of ['scope','authority','assumptions','limitations'])reject(s=>s.relations.positions[0][field]='');
 reject(s=>s.relations.positions[0].authorId='AUT-999999');
 reject(s=>s.relations.positions[0].evidenceIds=[]);
 reject(s=>s.relations.positions[0].claimIds=['AF-999999']);
 reject(s=>s.relations.positions[0].traditionId='T99');
 reject(s=>s.relations.positions.push(s.relations.positions[0]));
});
test('P6.5.3: permisos y admisión independientes por fuente',()=>{
 const s=complete();assert.ok(validateSnapshot(s,{...context,admittedSources:context.admittedSources.filter(a=>a.id!=='REC-900003')}).length);
 reject(s=>s.relations.evidence[2].resourceId='REC-999999');
 reject(s=>s.relations.evidence[1].permission='restringida');
 reject(s=>s.relations.evidence[0].verification='consultada');
});
test('P6.5.3: anclas únicas y destinos editoriales existentes',()=>{
 const s=complete();const all=[...s.record.claims,...s.record.conclusions,...s.relations.evidence,...s.relations.positions];const anchors=new Set(all.map(x=>relationAnchor(x.id)));assert.equal(anchors.size,all.length);
 for(const a of s.relations.arguments){assert.ok(anchors.has(relationAnchor(a.claimId)));assert.ok(anchors.has(relationAnchor(a.evidenceId)));}
 for(const p of s.relations.positions)for(const id of [...p.claimIds,...p.evidenceIds])assert.ok(anchors.has(relationAnchor(id)));
 for(const c of s.record.conclusions)for(const id of c.claimIds)assert.ok(anchors.has(relationAnchor(id)));
 reject(s=>s.relations.relatedStudies[0].targetStudyId=s.studyId);
 reject(s=>s.relations.relatedStudies[0].targetStudyId='SN-999');
 reject(s=>s.relations.relatedStudies.push(s.relations.relatedStudies[0]));
});
test('P6.5.3: coincidencias taxonómicas exactas y no duplicadas en todo el catálogo',()=>{
 for(const s of catalog){const actual=catalogRelations(s,catalog,'/Scriptura-Nexus/');const axes=new Set([s.primaryAxisId,...s.relatedAxisIds]);const expected=catalog.filter(t=>t.id!==s.id&&[t.primaryAxisId,...t.relatedAxisIds].some(id=>axes.has(id))).map(t=>t.id).sort();assert.deepEqual(actual.map(t=>t.id).sort(),expected);for(const t of actual){assert.equal(t.href,'/Scriptura-Nexus/estudios/'+t.id+'/');assert.ok(t.sharedAxes.every(id=>axes.has(id)));}}
});
