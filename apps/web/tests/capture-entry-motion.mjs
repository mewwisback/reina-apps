import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=process.env.ENTRY_CAPTURE_DIR||new URL('../../../artifacts/arena-motion-correction/',import.meta.url).pathname;
const base=process.env.ENTRY_BASE_URL||'http://127.0.0.1:3000';
await mkdir(out,{recursive:true});const browser=await chromium.launch();const evidence=[];
for(const [name,width,height] of [['desktop',1536,864],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:out,size:{width,height}}});const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/card-flip/'))requests.push(r.url())});
 await page.goto(`${base}/arena`);const canvas=page.locator('.threshold-environment canvas');await canvas.waitFor();await page.waitForTimeout(700);
 const hashes=[];
 for(let i=0;i<3;i++){const data=await canvas.evaluate(c=>c.toDataURL().split(',')[1]);const bytes=Buffer.from(data,'base64');hashes.push(createHash('sha256').update(bytes).digest('hex'));await writeFile(`${out}/${name}-frame-${i}.png`,bytes);await page.screenshot({path:`${out}/${name}-lobby-${i}.png`,fullPage:true});await page.waitForTimeout(650)}
 assert.equal(new Set(hashes).size,3);const earlyRequests=new Set(requests).size;assert.ok(earlyRequests<120);
 await page.getByRole('button',{name:/CASUAL/}).click();await page.getByRole('button',{name:'START DEMO MATCH'}).click();await page.waitForTimeout(250);await page.screenshot({path:`${out}/${name}-search.png`,fullPage:true});
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).waitFor();await page.waitForTimeout(400);await page.screenshot({path:`${out}/${name}-found.png`,fullPage:true});
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();await page.locator('.duel[data-entry-ready=true]').waitFor();await page.screenshot({path:`${out}/${name}-duel.png`,fullPage:true});
 const hand=await page.locator('.hand .card').count(),overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(hand,6);assert.equal(overflow,false);assert.deepEqual(errors,[]);
 const count=requests.length;await page.waitForTimeout(350);assert.equal(requests.length,count);evidence.push({name,base,hashes,earlyRequests,hand,overflow,errors,video:await page.video().path()});await context.close();
}
await browser.close();await writeFile(`${out}/evidence.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
