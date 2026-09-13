import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDeck,createServer} from './server.mjs';
const fixture=()=>({catalog:Array.from({length:15},(_,i)=>({id:`h${i}`,zone:'main'})),inventory:Array.from({length:15},(_,i)=>({cardId:`h${i}`,count:2})),main:Array.from({length:15},(_,i)=>[`h${i}`,`h${i}`]).flat(),extra:[]});
test('valid deck and invalid boundaries',()=>{
 const x=fixture(); assert.equal(validateDeck(x).valid,true);
 for(const bad of [null,{}, {...x,main:x.main.slice(1)}, {...x,main:[...x.main,'h0']}, {...x,main:x.main.map(()=> 'h0')}, {...x,inventory:[]}, {...x,extra:['h0']}, {...x,catalog:[...x.catalog,x.catalog[0]]}]) assert.equal(validateDeck(bad).valid,false);
});
test('HTTP validation, malformed JSON, media type and payload limit',async()=>{
 const server=createServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try { const url=`http://127.0.0.1:${server.address().port}`;
 const send=(body,type='application/json')=>fetch(url+'/v1/decks/validate',{method:'POST',headers:{'content-type':type},body});
 const r=await send(JSON.stringify(fixture())); assert.equal(r.status,200); assert.equal((await r.json()).ownershipVerified,false);
 assert.equal((await send('{')).status,400);
 assert.equal((await send('{}','text/plain')).status,415);
 assert.equal((await send(' '.repeat(70000))).status,413);
 } finally {await new Promise(r=>server.close(r));}
});
