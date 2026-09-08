import {test,expect,devices} from '@playwright/test';

for(const mobile of [false,true]) test(`dark game surfaces preserve readable controls ${mobile?'mobile':'desktop'}`,async({browser})=>{
 const context=await browser.newContext({...mobile?devices['iPhone 13']:{viewport:{width:1600,height:1000}},reducedMotion:'reduce'});
 const page=await context.newPage();
 for(const route of ['collection','deck-builder','quests','leaderboard','shop','docs','wiki','dashboard']){
  await page.goto(`/${route}`);await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];};
   const root=document.querySelector('.destination-shell,.deck-table');
   const failures=[...document.querySelectorAll('main p,main small,main label,main button:not(:disabled),.destination-kicker,.deck-table p,.deck-roster small')].filter(n=>n.getClientRects().length).flatMap(n=>{
    let p=n;while(p&&getComputedStyle(p).backgroundColor==='rgba(0, 0, 0, 0)')p=p.parentElement;
    if(!p)return [];
    const a=lum(getComputedStyle(n).color),b=lum(getComputedStyle(p).backgroundColor),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    return ratio<4.5?[{text:n.textContent,ratio}]:[];
   });
   return {canvas:lum(getComputedStyle(root).backgroundColor),failures,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  expect(result.canvas,route).toBeLessThan(.04);expect(result.failures,route).toEqual([]);expect(result.overflow,route).toBe(false);
 }
 await context.close();
});
