import {chromium,devices} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const out='/tmp/reina-pr10-evidence'; await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
for(const [name,options] of [['desktop',{viewport:{width:1600,height:900}}],['mobile',{...devices['iPhone 13'],viewport:{width:390,height:844}}]]) {
 const context=await browser.newContext({...options,recordVideo:{dir:out,size:options.viewport}}); const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000/dashboard'); await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);
 console.log(name,await page.evaluate(()=>({width:innerWidth,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)})));
 await page.screenshot({path:`${out}/${name}.png`});
 if(name==='mobile'){await page.getByRole('button',{name:'PLAY',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/mobile-play.png`});}
 for(const hero of ['HAKU','SORA','KOMA','YUI','REI']) {await page.getByRole('button',{name:`Select ${hero}`,exact:true}).click();await page.waitForTimeout(500);}
 if(name==='mobile'){await page.getByRole('button',{name:'More',exact:true}).click();await page.screenshot({path:`${out}/mobile-more.png`,fullPage:true});await page.keyboard.press('Escape');}
 await page.getByRole('button',{name:'PLAY',exact:true}).click(); await page.waitForURL('**/arena');await page.waitForTimeout(700);
 const video=page.video();await context.close();await video.saveAs(`${out}/${name}-motion.webm`);console.log(name,'errors',errors);
}
await browser.close();
