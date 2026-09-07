import {expect,test,devices} from '@playwright/test';

const sizes=[[320,568],[360,800],[390,844],[412,915],[430,932],[844,390],[820,1180],[1024,768],[1280,720],[1366,768],[1536,864],[1920,1080],[2560,1440],[3440,1440]];
for(const [width,height] of sizes)test(`game screen occupies viewport ${width}x${height}`,async({browser,baseURL},info)=>{
 const mobile=width<=430||width===844||width===820||width===1024;
 const context=await browser.newContext({...mobile?devices['Pixel 7']:{},viewport:{width,height},screen:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:'reduce'});
 const page=await context.newPage();await page.goto(`${baseURL}/arena`);await page.evaluate(()=>document.fonts.ready);
 const check=async state=>{
  await expect(page.locator('.threshold')).toHaveAttribute('data-entry-state',state);
  const metrics=await page.evaluate(()=>({width:innerWidth,visual:visualViewport.width,scale:visualViewport.scale,overflow:document.documentElement.scrollWidth,meta:[...document.querySelectorAll('meta[name=viewport]')].map(n=>n.content)}));
  expect(metrics.width).toBe(width);expect(metrics.visual).toBeCloseTo(width,0);expect(metrics.scale).toBe(1);expect(metrics.overflow).toBeLessThanOrEqual(width);expect(metrics.meta).toHaveLength(1);expect(metrics.meta[0]).toMatch(/width=device-width/);expect(metrics.meta[0]).toMatch(/initial-scale=1/);
  const footer=await page.locator('.threshold-footer').boundingBox();
  // Game actions anchor the screen, not a short landing section above a black void.
  expect(footer.y+footer.height).toBeGreaterThan(height-65);
  if(height>=568)expect(footer.y+footer.height).toBeLessThanOrEqual(height+1);
  for(const control of await page.locator('.threshold-nav a,.threshold-nav button,.threshold-mode,.threshold-actions button').all()){
   const r=await control.boundingBox();expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width+.5);
  }
  for(const copy of await page.locator('.threshold-mode em,.threshold-deck-copy p:not(.threshold-kicker),.threshold-footer p').all())expect(await copy.evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(14);
  expect((await page.locator('h1').boundingBox()).height).toBeLessThan(height*.18);
  await page.screenshot({path:info.outputPath(`${width}-${state}.png`),fullPage:true});
 };
 await check('category');await page.getByRole('button',{name:/CASUAL/}).click();await page.getByRole('button',{name:'START DEMO MATCH'}).click();await check('search');await page.getByRole('button',{name:'ENTER DUEL',exact:true}).waitFor();await check('found');await page.getByRole('button',{name:'ENTER DUEL',exact:true}).click();await expect(page.locator('.hand .card')).toHaveCount(6);await page.screenshot({path:info.outputPath(`${width}-duel.png`),fullPage:true});await context.close();
});
