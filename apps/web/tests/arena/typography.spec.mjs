import {test,expect} from '@playwright/test';

// Tab through real controls; outline offset puts the ring on the parent surface.
for(const width of [390,1600]) test(`keyboard focus contrast on dark surfaces ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});
 for(const route of ['deck-builder','shop','docs','leaderboard']){
  await page.goto(`/${route}`);
  if(route==='deck-builder'){
   await page.getByRole('button',{name:'NEW DECK',exact:true}).click();
   await page.getByRole('button',{name:'LOAD STARTER',exact:true}).click();
   await page.goto('/deck-builder');
  }
  const surfaces=new Set();
  for(let i=0;i<100;i++){
   await page.keyboard.press('Tab');
   const ring=await page.evaluate(()=>{
    const n=document.activeElement;
    if(!n.matches('.destination-shell :is(a,button,input,select,summary)'))return null;
    const s=getComputedStyle(n);
    let p=n.classList.contains('destination-skip')?n:n.parentElement;
    while(p&&getComputedStyle(p).backgroundColor==='rgba(0, 0, 0, 0)')p=p.parentElement;
    const bg=getComputedStyle(p).backgroundColor;
    const lum=color=>{const v=color.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];};
    const a=lum(s.outlineColor),b=lum(bg);
    return {text:n.textContent,visible:n.matches(':focus-visible'),style:s.outlineStyle,width:parseFloat(s.outlineWidth),contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),surface:b>.5?'cream':'dark',skip:n.classList.contains('destination-skip')};
   });
   if(!ring)continue;
   if(i>0&&ring.skip)break;
   expect(ring.visible).toBe(true);expect(ring.style).toBe('solid');expect(ring.width).toBeGreaterThanOrEqual(3);
   expect.soft(ring.contrast,`${route}: ${ring.text}`).toBeGreaterThanOrEqual(3);
   surfaces.add(ring.surface);
  }
  expect([...surfaces].sort()).toEqual(['dark']);
 }
});
test('destination actions request the loaded bundled 700 face',async({page})=>{
 for(const route of ['collection','shop','leaderboard']){
  await page.goto(`/${route}`);await page.evaluate(()=>document.fonts.ready);
  const actions=await page.locator('.destination-action').evaluateAll(nodes=>nodes.map(n=>{
   const s=getComputedStyle(n),family=s.fontFamily.split(',')[0].replaceAll('"','');
   return {family,weight:s.fontWeight,loaded:[...document.fonts].some(f=>f.family.replaceAll('"','')===family&&f.weight===s.fontWeight&&f.status==='loaded')};
  }));
  expect(actions.length).toBeGreaterThan(0);
  for(const action of actions){expect.soft(action.weight).toBe('700');expect(action.family).toContain('gameFont');expect.soft(action.loaded).toBe(true);}
 }
});
for(const width of [390,1600]) test(`destination display face loads and labels fit ${width}`,async({browser})=>{
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
 const page=await context.newPage();
 for(const route of ['collection','deck-builder','quests','leaderboard','shop','docs','wiki']){
  await page.goto(`/${route}`);await page.evaluate(()=>document.fonts.ready);
  const roles=await page.evaluate(()=>{
   const style=selector=>getComputedStyle(document.querySelector(selector));
   const heading=style('h1');const primary=heading.fontFamily.split(',')[0];
   return {heading:heading.fontFamily,weight:heading.fontWeight,nav:style('.destination-context>a').fontFamily,loaded:[...document.fonts].some(f=>f.family.replaceAll('"','')===primary.replaceAll('"','')&&f.status==='loaded'),body:style('main p:not(.destination-kicker)').fontFamily,brand:style('.destination-brand').fontFamily,overflow:[...document.querySelectorAll('h1,h2,.destination-filters button,.destination-header nav a')].filter(n=>n.getClientRects().length).filter(n=>{const r=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect();return r.left<p.left-.5||r.right>p.right+.5||n.scrollWidth>n.clientWidth+1;}).map(n=>n.textContent)};
  });
  expect(roles.heading).toContain('gameFont');expect(roles.weight).toBe('700');expect(roles.nav).toContain('gameFont');expect(roles.loaded).toBe(true);expect(roles.body).toContain('bodyFont');expect(roles.brand).toContain('displayFont');expect(roles.overflow).toEqual([]);
  await page.keyboard.press('Tab');await expect(page.locator('.destination-skip')).toBeFocused();
 }
 await context.close();
});
