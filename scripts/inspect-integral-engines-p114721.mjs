import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createCandidate} from './prepare-reader-candidate-p11425.mjs';
import {createIsolatedFragmentReader} from '../src/lib/reader-fragment-view.ts';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
import {createConcordance} from '../src/lib/concordance.ts';
import {createLexicalQuery} from '../src/lib/lexical-query.ts';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {loadPrivateLexicalModel} from './lib/build-lexical-concordance-p114441.mjs';
import {createPrivateComparator} from './lib/private-comparator-p11452.mjs';
import {createPrivateManuscriptCandidate} from './lib/private-manuscript-projection-p11462.mjs';
import {snapshot} from './lib/reader-artifact-scope.mjs';

const readerAssets='/Scriptura-Nexus/biblia/lector/reader-data/';
const shaEqual=(a,b)=>a.size===b.size&&[...a].every(([k,v])=>b.get(k)===v);
const normalize=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('es');
const wordExcerpt=(s,n=20)=>String(s??'').trim().split(/\s+/).slice(0,n).join(' ');
function findBook(view,editionId,needle){
 const found=view.books(editionId).find(b=>normalize(b.name).includes(normalize(needle)));
 assert.ok(found,'Book not found: '+editionId+'/'+needle);
 return found.id;
}
function compactRead(result){
 assert.ok(result&&['available','empty_marker'].includes(result.status),'Reader query unavailable: '+result?.status);
 return {status:result.status,edition:result.edition.name,version:result.edition.version,language:result.edition.language,book:result.bookName,chapter:result.unit.chapter,verse:result.unit.verse,text:result.unit.text,sourceLocator:result.unit.sourceLocator,resourceId:result.unit.resourceId};
}
let stage='initialization';
try{
 process.env.PYTHONDONTWRITEBYTECODE='1';
 const before=snapshot('dist');

 stage='reader source projection';
 const readerCandidate=await createCandidate();
 assert.equal(readerCandidate.summary.publicationAuthorized,false);
 assert.equal(readerCandidate.summary.corpusPersisted,false);
 const packedCatalog=readerCandidate.overlay.get(readerAssets+'catalog.json.gz');
 assert.ok(packedCatalog,'Reader catalog missing');
 const catalog=JSON.parse(gunzipSync(packedCatalog.body).toString('utf8'));
 const loadChapter=async d=>{
  const path=readerAssets+'chapters/'+[d.editionId,d.bookId,d.chapter].map(encodeURIComponent).join('/')+'.json.gz';
  const item=readerCandidate.overlay.get(path);
  assert.ok(item,'Reader chapter missing: '+path);
  return gunzipSync(item.body);
 };
 const reader=createIsolatedFragmentReader(catalog,loadChapter);
 const genesis=await reader.locate({editionId:'TXT-RV1909',bookId:findBook(reader,'TXT-RV1909','Génesis'),chapter:'1',verse:'1'});
 const sblJohn=await reader.locate({editionId:'TXT-SBLGNT-V1-2',bookId:findBook(reader,'TXT-SBLGNT-V1-2','Juan'),chapter:'1',verse:'1'});
 const rvJohn=await reader.locate({editionId:'TXT-RV1909',bookId:findBook(reader,'TXT-RV1909','Juan'),chapter:'1',verse:'1'});
 assert.equal(genesis.status,'available');
 assert.equal(sblJohn.status,'available');
 assert.equal(rvJohn.status,'available');

 stage='analyzer source projection';
 const data=await loadExpandedAnalyzerData();
 const analyzer=createTermAnalyzer(data.registry,data.admissions,data.supplements);
 const hebrewCoverage=analyzer.coverage().find(e=>e.languages.includes('hbo')&&e.bookIds.includes('LIB-Lev'));
 assert.ok(hebrewCoverage,'Hebrew Leviticus coverage missing');
 const lev=analyzer.select({editionId:hebrewCoverage.editionId,bookId:'LIB-Lev',chapter:'19',verse:'28'});
 assert.equal(lev.status,'disponible');
 assert.equal(lev.occurrences.length,12);
 const analyzedWords=lev.occurrences.map(t=>{
  const a=analyzer.analyze(t.id);
  assert.equal(a.status,'disponible');
  return {
   position:t.position,
   form:t.form,
   lexicalCode:a.lexical.raw,
   lexicalComponents:a.lexical.components.map(c=>({position:c.position,code:c.code,lemma:c.lemma?{system:c.lemma.system,providerKey:c.lemma.providerKey,language:c.lemma.language}:null})),
   morphologyState:a.morphology.state,
   morphology:a.morphology.analyses.map(m=>({system:m.system,version:m.version,code:m.code,state:m.state,features:m.features}))
  };
 });

 stage='lexicon query';
 const lexicalData=loadPrivateLexicalModel();
 const lexical=createLexicalQuery(lexicalData.model,lexicalData.admissions);
 const firstStrong=lexicalData.model.entries.find(e=>e.system==='strong');
 assert.ok(firstStrong,'No admitted Strong entry found');
 const strongSearch=lexical.search({mode:'identifier',system:'strong',value:firstStrong.providerKey,limit:5});
 assert.equal(strongSearch.status,'disponible');
 assert.equal(strongSearch.total,1);
 const strongDetail=lexical.detail(firstStrong.id);
 assert.ok(strongDetail,'Strong detail missing');

 stage='concordance query';
 const concordance=createConcordance(data.registry,data.admissions,data.supplements);
 const concordanceCoverage=concordance.coverage().find(e=>e.languages.includes('hbo')&&e.bookIds.includes('LIB-Lev'));
 assert.ok(concordanceCoverage,'Hebrew concordance coverage missing');
 const frequencies=concordance.frequency({editionId:concordanceCoverage.editionId,language:'hbo',bookId:'LIB-Lev',mode:'form',limit:5});
 assert.equal(frequencies.status,'disponible');
 assert.ok(frequencies.entries.length>0,'No Hebrew frequency keys returned');
 const firstFrequency=frequencies.entries[0];
 const hits=concordance.search({editionId:concordanceCoverage.editionId,language:'hbo',bookId:'LIB-Lev',mode:'form',value:firstFrequency.key,limit:5});
 assert.equal(hits.status,'disponible');
 assert.equal(hits.total,firstFrequency.count);

 stage='comparator query';
 const alignmentRegistry=JSON.parse(readFileSync('docs/P9/alineaciones-p931.json','utf8'));
 const comparator=createPrivateComparator(catalog,loadChapter,alignmentRegistry);
 const sourceBook=findBook(reader,'TXT-RV1909','Juan');
 const targetBook=findBook(reader,'TXT-SBLGNT-V1-2','Juan');
 const comparison=await comparator.compare(
  {editionId:'TXT-RV1909',bookId:sourceBook,chapter:'1',verse:'1'},
  'TXT-SBLGNT-V1-2',
  {editionId:'TXT-SBLGNT-V1-2',bookId:targetBook,chapter:'1',verse:'2'}
 );
 assert.equal(comparison.status,'not_aligned');
 assert.equal(comparison.group,null);
 assert.ok(comparison.source?.unit?.text&&comparison.target?.unit?.text);

 stage='manuscript query';
 const manuscript=createPrivateManuscriptCandidate();
 const p66=manuscript.view.witnesses('P66').find(w=>w.id==='MAN-GA-P66');
 const variant=manuscript.view.variant('VAR-P943-JHN-1-18');
 assert.ok(p66&&variant);
 assert.equal(variant.readings.length,2);
 assert.equal(manuscript.projection.evidence.length,8);

 stage='integrity boundary';
 const after=snapshot('dist');
 assert.ok(shaEqual(before,after),'dist changed during private query execution');

 const result={
  phase:'P11.4.7.2.1',
  execution:'direct_node_engines_no_browser_no_authentication',
  reader:{
   sourceSummary:readerCandidate.summary,
   queries:[compactRead(genesis),compactRead(rvJohn),compactRead(sblJohn)]
  },
  analyzer:{
   coverage:{editionId:hebrewCoverage.editionId,books:hebrewCoverage.bookIds.length,languages:hebrewCoverage.languages},
   query:'Levítico 19:28',
   status:lev.status,
   occurrences:lev.occurrences.length,
   words:analyzedWords,
   admissions:data.admissions.map(a=>({id:a.id,component:a.allowedComponents,commit:a.commit,sha256:a.sha256}))
  },
  lexical:{
   systems:lexical.available(),
   entries:lexicalData.model.entries.length,
   forms:lexicalData.model.forms.length,
   definitions:lexicalData.model.definitions.length,
   query:{system:'strong',identifier:firstStrong.providerKey},
   status:strongSearch.status,
   total:strongSearch.total,
   entry:{id:strongDetail.entry.id,system:strongDetail.entry.system,providerKey:strongDetail.entry.providerKey,language:strongDetail.entry.language,origin:strongDetail.entry.origin,forms:strongDetail.forms.length,definitions:strongDetail.definitions.slice(0,1).map(d=>({language:d.language,excerpt:wordExcerpt(d.text,20),origin:d.origin})),links:strongDetail.links.length},
   admissions:lexicalData.admissions.map(a=>({id:a.id,selectors:a.selectors.length,allowedComponents:a.allowedComponents}))
  },
  concordance:{
   editionId:concordanceCoverage.editionId,
   book:'Levítico',
   language:'hbo',
   mode:'form',
   frequencyKeys:frequencies.totalKeys,
   postings:frequencies.totalPostings,
   topForms:frequencies.entries,
   firstQuery:{form:firstFrequency.key,total:hits.total,examples:hits.occurrences.map(o=>({bookId:o.bookId,chapter:o.chapter,verse:o.verse,position:o.position,form:o.form,lemmas:o.lemmas.map(l=>({system:l.system,providerKey:l.providerKey}))}))}
  },
  comparator:{
   source:{edition:'RV1909',reference:'Juan 1:1',text:comparison.source.unit.text},
   target:{edition:'SBLGNT v1.2',reference:'Juan 1:2',text:comparison.target.unit.text},
   status:comparison.status,
   literalProbe:comparison.literalProbe,
   alignmentGroup:comparison.group,
   interpretation:'Dos lecturas recuperadas independientemente; no existe correspondencia textual admitida.'
  },
  manuscripts:{
   mode:manuscript.projection.mode,
   witness:{id:p66.id,siglum:p66.name,catalogIdentifier:p66.catalogIdentifier,dating:p66.dating,institution:p66.institution,shelfmark:p66.shelfmark,evidenceIds:p66.evidenceIds},
   variant:{id:variant.id,locus:variant.locus,edition:variant.edition,assessment:variant.assessment,readings:variant.readings},
   evidence:manuscript.projection.evidence.map(e=>({id:e.id,sourceId:e.sourceId,kind:e.kind,locator:e.locator,sourceTitle:manuscript.projection.sources.find(s=>s.id===e.sourceId)?.title}))
  },
  integrity:{distUnchanged:true,publicationAuthorized:false,corpusPersisted:false,corpusUploaded:false,manuscriptFilesAdmitted:0}
 };
 console.log('P11.4.7.2.1_DIRECT_ENGINE_RESULTS='+JSON.stringify(result));
 console.log('P11.4.7.2.1_STATUS=success');
}catch(error){
 console.error('P11.4.7.2.1_FAILED_AT='+stage);
 console.error(error instanceof Error?error.stack:String(error));
 process.exitCode=1;
}