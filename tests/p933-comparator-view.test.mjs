import test from 'node:test';
import assert from 'node:assert/strict';
import {createComparatorView,emptyComparatorRelease,comparisonStatus} from '../src/lib/comparator-view.ts';
const ref=(editionId,verse='1',bookId='LIB-test',chapter='1')=>({editionId,bookId,chapter,verse});
const A='TXT-comparator-fixture-A',B='TXT-comparator-fixture-B';
const u=(verse,text,chapter='1')=>({chapter,verse,text,sourceLocator:'test:'+chapter+':'+verse,resourceId:'comparator-fixture-only'});
const edition=(id,language,units)=>({id,name:id,language,version:'test',attribution:'Test attribution',license:'Test license',source:'Test source',books:[{id:'LIB-test',name:'Test book',units}]});
const fixture=()=>({reading:{publicationAuthorized:true,editions:[edition(A,'spa',[u('1','P933 PRIVATE FIXTURE'),u('2-3','B'),u('4','')]),edition(B,'grc',[u('1','λόγος'),u('2','β'),u('3','γ'),u('5','δ'),u('1','ε','2')])]},groups:[]});
const evidence=()=>({id:'EVD-comparator-test',sourceRef:'Test source',sourceRevision:'test',locator:'Test locator',reviewedBy:'Test reviewer',reviewedOn:'2026-01-01',verification:'verified'});
const group=(left,right,relationship)=>({id:'ALI-comparator-test',source:left.map(v=>ref(A,v)),target:right.map(v=>ref(B,v)),relationship,verification:'verified',evidence:[evidence()]});
const engine=(g)=>{const f=fixture();if(g)f.groups.push(g);return createComparatorView(f);};
test('empty release remains blocked and rejects groups without authorization',()=>{
 const e=createComparatorView(emptyComparatorRelease());assert.deepEqual(e.view.editions(),[]);assert.equal(e.compare(ref(A),B).status,'edition_unavailable');
 assert.throws(()=>createComparatorView({...emptyComparatorRelease(),groups:[group(['1'],['1'],'one_to_one')]}),/no autorizada/);
});
test('same native label never selects destination without evidence',()=>{
 const r=engine().compare(ref(A),B);assert.equal(r.status,'not_aligned');assert.equal(r.literalProbe,'available');assert.equal(r.target,null);assert.equal(r.group,null);
});
test('independent selection and provenance',()=>{
 const r=engine().compare(ref(A),B,ref(B,'2'));assert.equal(r.status,'not_aligned');assert.equal(r.source.unit.text,'P933 PRIVATE FIXTURE');assert.equal(r.target.unit.text,'β');assert.equal(r.target.edition.license,'Test license');assert.equal(r.group,null);
});
test('absence, empty marker and independent destination remain distinct',()=>{
 const e=engine();assert.equal(e.compare(ref(A,'4'),B).status,'source_empty_marker');
 assert.equal(e.compare(ref(B),A,ref(A,'4')).status,'target_empty_marker');
 for(const [r,status] of [[ref(B,'1','LIB-other'),'book_outside_coverage'],[ref(B,'1','LIB-test','9'),'chapter_not_found'],[ref(B,'99'),'reference_not_found']]){
  const x=e.compare(ref(A),B,r);assert.equal(x.status,'target_unavailable');assert.equal(x.target.status,status);
 }
 const x=e.compare(ref(A,'99'),B,ref(B,'2'));assert.equal(x.status,'source_unavailable');assert.equal(x.target.unit.text,'β');
});
test('distinct editions and no automatic fallback',()=>{
 const e=engine();assert.equal(e.compare(ref(A),A).status,'same_edition');assert.equal(e.compare(ref(A),'missing').status,'edition_unavailable');
 assert.equal(e.compare(ref(A),B,ref(A)).status,'target_unavailable');
});
test('four cardinalities, reverse groups and literal labels',()=>{
 for(const [l,r,kind,reverse] of [[['1'],['1'],'one_to_one','one_to_one'],[['2-3'],['2','3'],'one_to_many','many_to_one'],[['1','2-3'],['2'],'many_to_one','one_to_many'],[['1','2-3'],['1','2'],'many_to_many','many_to_many']]){
  const e=engine(group(l,r,kind));const x=e.compare(ref(A,l[0]),B),y=e.compare(ref(B,r[0]),A);
  assert.equal(x.status,'verified_alignment');assert.equal(x.group.relationship,kind);assert.equal(y.group.relationship,reverse);
  assert.deepEqual(x.group.source.map(u=>u.unit.verse),l);assert.deepEqual(x.group.target.map(u=>u.unit.verse),r);
  assert.equal(x.group.sameLanguage,false);assert.equal(x.group.literalTextEquality,null);
 }
});
test('explicit destination outside group is preserved',()=>{
 const e=engine(group(['2-3'],['2','3'],'one_to_many'));const x=e.compare(ref(A,'2-3'),B,ref(B,'5'));
 assert.equal(x.status,'target_outside_verified_group');assert.equal(x.target.unit.text,'δ');assert.equal(x.group,null);
 assert.equal(e.compare(ref(A,'2-3'),B,ref(B,'3')).status,'verified_alignment');
});
test('review metadata, valid endpoints, order and cardinality are required',()=>{
 for(const g of [{...group(['1'],['1'],'one_to_one'),evidence:[]},{...group(['1'],['1'],'one_to_one'),verification:'pending'},group(['4'],['1'],'one_to_one'),group(['99'],['1'],'one_to_one'),group(['2-3','1'],['1'],'many_to_one'),group(['1'],['1','2'],'one_to_one')]){
  assert.throws(()=>engine(g));
 }
 const f=fixture();f.groups=[group(['1'],['1'],'one_to_one'),{...group(['1'],['2'],'one_to_one'),id:'ALI-other'}];assert.throws(()=>createComparatorView(f),/solapado/);
});
test('same-language equality remains literal and detached',()=>{
 const f=fixture();f.reading.editions[1].language='spa';f.reading.editions[1].books[0].units[0].text='P933 PRIVATE FIXTURE';f.groups.push(group(['1'],['1'],'one_to_one'));
 const e=createComparatorView(f);const x=e.compare(ref(A),B);assert.equal(x.group.literalTextEquality,true);
 x.group.source[0].unit.text='mutated';x.group.evidence[0].locator='mutated';const y=e.compare(ref(A),B);
 assert.equal(y.group.source[0].unit.text,'P933 PRIVATE FIXTURE');assert.equal(y.group.evidence[0].locator,'Test locator');
 assert.equal(new Set(Object.values(comparisonStatus)).size,Object.keys(comparisonStatus).length);
});
