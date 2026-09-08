import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

for(const [width,height] of [[320,740],[390,844],[844,390],[1024,768],[1600,900],[3440,1440]]){
 for(const route of ['collection','deck-builder','quests','leaderboard','shop','docs','wiki']){
  test(`${route} destination geometry and navigation ${width}x${height}`,async({browser})=>{
   const context=await browser.newContext({viewport:{width,height},isMobile:width<=844,hasTouch:width<=844,reducedMotion:'reduce',...(width<=844?{userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'}:{})});
   const page=await context.newPage();await page.goto(`http://127.0.0.1:3000/${route}`);await page.evaluate(()=>document.fonts.ready);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
   const geometry=await page.evaluate(()=>({inner:innerWidth,visual:visualViewport.width,scale:visualViewport.scale,font:getComputedStyle(document.querySelector('h1')).fontFamily,loaded:document.fonts.check('16px '+getComputedStyle(document.body).fontFamily.split(',')[0]),small:[...document.querySelectorAll('.destination-header a,.destination-header button,.destination-dock a,.destination-dock button,main button,main input')].filter(n=>n.getClientRects().length).filter(n=>{const r=n.getBoundingClientRect();return r.height<44||r.width<40;}).map(n=>n.textContent)}));
   expect(geometry.inner).toBe(width);expect(geometry.visual).toBeCloseTo(width,0);expect(geometry.scale).toBe(1);expect(geometry.font).toContain('bodyFont');expect(geometry.loaded).toBe(true);expect(geometry.small).toEqual([]);
   if(width<=900){
    const more=page.getByRole('button',{name:'More',exact:true});await more.click();
    await expect(page.getByRole('navigation',{name:'More destinations'}).getByRole('link',{name:'Quests'})).toBeFocused();
    await page.keyboard.press('Escape');await expect(more).toBeFocused();
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    const footprint=await page.evaluate(()=>({main:document.querySelector('main').getBoundingClientRect().bottom,dock:document.querySelector('.destination-dock').getBoundingClientRect().top}));
    expect(footprint.main).toBeLessThanOrEqual(footprint.dock+1);
   }
   await context.close();
  });
 }
}


for(const [label,options] of [['desktop',{viewport:{width:1600,height:1000}}],['mobile',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'}]]){
 test(`destination screenshots ${label}`,async({browser})=>{
  await mkdir('/tmp/reina-destinations-evidence',{recursive:true});
  const context=await browser.newContext(options);const page=await context.newPage();
  for(const route of ['collection','deck-builder','quests','leaderboard','shop','docs','wiki']){
   await page.goto(`http://127.0.0.1:3000/${route}`);await page.evaluate(()=>document.fonts.ready);
   if(route==='deck-builder'){await page.getByRole('button',{name:'NEW DECK',exact:true}).click();await page.getByRole('button',{name:'LOAD STARTER',exact:true}).click();}
   await page.screenshot({path:`/tmp/reina-destinations-evidence/${route}-${label}.png`,fullPage:true});
  }
  await context.close();
 });
}

test('Wiki searches actual Arena catalog separately from visual roster',async({page})=>{
 await page.goto('/wiki');
 await expect(page.getByRole('heading',{name:'Card reference.'})).toBeVisible();
 await page.getByRole('textbox',{name:'Search Arena cards'}).fill('rei');
 await expect(page.locator('.reference-entry')).toHaveCount(1);
 await expect(page.locator('.reference-entry')).toContainText('2200');
 await page.getByRole('textbox',{name:'Search Arena cards'}).fill('missing');
 await expect(page.getByText('No Arena cards match.')).toBeVisible();
 await page.getByRole('button',{name:'VISUAL ROSTER',exact:true}).click();
 await expect(page.getByText('Five artwork profiles. Not Arena inputs.')).toBeVisible();
});

test('Docs documents current local deck contract in shared shell',async({page})=>{
 await page.goto('/docs');
 await expect(page.locator('[data-destination-shell]')).toBeVisible();
 await expect(page.getByRole('heading',{name:'The field manual.'})).toBeVisible();
 await page.getByRole('link',{name:'Saving & recovery',exact:true}).click();
 await expect(page).toHaveURL(/#recovery$/);
 await expect(page.locator('#recovery')).toContainText('another tab');
});

test('Shop is closed without fake transactions',async({page})=>{
 await page.goto('/shop');
 await expect(page.getByRole('heading',{name:'The vault is closed.'})).toBeVisible();
 await expect(page.getByRole('button',{name:/BUY|TOP UP/})).toHaveCount(0);
 await page.getByRole('button',{name:'COSMETICS',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Card backs, not purchases.'})).toBeVisible();
});

test('Leaderboard never presents invented player standings',async({page})=>{
 await page.goto('/leaderboard');
 await expect(page.getByRole('heading',{name:'No standings yet.'})).toBeVisible();
 await expect(page.getByText('Ranked results are not connected.')).toBeVisible();
 await expect(page.getByText('Kaiba99')).toHaveCount(0);
});

test('Quests offers practice paths without fabricated claims',async({page})=>{
 await page.goto('/quests');
 await expect(page.getByRole('heading',{name:'Practice before prizes.'})).toBeVisible();
 await expect(page.getByRole('button',{name:'CLAIM',exact:true})).toHaveCount(0);
 await expect(page.getByText('Quest tracking is not connected.')).toBeVisible();
 await expect(page.getByRole('link',{name:'Prepare a deck'})).toHaveAttribute('href','/deck-builder');
});

test('Deck Builder uses cream worktable and keeps real saved deck controls',async({page})=>{
 await page.goto('/deck-builder');
 await expect(page.locator('.local-builder')).toHaveCSS('background-color','rgb(245, 241, 232)');
 await expect(page.locator('main')).toHaveCount(1);
 await page.getByRole('button',{name:'NEW DECK',exact:true}).click();
 await page.getByRole('button',{name:'LOAD STARTER',exact:true}).click();
 await expect(page.locator('[data-deck-list-item]')).toHaveCount(20);
 await page.getByRole('button',{name:'SAVE DECK',exact:true}).click();
 await page.getByRole('button',{name:'USE SAVED DECK',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Active gameplay deck selected');
});

test('Collection shares lobby navigation and honest roster boundary',async({page})=>{
 await page.goto('/collection');
 await expect(page.locator('[data-destination-shell]')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Collection',exact:true})).toBeVisible();
 await expect(page.getByText('Visual roster, not owned inventory.')).toBeVisible();
 await expect(page.locator('[data-app-sidebar]')).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});
 const more=page.getByRole('button',{name:'More',exact:true});
 await more.click();
 await expect(page.getByRole('navigation',{name:'More destinations'}).getByRole('link',{name:'Quests'})).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(more).toBeFocused();
 await expect(more).toHaveAttribute('aria-expanded','false');
 await page.getByRole('button',{name:'Profile',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('No account profile is connected');
 await page.keyboard.press('Escape');
});
