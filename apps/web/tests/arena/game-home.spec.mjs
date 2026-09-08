import {expect,test} from '@playwright/test';

test('home shares destination shell and exposes contextual launch paths',async({page})=>{
 await page.goto('/dashboard');
 await expect(page.locator('[data-destination-shell]')).toBeVisible();
 await expect(page.getByRole('link',{name:'Skip to content'})).toHaveAttribute('href','#destination-content');
 const paths=page.getByRole('navigation',{name:'Home destinations'});
 await expect(paths.getByRole('link',{name:/Explore roster/})).toHaveAttribute('href','/collection');
 await paths.getByRole('link',{name:/Read field guide/}).click();
 await expect(page).toHaveURL(/docs$/);
 await expect(page.getByRole('navigation',{name:'Explore Reina'}).getByRole('link',{name:'Docs',exact:true})).toHaveAttribute('aria-current','page');
});

test('home composition gives fan priority and destination controls distinct active state',async({page})=>{
 await page.setViewportSize({width:1600,height:900}); await page.goto('/dashboard');
 const stage=await page.locator('.deck-table').boundingBox();
 const paths=await page.locator('.home-paths').boundingBox();
 expect(paths.y+paths.height).toBeLessThanOrEqual(900);
 expect(stage.width).toBeGreaterThan(1000);
 const home=page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Home',exact:true});
 expect(await home.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
});

test('PLAY departs with fan then live reduced motion finishes route',async({page})=>{
 await page.clock.install(); await page.goto('/dashboard'); await page.clock.pauseAt(new Date(Date.now()+10000));
 await page.getByRole('button',{name:'PLAY',exact:true}).click(); await page.clock.runFor(80);
 expect(await page.locator('.deck-fan').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
 await page.emulateMedia({reducedMotion:'reduce'}); await expect(page).toHaveURL(/arena$/);
 await page.goBack(); await expect(page.getByRole('button',{name:'PLAY',exact:true})).toBeEnabled();
});

for (const setting of ['system', 'local']) {
 test(`canceled PLAY stays home after ${setting} reduced motion and deliberate retry works`,async({page})=>{
  await page.clock.install(); await page.goto('/dashboard'); await page.clock.pauseAt(new Date(Date.now()+10000));
  await page.getByRole('button',{name:'PLAY',exact:true}).click(); await page.clock.runFor(80);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.getByRole('button',{name:'PLAY',exact:true})).toBeEnabled();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  if(setting==='system') await page.emulateMedia({reducedMotion:'reduce'});
  else { await page.getByRole('button',{name:'Settings',exact:true}).click(); await page.getByLabel('Reduce dashboard motion').check(); }
  await page.clock.runFor(500); await expect(page).toHaveURL(/dashboard$/);
  await expect(page.locator('.deck-dashboard')).toHaveAttribute('data-reduced-motion','true');
  if(setting==='local') await page.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.locator('.deck-fan')).toHaveCSS('opacity','1');
  await page.getByRole('button',{name:'PLAY',exact:true}).click(); await expect(page).toHaveURL(/arena$/);
 });
}

test('selection moves displaced card into vacated fan slot without replaying heading',async({page})=>{
 await page.clock.install(); await page.goto('/dashboard'); await page.clock.pauseAt(new Date(Date.now()+10000));
 const rei=page.locator('.deck-card').filter({has:page.locator('img[src="/images/dashboard/rei.webp"]')});
 const before=await rei.evaluate(el=>parseFloat(getComputedStyle(el).left));
 await page.getByRole('button',{name:'Select HAKU',exact:true}).click(); await page.clock.runFor(32);
 const during=await rei.evaluate(el=>parseFloat(getComputedStyle(el).left));
 await page.clock.runFor(400);
 const after=await rei.evaluate(el=>parseFloat(getComputedStyle(el).left));
 expect(during).toBeLessThan(before); expect(during).toBeGreaterThan(after);
 await expect(page.locator('[data-selected-hero]')).toHaveCSS('transform','none');
});

test('rapid separate selections preserve interpolated fan positions',async({page})=>{
 await page.clock.install(); await page.goto('/dashboard'); await page.clock.pauseAt(new Date(Date.now()+10000));
 await page.getByRole('button',{name:'Select HAKU',exact:true}).click(); await page.clock.runFor(64);
 const positions=()=>page.locator('.deck-card').evaluateAll(cards=>cards.map(el=>parseFloat(getComputedStyle(el).left)));
 const before=await positions();
 await page.getByRole('button',{name:'Select YUI',exact:true}).click();
 const after=await positions();
 console.log('rapid selection positions',JSON.stringify({before,after}));
 after.forEach((x,i)=>expect(Math.abs(x-before[i])).toBeLessThan(1));
 await page.clock.runFor(400);
 await expect.poll(()=>page.locator('.deck-card[data-selected=true]').evaluate(el=>Number(el.style.getPropertyValue('--slot')))).toBe(2);
});

test('shared navigation preserves modified links and native history',async({page,context})=>{
 await page.goto('/dashboard');
 const collection=page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Collection',exact:true});
 const opened=context.waitForEvent('page'); await collection.click({modifiers:['Control']}); const tab=await opened; await tab.waitForURL(/collection$/);
 await expect(page).toHaveURL(/dashboard$/); await tab.close();
 await collection.click(); await expect(page).toHaveURL(/collection$/); await page.goBack(); await expect(page).toHaveURL(/dashboard$/);
 await expect(page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Home',exact:true})).toHaveAttribute('aria-current','page');
});

test('rapid fan changes settle correct slots and hidden departure can retry',async({page})=>{
 await page.goto('/dashboard');
 for(const name of ['HAKU','YUI','SORA']) { await page.getByRole('button',{name:`Select ${name}`,exact:true}).click(); await page.waitForTimeout(40); }
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.locator('.deck-card[data-selected=true]').evaluate(el=>Number(el.style.getPropertyValue('--slot')))).toBe(2);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.getByRole('button',{name:'PLAY',exact:true}).click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForTimeout(400); await expect(page).toHaveURL(/dashboard$/);
 await expect(page.getByRole('button',{name:'PLAY',exact:true})).toBeEnabled();
 await expect(page.locator('.deck-fan')).toHaveCSS('opacity','1');
});

test('phone deck summary uses full rail width',async({page})=>{
 await page.setViewportSize({width:390,height:844}); await page.goto('/dashboard');
 const summary=await page.getByRole('region',{name:'Active gameplay deck'}).boundingBox();
 expect(summary.width).toBeGreaterThan(300);
});

test('hero rail supports directional keyboard selection without moving route',async({page})=>{
 await page.goto('/dashboard');
 const rei=page.getByRole('button',{name:'Select REI',exact:true});
 await rei.focus(); await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('button',{name:'Select KOMA',exact:true})).toBeFocused();
 await expect(page.locator('[data-selected-hero]')).toHaveText('KOMA');
 await page.keyboard.press('End');
 await expect(page.getByRole('button',{name:'Select YUI',exact:true})).toBeFocused();
 await expect(page.locator('[data-selected-hero]')).toHaveText('YUI');
 await page.keyboard.press('Home');
 await expect(page.getByRole('button',{name:'Select HAKU',exact:true})).toBeFocused();
 await expect(page).toHaveURL(/dashboard$/);
});
