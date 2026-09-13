import {expect,test} from '@playwright/test';

async function guarded(page) {
  return page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', {cancelable:true})));
}

test('unsaved deck keeps unload protection across routes and releases it after save or discard',async({page})=>{
  await page.goto('/deck-builder');
  expect(await guarded(page)).toBe(false);
  await page.getByRole('button',{name:'NEW DECK',exact:true}).click();
  await page.getByLabel('Deck name',{exact:true}).fill('Unload regression');
  await expect.poll(()=>guarded(page)).toBe(true);
  await page.locator('a[href="/dashboard"]').first().click();
  await expect(page).toHaveURL(/dashboard/);
  expect(await guarded(page)).toBe(true);
  await page.goBack();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Unload regression');
  await page.getByRole('button',{name:'SAVE DECK',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Saved');
  await expect.poll(()=>guarded(page)).toBe(false);
  await page.getByLabel('Deck name',{exact:true}).fill('Discard this');
  await expect.poll(()=>guarded(page)).toBe(true);
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('button',{name:'RELOAD SAVED DECKS',exact:true}).click();
  expect(await guarded(page)).toBe(true);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'RELOAD SAVED DECKS',exact:true}).click();
  await expect(page.getByLabel('Deck name',{exact:true})).toHaveValue('Unload regression');
  await expect.poll(()=>guarded(page)).toBe(false);
});
