import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildApp} from './app.js';
test('health is liveness only and protected functionality is absent',async()=>{
 const app=buildApp();try{
 const response=await app.inject({method:'GET',url:'/health'});assert.equal(response.statusCode,200);assert.deepEqual(response.json(),{status:'ok',databaseReady:false});
 assert.equal((await app.inject({method:'POST',url:'/v1/decks/validate',payload:{}})).statusCode,404);
 }finally{await app.close();}
});
