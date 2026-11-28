import {mkdtempSync,cpSync,symlinkSync,readFileSync,writeFileSync,rmSync,existsSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {searchCatalog} from '../src/lib/catalog-search.ts';
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

// The overlay changes only the temporary review build, never public source metadata.
const reviewId='SN-001';
const catalog=join(root,'src/lib/catalog.ts');
const catalogSource=readFileSync(catalog,'utf8');
const catalogOverlay=catalogSource.replace('...expansion.items];','...expansion.items].map(s=>s.id==="SN-001"?{...s,status:"en_revision",version:'+JSON.stringify(draft.version)+'}:s) as CatalogEntry[];');
assert.notEqual(catalogOverlay,catalogSource);writeFileSync(catalog,catalogOverlay);
const indexSource=join(root,'src/pages/data/catalog-search.json.ts');
const indexOriginal=readFileSync(indexSource,'utf8');
const references=pre.evidence.map(e=>e.reference);
const keywords=['tatuajes','tatuaje','incisiones','marcas corporales',...pre.terms.flatMap(t=>[t.form,t.strong??''])];
const indexOverlay=indexOriginal.replace("import { studies }","import {addReviewEntry} from '../../lib/review-catalog-search';\nimport { studies }").replace('createSearchIndex(studies,axes)','addReviewEntry(createSearchIndex(studies.map(s=>s.id==="SN-001"?{...s,status:"planificado"}:s),axes),"SN-001",'+JSON.stringify(references)+','+JSON.stringify(keywords)+')');
assert.notEqual(indexOverlay,indexOriginal);writeFileSync(indexSource,indexOverlay);
const searchPage=join(root,'src/pages/buscar/index.astro');
const searchOriginal=readFileSync(searchPage,'utf8');
const searchOverlay=searchOriginal.replace("item.id+' · Planificado'","item.id+(item.status==='en_revision'?' · En revisión (no publicado)':' · Planificado')").replace("item.status==='planificado'","(item.status==='planificado'||(item.id==='SN-001'&&item.status==='en_revision'))").replace('Los resultados son fichas planificadas, no investigaciones publicadas.','SN-001 está disponible como candidato en revisión. Las demás fichas permanecen planificadas. Ninguna es una investigación publicada.').replace('Aún no se consultan textos bíblicos, autores, léxicos ni manuscritos.','Se indexan referencias y términos de la ficha candidata, no corpus bíblicos ni diccionarios.');
assert.notEqual(searchOverlay,searchOriginal);writeFileSync(searchPage,searchOverlay);
const catPage=join(root,'src/pages/estudios/index.astro');
const catOriginal=readFileSync(catPage,'utf8');
const catOverlay=catOriginal.replace('investigaciones planificadas. Las fichas contienen información preliminar; no son estudios publicados ni conclusiones aprobadas.','investigaciones. SN-001 está en revisión; las otras 79 permanecen planificadas. No hay conclusiones aprobadas ni estudios publicados.');
assert.notEqual(catOverlay,catOriginal);writeFileSync(catPage,catOverlay);

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

 const reviewIndex=read(join(root,'dist/data/catalog-search.json'));
 const publicIndex=read('dist/data/catalog-search.json');
 assert.equal(reviewIndex.items.length,80);
 assert.equal(publicIndex.items.length,80);
 assert.deepEqual(reviewIndex.items.filter(x=>x.id!=='SN-001'),publicIndex.items.filter(x=>x.id!=='SN-001'));
 assert.equal(reviewIndex.items.find(x=>x.id==='SN-001').status,'en_revision');
 assert.equal(publicIndex.items.find(x=>x.id==='SN-001').status,'planificado');
 for(const query of ['SN-001','tatuarse','tatuaje','Levítico 19:28','H7085','קַעֲקַע'])assert.ok(searchCatalog(reviewIndex.items,query).some(x=>x.id==='SN-001'),query);
 assert.equal(searchCatalog(publicIndex.items,'H7085').length,0);
 const catalogHtml=readFileSync(join(root,'dist/estudios/index.html'),'utf8');
 assert.match(catalogHtml,/data-study-id="SN-001"[^>]*data-status="en_revision"/);
 assert.match(catalogHtml,/otras 79 permanecen planificadas/);
 const searchHtml=readFileSync(join(root,'dist/buscar/index.html'),'utf8');
 assert.match(searchHtml,/candidato en revisión/);
 assert.doesNotMatch(readFileSync('dist/buscar/index.html','utf8'),/candidato en revisión/);
 console.log('Catálogo: 80 fichas; SN-001 en revisión, 79 intactas. Seis consultas de control conformes.');

 // Review bundle is a CI artifact only, not the deployed dist.
 mkdirSync('sn001-review-output',{recursive:true});
 cpSync(join(root,'dist'),'sn001-review-output',{recursive:true});
 console.log('Vista aislada SN-001: 20 secciones, 8 pasajes, 12 fichas de términos, barrera pública intacta.');
} finally {rmSync(root,{recursive:true,force:true});}
