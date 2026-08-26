import assert from 'node:assert/strict';
import test from 'node:test';
import {attackOutcome,battleOutcome,resultWinner,spellDamage,trapOutcome,tributeIndices} from './rules.mjs';

test('spell damage is deterministic',()=>{
 assert.equal(spellDamage('QUEEN’S EDGE'),500);
 assert.equal(spellDamage('CRIMSON SURGE'),300);
 assert.equal(spellDamage('LAST PULSE'),300);
});

test('bot tributes weakest current battle value, not slot order',()=>{
 const field=[{atk:2200,def:1200},{atk:900,def:1700,defense:true},{atk:1100,def:900,defense:true}];
 assert.deepEqual(tributeIndices(field,1),[2]);
 assert.deepEqual(tributeIndices(field,2),[2,1]);
});

test('LP and deck-out winner priority',()=>{
 assert.equal(resultWinner(0,4000,null),'SILENTINDEX');
 assert.equal(resultWinner(4000,0,null),'REINA');
 assert.equal(resultWinner(4000,4000,'REINA'),'REINA');
});

test('battle compares attack against current stance',()=>{
 assert.deepEqual(battleOutcome(1750,{atk:1100,def:900,defense:false}),{destroyed:true,damage:0});
 assert.deepEqual(battleOutcome(1100,{atk:900,def:1700,defense:true}),{destroyed:false,damage:600});
 assert.deepEqual(battleOutcome(2200,null),{destroyed:false,damage:2200});
});

test('traps have distinct effects and require an earlier turn',()=>{
 assert.deepEqual(trapOutcome('COUNTER SEAL',2200,3,2),{armed:true,reflected:0});
 assert.deepEqual(trapOutcome('MIRROR WARD',2200,3,2),{armed:true,reflected:2200});
 assert.deepEqual(trapOutcome('MIRROR WARD',2200,3,3),{armed:false,reflected:0});
});

test('armed trap resolves before direct attack damage',()=>{
 assert.deepEqual(attackOutcome(2200,null,{name:'COUNTER SEAL',setAt:2},3),{negated:true,reflected:0,destroyed:false,damage:0});
 assert.deepEqual(attackOutcome(2200,null,{name:'MIRROR WARD',setAt:2},3),{negated:true,reflected:2200,destroyed:false,damage:0});
 assert.deepEqual(attackOutcome(2200,null,null,3),{negated:false,reflected:0,destroyed:false,damage:2200});
});
