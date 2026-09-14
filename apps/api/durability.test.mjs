import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Worker} from 'node:worker_threads';
import {openStore} from './store.mjs';
const moduleUrl=new URL('./store.mjs',import.meta.url).href;
import {spawnSync} from 'node:child_process';
test('process exit during transaction rolls back inventory and operation marker',()=>{
 const dir=mkdtempSync(join(tmpdir(),'reina-crash-'));const path=join(dir,'state.sqlite');
 try{
  let store=openStore(path);store.db.exec("INSERT INTO accounts VALUES ('alice'); INSERT INTO catalog VALUES ('a','main'); INSERT INTO inventory VALUES ('alice','a',2);");store.db.close();
  const child=spawnSync(process.execPath,['--input-type=module','-e',`import {openStore} from ${JSON.stringify(moduleUrl)};const s=openStore(process.argv[1]);s.db.exec("BEGIN IMMEDIATE; UPDATE inventory SET count=0; INSERT INTO inventory_operations VALUES ('alice','interrupted','[]');");process.exit(19);`,path],{timeout:10000});
  assert.equal(child.status,19);
  store=openStore(path);
  try{assert.equal(store.snapshot('alice').inventory[0].count,2);assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM inventory_operations').get().n,0);assert.equal(store.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');}finally{store.db.close();}
 }finally{rmSync(dir,{recursive:true,force:true});}
});
function run(path,operationId,delta){
 return new Promise((resolve,reject)=>{
  const worker=new Worker(`const {parentPort,workerData}=require('node:worker_threads');(async()=>{const {openStore}=await import(workerData.moduleUrl);const s=openStore(workerData.path);try{parentPort.postMessage(s.applyInventory('alice',workerData.operationId,[{cardId:'a',delta:workerData.delta}]));}catch(e){parentPort.postMessage({error:e.message});}finally{s.db.close();}})();`,{eval:true,workerData:{path,operationId,delta,moduleUrl}});
  let result;worker.on('message',value=>result=value);worker.on('error',reject);worker.on('exit',code=>code?reject(new Error(`Worker exited ${code}`)):resolve(result));
 });
}
test('file persistence, concurrent replay and competing debits preserve inventory',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'reina-store-'));const path=join(dir,'state.sqlite');let store;
 try{
  store=openStore(path);store.db.exec("INSERT INTO accounts VALUES ('alice'); INSERT INTO catalog VALUES ('a','main');");
  store.applyInventory('alice','initial',[{cardId:'a',delta:1}]);store.db.close();store=null;
  const replay=await Promise.all(Array.from({length:8},()=>run(path,'same-grant',1)));
  assert.equal(replay.filter(x=>x.replayed===false).length,1);assert.equal(replay.filter(x=>x.replayed===true).length,7);
  const debit=await Promise.all(Array.from({length:8},(_,i)=>run(path,`debit-${i}`,-1)));
  assert.equal(debit.filter(x=>x.replayed===false).length,2);assert.equal(debit.filter(x=>x.error).length,6);
  store=openStore(path);assert.equal(store.snapshot('alice').inventory[0].count,0);
  assert.equal(store.applyInventory('alice','same-grant',[{cardId:'a',delta:1}]).replayed,true);
  assert.equal(store.snapshot('alice').inventory[0].count,0);
 }finally{store?.db.close();rmSync(dir,{recursive:true,force:true});}
});
