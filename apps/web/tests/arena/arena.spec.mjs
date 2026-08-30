import {expect,test} from '@playwright/test';

const enterDuel=async(page,fixture='final-draw')=>{
 await page.goto(`/arena?arenaFixture=${fixture}`);
 await page.getByRole('button',{name:/RANKED/}).click();
 await page.getByRole('button',{name:'ENTER DUEL'}).click();
};

test('dashboard to Arena uses a loading fade before route content appears',async({page})=>{
 await page.goto('/dashboard');
 await page.getByRole('link',{name:'Arena'}).click();
 await expect(page.getByRole('status',{name:'Entering Arena'})).toBeVisible();
 await expect(page).toHaveURL(/\/arena$/);
 await expect(page.getByRole('heading',{name:'Choose your fight'})).toBeVisible();
 await expect(page.locator('.arena-route-enter')).toHaveCount(1);
});

test('matchmaking starts only after selecting a duel category',async({page})=>{
 await page.goto('/arena');
 await expect(page.getByRole('heading',{name:'Choose your fight'})).toBeVisible();
 await expect(page.locator('.matchmaking-nav')).toHaveCount(1);
 await expect(page.locator('.matchmaking-brand')).toContainText('REINA');
 await expect(page.locator('.matchmaking-region')).toContainText('ASIA PACIFIC');
 await expect(page.locator('.matchmaking-region')).toContainText('38 MS');
 await expect(page.locator('.matchmaking-nav')).not.toContainText('/');
 await expect(page.getByText('Searching the courtyard')).toHaveCount(0);
 await expect(page.locator('.match-mode,.duel-ledger')).toHaveCount(0);
 await expect(page.locator('.match-ruleset')).toHaveCount(3);
 await expect(page.locator('.match-ruleset')).toContainText(['CASUAL','RANKED','EVENT']);
 await expect(page.locator('.matchmaking-composition')).toHaveCSS('background-color','rgb(13, 11, 16)');
 await expect(page.locator('.matchmaking-signal')).toHaveCSS('background-color','rgb(224, 60, 78)');
 const headingFont=await page.getByRole('heading',{name:'Choose your fight'}).evaluate(node=>getComputedStyle(node).fontFamily);
 const modeFont=await page.getByRole('button',{name:/CASUAL/}).locator('.ruleset-copy b').evaluate(node=>getComputedStyle(node).fontFamily);
 expect(headingFont).toContain('Zen Old Mincho');
 expect(modeFont).toContain('Zen Kaku Gothic New');
 expect(modeFont).not.toBe(headingFont);
 await page.getByRole('button',{name:/CASUAL/}).click();
 await expect(page.getByRole('heading',{name:/Searching the courtyard|Duelist found/})).toBeVisible();
 await expect(page.locator('.queue-orbit')).toHaveCount(0);
 await expect(page.locator('.match-loader')).toHaveAttribute('src','/arena/loading/tail-spin.svg');
 await expect(page.locator('.matchmaking-brand')).toContainText('CASUAL DUEL');
});

test('ruleset hover moves its surface and text while reduced motion stays still',async({page})=>{
 await page.goto('/arena');
 const casual=page.getByRole('button',{name:/CASUAL/});
 const title=casual.locator('.ruleset-copy b');
 await casual.hover();
 await page.waitForTimeout(180);
 expect(await casual.evaluate(node=>getComputedStyle(node).transform)).not.toBe('none');
 expect(await title.evaluate(node=>getComputedStyle(node).transform)).not.toBe('none');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 const reducedCasual=page.getByRole('button',{name:/CASUAL/});
 await reducedCasual.hover();
 await page.waitForTimeout(180);
 expect(await reducedCasual.evaluate(node=>getComputedStyle(node).transform)).toBe('none');
});

