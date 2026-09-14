import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash} from 'node:crypto';
const hash=token=>createHash('sha256').update(token).digest('hex');
export function openStore(path) {
 const db=new DatabaseSync(path);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY NOT NULL);
 CREATE TABLE IF NOT EXISTS catalog(id TEXT PRIMARY KEY NOT NULL,zone TEXT NOT NULL CHECK(zone IN ('main','fusion')));
 CREATE TABLE IF NOT EXISTS inventory(account_id TEXT NOT NULL REFERENCES accounts(id),card_id TEXT NOT NULL REFERENCES catalog(id),count INTEGER NOT NULL CHECK(typeof(count)='integer' AND count>=0 AND count<=9007199254740991),PRIMARY KEY(account_id,card_id));
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY NOT NULL,account_id TEXT NOT NULL REFERENCES accounts(id),expires_at INTEGER NOT NULL);`);
 db.exec(`CREATE TABLE IF NOT EXISTS inventory_operations(account_id TEXT NOT NULL REFERENCES accounts(id),operation_id TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(account_id,operation_id));`);
 return {db,
  // Internal trusted service boundary: clients must never choose grants or deltas.
  applyInventory(accountId,operationId,changes){
   if(typeof accountId!=='string'||typeof operationId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(operationId)||!Array.isArray(changes)||!changes.length||changes.length>100)throw new Error('Invalid inventory operation');
   const seen=new Set();
   for(const change of changes){
    if(!change||typeof change.cardId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(change.cardId)||!Number.isSafeInteger(change.delta)||change.delta===0||seen.has(change.cardId))throw new Error('Invalid inventory change');
    seen.add(change.cardId);
   }
   const payload=JSON.stringify(changes.map(({cardId,delta})=>({cardId,delta})).sort((a,b)=>a.cardId<b.cardId?-1:a.cardId>b.cardId?1:0));
   db.exec('BEGIN IMMEDIATE');
   try{
    const prior=db.prepare('SELECT payload FROM inventory_operations WHERE account_id=? AND operation_id=?').get(accountId,operationId);
    if(prior){if(prior.payload!==payload)throw new Error('Operation replay conflict');db.exec('COMMIT');return {replayed:true};}
    for(const {cardId,delta} of changes){
     const count=db.prepare('SELECT count FROM inventory WHERE account_id=? AND card_id=?').get(accountId,cardId)?.count??0;
     const next=count+delta;
     if(!Number.isSafeInteger(next)||next<0)throw new Error('Insufficient inventory or count overflow');
     db.prepare('INSERT INTO inventory VALUES (?,?,?) ON CONFLICT(account_id,card_id) DO UPDATE SET count=excluded.count').run(accountId,cardId,next);
    }
    db.prepare('INSERT INTO inventory_operations VALUES (?,?,?)').run(accountId,operationId,payload);
    db.exec('COMMIT');return {replayed:false};
   }catch(error){db.exec('ROLLBACK');throw error;}
  },
  // Called only after a trusted identity provider verifies login; never exposed as a public issuance route.
  issueSession(accountId,ttl=3600000){
   if(!Number.isSafeInteger(ttl)||ttl<1||ttl>86400000)throw new Error('Invalid session lifetime');
   const token=randomBytes(32).toString('hex');
   db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token),accountId,Date.now()+ttl);return token;
  },
  revokeSession(token){db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token));},
  account(token){if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT account_id FROM sessions WHERE token_hash=? AND expires_at>?').get(hash(token),Date.now())?.account_id??null;},
  snapshot(accountId){
   db.exec('BEGIN');
   try{const catalog=db.prepare('SELECT id,zone FROM catalog').all();const inventory=db.prepare('SELECT card_id AS cardId,count FROM inventory WHERE account_id=?').all(accountId);db.exec('COMMIT');return {catalog,inventory};}
   catch(error){db.exec('ROLLBACK');throw error;}
  }
 };
}
