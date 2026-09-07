import {expect,test} from '@playwright/test';

test('entry uses canonical hero typography and unboxed horizontal rulesets',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/arena');
 await expect(page.locator('.threshold-hero')).toBeVisible();
 await expect(page.locator('.threshold-deck,.threshold-table,.threshold-mode>small')).toHaveCount(0);
 const style=await page.locator('.threshold h1').evaluate(async el=>{await document.fonts.ready;const s=getComputedStyle(el);return {family:s.fontFamily,weight:s.fontWeight,loaded:document.fonts.check(`${s.fontWeight} ${s.fontSize} ${s.fontFamily.split(',')[0]}`)}});
 expect(style.family).toContain('bodyFont');expect(style.weight).toBe('900');expect(style.loaded).toBe(true);
 const modes=await page.locator('.threshold-mode').all();const boxes=await Promise.all(modes.map(m=>m.boundingBox()));
 expect(boxes[0].y).toBe(boxes[1].y);expect(boxes[1].y).toBe(boxes[2].y);
 await expect(page.locator('.threshold-brand i')).toHaveCSS('background-color','rgb(224, 60, 78)');
 await expect(page.locator('.threshold-environment')).toHaveCSS('background-image',/card-field.webp/);
});

for(const width of [320,390,844,1280])test(`hero labels stay inside clipping parents at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto('/arena');await page.waitForTimeout(1200);
 const bounds=await page.locator('.threshold-line').evaluateAll(nodes=>nodes.map(node=>{const parent=node.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(node.firstElementChild);const text=range.getBoundingClientRect();return {left:text.left-parent.left,right:parent.right-text.right,top:text.top-parent.top,bottom:parent.bottom-text.bottom}}));
 for(const bound of bounds){expect(bound.left).toBeGreaterThanOrEqual(-.5);expect(bound.right).toBeGreaterThanOrEqual(-.5);expect(bound.top).toBeGreaterThanOrEqual(-.5);expect(bound.bottom).toBeGreaterThanOrEqual(-.5)}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('reduced motion leaves hero and selected ruleset still',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/arena');
 await page.getByRole('button',{name:/CASUAL/}).click();
 const targets=page.locator('.threshold-environment,.threshold-line>span');
 for(const target of await targets.all())await expect(target).toHaveCSS('transform','none');
 await expect(page.getByRole('button',{name:/CASUAL/})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'START DEMO MATCH'})).toBeEnabled();
});
