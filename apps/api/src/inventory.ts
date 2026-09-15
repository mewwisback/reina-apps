import type {Client} from 'pg';
import {createHash} from 'node:crypto';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
// Internal primitive only: not conversion, no currency credit, and no public route.
// Dedicated client; account must come from verified identity. Deck-reference checks remain a release blocker.
export async function consumeItems(client:Client,account:string,key:string,items:string[]):Promise<boolean>{
 if(!uuid.test(account)||!/^[-a-zA-Z0-9_]{1,128}$/.test(key)||!Array.isArray(items)||!items.length||items.length>100||items.some(x=>typeof x!=='string'||!uuid.test(x))||new Set(items).size!==items.length)throw new Error('Invalid consumption request');
 const ordered=[...items].sort();const digest=createHash('sha256').update(JSON.stringify({type:'consume',items:ordered})).digest('hex');
 await client.query('BEGIN');
 try{
  await client.query("SET LOCAL lock_timeout='5s'");
  const owner=await client.query('SELECT id FROM accounts WHERE id=$1 FOR UPDATE',[account]);
  if(!owner.rowCount)throw new Error('Unavailable account');
  const previous=await client.query('SELECT request_hash FROM operations WHERE account_id=$1 AND operation_key=$2',[account,key]);
  if(previous.rowCount){if(previous.rows[0].request_hash!==digest)throw new Error('Operation conflict');await client.query('COMMIT');return true;}
  const rows=await client.query('SELECT id,owner_account_id,state FROM inventory_items WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[ordered]);
  if(rows.rowCount!==ordered.length||rows.rows.some(row=>row.owner_account_id!==account||row.state!=='available'))throw new Error('Unavailable items');
  await client.query("UPDATE inventory_items SET state='consumed' WHERE id=ANY($1::uuid[])",[ordered]);
  await client.query('INSERT INTO operations(account_id,operation_key,request_hash) VALUES ($1,$2,$3)',[account,key,digest]);
  await client.query('COMMIT');return false;
 }catch(error){await client.query('ROLLBACK');throw error;}
}
