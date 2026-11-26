import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadVerifiedAnalyzerData} from './lib/term-analyzer-validation-data.mjs';
import {createTermAnalyzer} from '../src/lib/term-analyzer.ts';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const baseline={hbo:{documentado:22678,parcial:252},arc:{documentado:3520,parcial:74,sin_interpretar:7},grc:{documentado:213,sin_interpretar:3,ausente:3}};
let stage='admissions';
try{
 const h=read('docs/P8/candidatos-linguisticos.json'),g=read('docs/P8/admision-griega.json'),l=read('docs/P8/admision-lexica-p84.json');
 const admitted=[...h.files,...g.files,...l.decisions].filter(f=>f.review==='aprobado');
 assert.deepEqual(admitted.map(f=>f.id).sort(),Array.from({length:9},(_,i)=>'LING-'+String(i+10).padStart(3,'0')));
 assert.ok(g.publication===false&&l.publication===false);
 assert.deepEqual(l.decisions.filter(f=>f.review==='aplazado').map(f=>f.candidateId).sort(),['LEX-C01','LEX-C02','LEX-C07']);
 assert.ok(l.decisions.filter(f=>f.review==='aplazado').every(f=>f.allowedComponents.length===0));
 stage='coverage';
 const data=await loadVerifiedAnalyzerData(),r=data.registry,engine=createTermAnalyzer(r,data.admissions,data.supplements);
 const units=new Map(r.units.map(u=>[u.id,u]));
 const byBook={},states={},sources=new Set(),hash=createHash('sha256');let annotated=0,partial=0,unresolved=0,absent=0;
 for(const u of r.units){const b=byBook[u.bookId]??={units:0,tokens:0,languages:{},withLemma:0,withoutLemma:0};b.units++;}
 for(const t of r.tokens){
  const a=engine.analyze(t.id);assert.equal(a.status,'disponible');assert.equal(a.token.form,t.form);assert.equal(a.token.direction,t.language==='grc'?'ltr':'rtl');assert.equal(a.identifiers.length,0);assert.equal(a.meaning.state,'no_disponible');
  const b=byBook[units.get(t.unitId).bookId];b.tokens++;b.languages[t.language]=(b.languages[t.language]??0)+1;
  const hasLemma=a.lexical.direct.length>0||a.lexical.components.some(c=>c.lemmaId!==null);
  if(hasLemma){annotated++;b.withLemma++;}else b.withoutLemma++;
  const s=states[t.language]??={};s[a.morphology.state]=(s[a.morphology.state]??0)+1;
  partial+=Number(a.morphology.state==='parcial');unresolved+=Number(a.morphology.state==='sin_interpretar');absent+=Number(a.morphology.state==='ausente');
  sources.add(t.origin.fileId);
  for(const x of a.morphology.analyses)sources.add(x.origin.fileId);
  if(a.lexical.origin)sources.add(a.lexical.origin.fileId);
  for(const x of a.lexical.direct)sources.add(x.lemma.origin.fileId);
  hash.update(JSON.stringify([t.id,a.morphology.state,hasLemma]),'utf8');
 }
 stage='reconciliation';
 assert.deepEqual(states,baseline);
 assert.equal(annotated,26156);assert.equal(r.tokens.length-annotated,594);
 assert.deepEqual([partial,unresolved,absent],[326,10,3]);
 assert.deepEqual(Object.fromEntries(Object.entries(byBook).map(([k,v])=>[k,[v.units,v.tokens]])),{'LIB-Gen':[1533,20612],'LIB-Dan':[357,5919],'LIB-3John':[15,219]});
 assert.deepEqual([...sources].sort(),['LING-011','LING-012','LING-013','LING-014']);
 assert.equal(r.identifiers.length,0);assert.equal(r.morphCodes.length,0);
 console.log(JSON.stringify({mode:'P8.5.1-coverage-only',editions:r.editions.length,units:r.units.length,tokens:r.tokens.length,byBook,states,withLemma:annotated,withoutLemma:r.tokens.length-annotated,morphologyPending:{partial,unresolved,absent,total:partial+unresolved+absent},admittedFiles:admitted.length,usedCorpusFiles:[...sources].sort(),admittedNotIncorporated:['LING-010'],lexicalFiles:['LING-015','LING-016','LING-017','LING-018'],identifiers:0,morphCodes:0,fullCanon:false,published:0,sha256:hash.digest('hex')},null,2));
}catch{throw new Error('P8.5.1 coverage failed at '+stage+'; corpus omitted');}
