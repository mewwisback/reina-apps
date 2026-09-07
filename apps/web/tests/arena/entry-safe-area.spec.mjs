import {readFileSync} from 'node:fs';
import {expect,test} from '@playwright/test';
test('entry reserves device safe areas without changing combat layout',()=>{
 const css=readFileSync(new URL('../../src/app/arena/entry.css',import.meta.url),'utf8');
 for(const edge of ['top','right','bottom','left'])expect(css).toContain(`env(safe-area-inset-${edge})`);
});
