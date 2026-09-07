import {expect,test} from '@playwright/test';

test('matchmaking uses Reina tokens and quiet surfaces instead of ornamental shards',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/arena');
 await expect(page.locator('.threshold')).toBeVisible();
 await expect(page.locator('.matchmaking-shard')).toHaveCount(0);
 const identity=await page.evaluate(()=>{
  const root=getComputedStyle(document.documentElement),surface=document.querySelector('.threshold');
  return {crimson:root.getPropertyValue('--crimson').trim().toLowerCase(),void:root.getPropertyValue('--bg').trim().toLowerCase(),cream:root.getPropertyValue('--cream').trim().toLowerCase(),decoration:getComputedStyle(surface,'::before').content};
 });
 expect(identity).toEqual({crimson:'#e03c4e',void:'#0d0b10',cream:'#ede7dc',decoration:'none'});
});
