import {expect,test} from '@playwright/test';
import {writeFile} from 'node:fs/promises';

for(const [width,height] of [[1024,768],[844,390],[360,800],[1280,720]]){
 test(`Arena readability ${width}x${height}`,async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height});
  await page.goto('/arena?arenaFixture=dense&arenaHand=10');
  await page.getByRole('button',{name:/CASUAL/}).click();
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();
  await page.getByRole('button',{name:/ENTER DUEL/}).click();
  await page.locator('.duel:not(.opening)').waitFor();
  await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
  await page.getByRole('button',{name:'SUMMON',exact:true}).click();
  await page.locator('.player-territory .hero-zone .slot.valid').first().click();
  const metrics=await page.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
   return [...document.querySelectorAll('.duelist-information,.duelist-name strong,.duelist-lp,.command-status,.board .card strong,.board .card em,.board .card small')].map(e=>({selector:e.className||e.tagName,text:e.textContent,rect:rect(e),parent:rect(e.parentElement),font:getComputedStyle(e).fontSize,display:getComputedStyle(e).display,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}));
  });
  await writeFile(testInfo.outputPath('rectangles.json'),JSON.stringify(metrics,null,2));
  await page.screenshot({path:testInfo.outputPath(`arena-${width}x${height}.png`),fullPage:true});
  for(const text of metrics.filter(m=>['STRONG','EM'].includes(m.selector)&&m.parent.width<100)){
   expect(parseFloat(text.font),'Critical text floor').toBeGreaterThanOrEqual(10);
   expect(text.rect.bottom,'Text inside card').toBeLessThanOrEqual(text.parent.bottom+.5);
   expect(text.rect.top).toBeGreaterThanOrEqual(text.parent.top-.5);
  }
  const status=metrics.find(m=>m.selector==='command-status');
  expect(status.scrollHeight,'Full status fits').toBeLessThanOrEqual(status.clientHeight+1);
  for(const hud of metrics.filter(m=>m.selector.includes('duelist-information'))){
   expect(hud.rect.left,'HUD left').toBeGreaterThanOrEqual(0);
   expect(hud.rect.right,'HUD right').toBeLessThanOrEqual(width);
  }
 });
}