test('found opponent shows complete profile without clipping',async({page})=>{
 await page.goto('/arena?arenaFixture=matchmaking');
 await page.getByRole('button',{name:/RANKED/}).click();
 await expect(page.getByRole('heading',{name:'SILENTINDEX'})).toBeVisible();
 await expect(page.getByText('DIAMOND II / 2,510 MMR')).toBeVisible();
 await expect(page.getByText('CONTROL / SENTINEL')).toBeVisible();
 await expect(page.getByText('53% WR')).toBeVisible();
 await expect(page.getByText('128 DUELS')).toBeVisible();
 const readyLabels=page.getByText('READY',{exact:true});
 await expect(readyLabels).toHaveCount(2);
 for(const ready of await readyLabels.all()){
  const readyBox=await ready.boundingBox();
  const parentBox=await ready.locator('..').boundingBox();
  expect(readyBox).not.toBeNull();
  expect(parentBox).not.toBeNull();
  expect(readyBox.x).toBeGreaterThanOrEqual(parentBox.x-.5);
  expect(readyBox.x+readyBox.width).toBeLessThanOrEqual(parentBox.x+parentBox.width+.5);
  expect(readyBox.y).toBeGreaterThanOrEqual(parentBox.y-.5);
  expect(readyBox.y+readyBox.height).toBeLessThanOrEqual(parentBox.y+parentBox.height+.5);
 }
 const profile=page.locator('.match-duelist');
 const box=await profile.boundingBox();
 const navBox=await page.locator('.matchmaking-nav').boundingBox();
 const viewport=page.viewportSize();
 expect(box).not.toBeNull();
 expect(navBox).not.toBeNull();
 expect(box.y).toBeGreaterThanOrEqual(navBox.y+navBox.height);
 expect(box.x).toBeGreaterThanOrEqual(0);
 expect(box.x+box.width).toBeLessThanOrEqual(viewport.width);
 expect(await profile.evaluate(node=>node.scrollWidth<=node.clientWidth&&node.scrollHeight<=node.clientHeight)).toBe(true);
});

