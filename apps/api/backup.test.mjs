import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openStore,backupStore} from './store.mjs';
test('backup restores inventory and replay records without overwriting files',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'reina-backup-'));let store,restored;
 try{
  store=openStore(join(dir,'live.sqlite'));
  store.db.exec("INSERT INTO accounts VALUES ('alice'); INSERT INTO catalog VALUES ('a','main');");
  store.applyInventory('alice','grant',[{cardId:'a',delta:2}]);
  const dest=join(dir,'backup.sqlite');await backupStore(store,dest);
  const original=readFileSync(dest);
  await assert.rejects(backupStore(store,dest));assert.deepEqual(readFileSync(dest),original);
  store.applyInventory('alice','spend',[{cardId:'a',delta:-1}]);
  restored=openStore(dest);
  assert.equal(restored.snapshot('alice').inventory[0].count,2);
  assert.equal(restored.applyInventory('alice','grant',[{cardId:'a',delta:2}]).replayed,true);
  assert.equal(restored.db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
 }finally{restored?.db.close();store?.db.close();rmSync(dir,{recursive:true,force:true});}
});
