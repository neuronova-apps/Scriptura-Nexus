// Combined candidate: all data stays in memory. No public route changes or uploads.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {lexicalNotices} from './private-review-notices-p11484.mjs';
import {createCandidate} from '../prepare-reader-candidate-p11425.mjs';
import {createAnalyzerOverlay,validateStaticOverlay} from '../prepare-analyzer-candidate-p11435.mjs';
import {validateReleaseReview} from '../validate-analyzer-release-review-p11435.mjs';
import {loadExpandedAnalyzerData} from './linguistic-expansion-p11433.mjs';
import {buildAnalyzerFragments} from './build-analyzer-fragments-p11434.mjs';
import {loadPrivateLexicalModel} from './build-lexical-concordance-p114441.mjs';
import {buildPrivateLexicalBrowserCandidate} from './build-lexical-browser-candidate-p114442.mjs';
import {createPrivateComparatorOverlay,comparatorPath,privateAssets,readerAssets} from './private-comparator-overlay-p11453.mjs';
import {createPrivateManuscriptOverlay,manuscriptPath,manuscriptAssets} from './private-manuscript-overlay-p11463.mjs';
export const prefix='/Scriptura-Nexus/';
export const routes={reader:prefix+'biblia/lector/',analyzer:prefix+'linguistica/analizador/',lexical:prefix+'linguistica/lexicos-concordancias/',comparator:comparatorPath,manuscripts:manuscriptPath};
export const lexicalAssets=routes.lexical+'private-lexical/';
export const analyzerAssets=routes.analyzer+'candidate-data/';
export const privatePrefixes=[readerAssets,analyzerAssets,lexicalAssets,privateAssets,manuscriptAssets];
const sourceFiles=new Map([
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/term-analyzer.js','src/lib/term-analyzer.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/linguistic-contracts.js','src/lib/linguistic-contracts.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/term-analyzer-view.js','src/lib/term-analyzer-view.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/concordance.js','src/lib/concordance.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/lexical-query.js','src/lib/lexical-query.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/lexical-fragment-runtime.js','src/lib/lexical-fragment-runtime.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/analyzer-fragment-runtime.js','src/lib/analyzer-fragment-runtime.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/private-fragment-loader.js','src/lib/private-fragment-loader.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/lexicon-concordance-fragments.js','src/lib/lexicon-concordance-fragments.ts'],
 ['/Scriptura-Nexus/linguistica/lexicos-concordancias/private-lexical/modules/lexicon-concordance-ui.js','src/scripts/lexicon-concordance-ui.ts']
]);
const aliases={
 './linguistic-contracts.ts':'./linguistic-contracts.js',
 './term-analyzer.ts':'./term-analyzer.js',
 './term-analyzer-view.ts':'./term-analyzer-view.js',
 '../lib/term-analyzer-view.ts':'./term-analyzer-view.js',
 './concordance.ts':'./concordance.js',
 './lexical-query.ts':'./lexical-query.js',
 './lexical-fragment-runtime.ts':'./lexical-fragment-runtime.js',
 './analyzer-fragment-runtime.ts':'./analyzer-fragment-runtime.js',
 './private-fragment-loader.ts':'./private-fragment-loader.js'
};

