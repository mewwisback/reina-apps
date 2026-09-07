import assert from 'node:assert/strict';
import test from 'node:test';
import {cancellableDelay} from './async-control.mjs';
import {attackOutcome,battleOutcome,damageOutcome,drawOutcome,resultWinner,spellDamage,terminalWinner,trapOutcome,tributeIndices,tributeUpgrade} from './rules.mjs';

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
 assert.equal(resultWinner(1,1,null),null);
 assert.equal(resultWinner(4000,4000,null),null);
});

test('winner request is rejected while both LP and decks remain live',()=>{
 assert.equal(terminalWinner(4000,4000,null,'REINA'),null);
 assert.equal(terminalWinner(1,2500,null,'SILENTINDEX'),null);
 assert.equal(terminalWinner(0,2500,null,'SILENTINDEX'),'SILENTINDEX');
 assert.equal(terminalWinner(2500,0,null,'REINA'),'REINA');
 assert.equal(terminalWinner(2500,2500,'REINA','REINA'),'REINA');
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
 assert.deepEqual(battleOutcome(1750,{atk:1100,def:900,defense:false}),{attackerDestroyed:false,targetDestroyed:true,damage:650});
 assert.deepEqual(battleOutcome(1100,{atk:900,def:1700,defense:true}),{attackerDestroyed:false,targetDestroyed:false,damage:600});
 assert.deepEqual(battleOutcome(2200,null),{attackerDestroyed:false,targetDestroyed:false,damage:2200});
});

test('destroyed attack-position hero takes battle damage but defense-position hero does not',()=>{
 assert.deepEqual(battleOutcome(2200,{atk:1750,def:1100,defense:false}),{attackerDestroyed:false,targetDestroyed:true,damage:450});
 assert.deepEqual(battleOutcome(2200,{atk:1750,def:1100,defense:true}),{attackerDestroyed:false,targetDestroyed:true,damage:0});
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

test('tributes skip empty slots and retain original field indices',()=>{
 const weak=Object.freeze({atk:900,def:1700,defense:false});
 const strong=Object.freeze({atk:2200,def:1200});
 const field=Object.freeze([null,strong,null,weak,null]);
 assert.deepEqual(tributeIndices(field,2),[3,1]);
 assert.deepEqual(tributeIndices(field,0),[]);
 assert.deepEqual(tributeIndices(field,3),[3,1]);
 assert.deepEqual(tributeIndices([null,null],1),[]);
});

test('equal battle-value tributes prefer lower ATK before stable slot order',()=>{
 const field=[{atk:1700,def:900},{atk:900,def:1700,defense:true},{atk:900,def:1700,defense:true}];
 assert.deepEqual(tributeIndices(field,3),[1,2,0]);
});

test('tribute summon requires enough heroes even when candidate is stronger',()=>{
 assert.equal(tributeUpgrade({atk:3000},[null,{atk:900,def:1700},null],2),false);
 assert.equal(tributeUpgrade({atk:3000},[null,null],1),false);
});

test('tribute upgrade compares candidate against defense stance strength',()=>{
 const field=[{atk:900,def:2500,defense:true},null];
 assert.equal(tributeUpgrade({atk:2500},field,1),false);
 assert.equal(tributeUpgrade({atk:2501},field,1),true);
});

test('LP loss takes precedence over conflicting deck-out result',()=>{
 assert.equal(resultWinner(0,4000,'REINA'),'SILENTINDEX');
 assert.equal(resultWinner(4000,0,'SILENTINDEX'),'REINA');
 assert.equal(resultWinner(-1,4000,null),'SILENTINDEX');
 assert.equal(resultWinner(4000,-1,null),'REINA');
});

test('terminal winner rejects requests contradicting actual terminal result',()=>{
 assert.equal(terminalWinner(0,4000,null,'REINA'),null);
 assert.equal(terminalWinner(4000,0,null,'SILENTINDEX'),null);
 assert.equal(terminalWinner(4000,4000,'SILENTINDEX','REINA'),null);
 assert.equal(terminalWinner(4000,4000,'SILENTINDEX','SILENTINDEX'),'SILENTINDEX');
});

test('drawing final card succeeds; only subsequent empty draw causes deck-out',()=>{
 const first=Object.freeze({id:'held'}),last=Object.freeze({id:'last'});
 const deck=Object.freeze([last]),hand=Object.freeze([first]);
 const drawn=drawOutcome(deck,hand);
 assert.deepEqual(drawn,{deck:[],hand:[first,last],deckOut:false});
 assert.deepEqual(drawOutcome(drawn.deck,drawn.hand),{deck:[],hand:[first,last],deckOut:true});
 assert.deepEqual(deck,[last]);
 assert.deepEqual(hand,[first]);
});

test('damage distinguishes exact lethal from one remaining LP',()=>{
 assert.deepEqual(damageOutcome(300,300),{lp:0,lethal:true});
 assert.deepEqual(damageOutcome(301,300),{lp:1,lethal:false});
 assert.deepEqual(damageOutcome(300,0),{lp:300,lethal:false});
 assert.deepEqual(damageOutcome(0,300),{lp:0,lethal:true});
});

test('zero-power direct attack causes no destruction or damage',()=>{
 assert.deepEqual(battleOutcome(0,null),{attackerDestroyed:false,targetDestroyed:false,damage:0});
});

test('future-turn traps cannot reflect damage',()=>{
 for(const name of ['COUNTER SEAL','MIRROR WARD']){
  assert.deepEqual(trapOutcome(name,2200,2,3),{armed:false,reflected:0});
 }
});

test('fresh trap does not negate combat or direct attack',()=>{
 const trap=Object.freeze({name:'MIRROR WARD',setAt:3});
 assert.deepEqual(attackOutcome(2200,null,trap,3),{negated:false,reflected:0,attackerDestroyed:false,targetDestroyed:false,damage:2200});
 const target=Object.freeze({atk:1750,def:1100,defense:false});
 assert.deepEqual(attackOutcome(2200,target,trap,3),{negated:false,reflected:0,attackerDestroyed:false,targetDestroyed:true,damage:450});
});

test('armed trap prevents equal-ATK destruction before combat resolves',()=>{
 const target=Object.freeze({atk:1750,def:1100,defense:false});
 assert.deepEqual(attackOutcome(1750,target,{name:'MIRROR WARD',setAt:2},3),{negated:true,reflected:1750,attackerDestroyed:false,targetDestroyed:false,damage:0});
});

test('cancellable delay completes normally and late cancellation stays settled',async()=>{
 const delay=cancellableDelay(0);
 assert.equal(await delay.promise,true);
 delay.cancel();
 assert.equal(await delay.promise,true);
});

test('repeated cancellation resolves false without affecting another delay',async()=>{
 const cancelled=cancellableDelay(1000),active=cancellableDelay(0);
 cancelled.cancel();
 cancelled.cancel();
 assert.equal(await cancelled.promise,false);
 assert.equal(await active.promise,true);
});

test('cancellable delay clears pending timer and never resumes stale sequence',async()=>{
 let resumed=false;
 const delay=cancellableDelay(25);
 delay.promise.then(active=>{if(active)resumed=true});
 delay.cancel();
 await new Promise(resolve=>setTimeout(resolve,40));
 assert.equal(resumed,false);
});
