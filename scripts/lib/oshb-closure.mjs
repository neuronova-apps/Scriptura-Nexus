import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// P8.2.7: consolidate validation metadata only, never corpus or public records.
// Fixed scope of this checkpoint; new admissions require a separately reviewed baseline.
const scope={
 'LING-010':{path:'Morphology codes/TEHMC - Translators Expansion of Hebrew Morphology Codes - STEPBible.org CC BY.txt',commit:'5de0a47f35f0fc13dfe1430d104e5db8a4285f9c',sha256:'fe37e62b97e531410159e5f1b1ac8a69db4512c3e8407c03bae38639bd09f97f',components:['codigo_morfologico','descripcion_gramatical']},
 'LING-011':{path:'wlc/Gen.xml',commit:'6a5db284c715c18b239422e57bb89684e6a19f00',sha256:'e5ab737c323d3879733e03882ecf17b7d917115133f87f9cd97895ac98f2b1a4',components:['texto_wlc','anotaciones_lema','anotaciones_morfologia']},
 'LING-012':{path:'wlc/Dan.xml',commit:'6a5db284c715c18b239422e57bb89684e6a19f00',sha256:'e63592e843bfe907758853affb352f049296cce1df95e747d65a48b29ab486a4',components:['texto_wlc','anotaciones_lema','anotaciones_morfologia']}
};
const books={Gen:{chapters:50,verses:1533,words:20612,segments:4670},Dan:{chapters:12,verses:357,words:5919,segments:1077}};
const expected={units:1890,tokens:26531,hbo:22930,arc:3601,unknown:0,alternatives:132,alternativeWords:133,lemmas:2595,components:36749,documented:26331,partial:326,unresolved:7,absent:0,segments:5747};
const collections=['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'];
const shaPattern=/^[0-9a-f]{64}$/;
const digest=x=>createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
const nonNegativeInteger=x=>Number.isSafeInteger(x)&&x>=0;
const sorted=x=>[...x].sort();

export function consolidateP82({manifest,registry,integrity,repeatedIntegrity,compatibility,lexical}){
 assert.equal(manifest.schemaVersion,1);
 assert.equal(manifest.files.length,12);
 assert.deepEqual(sorted(manifest.files.map(f=>f.id)),Array.from({length:12},(_,i)=>'LING-'+String(i+1).padStart(3,'0')));
 const approved=manifest.files.filter(f=>f.review==='aprobado');
 const excluded=manifest.files.filter(f=>f.review==='rechazado');
 assert.deepEqual(sorted(approved.map(f=>f.id)),Object.keys(scope));
 assert.deepEqual(sorted(excluded.map(f=>f.id)),Array.from({length:9},(_,i)=>'LING-'+String(i+1).padStart(3,'0')));
 const sources=approved.sort((a,b)=>a.id.localeCompare(b.id)).map(f=>{
  const expected=scope[f.id];
  assert.equal(f.path,expected.path);
  assert.equal(f.commit,expected.commit);
  assert.equal(f.sha256,expected.sha256);
  assert.deepEqual(sorted(f.allowedComponents),sorted(expected.components));
  assert.ok(shaPattern.test(f.licenseEvidenceSha256));
  for(const k of ['approvalRef','attribution','declaredLicense'])assert.ok(typeof f[k]==='string'&&f[k].trim(),k);
  assert.ok(Array.isArray(f.conditions)&&f.conditions.length>0);
  return {id:f.id,commit:f.commit,sha256:f.sha256,licenseEvidenceSha256:f.licenseEvidenceSha256,components:sorted(f.allowedComponents)};
 });
 assert.deepEqual(sorted(Object.keys(registry)),sorted(['schemaVersion',...collections]));
 assert.equal(registry.schemaVersion,1);
 for(const k of collections)assert.deepEqual(registry[k],[],'Registro público no vacío: '+k);
 assert.deepEqual(integrity,repeatedIntegrity,'Auditorías no reproducibles');
 assert.ok(shaPattern.test(integrity.sha256));
 assert.deepEqual(integrity.books,books);
 const c=integrity.counts;
 for(const [k,v] of Object.entries(expected))assert.equal(c[k],v,'Línea base: '+k);
 assert.equal(c.tokens,c.hbo+c.arc+c.unknown);
 assert.equal(c.documented+c.partial+c.unresolved+c.absent,c.tokens+c.alternativeWords);
 assert.equal(c.segments,Object.values(books).reduce((n,b)=>n+b.segments,0));
 assert.equal(integrity.pendingMorphology,c.partial+c.unresolved+c.absent);
 const pending={partial:0,unresolved:0,absent:0};
 const seen=new Set();
 for(const g of integrity.pendingCodeGroups){
  assert.ok(Array.isArray(g.key)&&g.key.length===4);
  const key=JSON.stringify(g.key),state=g.key[2];
  assert.ok(Object.hasOwn(pending,state)&&!seen.has(key));
  assert.ok(Number.isSafeInteger(g.occurrences)&&g.occurrences>0);
  seen.add(key);pending[state]+=g.occurrences;
 }
 for(const [state,n] of Object.entries(pending))assert.equal(n,c[state],'Conciliación de pendientes: '+state);
 assert.ok(nonNegativeInteger(integrity.unanchoredVariants)&&integrity.unanchoredVariants<=c.alternatives);
 assert.ok(nonNegativeInteger(integrity.unicode.forms)&&integrity.unicode.forms===c.tokens+c.alternativeWords+c.segments);
 assert.ok(nonNegativeInteger(integrity.unicode.combiningMarks)&&integrity.unicode.combiningMarks>0);
 assert.ok(nonNegativeInteger(integrity.unicode.nonNfc)&&integrity.unicode.nonNfc<=integrity.unicode.forms);
 assert.equal(lexical.admittedIdentifiers,0);
 assert.equal(compatibility.semanticEquivalencesApproved,0);
 assert.ok(Number.isSafeInteger(compatibility.exactCodeMatches)&&compatibility.exactCodeMatches>0);
 const report={schemaVersion:1,mode:'P8.2.7-validation-only',sources,excludedIds:sorted(excluded.map(f=>f.id)),books:integrity.books,counts:{...expected},unicode:integrity.unicode,integritySha256:integrity.sha256,pending:{...pending,total:integrity.pendingMorphology,groups:seen.size,unanchoredVariants:integrity.unanchoredVariants},publication:{publicRegistryEmpty:true,admittedLexicalIdentifiers:0,approvedSemanticEquivalences:0},scope:{languages:['hbo','arc'],greekCorpusAdmitted:false,fullCanon:false},next:{p83FullAcceptanceBlocked:true,requiresGreekAdmission:true,requiresOwnerApproval:true}};
 return {...report,checkpointSha256:digest(report)};
}
