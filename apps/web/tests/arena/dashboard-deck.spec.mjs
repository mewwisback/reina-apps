import {expect,test,devices} from '@playwright/test';

for(const [width,height] of [[1600,900],[1024,768],[390,844],[320,740],[844,390]]) test(`dashboard geometry ${width}x${height}`,async({browser})=>{
 const context=await browser.newContext({...(width<=900?devices['iPhone 13']:{}),viewport:{width,height}});
 const page=await context.newPage(); await page.goto('/dashboard'); await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.evaluate(()=>visualViewport.width)).toBeCloseTo(width,0);
 const play=page.getByRole('button',{name:'PLAY',exact:true}); await play.scrollIntoViewIfNeeded();
 const box=await play.boundingBox(); expect(box.height).toBeGreaterThanOrEqual(44);
 expect(await play.evaluate(el=>{const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));})).toBe(true);
 if(width<=900){await page.getByRole('button',{name:'More',exact:true}).click(); await play.scrollIntoViewIfNeeded(); expect(await play.evaluate(el=>{const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));})).toBe(true);}
 else for(const name of ['Home','Collection','Deck Builder','Shop','Quests','Leaderboard','Docs','Wiki']) await expect(page.getByRole('link',{name,exact:true}).first()).toBeVisible();
 await context.close();
});

test('image failure shows approved back and retry recovers real card',async({page})=>{
 await page.route('**/images/dashboard/rei.webp',route=>route.abort()); await page.goto('/dashboard');
 await expect(page.getByRole('button',{name:'Retry REI image'})).toBeVisible();
 await expect(page.locator('[data-front][data-selected="true"]')).toHaveAttribute('src','/images/dashboard/back.webp');
 await page.unroute('**/images/dashboard/rei.webp'); await page.getByRole('button',{name:'Retry REI image'}).click();
 await expect(page.locator('[data-front][data-selected="true"]')).toHaveAttribute('src','/images/dashboard/rei.webp');
});

test('PLAY rapid double activation creates one history entry',async({page})=>{
 await page.goto('/dashboard');
 await page.evaluate(()=>{const b=document.querySelector('.deck-play'); b.click();b.click();});
 await expect(page).toHaveURL(/\/arena$/); await page.goBack(); await expect(page).toHaveURL(/\/dashboard$/);
});

test('rapid selection cancels motion and live reduced motion settles real hero',async({page})=>{
 await page.goto('/dashboard');
 await page.evaluate(()=>{for(const name of ['HAKU','SORA','YUI']) document.querySelector(`button[aria-label="Select ${name}"]`).click();});
 await expect(page.locator('[data-selected-hero]')).toHaveText('YUI');
 const front=page.locator('[data-front][data-selected="true"]');
 await expect.poll(()=>front.evaluate(el=>el.style.transform)).not.toBe('');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('.deck-dashboard')).toHaveAttribute('data-reduced-motion','true');
 await expect.poll(()=>front.evaluate(el=>el.style.transform)).toBe('');
 await page.getByRole('button',{name:'Select HAKU',exact:true}).click();
 await expect(page.locator('[data-front][data-selected="true"]')).toHaveAttribute('src','/images/dashboard/haku.webp');
 expect(await page.locator('[data-front]').evaluateAll(els=>els.every(el=>!el.style.transform))).toBe(true);
});

test('mobile More has keyboard dismissal and actual routes without covering PLAY',async({browser})=>{
 const context=await browser.newContext({...devices['iPhone 13'],viewport:{width:390,height:844}});
 const page=await context.newPage();
 await page.goto('/dashboard');
 const more=page.getByRole('button',{name:'More',exact:true});
 await more.click();
 await expect(more).toHaveAttribute('aria-expanded','true');
 await expect(page.getByRole('link',{name:'Quests',exact:true}).last()).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(more).toBeFocused();
 await expect(more).toHaveAttribute('aria-expanded','false');
 await more.click();
 await page.getByRole('heading',{name:'DECK',exact:true}).click();
 await expect(more).toHaveAttribute('aria-expanded','false');
 await more.click();
 await page.getByRole('link',{name:'Wiki',exact:true}).last().click();
 await expect(page).toHaveURL(/\/wiki$/);
 await context.close();
});

test('PLAY accepts keyboard once and opens real arena category selection',async({page})=>{
 await page.goto('/dashboard');
 const play=page.getByRole('button',{name:'PLAY',exact:true});
 await play.focus();
 await page.keyboard.press('Space');
 await expect(page).toHaveURL(/\/arena$/);
 await expect(page.getByRole('button',{name:/CASUAL/})).toBeVisible();
 await page.goBack();
 await expect(play).toBeEnabled();
});

test('account controls explain boundaries and settings provides session motion preference',async({page})=>{
 await page.goto('/dashboard');
 await page.getByRole('button',{name:'Profile',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('No account profile is connected');
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Profile',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByRole('checkbox',{name:'Reduce dashboard motion'}).check();
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await expect(page.locator('.deck-dashboard')).toHaveAttribute('data-reduced-motion','true');
});

test('dashboard replaces fabricated account metrics with cream deck play space',async({page})=>{
 await page.goto('/dashboard');
 await expect(page.locator('[data-deck-table]')).toHaveCSS('background-color','rgb(245, 241, 232)');
 await expect(page.getByRole('heading',{name:'DECK',exact:true})).toBeVisible();
 await expect(page.getByText('Kaiba99')).toHaveCount(0);
 for(const [name,href] of [['Home','/dashboard'],['Collection','/collection'],['Deck Builder','/deck-builder'],['Shop','/shop'],['Quests','/quests'],['Leaderboard','/leaderboard'],['Docs','/docs'],['Wiki','/wiki']]) await expect(page.getByRole('link',{name,exact:true}).first()).toHaveAttribute('href',href);
});

test('roster selection synchronizes real front, heading and profile without combat claims',async({page})=>{
 await page.goto('/dashboard');
 for(const [id,profile] of [['haku','Finds the signal inside the noise.'],['yui','Answers before the question grows.'],['rei','The one card every deck is built around.']]){
  await page.getByRole('button',{name:`Select ${id.toUpperCase()}`,exact:true}).click();
  await expect(page.locator('[data-selected-hero]')).toHaveText(id.toUpperCase());
  await expect(page.locator('[data-front][data-selected="true"]')).toHaveAttribute('src',`/images/dashboard/${id}.webp`);
  await expect(page.getByText(profile,{exact:true})).toBeVisible();
 }
 await expect(page.locator('[data-front]')).toHaveCount(5);
 expect(await page.locator('[data-front]').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth===600))).toBe(true);
 await expect(page.getByText('Visual roster only. Arena uses its own cards.',{exact:true})).toBeVisible();
});
