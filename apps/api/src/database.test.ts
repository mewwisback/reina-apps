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
 }finally{if(connected)await client.end();if(started)await postgres.stop();await rm(dir,{recursive:true,force:true});}
});
