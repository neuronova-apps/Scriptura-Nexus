import test from 'node:test';
import assert from 'node:assert/strict';
import {bucketFor,coordinate,decodeCoordinate,exactRow,groupKey,pageWindow} from '../src/lib/lexical-fragment-runtime.ts';
import {decodeAnnotationLayer,assembleChapter} from '../src/lib/analyzer-fragment-runtime.ts';
test('las claves exactas no se normalizan ni se confunden',()=>{
 assert.notEqual(groupKey({kind:'lexical',mode:'form',language:'hbo'}),groupKey({kind:'lexical',mode:'form',language:'arc'}));
 assert.notEqual(groupKey({kind:'concordance',editionId:'TXT-a',language:'hbo',mode:'form'}),groupKey({kind:'concordance',editionId:'TXT-a',language:'hbo',bookId:'LIB-Gen',mode:'form'}));
 assert.deepEqual(exactRow([['אָ',[1]],['א',[2]]],'א'),[2]);assert.equal(exactRow([['אָ',[1]]],'א'),null);
 assert.equal(bucketFor('λόγος'),bucketFor('λόγος'));assert.equal(bucketFor('λόγος'),bucketFor('λογος')||'different');
});
test('las coordenadas compactas respetan límites de capítulo y posición',()=>{
 const chapters=[{occurrences:3},{occurrences:7}];assert.deepEqual(decodeCoordinate(coordinate(1,6),chapters),{chapter:1,position:6});
 assert.throws(()=>decodeCoordinate(coordinate(1,7),chapters));assert.throws(()=>coordinate(0,10000));assert.throws(()=>pageWindow(4,0,101));
});
test('la tabla de cadenas restaura texto y conserva números',()=>{
 const packed={schemaVersion:1,encoding:'string-table-v1',strings:['hebreo','λόγος'],value:{label:'0',form:'1',count:2,enabled:true}};
 assert.deepEqual(decodeAnnotationLayer(packed),{label:'hebreo',form:'λόγος',count:2,enabled:true});
 const invalid={...packed,strings:['hebreo','λόγος','unused']};assert.throws(()=>decodeAnnotationLayer(invalid));
});
test('un capítulo reconstruido conserva unidades, formas y anotaciones',()=>{
 const edition={id:'TXT-a',name:'Edición',languages:['hbo'],version:'1',versificationRef:'V1',canonRef:null,coverageBookIds:['LIB-Gen'],fileIds:['LING-001']};
 const unit={id:'UNIT-1',editionId:'TXT-a',bookId:'LIB-Gen',chapter:'1',verse:'1',order:0,text:'א',origin:{fileId:'LING-001',commit:'a'.repeat(40),sha256:'b'.repeat(64),component:'texto_wlc',locator:'Gen 1:1'}};
 const token={id:'TOK-1',unitId:'UNIT-1',position:0,form:'א',language:'hbo',direction:'rtl',origin:unit.origin,analysisIds:[]};
 const d={editionId:'TXT-a',bookId:'LIB-Gen',chapter:'1',units:1,occurrences:1};
 const t={schemaVersion:1,...{editionId:'TXT-a',bookId:'LIB-Gen',chapter:'1'},units:[unit],tokens:[token],typography:[]};
 const a={schemaVersion:1,...{editionId:'TXT-a',bookId:'LIB-Gen',chapter:'1'},lemmas:[],analyses:[],links:[],supplements:[]};
 const result=assembleChapter([edition],d,t,a);assert.equal(result.registry.tokens[0].form,'א');assert.deepEqual(result.registry.tokens[0].analysisIds,[]);assert.equal(result.registry.units[0].verse,'1');
 assert.throws(()=>assembleChapter([edition],{...d,occurrences:2},t,a));
});
