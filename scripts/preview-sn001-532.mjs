import {mkdtempSync,cpSync,symlinkSync,readFileSync,writeFileSync,rmSync,existsSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const pre=read('docs/investigaciones/SN-001-pre-registro-editorial-531.json');
const draft=read('docs/investigaciones/SN-001-registro-editorial-531.json');
const validation=read('sn001-editorial-validacion.json'),audit=read('sn001-cotejo.json');
assert.equal(validation.structureValid,true);
assert.equal(validation.relationsValid,true);
assert.equal(validation.publicationAuthorized,false);
assert.equal(audit.publicationAuthorized,false);
assert.equal(audit.passages.length,8);
assert.equal(audit.terms.length,12);
assert.equal(audit.files.length,7);
assert.equal(validation.record.sections.length,20);
assert.equal(validation.record.claims.length,5);
assert.equal(validation.record.conclusions.length,3);
assert.equal(read('src/data/publicaciones/registro.json').snapshots.length,0);
for(const [i,t] of pre.terms.entries()){assert.equal(audit.terms[i].passageId,t.passageId);assert.equal(audit.terms[i].reportedForm,t.form);}
const root=mkdtempSync(join(tmpdir(),'sn001-review-'));
try {
 for(const p of ['src','public','package.json','astro.config.mjs','tsconfig.json'])if(existsSync(p))cpSync(p,join(root,p),{recursive:true});
 symlinkSync(resolve('node_modules'),join(root,'node_modules'),'dir');
 const data={candidate:{schemaVersion:1,studyId:'SN-001',version:draft.version,record:validation.record,relations:validation.relations,bodies:draft.bodies},passages:pre.evidence,terms:pre.terms,audit,sources:pre.sources};
 mkdirSync(join(root,'src/data/review'),{recursive:true});
 writeFileSync(join(root,'src/data/review/sn001.json'),JSON.stringify(data));
 const page=join(root,'src/pages/estudios/[id].astro');
 const original=readFileSync(page,'utf8');
 const updated=original.replace("import BaseLayout", "import StudyReview from '../../components/studies/StudyReview.astro';\nimport reviewData from '../../data/review/sn001.json';\nimport BaseLayout").replace('<div class="module-landing">','{study.id===\'SN-001\' ? <StudyReview {...reviewData}/> : <div class="module-landing">').replace('</div></BaseLayout>','</div>}</BaseLayout>');
 assert.notEqual(updated,original);
 writeFileSync(page,updated);
 execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'});
 const html=readFileSync(join(root,'dist/estudios/SN-001/index.html'),'utf8');
 assert.match(html,/data-review-only="true"/);
 assert.match(html,/Candidato de revisión/);
 assert.doesNotMatch(html,/Investigación aprobada|Versión editorial aprobada/);
 assert.equal((html.match(/data-section-id=/g)||[]).length,20);
 assert.equal((html.match(/id="pasaje-E\d+"/g)||[]).length,8);
 assert.match(html,/Morfología reportada/);
 assert.match(html,/Trazabilidad de conclusiones/);
 assert.match(html,/dir="rtl"/);

 const moduleLinks=[...html.matchAll(/<a\b[^>]*>/g)].map(m=>({key:m[0].match(/\bdata-study-module="([^"]+)"/)?.[1],href:m[0].match(/\bhref="([^"]+)"/)?.[1]})).filter(m=>m.key);
 assert.equal(new Set(moduleLinks.map(m=>m.key)).size,8);
 for(const {key,href} of moduleLinks){assert.ok(href,key+' href');const url=new URL(href,'https://example.invalid');assert.equal(url.origin,'https://example.invalid');assert.equal(url.search,'');const prefix='/Scriptura-Nexus/';assert.ok(url.pathname.startsWith(prefix),key+' base');const dest=url.pathname.slice(prefix.length);const target=readFileSync(join(root,'dist',dest,'index.html'),'utf8');assert.ok(target.includes('id="'+url.hash.slice(1)+'"'),key+' destination anchor');}
 assert.match(html,/no ejecuta una búsqueda/);
 const other=readFileSync(join(root,'dist/estudios/SN-002/index.html'),'utf8');
 assert.doesNotMatch(other,/data-review-only="true"/);
 const publicHtml=readFileSync('dist/estudios/SN-001/index.html','utf8');
 assert.doesNotMatch(publicHtml,/data-review-only="true"|Candidato de revisión no publicado|data-study-module=/);
 assert.match(publicHtml,/Sin versión aprobada/);
 // Review bundle is a CI artifact only, not the deployed dist.
 mkdirSync('sn001-review-output',{recursive:true});
 cpSync(join(root,'dist'),'sn001-review-output',{recursive:true});
 console.log('Vista aislada SN-001: 20 secciones, 8 pasajes, 12 fichas de términos, barrera pública intacta.');
} finally {rmSync(root,{recursive:true,force:true});}
