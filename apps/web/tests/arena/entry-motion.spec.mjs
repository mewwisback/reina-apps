import {expect,test} from '@playwright/test';

const pixels=page=>page.locator('.threshold-environment canvas').evaluate(canvas=>canvas.toDataURL());
test('canonical canvas paints distinct frames over time without eager full preload',async({page})=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/card-flip/'))requests.push(r.url())});
 await page.addInitScript(()=>{window.bitmapLive=0;window.bitmapPeak=0;const create=window.createImageBitmap;window.createImageBitmap=async(...args)=>{const bitmap=await create(...args),close=bitmap.close.bind(bitmap);window.bitmapPeak=Math.max(window.bitmapPeak,++window.bitmapLive);bitmap.close=()=>{window.bitmapLive--;close()};return bitmap}});
 await page.goto('/arena');
 const canvas=page.locator('.threshold-environment canvas');await expect(canvas).toBeVisible();
 await expect.poll(()=>canvas.evaluate(c=>c.getContext('2d').getImageData(640,360,1,1).data[3])).toBe(255);
 const first=await pixels(page);await page.waitForTimeout(650);const second=await pixels(page);await page.waitForTimeout(650);const third=await pixels(page);
 expect(new Set([first,second,third]).size).toBe(3);expect(new Set(requests).size).toBeLessThan(100);
 expect(await page.evaluate(()=>window.bitmapPeak)).toBeLessThanOrEqual(10);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});const paused=await pixels(page),count=requests.length;await page.waitForTimeout(350);expect(await pixels(page)).toBe(paused);expect(requests.length).toBe(count);expect(await page.evaluate(()=>window.bitmapLive)).toBe(0);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await page.waitForTimeout(350);expect(await pixels(page)).not.toBe(paused);
 await page.getByRole('link',{name:'← LEAVE'}).click();await page.waitForTimeout(300);expect(await page.evaluate(()=>window.bitmapLive)).toBe(0);
});

test('mode and queue transitions never replay heading or environment reveal',async({page})=>{
 await page.goto('/arena');await page.waitForTimeout(1400);
 await page.evaluate(()=>{window.motionViolations=[];const check=()=>{for(const el of document.querySelectorAll('.threshold-title h1 span,.threshold-environment,.threshold-intro,.threshold-deck-copy')){const s=getComputedStyle(el);if((s.transform!=='none'&&s.transform!=='matrix(1, 0, 0, 1, 0, 0)')||Number(s.opacity)<1)window.motionViolations.push(el.className)}window.motionObserver=requestAnimationFrame(check)};check()});
 for(const mode of ['CASUAL','RANKED','EVENT'])await page.getByRole('button',{name:new RegExp(mode)}).click();
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();await page.waitForTimeout(500);
 await page.getByRole('button',{name:'CANCEL',exact:true}).click();await page.waitForTimeout(500);
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();await page.getByRole('button',{name:'ENTER DUEL',exact:true}).waitFor();await page.waitForTimeout(700);
 expect(await page.evaluate(()=>{cancelAnimationFrame(window.motionObserver);return window.motionViolations})).toEqual([]);
 const settled=await page.locator('.threshold-opponent').getAttribute('style');await page.getByRole('button',{name:'Mute sound'}).click();await page.waitForTimeout(200);expect(await page.locator('.threshold-opponent').getAttribute('style')).toBe(settled);
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();await page.waitForTimeout(500);const board=await page.locator('.board').getAttribute('style');await page.getByRole('button',{name:'ENTER BATTLE',exact:true}).click();expect(await page.locator('.board').getAttribute('style')).toBe(board);
});

test('reduced motion requests no sequence and stays static even after live preference change',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requests=[];page.on('request',r=>{if(r.url().includes('/card-flip/'))requests.push(r.url())});
 await page.goto('/arena');await page.waitForTimeout(300);expect(requests).toEqual([]);
 await page.emulateMedia({reducedMotion:'no-preference'});await expect.poll(()=>requests.length).toBeGreaterThan(0);
 await page.waitForTimeout(300);await page.emulateMedia({reducedMotion:'reduce'});const count=requests.length,first=await pixels(page);await page.waitForTimeout(400);
 expect(await pixels(page)).toBe(first);expect(requests.length).toBe(count);
});
