import {readFile} from 'node:fs/promises';
import {expect,test} from '@playwright/test';

const arenaSourceUrl=new URL('../../src/app/arena/page.tsx',import.meta.url);
const arenaCssUrl=new URL('../../src/app/arena/arena.css',import.meta.url);
const rootLayoutUrl=new URL('../../src/app/layout.tsx',import.meta.url);

test('production fonts are local and require no build-time network access',async()=>{
 const layout=await readFile(rootLayoutUrl,'utf8');
 expect(layout).not.toContain('next/font/google');
 expect(layout).toContain('next/font/local');
 const fontPaths=[...layout.matchAll(/src:\s*['"]([^'"]+\.woff2)['"]/g)].map(([,path])=>new URL(`../../src/app/${path.replace(/^\.\//,'')}`,import.meta.url));
 expect(fontPaths.length).toBeGreaterThanOrEqual(3);
 await expect(Promise.all(fontPaths.map(path=>readFile(path)))).resolves.toHaveLength(fontPaths.length);
});

test('Arena owns one consolidated stylesheet with bounded cascade overrides',async()=>{
 const [source,css]=await Promise.all([
  readFile(arenaSourceUrl,'utf8'),
  readFile(arenaCssUrl,'utf8'),
 ]);
 const imports=[...source.matchAll(/import ['"]\.\/arena[^'"]*\.css['"]/g)];
 expect(imports).toHaveLength(1);
 expect(imports[0][0]).toContain("./arena.css");
 expect((css.match(/!important/g)??[]).length).toBeLessThanOrEqual(1197);
});

const enterDuel=async(page,fixture='final-draw')=>{
 await page.goto(`/arena?arenaFixture=${fixture}`);
 await page.getByRole('button',{name:/RANKED/}).click();
 await page.getByRole('button',{name:'ENTER DUEL'}).click();
};

