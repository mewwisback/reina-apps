import {expect,test} from '@playwright/test';
const sizes=[[320,568],[360,800],[390,844],[430,932],[844,390],[820,1180],[1024,768],[1280,720],[1366,768],[1536,864],[1920,1080],[2560,1440],[3440,1440]];
for(const [width,height] of sizes)test(`entry states and initial duel ${width}x${height}`,async({page},info)=>{
 await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/arena');await page.evaluate(()=>document.fonts.ready);
 const check=async state=>{
  await expect(page.locator('.threshold')).toHaveAttribute('data-entry-state',state);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  for(const node of await page.locator('.threshold-nav a,.threshold-nav button,.threshold-mode,.threshold-actions button').all()){
   await node.scrollIntoViewIfNeeded();const box=await node.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+.5);expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const clipped=await page.locator('.threshold-line>span').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect();return r.left<p.left-.5||r.right>p.right+.5||r.top<p.top-.5||r.bottom>p.bottom+.5}).length);expect(clipped).toBe(0);
  await page.screenshot({path:info.outputPath(`${width}-${state}.png`),fullPage:true});
 };
 await check('category');await page.getByRole('button',{name:/CASUAL/}).focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:'START DEMO MATCH'}).focus();await page.keyboard.press('Enter');await check('search');
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).waitFor();await check('found');
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('.hand .card')).toHaveCount(6);await expect(page.getByRole('button',{name:'ENTER BATTLE',exact:true})).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 await page.screenshot({path:info.outputPath(`${width}-duel.png`),fullPage:true});
});
