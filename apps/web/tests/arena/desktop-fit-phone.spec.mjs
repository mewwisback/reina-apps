import {expect,test} from '@playwright/test';

for(const [width,isMobile] of [[980,false],[1200,false],[980,true]])test(`desktop-fit phone remains physically readable at ${width}, mobile=${isMobile}`,async({browser,baseURL},info)=>{
 const context=await browser.newContext({viewport:{width,height:Math.round(width*744/390)},screen:{width:390,height:844},hasTouch:true,isMobile,reducedMotion:'reduce'});
 const page=await context.newPage();await page.goto(`${baseURL}/arena`);await page.evaluate(()=>document.fonts.ready);
 const metrics=await page.evaluate(()=>({layout:innerWidth,screen:screen.width,visual:visualViewport.width,scale:visualViewport.scale,coarse:matchMedia('(pointer:coarse)').matches,meta:document.querySelector('meta[name=viewport]').content}));
 console.log(JSON.stringify(metrics));expect(metrics.layout).toBe(width);expect(metrics.screen).toBe(390);expect(metrics.coarse).toBe(true);
 await page.screenshot({path:info.outputPath('desktop-fit.png'),fullPage:true});
 const modes=await page.locator('.threshold-mode').all();const boxes=await Promise.all(modes.map(n=>n.boundingBox()));
 expect(boxes[1].y).toBeGreaterThan(boxes[0].y+boxes[0].height-1);
 for(const control of await page.locator('.threshold-nav a,.threshold-nav button,.threshold-mode,.threshold-primary').all()){
  const r=await control.boundingBox();expect(r.height*390/width).toBeGreaterThanOrEqual(43.5);expect(r.x+r.width).toBeLessThanOrEqual(width+1);
 }
 expect((await page.locator('.threshold-primary').boundingBox()).y*390/width).toBeLessThan(744);
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
 expect(await page.locator('.threshold').evaluate(n=>parseFloat(n.style.getPropertyValue('--entry-scale')))).toBeCloseTo(width/390);
 expect(await page.evaluate(()=>visualViewport.scale)).toBe(2);
 await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
 await page.getByRole('button',{name:/CASUAL/}).click();await page.getByRole('button',{name:'START DEMO MATCH'}).click();await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();await expect(page.locator('.hand .card')).toHaveCount(6);
 await context.close();
});