test('dashboard to Arena uses a loading fade before route content appears',async({page})=>{
 await page.goto('/dashboard');
 await page.getByRole('link',{name:'Arena',exact:true}).click();
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
 const allowanceItems=await page.locator('.resource-strip>span').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 expect(allowanceItems).toHaveLength(4);
 const allowanceOverlap=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
 expect(allowanceItems.every((item,index)=>allowanceItems.every((other,otherIndex)=>index===otherIndex||!allowanceOverlap(item,other)))).toBe(true);
 expect(new Set(allowanceItems.map(item=>Math.round(item.x))).size).toBe(2);
 expect(new Set(allowanceItems.map(item=>Math.round(item.y))).size).toBe(2);
 expect(await page.locator('.board').evaluate(node=>getComputedStyle(node,'::before').display)).toBe('none');
 await expect(page.locator('.reina-seal')).toHaveCount(0);
 await expect(page.locator('.gameplay-information')).toHaveCount(0);
 await expect(page.locator('.commands [role="status"]')).toBeVisible();
 await expect(page.locator('.duelist-information')).toHaveCount(2);
 await expect(page.locator('.duelist-information.enemy')).toContainText('SILENTINDEX');
 await expect(page.locator('.duelist-information:not(.enemy)')).toContainText('REINA');
 await expect(page.locator('.duelist-information')).toContainText(['LP 4000','LP 4000']);
 const duelistRails=await page.locator('.duelist-information').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 expect(Math.abs(duelistRails[0].width-duelistRails[1].width)).toBeLessThanOrEqual(.5);
 expect(Math.abs(duelistRails[0].height-duelistRails[1].height)).toBeLessThanOrEqual(.5);
 const gameplayText=page.locator('.commands [role="status"]');
 await expect(gameplayText).toBeVisible();
 expect(Number.parseFloat(await gameplayText.evaluate(node=>getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(12);
 await expect(page.locator('.commands')).toContainText('ENTER BATTLE');
 await expect(page.locator('.commands')).toContainText('END TURN');
 await page.locator('.hand .card').first().click();
 await expect(page.locator('.inspect')).toHaveClass(/has-card/);
 await expect(page.locator('.inspect')).toContainText('CARD DETAILS');
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
 const gameplayBox=await page.locator('.commands [role="status"]').boundingBox();
 const supportBoxes=await page.locator('.support-zone').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 expect(commandBox.x).toBeGreaterThanOrEqual(handBox.x+handBox.width);
 expect(overlaps(inspectBox,playerStatsBox)).toBe(false);
 expect(overlaps(enemyStatsBox,supportBoxes[0])).toBe(false);
 expect(supportBoxes.every(box=>!overlaps(gameplayBox,box))).toBe(true);
});

test('visible enemy card opens read-only inspect without revealing concealed support',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 await page.getByRole('button',{name:/END TURN/}).click();
 const enemyHero=page.locator('.enemy-territory .hero-zone .card').first();
 await expect(enemyHero).toBeVisible({timeout:15000});
 const enemyName=(await enemyHero.locator('strong').textContent()).trim();
 await enemyHero.click();
 const inspect=page.locator('.inspect');
 await expect(inspect).toHaveClass(/has-card/);
 await expect(inspect).toContainText(enemyName);
 await expect(inspect).toContainText(/ATK \d+ \/ DEF \d+/);
 await expect(inspect.getByRole('button',{name:/SUMMON|DEFENSE|ACTIVATE|SET SUPPORT/})).toHaveCount(0);
 await expect(inspect.getByRole('button',{name:'CLOSE'})).toBeVisible();
 const concealed=page.locator('.enemy-territory .support-zone .card.concealed').first();
 if(await concealed.count()){
  await concealed.click();
  await expect(inspect).toContainText(enemyName);
  await expect(inspect).not.toContainText('UNKNOWN');
 }
});

test('visible own battlefield card opens inspect outside targeting modes',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 const yuri=page.getByRole('button',{name:/Select YURI SCOUT/});
 await yuri.focus();
 await yuri.press('Enter');
 await page.getByRole('button',{name:'SUMMON',exact:true}).click();
 await page.locator('.player-territory .hero-zone .slot.valid').first().click();
 const ownHero=page.locator('.player-territory .hero-zone .card').first();
 await ownHero.click();
 const inspect=page.locator('.inspect');
 await expect(inspect).toHaveClass(/has-card/);
 await expect(inspect).toContainText('YURI SCOUT');
 await expect(inspect).toContainText('ATK 1100 / DEF 900');
 await expect(inspect.getByRole('button',{name:/SUMMON|DEFENSE|SET SUPPORT/})).toHaveCount(0);
 await expect(inspect.getByRole('button',{name:'CLOSE'})).toBeVisible();
});

test('inspect dismissal clears selected hand actions before battlefield input resumes',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 const handHero=page.getByRole('button',{name:/Select YURI SCOUT/});
 await handHero.focus();
 await handHero.press('Enter');
 await expect(page.locator('.inspect')).toHaveClass(/has-card/);
 await page.getByRole('button',{name:'Close card details'}).click();
 await expect(page.locator('.inspect')).not.toHaveClass(/has-card/);
 await expect(page.locator('.inspect-backdrop')).toHaveCount(0);
 await expect(page.locator('.hand .card.active')).toHaveCount(0);
 await expect(page.locator('.player-territory .slot.valid')).toHaveCount(0);
});

test('attack selection wins over own hero inspection during battle',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page,'dense');
 const handHero=page.getByRole('button',{name:/Select YURI SCOUT/});
 await handHero.focus();
 await handHero.press('Enter');
 await page.getByRole('button',{name:'SUMMON',exact:true}).click();
 await page.locator('.player-territory .hero-zone .slot.valid').first().click();
 await page.getByRole('button',{name:/ENTER BATTLE/}).click();
 await page.getByRole('button',{name:/END TURN/}).click();
 await expect(page.locator('.phase-label')).toHaveText('MAIN PHASE',{timeout:15000});
 await expect(page.locator('.duel-state')).toContainText('2');
 await page.getByRole('button',{name:/ENTER BATTLE/}).click();
 const ownHero=page.locator('.player-territory .hero-zone .card').first();
 await ownHero.click();
 await expect(page.locator('.player-territory .hero-zone .slot.selected')).toHaveCount(1);
 await expect(page.locator('.inspect')).not.toHaveClass(/has-card/);
 await expect(page.locator('.commands [role="status"]')).toContainText(/direct damage|Choose target/);
});

