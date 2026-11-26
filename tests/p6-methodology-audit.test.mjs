import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,approve,ctx} from './fixtures/p6-template.mjs';
import {validateSnapshot} from '../src/lib/publication.ts';
import {conclusionOutcomes,comparisonScopes} from '../src/lib/editorial-contracts.ts';
const marker='PRUEBA SINTÉTICA P6.5.5.1';
test('cuatro resultados posibles sin preferencia confesional',()=>{
 for(const outcome of conclusionOutcomes){const s=fixture();const c=s.record.conclusions[0];c.outcome=outcome;c.grade=outcome==='indeterminada'?'indeterminado':outcome==='interpretativa'?'plausible':'solidamente_fundamentado';assert.deepEqual(validateSnapshot(approve(s),ctx),[]);}
});
test('rechaza resultados categóricos sin respaldo y abiertos sin reservas',()=>{
 for(const outcome of ['afirmativa','refutatoria']){const s=fixture();s.record.conclusions[0].outcome=outcome;assert.ok(validateSnapshot(approve(s),ctx).length);}
 for(const outcome of ['interpretativa','indeterminada']){const s=fixture();const c=s.record.conclusions[0];c.outcome=outcome;c.grade=outcome==='indeterminada'?'indeterminado':'plausible';c.reservations=[];assert.ok(validateSnapshot(approve(s),ctx).length);}
});
test('alcances canónicos admitidos con justificación explícita',()=>{
 for(const comparisonScope of comparisonScopes){const s=fixture();Object.assign(s.relations.arguments[0],{comparisonScope,comparisonJustification:marker});assert.deepEqual(validateSnapshot(approve(s),ctx),[]);}
 for(const change of [{comparisonScope:'canon_verdadero'},{comparisonJustification:''},{comparisonScope:null}]){const s=fixture();Object.assign(s.relations.arguments[0],change);assert.ok(validateSnapshot(approve(s),ctx).length);}
});
test('imparcialidad y contexto canónico son controles críticos',()=>{
 for(const id of ['imparcialidad','contexto_canonico']){const s=fixture();s.record.reviews[0].controls=s.record.reviews[0].controls.filter(c=>c.id!==id);assert.ok(validateSnapshot(approve(s),ctx).length);}
});
