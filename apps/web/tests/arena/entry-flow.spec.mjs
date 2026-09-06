import {expect,test} from '@playwright/test';

test('duel entry is single initialization and focuses actionable frame',async({page})=>{
 await page.goto('/arena?arenaFixture=matchmaking');
 await page.getByRole('button',{name:/CASUAL/}).click();
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).evaluate(button=>{button.click();button.click()});
 await expect(page.locator('.hand .card')).toHaveCount(6);
 await expect(page.locator('.duel')).toHaveAttribute('data-entry-ready','true');
 await expect(page.getByRole('button',{name:'ENTER BATTLE',exact:true})).toBeFocused();
});

test('cancel invalidates pending opponent reveal',async({page})=>{
 await page.goto('/arena');
 await page.getByRole('button',{name:/CASUAL/}).click();
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();
 await page.getByRole('button',{name:'CANCEL',exact:true}).click();
 await page.waitForTimeout(4400);
 await expect(page.getByRole('heading',{name:'Choose your fight'})).toBeVisible();
 await expect(page.getByRole('button',{name:'ENTER DUEL',exact:true})).toHaveCount(0);
});

test('mode selection requires explicit queue commitment',async({page})=>{
 await page.goto('/arena');
 await page.getByRole('button',{name:/CASUAL/}).click();
 await expect(page.getByRole('button',{name:'START DEMO MATCH'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Choose your fight'})).toBeVisible();
 await expect(page.getByRole('button',{name:/CASUAL/})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();
 await expect(page.getByRole('heading',{name:'Searching the courtyard'})).toBeVisible();
 await expect(page.getByText('Simulated matchmaking · no live players')).toBeVisible();
});

test('dashboard primary entry preserves link and gives pending feedback',async({page})=>{
 await page.goto('/dashboard');
 const link=page.getByRole('link',{name:'ENTER ARENA',exact:true});
 await expect(link).toHaveAttribute('href','/arena');
 await link.click();
 await expect(page.getByRole('heading',{name:'Choose your fight'})).toBeVisible();
 await expect(page.locator('.threshold')).toHaveAttribute('data-entry-state','category');
});

test('mute preference survives reload',async({page})=>{
 await page.goto('/arena');
 await page.getByRole('button',{name:'Mute sound'}).click();
 await page.reload();
 await expect(page.getByRole('button',{name:'Enable sound'})).toBeVisible();
});

for(const [width,height] of [[360,800],[390,844],[430,932],[844,390],[820,1180],[1024,768],[1280,720],[1366,768],[1536,864],[1920,1080],[2560,1440],[3440,1440]])test(`entry ${width}x${height} keeps mode and action within viewport`,async({page})=>{
 await page.setViewportSize({width,height});
 await page.goto('/arena?arenaFixture=matchmaking');
 await page.getByRole('button',{name:/CASUAL/}).click();
 for(const node of await page.locator('.threshold-mode,.threshold-primary').all()){
  const box=await node.boundingBox();expect(box.width).toBeGreaterThan(44);expect(box.height).toBeGreaterThanOrEqual(44);expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
 }
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();
 await expect(page.getByRole('heading',{name:'SILENTINDEX'})).toBeVisible();
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();
 await expect(page.locator('.hand .card')).toHaveCount(6);
});

test('failed decorative image and audio cannot block keyboard entry',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/arena/card-field.webp',route=>route.abort());
 await page.route('**/arena/audio/**',route=>route.abort());
 await page.goto('/arena?arenaFixture=matchmaking');
 const mode=page.getByRole('button',{name:/CASUAL/});await mode.focus();await page.keyboard.press('Enter');
 const start=page.getByRole('button',{name:'START DEMO MATCH'});await start.focus();await page.keyboard.press('Enter');
 const enter=page.getByRole('button',{name:'ENTER DUEL',exact:true});await expect(enter).toBeFocused();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'ENTER BATTLE',exact:true})).toBeFocused();
});
