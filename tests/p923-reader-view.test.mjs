import test from 'node:test';
import assert from 'node:assert/strict';
import {createReaderView,emptyReaderRelease,readerStatus} from '../src/lib/reader-view.ts';
const unit=(chapter,verse,text)=>({chapter,verse,text,sourceLocator:'test:'+chapter+':'+verse,resourceId:'reader-fixture-only'});
const fixture=()=>({publicationAuthorized:true,editions:[{id:'TXT-reader-fixture',name:'Edición de prueba',version:'0',language:'spa',attribution:'Prueba',license:'Prueba',source:'Prueba',books:[{id:'LIB-test',name:'Libro de prueba',units:[unit('1','1a','Texto de prueba exclusivo P923'),unit('1','2-3','B'),unit('1','4',''),unit('3','1','C')]}]}]});
const ref=(chapter='1',verse='1a')=>({editionId:'TXT-reader-fixture',bookId:'LIB-test',chapter,verse});
test('public release empty and unauthorized data rejected',()=>{
 const v=createReaderView(emptyReaderRelease());assert.deepEqual(v.editions(),[]);assert.equal(v.locate(ref()).status,'edition_unavailable');
 assert.throws(()=>createReaderView({...fixture(),publicationAuthorized:false}),/no autorizada/);
});
test('selection preserves actual source labels and order',()=>{
 const v=createReaderView(fixture());assert.deepEqual(v.chapters(ref().editionId,ref().bookId),['1','3']);
 assert.deepEqual(v.verses(ref().editionId,ref().bookId,'1'),['1a','2-3','4']);assert.equal(v.locate(ref('1','2')).status,'reference_not_found');
});
test('exact reading, attribution and source locator',()=>{
 const a=createReaderView(fixture()).locate(ref());assert.equal(a.status,'available');assert.equal(a.unit.text,'Texto de prueba exclusivo P923');assert.equal(a.unit.sourceLocator,'test:1:1a');assert.equal(a.edition.license,'Prueba');
});
test('distinct absence states and empty marker',()=>{
 const v=createReaderView(fixture());assert.equal(v.locate({...ref(),bookId:'other'}).status,'book_outside_coverage');
 assert.equal(v.locate(ref('2','1')).status,'chapter_not_found');assert.equal(v.locate(ref('1','4')).status,'empty_marker');
 assert.equal(new Set(Object.values(readerStatus)).size,Object.keys(readerStatus).length);
});
test('neighbors preserve ranges and cross chapters only within book',()=>{
 const v=createReaderView(fixture());assert.equal(v.locate(ref()).previous,null);
 assert.deepEqual(v.locate(ref('1','4')).next,ref('3','1'));assert.deepEqual(v.locate(ref('1','4')).previous,ref('1','2-3'));assert.equal(v.locate(ref('3','1')).next,null);
});
test('rejects duplicated source label and returns detached data',()=>{
 const f=fixture(),v=createReaderView(f);f.editions[0].books[0].units[0].text='changed';
 const result=v.locate(ref());result.unit.text='changed again';assert.equal(v.locate(ref()).unit.text,'Texto de prueba exclusivo P923');
 f.editions[0].books[0].units.push({...f.editions[0].books[0].units[0]});assert.throws(()=>createReaderView(f),/duplicada/);
});
test('Greek script preserved and never interpreted as Spanish',()=>{
 const f=fixture();f.editions[0].language='grc';f.editions[0].books[0].units[0].text='λόγος';
 const a=createReaderView(f).locate(ref());assert.equal(a.edition.language,'grc');assert.equal(a.unit.text,'λόγος');
});
