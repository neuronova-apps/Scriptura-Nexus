import assert from 'node:assert/strict';
import {snapshot} from './lib/reader-artifact-scope.mjs';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {loadPrivateLexicalModel,buildLexicalConcordanceFragments} from './lib/build-lexical-concordance-p114441.mjs';
let stage='baseline';
try{
 const before=snapshot('dist');
 stage='verified sources';const data=await loadExpandedAnalyzerData(),lexical=loadPrivateLexicalModel();
 stage='fragment reconstruction';const candidate=await buildLexicalConcordanceFragments(data,lexical);
 stage='public barrier';assert.deepEqual(snapshot('dist'),before);
 console.log(JSON.stringify({...candidate.summary,baselineIntact:true,upload:false}));
}catch(e){console.error('Private lexical transport rejected at '+stage+' ('+(e instanceof Error?e.name:'UnknownError')+'); corpus omitted');process.exitCode=1;}