test('tribute mode selects occupied heroes instead of opening inspect',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page,'dense');
 const handHero=page.getByRole('button',{name:/Select TARI GUARD/});
 await handHero.focus();
 await handHero.press('Enter');
 await page.getByRole('button',{name:'DEFENSE',exact:true}).click();
 await page.locator('.player-territory .hero-zone .slot.valid').first().click();
 for(const turn of [2,3]){
  await page.getByRole('button',{name:/ENTER BATTLE/}).click();
  await page.getByRole('button',{name:/END TURN/}).click();
  await expect(page.locator('.phase-label')).toHaveText('MAIN PHASE',{timeout:15000});
  await expect(page.locator('.duel-state')).toContainText(String(turn));
 }
 const highLevel=page.locator('.hand .card').filter({hasText:'CHISE BLADE'}).first();
 await expect(highLevel).toBeVisible();
 await highLevel.focus();
 await highLevel.press('Enter');
 await page.getByRole('button',{name:'SUMMON',exact:true}).click();
 await page.locator('.player-territory .hero-zone .card').first().click();
 await expect(page.locator('.player-territory .hero-zone')).toContainText('CHISE BLADE');
 await expect(page.locator('.player-territory .hero-zone')).not.toContainText('TARI GUARD');
 await expect(page.locator('.player-territory .hero-zone .slot.selected')).toHaveCount(0);
 await expect(page.locator('.inspect')).not.toHaveClass(/has-card/);
 await expect(page.locator('.commands [role="status"]')).toContainText('summoned using 1 chosen tribute');
});

test('tall viewport keeps opponent and command status clear of support rows',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await enterDuel(page);
 const enemyBox=await page.locator('.duelist-information.enemy').boundingBox();
 const gameplayBox=await page.locator('.commands [role="status"]').boundingBox();
 const supportBoxes=await page.locator('.support-zone').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 expect(supportBoxes.every(box=>!overlaps(enemyBox,box))).toBe(true);
 expect(supportBoxes.every(box=>!overlaps(gameplayBox,box))).toBe(true);
 expect(enemyBox.height).toBeLessThanOrEqual(160);
});

test('owned support uses Shift+Enter for read-only inspect while primary click still activates',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 const handSupport=page.locator('.hand .card').filter({hasText:'CRIMSON SURGE'}).first();
 await handSupport.click();
 await page.getByRole('button',{name:'SET SUPPORT'}).click();
 const support=page.locator('.support-zone:not(.enemy-zone) .card').first();
 await support.focus();
 await support.press('Shift+Enter');
 const inspect=page.locator('.inspect');
 await expect(inspect).toHaveClass(/has-card/);
 await expect(inspect).toContainText('CRIMSON SURGE');
 await expect(inspect.getByRole('button',{name:/SUMMON|DEFENSE|ACTIVATE|SET SUPPORT/})).toHaveCount(0);
 await page.getByRole('button',{name:'CLOSE'}).click();
 await support.click();
 await expect(page.locator('.commands [role="status"]')).toContainText('not armed until your next turn');
});

