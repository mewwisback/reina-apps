import type {Client} from 'pg';
import {createHash} from 'node:crypto';
// Trusted, reviewed SQL only. The dedicated client must not have an active transaction.
export async function migrate(client:Client,migrations:{id:string;sql:string}[]):Promise<number>{
 const ids=migrations.map(x=>x.id);
 if(ids.some((id,i)=>!/^\d{4}_[a-z0-9_]+$/.test(id)||(i>0&&id<=ids[i-1]!)))throw new Error('Invalid migration order');
 await client.query('BEGIN');
 try{
  await client.query("SET LOCAL lock_timeout='5s'");
  await client.query('SELECT pg_advisory_xact_lock(74192311)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(id text PRIMARY KEY, checksum text NOT NULL)');
  const applied=await client.query<{id:string;checksum:string}>('SELECT id,checksum FROM schema_migrations ORDER BY id');
  for(const [index,row] of applied.rows.entries()){
   const entry=migrations[index];
   if(!entry||entry.id!==row.id||createHash('sha256').update(entry.sql).digest('hex')!==row.checksum)throw new Error('Migration history or checksum mismatch');
  }
  for(const entry of migrations.slice(applied.rows.length)){
   await client.query(entry.sql);
   await client.query('INSERT INTO schema_migrations VALUES ($1,$2)',[entry.id,createHash('sha256').update(entry.sql).digest('hex')]);
  }
  await client.query('COMMIT');return migrations.length-applied.rows.length;
 }catch(error){await client.query('ROLLBACK');throw error;}
}
