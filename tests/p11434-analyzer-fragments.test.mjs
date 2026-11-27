import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAnalyzerPlan} from '../scripts/validate-analyzer-plan-p11434.mjs';
import {createFragmentAnalyzer,assembleChapter,encodeAnnotationLayer,decodeAnnotationLayer,decodeAnalyzerAsset} from '../scripts/lib/analyzer-fragments-p11434.mjs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const f={id:'LING-fixture',commit:'a'.repeat(40),sha256:'b'.repeat(64),allowedComponents:['texto_griego']},o={fileId:f.id,commit:f.commit,sha256:f.sha256,component:'texto_griego',locator:'fixture'};
const spec=path=>({path,jsonBytes:1,gzipBytes:1,sha256:'c'.repeat(64),gzipSha256:'d'.repeat(64)});
const edition={id:'TXT-fixture',name:'Fixture',languages:['grc'],version:'test',versificationRef:'test',canonRef:null,coverageBookIds:['LIB-fixture'],fileIds:[f.id]};
const i={schemaVersion:1,editionId:edition.id,bookId:'LIB-fixture',chapter:'1'},q={editionId:i.editionId,bookId:i.bookId,chapter:i.chapter,verse:'1'};
const d={editionId:i.editionId,bookId:i.bookId,chapter:i.chapter,units:1,occurrences:1,text:spec('chapters/TXT-fixture/LIB-fixture/1/text.json.gz'),annotations:spec('chapters/TXT-fixture/LIB-fixture/1/annotations.json.gz')};
const catalog=()=>({schemaVersion:1,mode:'isolated_validation',publicationAuthorized:false,editions:[edition],admissions:[f],chapters:[structuredClone(d)]});
const text={...i,units:[{id:'UNIT-fixture',...q,order:0,text:'α',origin:o}],tokens:[{id:'TOK-fixture',unitId:'UNIT-fixture',position:0,form:'α',language:'grc',direction:'ltr',origin:o,analysisIds:[]}],typography:[]};
const ann={...i,lemmas:[],analyses:[],links:[],supplements:[]};
test('validated private plan retains gates',()=>{const r=validateAnalyzerPlan();assert.equal(r.scope.occurrences,78218);assert.equal(r.publicationAuthorized,false);});
test('lazy chapter pair, one cached engine, native absence',async()=>{let calls=0;const a=createFragmentAnalyzer(catalog(),async s=>{calls++;return structuredClone(s.path.endsWith('/text.json.gz')?text:ann);});assert.equal(calls,0);assert.equal(a.initial.coverage().length,1);assert.equal((await a.prepare(q)).select(q).status,'disponible');assert.equal(calls,2);await a.prepare(q);assert.equal(calls,2);assert.equal((await a.prepare({...q,chapter:'2'})).select({...q,chapter:'2'}).status,'unidad_no_disponible');assert.equal(calls,2);});
test('reject substituted layer, extra analysis links and release flags',()=>{assert.throws(()=>assembleChapter(catalog(),d,text,{...ann,chapter:'2'}));assert.throws(()=>assembleChapter(catalog(),d,text,{...ann,links:[{tokenId:'TOK-other',analysisIds:['MOR-other']}]}));const c=catalog();c.publicationAuthorized=true;assert.throws(()=>createFragmentAnalyzer(c,async()=>{}));});
test('failed layer does not cache or reveal a result',async()=>{let fail=true,calls=0;const a=createFragmentAnalyzer(catalog(),async s=>{calls++;if(fail&&s.path.endsWith('/annotations.json.gz'))throw Error('integrity');return structuredClone(s.path.endsWith('/text.json.gz')?text:ann);});await assert.rejects(a.prepare(q));fail=false;assert.equal((await a.prepare(q)).select(q).status,'disponible');assert.equal(calls,4);});

test('lossless annotation string table, numeric strings and non-ASCII values',()=>{
 const input={...ann,values:['0',0,null,true,'α','α','אּ'],nested:{a:['0','01'],b:false}};
 const packed=encodeAnnotationLayer(input);assert.deepEqual(decodeAnnotationLayer(packed),input);
 assert.deepEqual(decodeAnalyzerAsset('chapters/TXT-fixture/LIB-fixture/1/annotations.json.gz',packed),input);
 for(const bad of [{...packed,strings:[...packed.strings,packed.strings[0]]},{...packed,strings:[...packed.strings,'unused']},{...packed,value:'999999'},{...packed,value:'01'},{...packed,encoding:'other'}])assert.throws(()=>decodeAnnotationLayer(bad));
 assert.throws(()=>decodeAnalyzerAsset('chapters/TXT-fixture/LIB-fixture/1/annotations.json.gz',input));
});
test('large synthetic Hebrew annotation chapter fits unchanged 256000-byte budget',()=>{
 const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
 const lemmas=Array.from({length:450},(_,i)=>({id:'LEM-'+hash(['l',i]),language:'hbo',form:null,homograph:null,providerKey:String(i),system:'OSHB-lemma',origin:{...o,component:'anotaciones_lema',locator:'fixture/lemma/'+i}}));
 const analyses=[],links=[],supplements=[];
 for(let i=0;i<996;i++){
  const tokenId='TOK-'+hash(['t',i]),mid='MOR-'+hash(['m',i]),loc='fixture/verse/'+Math.floor(i/15)+'/word/'+i%15;
  analyses.push({id:mid,tokenId,lemmaId:null,system:'OSHB',version:'2.2',code:'HNcmsa',features:{'c0.categoria':'sustantivo','c0.genero':'masculino'},state:'documentado',origin:{...o,component:'anotaciones_morfologia',locator:loc+'/morph'}});
  links.push({tokenId,analysisIds:[mid]});
  supplements.push({tokenId,lexical:{raw:String(i%450),origin:{...o,component:'anotaciones_lema',locator:loc+'/lemma'},components:[{position:0,code:String(i%450),lemmaId:lemmas[i%450].id}]},morphology:{state:'documented',analysisId:mid}});
 }
 const full={...i,lemmas,analyses,links,supplements},encoded=encodeAnnotationLayer(full);
 const originalBytes=gzipSync(JSON.stringify(full),{level:6}).length,compactBytes=gzipSync(JSON.stringify(encoded),{level:6}).length;
 assert.ok(originalBytes>256000);assert.ok(compactBytes<=256000);assert.deepEqual(decodeAnnotationLayer(encoded),full);
});
