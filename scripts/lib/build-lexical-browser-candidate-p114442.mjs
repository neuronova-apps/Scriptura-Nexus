import {createPrivatePack,sha} from './private-lexical-pack-p114441.mjs';
import {bucketFor} from '../../src/lib/lexical-fragment-runtime.ts';
import {buildLexicalConcordanceFragments} from './build-lexical-concordance-p114441.mjs';
const SUMMARY_BUCKETS=16;
export async function buildPrivateLexicalBrowserCandidate(data,lexical){
 const candidate=await buildLexicalConcordanceFragments(data,lexical),pack=createPrivatePack(),groups=new Map();
 for(const entry of lexical.model.entries){const b=bucketFor(entry.id,SUMMARY_BUCKETS),a=groups.get(b)??[];a.push({id:entry.id,system:entry.system,providerKey:entry.providerKey,language:entry.language});groups.set(b,a);}
 const summaries={};
 for(const [b,entries] of [...groups].sort((a,b)=>Number(a[0])-Number(b[0]))){entries.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);const path='summaries/bucket-'+b+'.json.gz',d=pack.put(path,{bucket:b,entries});candidate.assets.set(path,pack.assets.get(path));candidate.descriptors.set(path,d);summaries[b]=d;}
 const lemmaRows=data.registry.lemmas.map(x=>({id:x.id,language:x.language})).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 const lemmaCatalog=pack.put('lemma-catalog.json.gz',{schemaVersion:1,lemmas:lemmaRows});candidate.assets.set(lemmaCatalog.path,pack.assets.get(lemmaCatalog.path));candidate.descriptors.set(lemmaCatalog.path,lemmaCatalog);
 candidate.catalog.lexicalSummaryBuckets=summaries;candidate.catalog.lemmaCatalog=lemmaCatalog;
 const catalogPack=createPrivatePack(),catalogSpec=catalogPack.put('catalog.json.gz',candidate.catalog);
 candidate.assets.set(catalogSpec.path,catalogPack.assets.get(catalogSpec.path));candidate.descriptors.set(catalogSpec.path,catalogSpec);candidate.catalogSpec=catalogSpec;
 const inventory=[...candidate.descriptors.values()].map(x=>({path:x.path,jsonBytes:x.jsonBytes,sha256:x.sha256})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 const inventorySha256=sha(Buffer.from(JSON.stringify(inventory))),sizes=[...candidate.descriptors.values()];
 candidate.rootManifest={schemaVersion:1,mode:'isolated_lexical_concordance',publicationAuthorized:false,catalog:catalogSpec};
 candidate.summary={...candidate.summary,phase:'P11.4.4.4.2',summaryBuckets:Object.keys(summaries).length,lemmaCatalogEntries:lemmaRows.length,fragmentFiles:sizes.length,catalogGzipBytes:catalogSpec.gzipBytes,maxGzipBytes:Math.max(...sizes.map(x=>x.gzipBytes)),maxJsonBytes:Math.max(...sizes.map(x=>x.jsonBytes)),totalGzipBytes:[...candidate.assets.values()].reduce((n,x)=>n+x.length,0),manifestSha256:inventorySha256,publicationAuthorized:false,corpusPersisted:false,browserCandidate:true};
 return candidate;
}
