import {expect,test} from '@playwright/test';
import {execFileSync} from 'node:child_process';

test('combat effects declare complete dependencies',()=>{
 const results=JSON.parse(execFileSync('node',['node_modules/eslint/bin/eslint.js','src/app/arena/page.tsx','--format','json'],{encoding:'utf8'}));
 expect(results.flatMap(result=>result.messages).filter(message=>message.ruleId==='react-hooks/exhaustive-deps')).toEqual([]);
});

async function enter(page,fixture='dense'){
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`/arena?arenaFixture=${fixture}`);
 await page.getByRole('button',{name:/CASUAL/}).click();await page.getByRole('button',{name:'START DEMO MATCH'}).click();await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();await page.locator('.duel:not(.opening)').waitFor();
}

test('rapid end-turn input draws once and bot continues through inspection rerenders',async({page})=>{
 await enter(page);await page.getByRole('button',{name:/END TURN/}).evaluate(button=>{button.click();button.click();button.click()});
 await expect(page.locator('.enemy-territory .hero-zone .card')).toHaveCount(1);
 await page.locator('.enemy-territory .hero-zone .card').click();await page.getByRole('button',{name:'Close card details'}).click();
 await expect(page.locator('.duel-state')).toContainText('TURN2',{timeout:7000});
 await expect(page.locator('.hand .card')).toHaveCount(7);await expect(page.locator('.stats.enemy dl dd').first()).toHaveText('14');
});

test('bot direct attack applies exactly one hit in StrictMode',async({page})=>{
 await enter(page);
 for(const turn of [2,3]){
  await page.getByRole('button',{name:/END TURN/}).click();
  await expect(page.locator('.duel-state')).toContainText(`TURN${turn}`,{timeout:7000});
 }
 await expect(page.locator('.stats:not(.enemy) .duelist-lp')).toHaveText('LP 2650');
 await expect(page.locator('.stats dl dd').nth(4)).toHaveText('20');
 await expect(page.locator('.stats:not(.enemy) dl dd').nth(4)).toHaveText('20');
});

test('bot spell deals 300 once and conserves its grave card',async({page})=>{
 await enter(page);
 for(const turn of [2,3,4,5]){
  await page.getByRole('button',{name:/END TURN/}).click();
  await expect(page.locator('.duel-state')).toContainText(`TURN${turn}`,{timeout:7000});
 }
 await page.getByRole('button',{name:/END TURN/}).click();
 await expect(page.getByRole('status')).toContainText('activates LAST PULSE');
 await expect(page.locator('.stats:not(.enemy) .duelist-lp')).toHaveText('LP 0600');
 await expect(page.locator('.stats.enemy dl dd').nth(3)).toHaveText('4'); await expect(page.locator('.stats.enemy .duelist-lp')).toHaveText('LP 4000');
 for(const side of ['.stats.enemy','.stats:not(.enemy)'])await expect(page.locator(`${side} dl dd`).nth(4)).toHaveText('20');
});

for(const trap of ['MIRROR WARD','COUNTER SEAL'])test(`${trap} consumes one card and resolves once`,async({page})=>{
 await enter(page,'dense&arenaHand=10');
 await page.getByRole('button',{name:`Select ${trap}`,exact:true}).click();
 await page.getByRole('button',{name:'SET SUPPORT',exact:true}).click();
 for(const turn of [2,3]){
  await page.getByRole('button',{name:/END TURN/}).click();
  await expect(page.locator('.duel-state')).toContainText(`TURN${turn}`,{timeout:7000});
 }
 await expect(page.locator('.stats:not(.enemy) .duelist-lp')).toHaveText('LP 4000');
 await expect(page.locator('.stats.enemy .duelist-lp')).toHaveText(trap==='MIRROR WARD'?'LP 2650':'LP 4000');
 await expect(page.locator('.stats:not(.enemy) dl dd').nth(3)).toHaveText('1');
 await expect(page.locator('.player-territory .support-zone .card')).toHaveCount(0);
 for(const side of ['.stats.enemy','.stats:not(.enemy)'])await expect(page.locator(`${side} dl dd`).nth(4)).toHaveText('20');
});

test('bot lethal attack rematch stays fresh after pending delay',async({page})=>{
 await enter(page);
 for(const turn of [2,3,4,5,6]){
  await page.getByRole('button',{name:/END TURN/}).click();
  await expect(page.locator('.duel-state')).toContainText(`TURN${turn}`,{timeout:7000});
 }
 await page.getByRole('button',{name:/END TURN/}).click();
 await expect(page.locator('.duel-result')).toContainText('DEFEAT',{timeout:7000});
 await expect(page.locator('.stats:not(.enemy) .duelist-lp')).toHaveText('LP 0000');
 await page.getByRole('button',{name:'REMATCH'}).click();
 await page.waitForTimeout(4000);
 await expect(page.locator('.duel-result')).toHaveCount(0);
 await expect(page.locator('.duel-state')).toContainText('TURN1');
 await expect(page.locator('.hand .card')).toHaveCount(6);
 for(const side of ['.stats.enemy','.stats:not(.enemy)']){
  await expect(page.locator(`${side} .duelist-lp`)).toHaveText('LP 4000');
  await expect(page.locator(`${side} dl dd`).nth(3)).toHaveText('0');
  await expect(page.locator(`${side} dl dd`).nth(4)).toHaveText('20');
 }
});

test('unmount during bot delay leaves fresh next visit untouched',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await enter(page);
 await page.getByRole('button',{name:/END TURN/}).click();await page.getByRole('link',{name:'EXIT',exact:true}).click();await expect(page).toHaveURL(/dashboard/);
 await enter(page);await page.waitForTimeout(4000);await expect(page.locator('.hand .card')).toHaveCount(6);await expect(page.locator('.duel-state')).toContainText('TURN1');expect(errors).toEqual([]);
});

test('rapid rematch clears result and deals one fresh opening',async({page})=>{
 await enter(page,'deck-out');await page.getByRole('button',{name:'REMATCH'}).evaluate(button=>{button.click();button.click()});
 await expect(page.locator('.duel-result')).toHaveCount(0);await page.waitForTimeout(4000);await expect(page.locator('.hand .card')).toHaveCount(6);await expect(page.locator('.duel-state')).toContainText('TURN1');
});

test('pending reveal honors latest mute without restarting queue timer',async({page})=>{
 await page.addInitScript(()=>{window.cues=[];window.Audio=class{constructor(src){window.cues.push(src)}play(){return Promise.resolve()}}});
 await page.goto('/arena');await page.getByRole('button',{name:/CASUAL/}).click();await page.getByRole('button',{name:'START DEMO MATCH'}).click();
 await page.waitForTimeout(2200);await page.getByRole('button',{name:'Mute sound'}).click();
 await expect(page.getByRole('button',{name:'ENTER DUEL',exact:true})).toBeVisible({timeout:3000});
 expect(await page.evaluate(()=>window.cues.filter(x=>x.endsWith('/open.ogg')))).toEqual([]);
});
