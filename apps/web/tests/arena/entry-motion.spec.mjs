import {expect,test} from '@playwright/test';
const time=page=>page.locator('.threshold-environment video').evaluate(v=>v.currentTime);
test('native backdrop pauses hidden, resumes visible and releases source on exit',async({page})=>{
 await page.goto('/arena');await expect.poll(()=>time(page)).toBeGreaterThan(.2);
 await page.evaluate(()=>{window.backdrop=document.querySelector('.threshold-environment video');Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
 const paused=await time(page);await page.waitForTimeout(350);expect(await time(page)).toBe(paused);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await expect.poll(()=>time(page)).toBeGreaterThan(paused+.2);
 await page.getByRole('link',{name:'← LEAVE'}).click();await expect.poll(()=>page.evaluate(()=>window.backdrop.getAttribute('src'))).toBeNull();
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

test('reduced motion requests no video and responds to live preference changes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requests=[];page.on('request',r=>{if(r.url().includes('/card-flip'))requests.push(r.url())});
 await page.goto('/arena');await page.waitForTimeout(300);expect(requests).toEqual([]);
 await page.emulateMedia({reducedMotion:'no-preference'});await expect.poll(()=>time(page)).toBeGreaterThan(.2);
 await page.emulateMedia({reducedMotion:'reduce'});const paused=await time(page);await page.waitForTimeout(400);expect(await time(page)).toBe(paused);await expect(page.locator('.threshold-environment video')).toBeHidden();
});
test('failed decoration never blocks ruleset selection or duel entry',async({page})=>{
 await page.route('**/card-flip.mp4',route=>route.abort());await page.goto('/arena');
 await page.getByRole('button',{name:/CASUAL/}).click();await page.getByRole('button',{name:'START DEMO MATCH'}).click();await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();await expect(page.getByRole('button',{name:'ENTER BATTLE',exact:true})).toBeVisible();
});
test('matchmaking omits generic intro and uses source crimson control feedback',async({page})=>{
 await page.goto('/arena');await expect(page.locator('.threshold-intro')).toHaveCount(0);
 const mode=page.getByRole('button',{name:/CASUAL/});await mode.click();await expect(mode.locator('i')).toHaveText('✓');
 const leave=page.getByRole('link',{name:'← LEAVE'});await leave.hover();await expect(leave).toHaveCSS('color','rgb(224, 60, 78)');await page.mouse.move(0,0);await page.keyboard.press('Tab');await leave.focus();await expect(leave).toBeFocused();await expect(leave).toHaveCSS('color','rgb(224, 60, 78)');
});
