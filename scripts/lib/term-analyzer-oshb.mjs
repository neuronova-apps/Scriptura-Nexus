import assert from 'node:assert/strict';
// Only already verified OSHB outputs may enter this adapter. Alternative readings are not primary tokens.
export function oshbSupplements(lexical,morphology){
 const links=new Map(lexical.links.filter(x=>x.layer==='primary').map(x=>[x.occurrenceId,x]));
 const morph=new Map(morphology.links.filter(x=>x.layer==='primary').map(x=>[x.occurrenceId,x]));
 return morphology.registry.tokens.map(t=>{
  const l=links.get(t.id),m=morph.get(t.id);
  assert.ok(l&&m&&l.unitId===t.unitId&&m.unitId===t.unitId&&l.language===t.language&&m.language===t.language);
  return {tokenId:t.id,lexical:{raw:l.raw,origin:l.origin,components:l.components.map(c=>({position:c.position,code:c.code,lemmaId:c.lemmaId}))},morphology:{state:m.state,analysisId:m.analysisId}};
 });
}
