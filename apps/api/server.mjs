import http from 'node:http';
import {pathToFileURL} from 'node:url';
const id=value=>typeof value==='string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const object=value=>value!==null && typeof value==='object' && !Array.isArray(value);

// ponytail: stateless consistency only; replace submitted catalog/inventory with trusted stores before ranked integration.
export function validateDeck(input) {
 const errors=[];
 const result=()=>({valid:errors.length===0,ownershipVerified:false,errors});
 if(!object(input)||!['catalog','inventory','main','extra'].every(k=>Array.isArray(input[k]))) {
  errors.push('Expected catalog, inventory, main and extra arrays'); return result();
 }
 const {catalog,inventory,main,extra}=input;
 if(catalog.length>1000||inventory.length>1000||main.length!==30||extra.length>5) {
  errors.push('Main Deck must contain 30 cards; Extra Deck at most 5; catalog and inventory at most 1000 entries'); return result();
 }
 const cards=new Map(),owned=new Map(),used=new Map();
 for(const card of catalog) {
  if(!object(card)||!id(card.id)||!['main','fusion'].includes(card.zone)||cards.has(card.id)) {errors.push('Invalid or duplicate catalog entry');return result();}
  cards.set(card.id,card.zone);
 }
 for(const item of inventory) {
  if(!object(item)||!id(item.cardId)||!cards.has(item.cardId)||!Number.isSafeInteger(item.count)||item.count<0||owned.has(item.cardId)) {errors.push('Invalid or duplicate inventory entry');return result();}
  owned.set(item.cardId,item.count);
 }
 for(const [deck,zone] of [[main,'main'],[extra,'fusion']]) {
  const counts=new Map();
  for(const cardId of deck) {
   if(!id(cardId)||cards.get(cardId)!==zone) {errors.push('Unknown card or invalid deck zone');continue;}
   counts.set(cardId,(counts.get(cardId)||0)+1);
   used.set(cardId,(used.get(cardId)||0)+1);
  }
  for(const count of counts.values()) if(count>2) errors.push('Maximum two copies per gameplay identity');
 }
 for(const [cardId,count] of used) if(count>(owned.get(cardId)||0)) errors.push('Insufficient declared inventory');
 return result();
}

export function createServer({allowUntrustedDiagnostics=false,store=null}={}) {
 const server=http.createServer((req,res)=>{
  const reply=(status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data));};
  if(req.method==='GET'&&req.url==='/health') return reply(200,{status:'ok',scope:'stateless-deck-consistency'});
  if(req.method!=='POST'||req.url!=='/v1/decks/validate') return reply(404,{error:'Not found'});
  if(!store&&allowUntrustedDiagnostics!==true) {req.resume();return reply(503,{error:'Trusted inventory service unavailable',ownershipVerified:false});}
  if(store){
   try{if(!store.account(req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/i)?.[1])){req.resume();return reply(401,{error:'Invalid session'});}}
   catch{req.resume();return reply(503,{error:'Trusted inventory service unavailable'});}
  }
  if(req.headers['content-type']?.split(';')[0].trim().toLowerCase()!=='application/json') {req.resume();return reply(415,{error:'Expected application/json'});}
  let size=0,tooLarge=false;const chunks=[];
  req.on('data',chunk=>{size+=chunk.length;if(size>65536){if(!tooLarge){tooLarge=true;chunks.length=0;reply(413,{error:'Payload exceeds 65536 bytes'});}return;}chunks.push(chunk);});
  req.on('error',()=>{if(!res.writableEnded)reply(400,{error:'Request interrupted'});});
  req.on('end',()=>{
   if(tooLarge)return;
   let input;
   try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return reply(400,{error:'Invalid JSON'});}
   try {
    if(store){
     if(!object(input)||Object.keys(input).some(key=>!['main','extra'].includes(key)))return reply(400,{error:'Only main and extra are accepted'});
     const accountId=store.account(req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/i)?.[1]);
     if(!accountId)return reply(401,{error:'Invalid session'});
     input={...input,...store.snapshot(accountId)};
    }
    const result=validateDeck(input);reply(result.valid?200:422,{...result,ownershipVerified:!!store&&result.valid});
   }catch{reply(503,{error:'Trusted inventory service unavailable'});}
  });
 });
 server.requestTimeout=10000;server.headersTimeout=10000;
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const server=createServer();
 server.on('error',error=>{console.error(error.message);process.exitCode=1;});
 server.listen(3100,'127.0.0.1',()=>console.log('REINA consistency API listening on http://127.0.0.1:3100'));
}
