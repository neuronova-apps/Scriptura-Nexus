// P11.4.3.5.2: exact private static candidate; no writes, uploads or public listener.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync,realpathSync} from 'node:fs';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import ts from 'typescript';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {buildAnalyzerFragments} from './lib/build-analyzer-fragments-p11434.mjs';
import {validateReleaseReview} from './validate-analyzer-release-review-p11435.mjs';
export const prefix='/Scriptura-Nexus/',root=prefix+'linguistica/analizador/',assets=root+'candidate-data/';
const mime={'.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const sha=b=>createHash('sha256').update(b).digest('hex');
const modules=['term-analyzer.js','linguistic-contracts.js','term-analyzer-view.js','term-analyzer-ui.js','appearance.js','analyzer-fragments.js','static-gzip.js','init.js'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attribution=[{"label":"OSHB / WLC","text":"Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb. WLC: dominio público según proveedor; anotaciones: CC BY 4.0.","license":"CC BY 4.0 (anotaciones); WLC dominio público declarado","url":"https://github.com/openscriptures/morphhb/tree/6a5db284c715c18b239422e57bb89684e6a19f00","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","change":"Proyección de ocurrencias primarias y códigos; se excluyen notas y variantes; se preservan las formas Unicode."},{"label":"SBLGNT v1.2","text":"Copyright 2010 Society of Biblical Literature and Logos Bible Software; SBLGNT v1.2. https://github.com/Faithlife/SBLGNT","license":"CC BY 4.0","url":"https://github.com/Faithlife/SBLGNT/tree/736fdc76158950c3d04b949b7e013ca14305145a","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","change":"Selección de elementos de palabra oficiales por referencia y posición; no incluye aparato crítico."},{"label":"MorphGNT (commit fijado)","text":"Tauber, J. K., ed. (2017). MorphGNT: SBLGNT Edition, v6.12. https://github.com/morphgnt/sblgnt; DOI 10.5281/zenodo.376200","license":"CC BY-SA 3.0","url":"https://github.com/morphgnt/sblgnt/tree/aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","change":"Se proyectan lemas y códigos morfológicos en una capa separada de anotaciones, bajo la misma licencia; se excluyen las columnas textuales y las divergencias no se vinculan."}];

export function createAnalyzerOverlay(candidate,original=readFileSync('dist/linguistica/analizador/index.html','utf8')){
 const overlay=new Map(),put=(path,body,type)=>{assert.ok(!overlay.has(path));overlay.set(path,{body:Buffer.isBuffer(body)?body:Buffer.from(body),type});};
 for(const [path,b] of candidate.assets)put(assets+path,b,'application/octet-stream');
 const aliases={'./linguistic-contracts.ts':'./linguistic-contracts.js','../lib/term-analyzer-view':'./term-analyzer-view.js','../../src/lib/term-analyzer.ts':'./term-analyzer.js'};
 for(const [name,path] of [['term-analyzer.js','src/lib/term-analyzer.ts'],['linguistic-contracts.js','src/lib/linguistic-contracts.ts'],['term-analyzer-view.js','src/lib/term-analyzer-view.ts'],['term-analyzer-ui.js','src/scripts/term-analyzer-ui.ts'],['appearance.js','src/lib/appearance.ts'],['analyzer-fragments.js','scripts/lib/analyzer-fragments-p11434.mjs']]){
  let js=path.endsWith('.ts')?ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText:readFileSync(path,'utf8');
  for(const [from,to] of Object.entries(aliases))js=js.replaceAll("'"+from+"'","'"+to+"'").replaceAll('"'+from+'"','"'+to+'"');
  put(assets+name,js,'text/javascript; charset=utf-8');
 }
 put(assets+'static-gzip.js',readFileSync('scripts/lib/reader-static-gzip.mjs'),'text/javascript; charset=utf-8');
 put(assets+'init.js',[
 "import {initializeAppearance} from './appearance.js';",
 "import {mountAnalyzer} from './term-analyzer-ui.js';",
 "import {createFragmentAnalyzer,decodeAnalyzerAsset} from './analyzer-fragments.js';",
 "import {loadStaticGzip} from './static-gzip.js';",
 "initializeAppearance(document);",
 "const spec="+JSON.stringify(candidate.catalogSpec)+";",
 "const load=async d=>decodeAnalyzerAsset(d.path,JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await loadStaticGzip(new URL(d.path,import.meta.url),d,location.origin))));",
 "try{const c=await load(spec);const a=createFragmentAnalyzer(c,load);mountAnalyzer(document,a.initial,a.prepare);}catch{document.querySelector('#ta-status').textContent='No se pudo verificar el catálogo.';}"
 ].join('\n'),'text/javascript; charset=utf-8');
 const notice='La interfaz está preparada. No hay ediciones lingüísticas publicadas para consulta. La validación interna de datos no equivale a autorización de publicación.',closing=/<\/div>\s*<\/div>\s*<\/main>/;
 assert.ok(original.includes(notice)&&closing.test(original));
 const extra='<section class="sn-card sn-card--default" id="ta-candidate-rights"><h2>Fuentes, licencias y cambios</h2>'+attribution.map(x=>'<h3>'+esc(x.label)+'</h3><p>'+esc(x.text)+'</p><p>'+esc(x.license)+'</p><p>'+esc(x.change)+'</p><p><a rel="noreferrer" href="'+esc(x.url)+'">Fuente fijada de '+esc(x.label)+'</a> · <a rel="noreferrer" href="'+esc(x.licenseUrl)+'">Licencia de '+esc(x.label)+'</a></p>').join('')+'</section><section class="sn-card sn-card--default" id="ta-candidate-privacy"><h2>Privacidad</h2><p>Sin cuenta, historial de consulta ni analítica de referencias. Las peticiones de capítulos son del mismo origen. Solo se guardan las preferencias visuales. El alojamiento público puede registrar solicitudes y direcciones IP; esta prueba local no evalúa al proveedor.</p><p><a rel="noreferrer" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">Privacidad del alojamiento</a></p></section>';
 const html=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</head>','<meta name="referrer" content="no-referrer"></head>').replace(notice,'Candidato privado de consulta de siete libros. No constituye publicación. Cobertura: Génesis, Levítico, Deuteronomio, Daniel, Hechos, 1 Corintios y 3 Juan. No es el canon completo ni incluye léxicos, equivalencias Strong o aparato crítico.').replace('La selección se habilitará únicamente cuando existan ediciones publicadas.','La selección se habilita tras verificar el catálogo privado.').replace(closing,m=>extra+m).replace('</body>','<script type="module" src="'+assets+'init.js"></script></body>');
 put(root,html,'text/html; charset=utf-8');

 validateStaticOverlay(candidate,overlay);
 return overlay;
}
export function validateStaticOverlay(candidate,overlay){
 const specs=[candidate.catalogSpec,...candidate.catalog.chapters.flatMap(d=>[d.text,d.annotations])];
 assert.equal(candidate.catalog.publicationAuthorized,false);
 assert.equal(candidate.catalog.chapters.length,168);assert.equal(specs.length,337);assert.equal(candidate.assets.size,337);
 const expected=new Set([root,...modules.map(n=>assets+n),...specs.map(d=>assets+d.path)]);
 assert.equal(expected.size,346);assert.equal(overlay.size,346);
 assert.ok([...overlay.keys()].every(p=>expected.has(p)));
 for(const d of specs){
  const f=overlay.get(assets+d.path);assert.ok(f&&f.type==='application/octet-stream');
  const b=f.body;assert.ok(b.length===d.gzipBytes&&b.length<=256000&&sha(b)===d.gzipSha256&&b.equals(candidate.assets.get(d.path)));
  const raw=gunzipSync(b,{maxOutputLength:8388608});assert.ok(raw.length===d.jsonBytes&&sha(raw)===d.sha256);
 }
 for(const n of modules){const f=overlay.get(assets+n);assert.ok(f?.type==='text/javascript; charset=utf-8'&&f.body.length>0);}
 const html=overlay.get(root)?.body.toString('utf8')??'';
 assert.ok(html.includes('No constituye publicación.')&&html.includes('No es el canon completo')&&html.includes('id="ta-candidate-rights"')&&html.includes('id="ta-candidate-privacy"'));
 assert.ok(html.includes('https://creativecommons.org/licenses/by-sa/3.0/')&&html.includes('https://creativecommons.org/licenses/by/4.0/'));
 assert.equal((html.match(/<script\b/g)??[]).length,1);assert.ok(html.includes('src="'+assets+'init.js"'));
 const manifest=[...overlay.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([path,f])=>({path,bytes:f.body.length,sha256:sha(f.body)}));
 return {files:manifest.length,dataFiles:337,chapterLayers:336,modules:8,htmlFiles:1,manifestSha256:sha(Buffer.from(JSON.stringify(manifest)))};
}
export async function startAnalyzerPreview(overlay,dist='dist'){
 const base=realpathSync(resolve(dist));
 let server;
 const send=(res,status,body,type)=>{const b=Buffer.isBuffer(body)?body:Buffer.from(body);res.writeHead(status,{'Content-Type':type,'Content-Length':b.length,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});res.end(b);};
 server=createServer((req,res)=>{try{
  if(req.method!=='GET'||req.headers.host!=='127.0.0.1:'+server.address().port||['cross-site','same-site'].includes(req.headers['sec-fetch-site'])||(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host))return send(res,403,'Acceso local únicamente','text/plain');
  const u=new URL(req.url,'http://'+req.headers.host),path=u.pathname;if(u.search)return send(res,404,'Ruta no disponible','text/plain');
  if(overlay.has(path)){const x=overlay.get(path);return send(res,200,x.body,x.type);}
  if(path.startsWith(prefix)&&!path.startsWith(assets)){const file=resolve(base,decodeURIComponent(path.slice(prefix.length))),rel=relative(base,file);if(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&mime[extname(file)]&&statSync(file,{throwIfNoEntry:false})?.isFile()){const real=realpathSync(file),safe=relative(base,real);if(safe&&!safe.startsWith('..')&&!isAbsolute(safe))return send(res,200,readFileSync(real),mime[extname(file)]);}}
  return send(res,404,'Ruta no disponible','text/plain');
 }catch{if(!res.headersSent)send(res,500,'Recurso no disponible','text/plain');else res.destroy();}});
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 const origin='http://127.0.0.1:'+server.address().port;

 return {server,origin,url:origin+root};
}
export async function createStaticCandidate(){
 const review=validateReleaseReview();
 assert.equal(review.releaseGates.publicationAuthorized,false);
 const data=await loadExpandedAnalyzerData(),candidate=buildAnalyzerFragments(data),overlay=createAnalyzerOverlay(candidate);
 const summary=validateStaticOverlay(candidate,overlay);
 return {candidate,overlay,summary:{...candidate.summary,...summary,publicationAuthorized:false,corpusPersisted:false}};
}
async function main(){
 let server,stage='review and candidate';
 try{
  const mode=process.argv.slice(2);
  assert.ok(mode.length===1&&['--verify','--preview'].includes(mode[0]));
  const {overlay,summary}=await createStaticCandidate();
  if(mode[0]==='--verify'){console.log(JSON.stringify({phase:'P11.4.3.5.2',...summary,distModified:false,upload:false}));return;}
  stage='loopback';const preview=await startAnalyzerPreview(overlay);server=preview.server;
  const close=()=>{server.closeAllConnections();server.close();};
  process.once('SIGINT',close);process.once('SIGTERM',close);
  console.log(JSON.stringify({phase:'P11.4.3.5.2',...summary,url:preview.url,distModified:false,upload:false}));
 }catch(e){server?.closeAllConnections();server?.close();console.error('Private analyzer candidate failed at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+'); no corpus persisted');process.exitCode=1;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
