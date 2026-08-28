import assert from 'node:assert/strict';
import test from 'node:test';
import {attackOutcome,battleOutcome,damageOutcome,drawOutcome,resultWinner,spellDamage,trapOutcome,tributeIndices,tributeUpgrade} from './rules.mjs';

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

test('bot refuses tribute summons that downgrade its field',()=>{
 const field=[{atk:2200,def:1200},{atk:1750,def:1100}];
 assert.equal(tributeUpgrade({atk:1350,def:1400},field,1),false);
 assert.equal(tributeUpgrade({atk:2300,def:1000},field,1),true);
 assert.equal(tributeUpgrade({atk:2200,def:1200},field,1),false);
});

test('LP and deck-out winner priority',()=>{
 assert.equal(resultWinner(0,4000,null),'SILENTINDEX');
 assert.equal(resultWinner(4000,0,null),'REINA');
 assert.equal(resultWinner(4000,4000,'REINA'),'REINA');
});

test('turn draw moves the top card into hand or reports deck-out',()=>{
 const card={id:'top'};
 assert.deepEqual(drawOutcome([card,{id:'next'}],[]),{deck:[{id:'next'}],hand:[card],deckOut:false});
 assert.deepEqual(drawOutcome([], [card]),{deck:[],hand:[card],deckOut:true});
});

test('all damage sources clamp LP and report lethal results',()=>{
 for(const source of ['player hand spell','player support spell','player direct attack','player combat damage','bot combat damage','trap reflection','bot spell','bot direct attack']){
  assert.deepEqual(damageOutcome(200,300),{lp:0,lethal:true},source);
  assert.deepEqual(damageOutcome(4000,300),{lp:3700,lethal:false},source);
 }
});

test('battle compares attack against current stance',()=>{
 assert.deepEqual(battleOutcome(1750,{atk:1100,def:900,defense:false}),{attackerDestroyed:false,targetDestroyed:true,damage:0});
 assert.deepEqual(battleOutcome(1100,{atk:900,def:1700,defense:true}),{attackerDestroyed:false,targetDestroyed:false,damage:600});
 assert.deepEqual(battleOutcome(2200,null),{attackerDestroyed:false,targetDestroyed:false,damage:2200});
});

test('equal ATK battle destroys both attacking heroes',()=>{
 assert.deepEqual(battleOutcome(1750,{atk:1750,def:1100,defense:false}),{attackerDestroyed:true,targetDestroyed:true,damage:0});
});

test('equal ATK versus DEF destroys neither hero and deals no damage',()=>{
 assert.deepEqual(battleOutcome(1700,{atk:900,def:1700,defense:true}),{attackerDestroyed:false,targetDestroyed:false,damage:0});
});

test('traps have distinct effects and require an earlier turn',()=>{
 assert.deepEqual(trapOutcome('COUNTER SEAL',2200,3,2),{armed:true,reflected:0});
 assert.deepEqual(trapOutcome('MIRROR WARD',2200,3,2),{armed:true,reflected:2200});
 assert.deepEqual(trapOutcome('MIRROR WARD',2200,3,3),{armed:false,reflected:0});
});

test('armed trap resolves before direct attack damage',()=>{
 assert.deepEqual(attackOutcome(2200,null,{name:'COUNTER SEAL',setAt:2},3),{negated:true,reflected:0,attackerDestroyed:false,targetDestroyed:false,damage:0});
 assert.deepEqual(attackOutcome(2200,null,{name:'MIRROR WARD',setAt:2},3),{negated:true,reflected:2200,attackerDestroyed:false,targetDestroyed:false,damage:0});
 assert.deepEqual(attackOutcome(2200,null,null,3),{negated:false,reflected:0,attackerDestroyed:false,targetDestroyed:false,damage:2200});
});
