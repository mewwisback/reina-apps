import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from './store.mjs';
test('inventory changes are atomic, idempotent and reject conflicting replay',()=>{
 const store=openStore(':memory:');
 try {
  store.db.exec("INSERT INTO accounts VALUES ('alice'); INSERT INTO catalog VALUES ('a','main'),('b','main');");
  const changes=[{cardId:'a',delta:2},{cardId:'b',delta:1}];
  assert.equal(store.applyInventory('alice','grant-1',changes).replayed,false);
  assert.equal(store.applyInventory('alice','grant-1',changes).replayed,true);
  assert.equal(store.snapshot('alice').inventory.find(x=>x.cardId==='a').count,2);
  assert.throws(()=>store.applyInventory('alice','grant-1',[{cardId:'a',delta:1}]),/conflict/);
  assert.throws(()=>store.applyInventory('alice','debit-1',[{cardId:'a',delta:-1},{cardId:'b',delta:-2}]));
  assert.equal(store.snapshot('alice').inventory.find(x=>x.cardId==='a').count,2);
  assert.equal(store.applyInventory('alice','debit-1',[{cardId:'a',delta:-1}]).replayed,false);
  assert.throws(()=>store.applyInventory('alice','bad',[{cardId:'a',delta:0.5}]),/Invalid/);
 } finally {store.db.close();}
});
