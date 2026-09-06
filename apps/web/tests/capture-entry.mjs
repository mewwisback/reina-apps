import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const out=new URL('../../../artifacts/arena-entry/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
for(const [name,width,height] of [['desktop',1536,864],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:out,size:{width,height}}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:3000/dashboard');
 await page.getByRole('link',{name:'ENTER ARENA',exact:true}).click();
 await page.getByRole('heading',{name:'Choose your fight'}).waitFor();
 await page.waitForTimeout(700);
 await page.screenshot({path:`${out}/${name}-lobby.png`,fullPage:true});
 await page.getByRole('button',{name:/CASUAL/}).click();
 await page.getByRole('button',{name:'START DEMO MATCH'}).click();
 await page.waitForTimeout(500);
 await page.screenshot({path:`${out}/${name}-search.png`,fullPage:true});
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).waitFor();
 await page.waitForTimeout(700);
 await page.screenshot({path:`${out}/${name}-found.png`,fullPage:true});
 await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();
 await page.locator('.duel[data-entry-ready=true]').waitFor();
 await page.screenshot({path:`${out}/${name}-duel.png`,fullPage:true});
 console.log(JSON.stringify({name,errors,hand:await page.locator('.hand .card').count(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
 await context.close();
}
await browser.close();
