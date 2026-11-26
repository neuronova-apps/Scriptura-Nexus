import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOshbXml,importOshb,oshbFileIds,summarizeOshb} from '../scripts/lib/oshb-importer.mjs';
const manifest=JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8'));
const wrap=(inner,book='Gen')=>Buffer.from('<?xml version="1.0" encoding="UTF-8"?><osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"><osisText osisIDWork="OSHB"><header/><div type="book" osisID="'+book+'"><chapter osisID="'+book+'.1">'+inner+'</chapter></div></osisText></osis>');
const verse=(inner,id='Gen.1.1')=>'<verse osisID="'+id+'">'+inner+'</verse>';
const word='<w id="synthetic" lemma="b/123 a" morph="HR/Ncmsa">שָׁ/לֹם</w>';
const sample=()=>wrap(verse(word+'<seg type="x-maqqef">־</seg><w morph="ANp">א</w><note type="variant"><rdg><w lemma="999">ב</w></rdg></note>'));
test('P8.2.2: only admitted OSHB IDs, bytes and components gated',()=>{
 assert.deepEqual(oshbFileIds,['LING-011','LING-012']);
 for(const id of ['LING-001','LING-010','LING-011','LING-012','__proto__'])assert.throws(()=>importOshb(manifest,id,sample()));
});
test('P8.2.2: synthetic ordered text, Unicode, original codes and explicit absence',()=>{
 const p=parseOshbXml(sample(),'Gen'),v=p.chapters[0].verses[0];
 assert.equal(v.reference,'Gen.1.1');
 assert.deepEqual(v.events,[{kind:'word',form:'שָׁ/לֹם',providerId:'synthetic',type:null,lemmaRaw:'b/123 a',morphRaw:'HR/Ncmsa'},{kind:'segment',form:'־',type:'x-maqqef'},{kind:'word',form:'א',providerId:null,type:null,lemmaRaw:null,morphRaw:'ANp'}]);
 assert.deepEqual(p.pendingStructures,{'versiculo:note':1});
});
test('P8.2.2: notes and unknown structures excluded without fabricated readings',()=>{
 const p=parseOshbXml(wrap(verse(word+'<note><rdg><w>RESTRICTED</w></rdg></note><milestone type="x"/><w><hi>UNKNOWN</hi></w>')),'Gen');
 assert.equal(p.chapters[0].verses[0].events.length,1);
 assert.equal(p.pendingStructures['versiculo:note'],1);
 assert.equal(p.pendingStructures['versiculo:milestone'],1);
 assert.equal(p.pendingStructures['versiculo:w'],1);
 assert.doesNotMatch(JSON.stringify(p),/RESTRICTED|UNKNOWN/);
});
test('P8.2.2: DTD, entities and malformed XML rejected',()=>{
 for(const xml of ['<!DOCTYPE osis [<!ENTITY x SYSTEM "file:///etc/passwd">]><osis>&x;</osis>','<!DOCTYPE osis [<!ENTITY x "x">]><osis/>','<osis>','<osis xmlns="wrong"/>'])assert.throws(()=>parseOshbXml(Buffer.from(xml),'Gen'));
});
test('P8.2.2: invalid UTF-8 and replacement characters rejected',()=>{
 assert.throws(()=>parseOshbXml(Buffer.from([0xff,0xfe,0x00]),'Gen'));
 assert.throws(()=>parseOshbXml(wrap(verse('<w>\ufffd</w>')),'Gen'));
});
test('P8.2.2: wrong book, references and duplicated verses rejected',()=>{
 assert.throws(()=>parseOshbXml(sample(),'Dan'));
 assert.throws(()=>parseOshbXml(wrap(verse(word,'Gen.2.1')),'Gen'));
 assert.throws(()=>parseOshbXml(wrap(verse(word)+verse(word)),'Gen'));
});
test('P8.2.2: deterministic projection and separate counts',()=>{
 const a=parseOshbXml(sample(),'Gen'),b=parseOshbXml(sample(),'Gen');
 assert.deepEqual(a,b);
 const report=summarizeOshb(a);
 assert.equal(report.words,2);assert.equal(report.segments,1);assert.equal(report.verses,1);
 assert.equal(report.missingLemma,1);assert.equal(report.missingMorph,0);
 assert.equal(report.projectionSha256,summarizeOshb(b).projectionSha256);
});
test('P8.2.2: public registry remains empty',()=>{
 const data=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));
 for(const [key,value] of Object.entries(data))if(key!=='schemaVersion')assert.deepEqual(value,[]);
});
