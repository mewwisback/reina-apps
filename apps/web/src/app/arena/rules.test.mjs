import assert from 'node:assert/strict';
import test from 'node:test';
import {spellDamage,tributeIndices,resultWinner} from './rules.mjs';

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