test('duel controls use one command rail and card inspect stays inside viewport',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 await expect(page.locator('.arena-duel-nav')).toHaveCount(1);
 const navCentering=await page.locator('.arena-duel-nav').evaluate(nav=>{
  const identity=nav.querySelector('.duel-identity').getBoundingClientRect(),box=nav.getBoundingClientRect();
  return Math.abs(identity.x+identity.width/2-(box.x+box.width/2));
 });
 expect(navCentering).toBeLessThanOrEqual(.5);
 await expect(page.locator('.arena .game-topbar,.arena .arena-header')).toHaveCount(0);
 await expect(page.locator('.resource-strip')).toHaveCount(1);
 await expect(page.locator('.resource-strip>span')).toHaveCount(4);
 const allowanceNotation=await page.locator('.resource-strip').evaluate(node=>{
  const style=getComputedStyle(node),signal=getComputedStyle(node,'::before');
  const items=[...node.children].map(item=>{const itemStyle=getComputedStyle(item),box=item.getBoundingClientRect();return{display:itemStyle.display,background:itemStyle.backgroundColor,borders:[itemStyle.borderTopWidth,itemStyle.borderRightWidth,itemStyle.borderBottomWidth,itemStyle.borderLeftWidth],x:box.x,right:box.right}});
  return{display:style.display,background:style.backgroundColor,borders:[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth],signalDisplay:signal.display,signalWidth:Number.parseFloat(signal.width),items};
 });
 expect(allowanceNotation.display).toBe('flex');
 expect(allowanceNotation.background).toBe('rgba(0, 0, 0, 0)');
 expect(allowanceNotation.borders.every(width=>width==='0px')).toBe(true);
 expect(allowanceNotation.signalDisplay).toBe('block');
 expect(allowanceNotation.signalWidth).toBeLessThanOrEqual(48);
 expect(allowanceNotation.items.every(item=>item.display==='flex'&&item.background==='rgba(0, 0, 0, 0)'&&item.borders.every(width=>width==='0px'))).toBe(true);
 expect(allowanceNotation.items[3].x).toBeGreaterThan(allowanceNotation.items[2].right);
 expect(await page.locator('.board').evaluate(node=>getComputedStyle(node,'::before').display)).toBe('none');
 await expect(page.locator('.reina-seal')).toHaveCount(0);
 await expect(page.locator('.gameplay-information')).toHaveCount(1);
 await expect(page.locator('.duelist-information')).toHaveCount(2);
 await expect(page.locator('.duelist-information.enemy')).toContainText('SILENTINDEX');
 await expect(page.locator('.duelist-information:not(.enemy)')).toContainText('REINA');
 await expect(page.locator('.duelist-information')).toContainText(['LP 4000','LP 4000']);
 const duelistRails=await page.locator('.duelist-information').evaluateAll(nodes=>nodes.map(node=>{
  const style=getComputedStyle(node),signal=getComputedStyle(node,'::before'),box=node.getBoundingClientRect();
  return {width:box.width,height:box.height,background:style.backgroundColor,borders:[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth],signalDisplay:signal.display,signalWidth:Number.parseFloat(signal.width),after:getComputedStyle(node,'::after').display};
 }));
 expect(Math.abs(duelistRails[0].width-duelistRails[1].width)).toBeLessThanOrEqual(.5);
 expect(Math.abs(duelistRails[0].height-duelistRails[1].height)).toBeLessThanOrEqual(.5);
 expect(duelistRails.every(rail=>rail.background==='rgba(0, 0, 0, 0)'&&rail.borders.every(width=>width==='0px')&&rail.signalDisplay==='block'&&rail.signalWidth<=56&&rail.after==='none')).toBe(true);
 for(const rail of await page.locator('.duelist-information').all()){
  const telemetry=rail.locator('dl');
  await expect(telemetry.locator('dt')).toHaveText(['DECK','HAND','FIELD','GRAVE','TOTAL']);
  expect(await telemetry.evaluate(node=>getComputedStyle(node).display)).toBe('flex');
  const cells=await telemetry.locator('div').evaluateAll(nodes=>nodes.map(node=>({display:getComputedStyle(node).display,textAlign:getComputedStyle(node).textAlign,borderRight:getComputedStyle(node).borderRightWidth})));
  expect(cells.every(cell=>cell.display==='flex'&&cell.textAlign==='left'&&cell.borderRight==='0px')).toBe(true);
 }
 const gameplayText=page.locator('.gameplay-information strong');
 await expect(gameplayText).toBeVisible();
 expect(Number.parseFloat(await gameplayText.evaluate(node=>getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(12);
 await expect(page.locator('.commands')).toContainText('ENTER BATTLE');
 await expect(page.locator('.commands')).toContainText('END TURN');
 await page.locator('.hand .card').first().click();
 await expect(page.locator('.inspect')).toHaveClass(/has-card/);
 await expect(page.locator('.inspect')).toContainText('CARD INSPECT');
 const viewport=page.viewportSize();
 for(const selector of ['.inspect','.commands','.resource-strip','.hand']){
  const box=await page.locator(selector).boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x+box.width).toBeLessThanOrEqual(viewport.width+.5);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y+box.height).toBeLessThanOrEqual(viewport.height+.5);
 }
 const commandBox=await page.locator('.commands').boundingBox();
 const handBox=await page.locator('.hand').boundingBox();
 const inspectBox=await page.locator('.inspect').boundingBox();
 const playerStatsBox=await page.locator('.stats:not(.enemy)').boundingBox();
 const enemyStatsBox=await page.locator('.duelist-information.enemy').boundingBox();
 const gameplayBox=await page.locator('.gameplay-information').boundingBox();
 const supportBoxes=await page.locator('.support-zone').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 expect(commandBox.x).toBeGreaterThanOrEqual(handBox.x+handBox.width);
 expect(inspectBox.y).toBeGreaterThanOrEqual(playerStatsBox.y+playerStatsBox.height);
 expect(overlaps(enemyStatsBox,supportBoxes[0])).toBe(false);
 expect(supportBoxes.every(box=>!overlaps(gameplayBox,box))).toBe(true);
});

test('tall viewport keeps opponent and gameplay rails clear of support rows',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await enterDuel(page);
 const enemyBox=await page.locator('.duelist-information.enemy').boundingBox();
 const gameplayBox=await page.locator('.gameplay-information').boundingBox();
 const supportBoxes=await page.locator('.support-zone').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 expect(supportBoxes.every(box=>!overlaps(enemyBox,box))).toBe(true);
 expect(supportBoxes.every(box=>!overlaps(gameplayBox,box))).toBe(true);
 expect(enemyBox.height).toBeLessThanOrEqual(160);
});

