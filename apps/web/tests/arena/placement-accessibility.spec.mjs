import {expect,test} from '@playwright/test';

for(const [width,height] of [[390,844],[844,390],[1280,720]])test(`placement releases modal and supports cancellation at ${width}x${height}`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width,height});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
 await page.getByRole('button',{name:'DEFENSE',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.inspect-backdrop')).toHaveCount(0);
 const cancel=page.getByRole('button',{name:'Cancel placement',exact:true});
 await expect(cancel).toBeVisible();
 await cancel.focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('.slot.valid')).toHaveCount(0);
 await expect(page.locator('.hand .card')).toHaveCount(10);
 await expect(page.locator('.player-territory .hero-zone .card')).toHaveCount(0);
});
