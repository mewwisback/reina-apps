import {expect,test} from '@playwright/test';

const directions=[
 ['crimson-courtyard','Crimson Courtyard'],
 ['tactical-table','Tactical War Table'],
 ['arcane-chamber','Arcane Duel Chamber'],
];

for(const [slug,title] of directions){
 test(`${title} exposes one playable battlefield fixture`,async({page})=>{
  await page.goto(`/arena-lab/${slug}`);
  await expect(page.getByRole('heading',{name:title})).toBeVisible();
  await expect(page.locator('[data-arena-direction]')).toHaveAttribute('data-arena-direction',slug);
  await expect(page.getByRole('status')).toContainText('Main phase');
  await expect(page.getByLabel('Player hand')).toBeVisible();
  await expect(page.getByLabel('Player deck')).toBeVisible();
  await expect(page.getByLabel('Player grave')).toBeVisible();
  await expect(page.getByLabel('Player hero line')).toBeVisible();
  await expect(page.getByLabel('Player support row')).toBeVisible();
  await page.getByRole('button',{name:/Select Rei Zero/}).click();
  await expect(page.getByRole('status')).toContainText('Choose a hero slot');
  await expect(page.getByRole('button',{name:'Summon Rei Zero to hero slot 1'})).toBeVisible();
  await page.getByRole('button',{name:'Summon Rei Zero to hero slot 1'}).click();
  await expect(page.getByRole('status')).toContainText('Rei Zero summoned');
  await expect(page.getByLabel('Player hero line')).toContainText('REI ZERO');
 });
}

test('prototype battlefield stays contained and exposes focus at desktop and mobile',async({page})=>{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  await page.goto('/arena-lab/tactical-table');
  const surface=page.locator('[data-arena-direction]');
  const box=await surface.boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x+box.width).toBeLessThanOrEqual(viewport.width+.5);
  await page.getByRole('button',{name:/Select Rei Zero/}).focus();
  expect(await page.getByRole('button',{name:/Select Rei Zero/}).evaluate(node=>getComputedStyle(node).outlineStyle)).not.toBe('none');
 }
});

test('reduced motion removes prototype transitions without removing state feedback',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/arena-lab/arcane-chamber');
 const motion=await page.locator('[data-motion-surface]').evaluateAll(nodes=>nodes.map(node=>({transition:getComputedStyle(node).transitionDuration,animation:getComputedStyle(node).animationDuration})));
 expect(motion.every(item=>item.transition==='0s'&&item.animation==='0s')).toBe(true);
 await page.getByRole('button',{name:/Select Rei Zero/}).click();
 await expect(page.getByRole('status')).toContainText('Choose a hero slot');
});

test('production Arena uses ritual matchmaking and physical battlefield semantics',async({page})=>{
 await page.goto('/arena?arenaFixture=final-draw');
 await expect(page.locator('[data-matchmaking-ritual]')).toHaveAttribute('data-matchmaking-ritual','category');
 await expect(page.locator('[data-ritual-step]')).toHaveText(['CHOOSE','SEARCH','REVEAL','DUEL']);
 await page.getByRole('button',{name:/RANKED/}).click();
 await expect(page.locator('[data-matchmaking-ritual]')).toHaveAttribute('data-matchmaking-ritual',/search|found/);
 await page.getByRole('button',{name:'ENTER DUEL'}).click();
 await expect(page.locator('[data-battlefield-system]')).toHaveAttribute('data-battlefield-system','tactical-table');
 await expect(page.getByLabel('Opponent support row')).toBeVisible();
 await expect(page.getByLabel('Opponent hero line')).toBeVisible();
 await expect(page.getByLabel('Player hero line')).toBeVisible();
 await expect(page.getByLabel('Player support row')).toBeVisible();
 await expect(page.getByLabel('Player hand')).toBeVisible();
});

test('production card selection couples command and legal board targets',async({page})=>{
 await page.goto('/arena?arenaFixture=final-draw');
 await page.getByRole('button',{name:/RANKED/}).click();
 await page.getByRole('button',{name:'ENTER DUEL'}).click();
 const hero=page.getByRole('button',{name:/Select YURI/}).first();
 await hero.focus();
 expect(await hero.evaluate(node=>getComputedStyle(node).outlineStyle)).not.toBe('none');
 await hero.press('Enter');
 await expect(page.locator('.inspect')).toHaveClass(/has-card/);
 await page.getByRole('button',{name:'SUMMON'}).click();
 await expect(page.getByLabel('Player hero line').locator('[role="button"]')).toHaveCount(5);
 await expect(page.getByRole('status')).toContainText('Choose an illuminated front slot');
 const target=page.getByRole('button',{name:'Empty slot 1'});
 await target.focus();
 expect(await target.evaluate(node=>getComputedStyle(node).outlineStyle)).not.toBe('none');
 await target.press('Enter');
 await expect(page.getByLabel('Player hero line')).toContainText('YURI');
 await expect(page.getByRole('status')).toContainText('summoned');
});

test('production battlefield contains board and isolates hand overflow across target viewports',async({page})=>{
 for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1280,height:720},{width:1440,height:900}]){
  await page.setViewportSize(viewport);
  await page.goto('/arena?arenaFixture=final-draw');
  await page.getByRole('button',{name:/RANKED/}).click();
  await page.getByRole('button',{name:'ENTER DUEL'}).click();
  const board=await page.locator('.board').boundingBox();
  expect(board).not.toBeNull();
  expect(board.x).toBeGreaterThanOrEqual(0);
  expect(board.x+board.width).toBeLessThanOrEqual(viewport.width+.5);
  expect(await page.locator('html').evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  const hand=page.getByLabel('Player hand');
  expect(await hand.evaluate(node=>getComputedStyle(node).overflowX)).toMatch(/auto|scroll|visible/);
 }
});

for(const [slug] of directions){
 test(`${slug} uses anchored open HUD instead of floating dashboard panels`,async({page})=>{
  await page.goto(`/arena-lab/${slug}`);
  const hud=await page.locator('[data-hud-anchor]:not(.physical-pile)').evaluateAll(nodes=>nodes.map(node=>{
   const style=getComputedStyle(node);
   return {background:style.backgroundColor,borders:[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth],position:style.position};
  }));
  expect(hud.length).toBeGreaterThanOrEqual(4);
  expect(hud.every(item=>item.background==='rgba(0, 0, 0, 0)'&&item.borders.every(width=>width==='0px'))).toBe(true);
  await expect(page.locator('.dashboard-card,.floating-panel,.telemetry-grid')).toHaveCount(0);
 });
}