test('player support card matches opponent support presentation and turn two commands remain readable',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 const supportCard=page.locator('.hand .card').filter({hasText:'CRIMSON SURGE'}).first();
 await supportCard.focus();
 await supportCard.press('Enter');
 await page.getByRole('button',{name:'SET SUPPORT'}).click();
 const playerCard=page.locator('.support-zone:not(.enemy-zone) .card').first();
 await expect(playerCard).toBeVisible();
 await page.evaluate(()=>{const source=document.querySelector('.support-zone:not(.enemy-zone) .card'),slot=document.querySelector('.support-zone.enemy-zone .slot');slot.append(source.cloneNode(true))});
 const opponentCard=page.locator('.support-zone.enemy-zone .card').first();
 await expect(opponentCard).toBeVisible();
 const presentation=async card=>card.evaluate(node=>{const style=getComputedStyle(node);return{width:node.offsetWidth,height:node.offsetHeight,position:style.position,art:Boolean(node.querySelector('.card-art')),rarity:Boolean(node.querySelector('small')),name:Boolean(node.querySelector('strong')),label:Boolean(node.querySelector('em'))}});
 const playerPresentation=await presentation(playerCard);
 const opponentPresentation=await presentation(opponentCard);
 expect(playerPresentation).toEqual(opponentPresentation);
 expect(playerPresentation.height/playerPresentation.width).toBeGreaterThanOrEqual(1.35);
 expect(playerPresentation.position).not.toBe('absolute');
 expect(playerPresentation).toMatchObject({art:true,rarity:true,name:true,label:true});
 const contained=await playerCard.evaluate(node=>{const box=node.getBoundingClientRect(),slot=node.parentElement.getBoundingClientRect();return box.left>=slot.left-.5&&box.right<=slot.right+.5&&box.top>=slot.top-.5&&box.bottom<=slot.bottom+.5});
 expect(contained).toBe(true);
 await page.getByRole('button',{name:/ENTER BATTLE/}).click();
 await page.getByRole('button',{name:/END TURN/}).click();
 await expect(page.locator('.duel-state')).toContainText('2');
 for(const button of await page.locator('.commands button').all()){
  const box=await button.boundingBox();
  const metrics=await button.evaluate(node=>({fontSize:Number.parseFloat(getComputedStyle(node).fontSize),fits:node.scrollWidth<=node.clientWidth&&node.scrollHeight<=node.clientHeight}));
  expect(box.height).toBeGreaterThanOrEqual(40);
  expect(metrics.fontSize).toBeGreaterThanOrEqual(10);
  expect(metrics.fits).toBe(true);
 }
});

test('mobile hand remains clickable and controls follow board flow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await enterDuel(page);
 const mobileNavCentering=await page.locator('.arena-duel-nav').evaluate(nav=>{
  const identity=nav.querySelector('.duel-identity').getBoundingClientRect(),box=nav.getBoundingClientRect();
  return Math.abs(identity.x+identity.width/2-(box.x+box.width/2));
 });
 expect(mobileNavCentering).toBeLessThanOrEqual(.5);
 await page.locator('.hand .card').first().click();
 await expect(page.locator('.inspect')).toHaveClass(/has-card/);
 const handBox=await page.locator('.hand').boundingBox();
 const inspectBox=await page.locator('.inspect').boundingBox();
 const commandsBox=await page.locator('.commands').boundingBox();
 expect(inspectBox.y).toBeGreaterThanOrEqual(handBox.y+handBox.height);
 expect(commandsBox.y).toBeGreaterThanOrEqual(inspectBox.y+inspectBox.height);
});

test('opening hand draws automatically exactly once',async({page})=>{
 await enterDuel(page);
 await expect(page.locator('.phase-label')).toHaveText('MAIN PHASE');
 await expect(page.locator('.hand .card')).toHaveCount(6);
 await expect(page.locator('.stats:not(.enemy) dl dd').nth(0)).toHaveText('0');
 await page.waitForTimeout(500);
 await expect(page.locator('.hand .card')).toHaveCount(6);
});

test('empty deck resolves once and stops turn progression',async({page})=>{
 await enterDuel(page,'deck-out');
 await expect(page.getByRole('dialog')).toContainText('SILENTINDEX wins');
 await expect(page.locator('.duel-state')).toContainText('TURN1');
 await page.waitForTimeout(1500);
 await expect(page.getByRole('dialog')).toHaveCount(1);
 await expect(page.locator('.duel-state')).toContainText('TURN1');
});

test('rematch clears terminal state and resumes automatic draw',async({page})=>{
 await enterDuel(page,'deck-out');
 await page.getByRole('button',{name:'REMATCH'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.phase-label')).toHaveText('MAIN PHASE');
 await expect(page.locator('.hand .card')).toHaveCount(6);
 await expect(page.locator('.duel-state')).toContainText('TURN1');
});