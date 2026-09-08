import {expect,test,devices} from '@playwright/test';
const key = 'reina-decks-v1';
async function enter(page, fixture='dense') {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto(`/arena?arenaFixture=${fixture}`);
  await page.getByRole('button',{name:/CASUAL/}).click();
  await page.getByRole('button',{name:'START DEMO MATCH'}).click();
  await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();
}
test('duel takes saved snapshot; rematch rereads validated active selection',async({page})=>{
  await custom(page);
  await page.getByRole('button',{name:'USE SAVED DECK',exact:true}).click();
  await enter(page,'deck-out');
  await expect(page.locator('.hand .card')).toHaveCount(5);
  await expect(page.locator('.hand .card strong')).toHaveText(Array(5).fill('YURI SCOUT'));
  await page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key)); x.decks[0].cardIds=Array(20).fill('tari'); localStorage.setItem(key,JSON.stringify(x));},key);
  await expect(page.locator('.hand .card strong')).toHaveText(Array(5).fill('YURI SCOUT'));
  await page.getByRole('button',{name:'REMATCH',exact:true}).click();
  await expect(page.locator('.hand .card strong')).toHaveText(Array(6).fill('TARI GUARD'));
  await expect(page.locator('.stats:not(.enemy) dl dd').nth(4)).toHaveText('20');
});
test('corrupt storage falls back honestly at duel acceptance',async({page})=>{
  await page.goto('/dashboard'); await page.evaluate(key=>localStorage.setItem(key,'{bad'),key);
  await enter(page);
  await expect(page.locator('[data-duel-deck]')).toContainText('Arena starter');
  await expect(page.locator('[data-duel-deck]')).toContainText('corrupt');
  await expect(page.locator('.hand .card')).toHaveCount(6);
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe('{bad');
});
test('storage write failure keeps unsaved editor and prior bytes',async({page})=>{
  await custom(page);
  const raw=await page.evaluate(key=>localStorage.getItem(key),key);
  await page.getByLabel('Deck name',{exact:true}).fill('Keep this draft');
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};});
  await page.getByRole('button',{name:'SAVE DECK',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('write failed');
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Keep this draft');
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(raw);
  await expect(page.getByRole('button',{name:'USE SAVED DECK',exact:true})).toBeDisabled();
});
test('corrupt builder preserves bytes until explicit reset confirmation',async({page})=>{
  await page.goto('/dashboard'); await page.evaluate(key=>localStorage.setItem(key,'{bad'),key);
  await page.goto('/deck-builder');
  await expect(page.getByRole('region',{name:'Storage recovery'})).toBeVisible();
  await expect(page.getByRole('button',{name:'NEW DECK',exact:true})).toBeDisabled();
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('button',{name:'RESET LOCAL LIBRARY',exact:true}).click();
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe('{bad');
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'RESET LOCAL LIBRARY',exact:true}).click();
  await expect(page.getByRole('button',{name:'NEW DECK',exact:true})).toBeEnabled();
});
for(const mobile of [false,true]) test(`deck integration evidence ${mobile?'mobile':'desktop'}`,async({browser})=>{
  const context=await browser.newContext(mobile?devices['iPhone 13']:{viewport:{width:1600,height:900}});
  const page=await context.newPage();
  await custom(page); await page.getByRole('button',{name:'USE SAVED DECK',exact:true}).click();
  const label=mobile?'mobile':'desktop';
  await page.screenshot({path:`/tmp/reina-decks-${label}-builder.png`,fullPage:true});
  await page.goto('/dashboard');
  await expect(page.getByRole('region',{name:'Active gameplay deck'})).toContainText('Scout twenty');
  await page.screenshot({path:`/tmp/reina-decks-${label}-dashboard.png`,fullPage:true});
  await enter(page);
  await expect(page.locator('.hand .card strong')).toHaveText(Array(6).fill('YURI SCOUT'));
  await page.screenshot({path:`/tmp/reina-decks-${label}-arena.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await context.close();
});
test('storage event cannot rebase stale editor over another tab',async({page,context})=>{
  await custom(page);
  const other=await context.newPage(); await other.goto('/deck-builder');
  await page.getByLabel('Deck name',{exact:true}).fill('Tab A draft');
  await page.evaluate(()=>{window.deckStorageEvents=0; window.addEventListener('storage',()=>window.deckStorageEvents++);});
  await other.getByLabel('Deck name',{exact:true}).fill('Tab B saved');
  await other.getByRole('button',{name:'SAVE DECK',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>window.deckStorageEvents)).toBeGreaterThan(0);
  await expect(page.getByRole('navigation',{name:'Saved local decks'})).toContainText('Tab B saved');
  await page.getByRole('button',{name:'SAVE DECK',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('changed in another tab');
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Tab A draft');
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).decks[0].name,key)).toBe('Tab B saved');
  page.once('dialog',dialog=>dialog.dismiss()); await page.getByRole('button',{name:'RELOAD SAVED DECKS',exact:true}).click();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Tab A draft');
  page.once('dialog',dialog=>dialog.accept()); await page.getByRole('button',{name:'RELOAD SAVED DECKS',exact:true}).click();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Tab B saved');
});
test('internal link and history return recover draft until explicit discard',async({page})=>{
  await custom(page); await page.getByLabel('Deck name',{exact:true}).fill('Recover me');
  await page.getByRole('link',{name:'Back to dashboard',exact:true}).click();
  await expect(page).toHaveURL(/dashboard/); await page.goBack();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Recover me');
  await expect(page.getByRole('button',{name:'USE SAVED DECK',exact:true})).toBeDisabled();
  await page.locator('a[href="/arena"]').first().click();
  await expect(page).toHaveURL(/arena/); await page.goBack();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Recover me');
  await page.goForward(); await expect(page).toHaveURL(/arena/); await page.goBack();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Recover me');
  page.once('dialog',dialog=>dialog.accept()); await page.getByRole('button',{name:'RELOAD SAVED DECKS',exact:true}).click();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Scout twenty');
});
test('shortening active deck clears selection and read failure recovers',async({page})=>{
  await custom(page); await page.getByRole('button',{name:'USE SAVED DECK',exact:true}).click();
  await page.getByRole('button',{name:'Remove YURI SCOUT, card 1',exact:true}).click();
  await page.getByRole('button',{name:'SAVE DECK',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Active selection cleared');
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).activeId,key)).toBeNull();
  await page.evaluate(()=>{window.originalGetItem=Storage.prototype.getItem; Storage.prototype.getItem=()=>{throw Error('blocked');};});
  await page.getByRole('button',{name:'RELOAD SAVED DECKS',exact:true}).click();
  await expect(page.getByRole('region',{name:'Storage recovery'})).toContainText('unavailable');
  await page.evaluate(()=>{Storage.prototype.getItem=window.originalGetItem;});
  await page.getByRole('button',{name:'RELOAD SAVED DECKS',exact:true}).click();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Scout twenty');
  await expect(page.locator('[data-deck-list-item]')).toHaveCount(19);
  await page.getByRole('link',{name:'Back to dashboard',exact:true}).click();
  await expect(page.getByRole('region',{name:'Active gameplay deck'})).toContainText('Arena starter');
});
async function custom(page) {
  await page.goto('/deck-builder');
  await page.getByRole('button',{name:'NEW DECK',exact:true}).click();
  await page.getByLabel('Deck name',{exact:true}).fill('Scout twenty');
  for(let i=0;i<20;i++) await page.getByRole('button',{name:'Add YURI SCOUT',exact:true}).click();
  await page.getByRole('button',{name:'SAVE DECK',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Saved');
}
test('create save refresh edit activate and dashboard preserves visual roster',async({page})=>{
  await custom(page); await page.reload();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Scout twenty');
  await expect(page.locator('[data-deck-list-item]')).toHaveCount(20);
  await page.getByRole('button',{name:'Remove YURI SCOUT, card 1',exact:true}).click();
  await page.getByRole('button',{name:'Add TARI GUARD',exact:true}).click();
  await page.getByRole('button',{name:'SAVE DECK',exact:true}).click();
  await page.getByRole('button',{name:'USE SAVED DECK',exact:true}).click();
  await page.goto('/dashboard');
  await expect(page.getByRole('region',{name:'Active gameplay deck'})).toContainText('Scout twenty');
  await expect(page.getByRole('region',{name:'Active gameplay deck'})).toContainText('20 cards');
  await expect(page.locator('[data-front]')).toHaveCount(5);
  await page.getByRole('button',{name:'Select HAKU',exact:true}).click();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).activeId,key)).toBeTruthy();
});
