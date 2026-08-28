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
 const profile=page.locator('.match-duelist');
 const box=await profile.boundingBox();
 const viewport=page.viewportSize();
 expect(box).not.toBeNull();
 expect(box.x).toBeGreaterThanOrEqual(0);
 expect(box.x+box.width).toBeLessThanOrEqual(viewport.width);
 expect(await profile.evaluate(node=>node.scrollWidth<=node.clientWidth&&node.scrollHeight<=node.clientHeight)).toBe(true);
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
 await expect(page.locator('.turn b')).toContainText('TURN 1');
 await page.waitForTimeout(1500);
 await expect(page.getByRole('dialog')).toHaveCount(1);
 await expect(page.locator('.turn b')).toContainText('TURN 1');
});

test('rematch clears terminal state and resumes automatic draw',async({page})=>{
 await enterDuel(page,'deck-out');
 await page.getByRole('button',{name:'REMATCH'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.phase-label')).toHaveText('MAIN PHASE');
 await expect(page.locator('.hand .card')).toHaveCount(6);
 await expect(page.locator('.turn b')).toContainText('TURN 1');
});