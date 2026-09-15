import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import EmbeddedPostgres from 'embedded-postgres';
import {drizzle} from 'drizzle-orm/node-postgres';
import {accounts,authIdentities} from './schema.js';
import {migrate} from './migrate.js';
import {consumeItems} from './inventory.js';
test('real PostgreSQL migration and identity constraints', {timeout:60000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'reina-pg-'));
 const postgres=new EmbeddedPostgres({databaseDir:join(dir,'db'),port:15439,user:'postgres',password:randomBytes(24).toString('hex'),persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
 let started=false;const client=postgres.getPgClient();let connected=false;
 try{
  await postgres.initialise();await postgres.start();started=true;
  await client.connect();connected=true;
  const version=await client.query('SHOW server_version');assert.match(version.rows[0].server_version,/^17\./);
  const sql=await readFile(new URL('../migrations/0001_accounts.sql',import.meta.url),'utf8');
  const migrations=[{id:'0001_accounts',sql}];
  const bootstrapPeer=postgres.getPgClient();await bootstrapPeer.connect();
  try{assert.deepEqual((await Promise.all([migrate(client,migrations),migrate(bootstrapPeer,migrations)])).sort(),[0,1]);}
  finally{await bootstrapPeer.end();}
  assert.equal(await migrate(client,migrations),0);
  const other=postgres.getPgClient();await other.connect();
  try{
   const upgrade=[...migrations,{id:'0002_concurrent',sql:'CREATE TABLE concurrent_probe(id integer);'}];
   const outcomes=await Promise.all([migrate(client,upgrade),migrate(other,upgrade)]);
   assert.deepEqual(outcomes.sort(),[0,1]);
   migrations.push(upgrade[1]!);
  }finally{await other.end();}
  await assert.rejects(migrate(client,[{id:'0001_accounts',sql:sql+'\n-- changed'}]),/checksum/);
  await assert.rejects(migrate(client,[...migrations,{id:'0003_bad',sql:'CREATE TABLE rollback_probe(id integer); SELECT missing_column;'}]));
  assert.equal((await client.query("SELECT to_regclass('rollback_probe') AS name")).rows[0].name,null);
  assert.equal(await migrate(client,[...migrations,{id:'0003_good',sql:'CREATE TABLE upgrade_probe(id integer);'}]),1);
  const db=drizzle(client);
  const [account]=await db.insert(accounts).values({}).returning();
  await db.insert(authIdentities).values({accountId:account!.id,provider:'test',subject:'synthetic-user'});
  await assert.rejects(client.query('INSERT INTO auth_identities(account_id,provider,subject) VALUES ($1,$2,$3)',[account!.id,'test','synthetic-user']),{code:'23505'});
  await assert.rejects(client.query("INSERT INTO auth_identities(account_id,provider,subject) VALUES ('00000000-0000-0000-0000-000000000000','test','missing')"),{code:'23503'});
  assert.equal((await db.select().from(authIdentities)).length,1);
  const inventorySql=await readFile(new URL('../migrations/0002_inventory.sql',import.meta.url),'utf8');
  const fullHistory=[...migrations,{id:'0003_good',sql:'CREATE TABLE upgrade_probe(id integer);'},{id:'0004_inventory_test',sql:inventorySql}];
  assert.equal(await migrate(client,fullHistory),1);
  assert.equal(await migrate(client,fullHistory),0);
  const card=(await client.query("INSERT INTO card_definitions(category) VALUES ('Hero') RETURNING id")).rows[0].id;
  await client.query('INSERT INTO inventory_items(owner_account_id,card_id) VALUES ($1,$2)',[account!.id,card]);
  await assert.rejects(client.query("INSERT INTO card_definitions(category) VALUES ('Support')"),{code:'23514'});
  await assert.rejects(client.query("UPDATE inventory_items SET state='invalid'"),{code:'23514'});
  await client.query("INSERT INTO operations(account_id,operation_key,request_hash) VALUES ($1,'grant-1',$2)",[account!.id,'a'.repeat(64)]);
  await assert.rejects(client.query("INSERT INTO operations(account_id,operation_key,request_hash) VALUES ($1,'grant-1',$2)",[account!.id,'b'.repeat(64)]),{code:'23505'});
  await client.query('BEGIN');
  await client.query('INSERT INTO inventory_items(owner_account_id,card_id) VALUES ($1,$2)',[account!.id,card]);
  await client.query('ROLLBACK');
  assert.equal((await client.query('SELECT count(*)::int AS n FROM inventory_items')).rows[0].n,1);
  const racingItem=(await client.query('INSERT INTO inventory_items(owner_account_id,card_id) VALUES ($1,$2) RETURNING id',[account!.id,card])).rows[0].id;
  const contender=postgres.getPgClient();await contender.connect();
  try{assert.deepEqual((await Promise.all([consumeItems(client,account!.id,'race',[racingItem]),consumeItems(contender,account!.id,'race',[racingItem])])).sort(),[false,true]);}finally{await contender.end();}
  const item=(await client.query("SELECT id FROM inventory_items WHERE state='available'")).rows[0].id;
  await assert.rejects(consumeItems(client,account!.id,'race',[item]),/conflict/);
  await client.query("UPDATE inventory_items SET state='locked' WHERE id=$1",[item]);
  await assert.rejects(consumeItems(client,account!.id,'locked-attempt',[item]),/Unavailable/);
  await client.query("UPDATE inventory_items SET state='available' WHERE id=$1",[item]);
  await assert.rejects(consumeItems(client,account!.id,'duplicate',[item,item]),/Invalid/);
  await assert.rejects(consumeItems(client,account!.id,'mixed',[item,'00000000-0000-0000-0000-000000000000']),/Unavailable/);
  assert.equal((await client.query('SELECT state FROM inventory_items WHERE id=$1',[item])).rows[0].state,'available');
  const [outsider]=await db.insert(accounts).values({}).returning();
  await assert.rejects(consumeItems(client,outsider!.id,'consume',[item]),/Unavailable/);
  assert.equal(await consumeItems(client,account!.id,'consume',[item]),false);
  assert.equal(await consumeItems(client,account!.id,'consume',[item]),true);
  await assert.rejects(consumeItems(client,account!.id,'different',[item]),/Unavailable/);
  assert.equal((await client.query('SELECT state FROM inventory_items WHERE id=$1',[item])).rows[0].state,'consumed');
  assert.equal((await client.query("SELECT count(*)::int AS n FROM operations WHERE operation_key='different'")).rows[0].n,0);
 }finally{if(connected)await client.end();if(started)await postgres.stop();await rm(dir,{recursive:true,force:true});}
});