const read=p=>readFileSync(p,'utf8');
const transpile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const jsType='text/javascript; charset=utf-8';
function lexicalOverlay(candidate){
 const files=new Map(),put=(p,b,type)=>{assert.ok(!files.has(p));files.set(p,{body:Buffer.isBuffer(b)?b:Buffer.from(b),type});};
 for(const [path,file] of sourceFiles){
  let js=transpile(read(file));
  for(const [from,to] of Object.entries(aliases))js=js.replaceAll("'"+from+"'","'"+to+"'").replaceAll('"'+from+'"','"'+to+'"');
  put(path,js,jsType);
 }
 put(lexicalAssets+'modules/appearance.js',transpile(read('src/lib/appearance.ts')),jsType);
 for(const [path,bytes] of candidate.assets)put(lexicalAssets+path,bytes,'application/gzip');
 put(lexicalAssets+'manifest.json',JSON.stringify(candidate.rootManifest),'application/json; charset=utf-8');
 put(lexicalAssets+'modules/init.js',[
  "import {initializeAppearance} from './appearance.js';",
  "import {createLexiconConcordanceFragments} from './lexicon-concordance-fragments.js';",
  "import {mountLexiconConcordance} from './lexicon-concordance-ui.js';",
  "initializeAppearance(document);",
  "try{const a=await createLexiconConcordanceFragments({manifestUrl:"+JSON.stringify(lexicalAssets+'manifest.json')+",assetBase:"+JSON.stringify(lexicalAssets)+"});mountLexiconConcordance(document,a.lexicon,a.concordance);window.addEventListener('pagehide',()=>a.close(),{once:true});}catch{document.querySelector('#lc-lex-status').textContent='No se pudo verificar el catálogo privado.';}"
 ].join('\n'),jsType);
 const original=read('dist/linguistica/lexicos-concordancias/index.html');
 const notice='No hay diccionarios ni corpus autorizados para consulta pública. Los controles se habilitarán cuando exista una publicación aprobada.';
 assert.ok(original.includes(notice)&&original.includes('</body>'));
 const html=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(notice,'Candidato privado de léxicos y concordancias. No autorizado para publicación; consultas independientes.').replace('</main>',lexicalNotices+'</main>').replace('</body>','<script type="module" src="'+lexicalAssets+'modules/init.js"></script></body>');
 assert.ok(html.includes('id="lc-candidate-rights"')&&html.includes('id="lc-candidate-privacy"'));
 put(routes.lexical,html,'text/html; charset=utf-8');
 return files;
}
export function combineOverlays(parts){
 const files=new Map(),owners=new Map();const pages=new Set(Object.values(routes));
 for(const [name,part] of parts)for(const [path,f] of part){
  assert.ok(pages.has(path)||privatePrefixes.some(p=>path.startsWith(p)),'Unexpected private path');
  assert.ok(!path.includes('?')&&!path.includes('#')&&!path.split('/').includes('..')&&Buffer.isBuffer(f.body)&&typeof f.type==='string');
  if(files.has(path)){
   // Only reader data may be shared by the reader and comparator, byte for byte.
   assert.ok(path===readerAssets+'catalog.json.gz'||path.startsWith(readerAssets+'chapters/'));
   assert.equal(owners.get(path),'reader');assert.equal(name,'comparator');
   assert.ok(files.get(path).body.equals(f.body)&&files.get(path).type===f.type,'Shared reader bytes differ');
  }else{files.set(path,f);owners.set(path,name);}
 }
 return files;
}
export async function createIntegralPrivateOverlay(){
 assert.equal(validateReleaseReview().releaseGates.publicationAuthorized,false);
 const reader=await createCandidate();
 assert.deepEqual([reader.summary.editions,reader.summary.chapters,reader.summary.units,reader.summary.publicationAuthorized,reader.summary.corpusPersisted],[2,1449,39041,false,false]);
 const comparator=await createPrivateComparatorOverlay(reader);
 const data=await loadExpandedAnalyzerData(),analyzer=buildAnalyzerFragments(data),analyzerOverlay=createAnalyzerOverlay(analyzer);
 validateStaticOverlay(analyzer,analyzerOverlay);
 assert.deepEqual([analyzer.summary.chapters,analyzer.summary.chapterLayers,analyzer.summary.units,analyzer.summary.occurrences,analyzer.summary.publicationAuthorized,analyzer.summary.corpusPersisted],[168,336,5162,78218,false,false]);
 const lexical=loadPrivateLexicalModel(),lc=await buildPrivateLexicalBrowserCandidate(data,lexical);
 assert.deepEqual([lc.summary.lexicalEntries,lc.summary.forms,lc.summary.definitions,lc.summary.occurrences,lc.summary.fragmentFiles,lc.summary.publicationAuthorized,lc.summary.corpusPersisted],[30740,10221,35496,78218,11442,false,false]);
 assert.ok(lc.summary.maxGzipBytes<=256000&&lc.summary.maxJsonBytes<=8388608);
 const manuscript=createPrivateManuscriptOverlay();
 assert.deepEqual([manuscript.summary.witnesses,manuscript.summary.variants,manuscript.summary.evidence,manuscript.summary.publicationAuthorized],[2,1,8,false]);
 const entry=lexical.model.entries.find(e=>e.system==='strong');
 assert.ok(entry);
 const chapter=analyzer.catalog.chapters.find(d=>d.bookId==='LIB-Lev'&&d.chapter==='19');
 assert.ok(chapter);
 const coverage=lc.catalog.coverage.find(e=>e.languages.includes('hbo'));assert.ok(coverage);
 const files=combineOverlays([['reader',reader.overlay],['analyzer',analyzerOverlay],['lexical',lexicalOverlay(lc)],['comparator',comparator.files],['manuscripts',manuscript.files]]);
 for(const route of Object.values(routes))assert.ok(files.has(route));
 assert.equal([...files.keys()].filter(p=>p.startsWith(readerAssets+'chapters/')).length,1449);
 return {files,query:{entry:entry.providerKey,analyzerEdition:chapter.editionId,concordanceEdition:coverage.editionId},summary:{modules:5,sharedReaderChapters:1449,analyzerLayers:336,lexicalFragments:11442,manuscriptEvidence:8,publicationAuthorized:false,corpusPersisted:false,upload:false}};
}