test('support cards match hero card dimensions and turn two commands remain readable',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 const supportCard=page.locator('.hand .card').filter({hasText:'CRIMSON SURGE'}).first();
 await supportCard.focus();
 await supportCard.press('Enter');
 await page.getByRole('button',{name:'SET SUPPORT'}).click();
 const playerSupport=page.locator('.support-zone:not(.enemy-zone) .card').first();
 await expect(playerSupport).toBeVisible();
 await page.evaluate(()=>{const source=document.querySelector('.support-zone:not(.enemy-zone) .card');document.querySelector('.support-zone.enemy-zone .slot').append(source.cloneNode(true));document.querySelector('.hero-zone:not(.enemy-zone) .slot').append(source.cloneNode(true))});
 const opponentSupport=page.locator('.support-zone.enemy-zone .card').first();
 const heroCard=page.locator('.hero-zone:not(.enemy-zone) .card').first();
 await expect(opponentSupport).toBeVisible();
 await expect(heroCard).toBeVisible();
 const dimensions=async card=>card.evaluate(node=>({width:node.offsetWidth,height:node.offsetHeight}));
 const heroDimensions=await dimensions(heroCard);
 expect(await dimensions(playerSupport)).toEqual(heroDimensions);
 expect(await dimensions(opponentSupport)).toEqual(heroDimensions);
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

const responsiveViewports=[
 {name:'full-hd',width:1920,height:1080},
 {name:'laptop-wide',width:1536,height:864},
 {name:'laptop',width:1366,height:768},
 {name:'short-desktop',width:1280,height:720},
 {name:'tablet-landscape',width:1024,height:768},
 {name:'tablet-portrait',width:820,height:1180},
 {name:'phone-large',width:430,height:932},
 {name:'phone',width:390,height:844},
 {name:'phone-small',width:360,height:800},
 {name:'phone-landscape',width:844,height:390},
];

for(const viewport of responsiveViewports)test(`responsive duel geometry stays usable at ${viewport.name} ${viewport.width}x${viewport.height}`,async({page})=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});
 await page.emulateMedia({reducedMotion:'reduce'});
 await enterDuel(page);
 const supportCard=page.locator('.hand .card').filter({hasText:'CRIMSON SURGE'}).first();
 await supportCard.focus();
 await supportCard.press('Enter');
 const setSupport=page.getByRole('button',{name:'SET SUPPORT'});
 await setSupport.focus();
 await setSupport.press('Enter');
 const support=page.locator('.support-zone:not(.enemy-zone) .card').first();
 await expect(support).toBeVisible();
 await page.evaluate(()=>{const source=document.querySelector('.support-zone:not(.enemy-zone) .card');document.querySelector('.hero-zone:not(.enemy-zone) .slot').append(source.cloneNode(true))});
 const hero=page.locator('.hero-zone:not(.enemy-zone) .card').first();
 await expect(hero).toBeVisible();
 const dimensions=async card=>card.evaluate(node=>({width:node.offsetWidth,height:node.offsetHeight}));
 expect(await dimensions(support)).toEqual(await dimensions(hero));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 for(const button of await page.locator('.commands button').all()){
  const metrics=await button.evaluate(node=>({height:node.getBoundingClientRect().height,fits:node.scrollWidth<=node.clientWidth+.5&&node.scrollHeight<=node.clientHeight+.5}));
  expect(metrics.height).toBeGreaterThanOrEqual(40);
  expect(metrics.fits).toBe(true);
 }
 const supportBox=await page.locator('.support-zone:not(.enemy-zone)').boundingBox();
 const handBox=await page.locator('.hand').boundingBox();
 if(viewport.width>900)expect(supportBox.y+supportBox.height).toBeLessThanOrEqual(handBox.y+.5);
 else{
  await page.locator('.hand .card').first().click();
  await expect(page.locator('.inspect')).toHaveClass(/has-card/);
  await expect(page.locator('.inspect')).toHaveAttribute('role','dialog');
  await expect(page.locator('.inspect-backdrop')).toBeVisible();
  const inspectBox=await page.locator('.inspect').boundingBox(),commandsBox=await page.locator('.commands').boundingBox(),size=page.viewportSize();
  expect(inspectBox.y).toBeGreaterThanOrEqual(0);
  expect(inspectBox.y+inspectBox.height).toBeLessThanOrEqual(size.height+.5);
  expect(commandsBox.y+commandsBox.height).toBeLessThanOrEqual(size.height+.5);
 }
});

test('mobile hand remains clickable while inspect dialog preserves commands',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await enterDuel(page);
 const mobileNavCentering=await page.locator('.arena-duel-nav').evaluate(nav=>{
  const identity=nav.querySelector('.duel-identity').getBoundingClientRect(),box=nav.getBoundingClientRect();
  return Math.abs(identity.x+identity.width/2-(box.x+box.width/2));
 });
 expect(mobileNavCentering).toBeLessThanOrEqual(.5);
 await page.locator('.hand .card').first().click();
 await expect(page.locator('.inspect')).toHaveClass(/has-card/);
 const inspectBox=await page.locator('.inspect').boundingBox();
 const commandsBox=await page.locator('.commands').boundingBox();
 await expect(page.locator('.inspect')).toHaveAttribute('role','dialog');
 await expect(page.locator('.inspect-backdrop')).toBeVisible();
 expect(inspectBox.y).toBeGreaterThanOrEqual(0);
 expect(inspectBox.y+inspectBox.height).toBeLessThanOrEqual(844.5);
 expect(commandsBox.y+commandsBox.height).toBeLessThanOrEqual(844.5);
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