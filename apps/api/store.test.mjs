import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openStore} from './store.mjs';
import {createServer} from './server.mjs';
test('trusted sessions isolate inventory and reject client ownership claims',async()=>{
 const store=openStore(':memory:');
 store.db.exec("INSERT INTO accounts VALUES ('alice'),('bob')");
 const a=store.issueSession('alice',10000), b=store.issueSession('bob',10000);
 for(let i=0;i<15;i++){
  store.db.prepare('INSERT INTO catalog VALUES (?,?)').run(`h${i}`,'main');
  store.db.prepare('INSERT INTO inventory VALUES (?,?,?)').run('alice',`h${i}`,2);
 }
 const server=createServer({store});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const body={main:Array.from({length:15},(_,i)=>[`h${i}`,`h${i}`]).flat(),extra:[]};
  const send=(token,data=body)=>fetch(`http://127.0.0.1:${server.address().port}/v1/decks/validate`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(data)});
  assert.equal((await send('unknown')).status,401);
  assert.equal((await send(b)).status,422);
  const ok=await send(a); assert.equal(ok.status,200);assert.equal((await ok.json()).ownershipVerified,true);
  assert.equal((await send(b,{...body,inventory:[{cardId:'h0',count:999}]})).status,400);
  store.revokeSession(a); assert.equal((await send(a)).status,401);
  const expired=store.issueSession('alice',1); await new Promise(r=>setTimeout(r,5)); assert.equal((await send(expired)).status,401);
  assert.throws(()=>store.db.prepare('UPDATE inventory SET count=-1').run());
 }finally{await new Promise(r=>server.close(r));store.db.close();}
});
