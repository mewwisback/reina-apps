import {expect,test} from '@playwright/test';

const viewports=[['phone',360,800],['phone-wide',430,932],['landscape',844,390],['tablet',820,1180],['tablet-wide',1024,768],['short-desktop',1280,720],['desktop',1920,1080],['large-desktop',2560,1440],['ultrawide',3440,1440]];
const routes=['/dashboard','/collection','/deck-builder','/leaderboard','/quests','/shop','/docs','/wiki','/login','/signup'];

for(const [name,width,height] of viewports){
 for(const route of routes)test(`${route} ${name} ${width}x${height} contains content and reachable controls`,async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width,height});
  await page.goto(route);
  await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>{
   const owner=document.querySelector('.app-main,.docs-content,.auth-form-panel')||document.querySelector('main');
   const r=owner?.getBoundingClientRect();
   return {width:document.documentElement.scrollWidth,owner:r&&{left:r.left,right:r.right},overflow:owner?owner.scrollWidth-owner.clientWidth:0};
  });
  expect(metrics.width).toBeLessThanOrEqual(width);
  if(metrics.owner){
   expect(metrics.owner.left).toBeGreaterThanOrEqual(-.5);
   expect(metrics.owner.right).toBeLessThanOrEqual(width+.5);
   expect(metrics.overflow).toBeLessThanOrEqual(1);
  }
  const sidebar=page.locator('[data-app-sidebar]');
  if(await sidebar.count()){
   if(width<=700){
    await expect(sidebar).toHaveAttribute('aria-hidden','true');
    const menu=page.getByRole('button',{name:'Open navigation'});
    await menu.click();
    await expect(sidebar).not.toHaveAttribute('aria-hidden','true');
    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveAttribute('aria-hidden','true');
    await expect(menu).toBeFocused();
   }else await expect(sidebar).toBeVisible();
  }
  if(['phone','landscape','short-desktop','ultrawide'].includes(name)&&['/dashboard','/shop','/docs'].includes(route))await page.screenshot({path:testInfo.outputPath(`${route.slice(1)}-${width}x${height}.png`),fullPage:true});
 });
 test(`Arena ${name} ${width}x${height} preserves occupied slot ownership`,async({page},testInfo)=>{
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
  const cards=await page.locator('.slot > .card').evaluateAll(nodes=>nodes.map(card=>{
   const r=card.getBoundingClientRect(),s=card.parentElement.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
   return {contained:r.left>=s.left-.5&&r.right<=s.right+.5&&r.top>=s.top-.5&&r.bottom<=s.bottom+.5,ownsCenter:hit===card||card.contains(hit)};
  }));
  expect(cards.length).toBeGreaterThan(0);
  expect(cards.every(card=>card.contained&&card.ownsCenter)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  for(const button of await page.locator('.commands button').all()){
   const box=await button.boundingBox();
   expect(box.height).toBeGreaterThanOrEqual(40);
   expect(box.x).toBeGreaterThanOrEqual(0);
   expect(box.x+box.width).toBeLessThanOrEqual(width+.5);
  }
  await page.screenshot({path:testInfo.outputPath(`arena-${width}x${height}.png`)});
 });
}
