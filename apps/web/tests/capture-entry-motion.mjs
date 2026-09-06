import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=process.env.ENTRY_CAPTURE_DIR||new URL('../../../artifacts/arena-motion-correction/',import.meta.url).pathname;
const base=process.env.ENTRY_BASE_URL||'http://127.0.0.1:3000';
// Measure without screencast encoding; capture-entry.mjs records visual evidence separately.
await mkdir(out,{recursive:true});const browser=await chromium.launch();const evidence=[];
for(const [name,width,height] of [['desktop',1536,864],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height}});const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/card-flip'))requests.push(r.url())});
 await page.goto(`${base}/arena`);const canvas=page.locator('.threshold-environment video');await canvas.waitFor();await page.waitForFunction(()=>document.querySelector('.threshold-environment video').currentTime>.2);
 const cadence=await canvas.evaluate(v=>new Promise(resolve=>{const times=[],start=performance.now();const frame=(now)=>{times.push(now);if(now-start<8000){v.requestVideoFrameCallback(frame);return}const intervals=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b),q=v.getVideoPlaybackQuality();resolve({fps:times.length/((now-start)/1000),p95:intervals[Math.floor(intervals.length*.95)],max:Math.max(...intervals),dropped:q.droppedVideoFrames,total:q.totalVideoFrames})};v.requestVideoFrameCallback(frame)}));assert.ok(cadence.fps>22);
 const hashes=[];
 for(let i=0;i<3;i++){const data=await canvas.evaluate(v=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL().split(',')[1]});const bytes=Buffer.from(data,'base64');hashes.push(createHash('sha256').update(bytes).digest('hex'));await writeFile(`${out}/${name}-frame-${i}.png`,bytes);await page.screenshot({path:`${out}/${name}-lobby-${i}.png`,fullPage:true});await page.waitForTimeout(650)}
 assert.equal(new Set(hashes).size,3);const earlyRequests=new Set(requests).size;assert.ok(earlyRequests<120);
 await page.getByRole('button',{name:/CASUAL/}).click();await page.getByRole('button',{name:'START DEMO MATCH'}).click();await page.waitForTimeout(250);await page.screenshot({path:`${out}/${name}-search.png`,fullPage:true});
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).waitFor();await page.waitForTimeout(400);await page.screenshot({path:`${out}/${name}-found.png`,fullPage:true});
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();await page.locator('.duel[data-entry-ready=true]').waitFor();await page.screenshot({path:`${out}/${name}-duel.png`,fullPage:true});
 const hand=await page.locator('.hand .card').count(),overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(hand,6);assert.equal(overflow,false);assert.deepEqual(errors,[]);
 const count=requests.length;await page.waitForTimeout(350);assert.equal(requests.length,count);evidence.push({name,base,cadence,hashes,earlyRequests,hand,overflow,errors,recording:false});await context.close();
}
await browser.close();await writeFile(`${out}/evidence.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
