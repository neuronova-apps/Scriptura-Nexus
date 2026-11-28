import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const v=read('sn001-editorial-validacion.json'),a=read('sn001-cotejo.json');
const draft=read('docs/investigaciones/SN-001-registro-editorial-531.json');
assert.equal(v.publicationAuthorized,false);
assert.equal(v.structureValid,true);
assert.equal(v.relationsValid,true);
assert.equal(v.record.sections.filter(s=>s.applicability==='no_aplicable').length,6);
assert.equal(v.record.sections.filter(s=>s.applicability==='analizada').length,14);
for(const s of v.record.sections.filter(s=>s.applicability==='no_aplicable')){assert.ok(s.justification);assert.equal(s.contentRef,undefined);assert.equal(draft.bodies[s.id],undefined);}
assert.equal(v.record.reviews[0].result,'pendiente');
assert.equal(a.terms.length,12);
const grouped={};for(const b of v.blockers){const key=b.split(':')[0];(grouped[key]??=[]).push(b);}
const report={phase:'5.4',study:'SN-001',version:draft.version,publicationAuthorized:false,technicalContracts:'conformes',reviewedContentDigest:v.record.reviews[0].reviewedDigest,sections:{total:20,analyzed:14,omittedWithReason:6},sources:a.files.length,passages:a.passages.length,termStatus:a.terms.reduce((m,t)=>(m[t.status]=(m[t.status]??0)+1,m),{}),lexicalChecks:a.lexical,publicationBlockers:grouped,blockerCount:v.blockers.length,admissions:v.admissions,criticalControls:v.record.reviews[0].controls,requiredBeforePublication:['Revisar el cotejo puntual y las discrepancias de identificadores y morfología.','Determinar admisión editorial de cada fuente y uso.','Acreditar evidencia específica de afirmaciones lingüísticas.','Revisar las secciones dentro del alcance y aprobar el contenido exacto mediante huella.','No incorporar al registro público mientras existan bloqueos.']};
mkdirSync('sn001-validation-output',{recursive:true});
writeFileSync('sn001-validation-output/editorial-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({phase:report.phase,sections:report.sections,termStatus:report.termStatus,blockerCount:report.blockerCount,admissions:report.admissions,publicationAuthorized:false}));
