import {expect,test} from '@playwright/test';

const shellRoutes=['/dashboard','/collection','/deck-builder','/leaderboard','/quests','/shop'];

for(const route of shellRoutes){
 test(`${route} uses a contained mobile application shell`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(route);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const sidebar=page.locator('[data-app-sidebar]');
  await expect(sidebar).toHaveAttribute('aria-hidden','true');
  const closedBox=await sidebar.boundingBox();
  expect(closedBox.x+closedBox.width).toBeLessThanOrEqual(0);
  const menu=page.locator('.app-mobile-menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-label','Open navigation');
  const box=await menu.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(menu).toHaveAttribute('aria-expanded','false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded','true');
  await expect(menu).toHaveAttribute('aria-label','Close navigation');
  await expect(page.locator('[data-app-sidebar]')).toBeVisible();
  await expect(page.locator('[data-nav-backdrop]')).toBeVisible();
  const navLinks=page.locator('[data-app-sidebar] nav a');
  await expect(navLinks.first()).toBeVisible();
  for(const link of await navLinks.all()){
   const linkBox=await link.boundingBox();
   expect(linkBox.height).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press('Escape');
  await expect(sidebar).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('[data-nav-backdrop]')).toHaveCount(0);
 });
}

test('dashboard exposes core play action on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/dashboard');
 const play=page.getByRole('link',{name:/ENTER ARENA/});
 await expect(play).toBeVisible();
 expect((await play.boundingBox()).height).toBeGreaterThanOrEqual(44);
});

test('deck builder renders every selected card in its deck list',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/deck-builder');
 await expect(page.locator('[data-deck-list-item]')).toHaveCount(8);
});

test('desktop application shell keeps persistent navigation',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/dashboard');
 await expect(page.locator('[data-app-sidebar]')).toBeVisible();
 await expect(page.getByRole('button',{name:'Open navigation'})).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
});

for(const handSize of [1,3,5,6,8,10]){
 test(`Arena renders and exposes every card in a ${handSize}-card hand`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(`/arena?arenaFixture=dense&arenaHand=${handSize}`);
  await page.getByRole('button',{name:'CASUAL'}).click();
  await page.getByRole('button',{name:/ENTER DUEL/}).click();
  await expect(page.locator('.duel')).not.toHaveClass(/opening/);
  const cards=page.locator('.hand .card');
  await expect(cards).toHaveCount(handSize);
  for(const card of await cards.all()){
   const box=await card.boundingBox();
   expect(box.x).toBeGreaterThanOrEqual(-0.5);
   expect(box.x+box.width).toBeLessThanOrEqual(390.5);
   expect(box.y).toBeGreaterThanOrEqual(-0.5);
   expect(box.y+box.height).toBeLessThanOrEqual(844.5);
   const ownsCenter=await card.evaluate((node)=>{
    const rect=node.getBoundingClientRect();
    const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
    return hit===node||node.contains(hit);
   });
   expect(ownsCenter).toBe(true);
  }
 });
}

test('Arena mobile gameplay text remains readable and contained',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 const metrics=await page.locator('.duel').evaluate(root=>{
  const nodes=[...root.querySelectorAll('.territory-title,.zone-label,.command-status,.card strong,.card span')].filter(node=>{
   const style=getComputedStyle(node),box=node.getBoundingClientRect();
   return style.display!=='none'&&style.visibility!=='hidden'&&box.width>0&&box.height>0;
  });
  const clipped=nodes.filter(node=>{
   const parent=node.parentElement;if(!parent)return false;
   const box=node.getBoundingClientRect(),owner=parent.getBoundingClientRect();
   return box.left<owner.left-.5||box.right>owner.right+.5||box.top<owner.top-.5||box.bottom>owner.bottom+.5;
  });
  return {minimumFont:Math.min(...nodes.map(node=>parseFloat(getComputedStyle(node).fontSize))),clipped:clipped.length};
 });
 expect(metrics.minimumFont).toBeGreaterThanOrEqual(10);
 expect(metrics.clipped).toBe(0);
});

for(const handSize of [1,3,5,6,8,10]){
 test(`Arena landscape exposes every card in a ${handSize}-card hand`,async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto(`/arena?arenaFixture=dense&arenaHand=${handSize}`);
  await page.getByRole('button',{name:'CASUAL'}).click();
  await page.getByRole('button',{name:/ENTER DUEL/}).click();
  await expect(page.locator('.duel')).not.toHaveClass(/opening/);
  const cards=page.locator('.hand .card');
  await expect(cards).toHaveCount(handSize);
  for(const card of await cards.all()){
   const box=await card.boundingBox();
   expect(box.x).toBeGreaterThanOrEqual(-0.5);
   expect(box.x+box.width).toBeLessThanOrEqual(844.5);
   expect(box.y).toBeGreaterThanOrEqual(-0.5);
   expect(box.y+box.height).toBeLessThanOrEqual(390.5);
   const ownsCenter=await card.evaluate((node)=>{
    const rect=node.getBoundingClientRect();
    const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
    return hit===node||node.contains(hit);
   });
   expect(ownsCenter).toBe(true);
  }
  for(const slot of await page.locator('.board .slot').all()){
   const [slotBox,zoneBox]=await Promise.all([slot.boundingBox(),slot.locator('..').boundingBox()]);
   expect(slotBox&&zoneBox&&slotBox.y+slotBox.height<=zoneBox.y+zoneBox.height+.5).toBe(true);
  }
 });
}

test('Arena canvas owns battlefield geometry while DOM preserves interaction semantics',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 const canvas=page.locator('canvas.battlefield-canvas');
 await expect(canvas).toBeVisible();
 await expect(canvas).toHaveAttribute('data-renderer','canvas-2d');
 await expect(canvas).toHaveAttribute('data-lane-gap','1');
 const [canvasBox,boardBox]=await Promise.all([canvas.boundingBox(),page.locator('.board').boundingBox()]);
 expect(canvasBox&&boardBox&&Math.abs(canvasBox.x-boardBox.x)<=.5&&Math.abs(canvasBox.y-boardBox.y)<=.5&&Math.abs(canvasBox.width-boardBox.width)<=.5&&Math.abs(canvasBox.height-boardBox.height)<=.5).toBe(true);
 await expect(page.locator('.battlefield-semantics')).toHaveAttribute('aria-label','Interactive battlefield controls');
 await expect(page.locator('.battlefield-semantics .slot')).toHaveCount(20);
});

test('Arena short desktop reserves disjoint battlefield, hand, inspect, and command regions',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 const selectors=['.board','.hand','.inspect','.commands'],boxes=await Promise.all(selectors.map(selector=>page.locator(selector).boundingBox()));
 expect(boxes.every(box=>box&&box.x>=0&&box.y>=64&&box.x+box.width<=1280.5&&box.y+box.height<=720.5)).toBe(true);
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i],b=boxes[j],overlaps=a&&b&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  const controlledHandOverlap=new Set([selectors[i],selectors[j]]).size===2&&[selectors[i],selectors[j]].includes('.board')&&[selectors[i],selectors[j]].includes('.hand');
  expect(Boolean(overlaps)&&!controlledHandOverlap).toBe(false);
 }
});

test('Arena allowance panel stays outside battlefield and reserved desktop regions',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 const boxes=await page.evaluate(()=>{const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};return{allowance:rect('.perimeter'),board:rect('.board'),inspect:rect('.inspect'),player:rect('.stats:not(.enemy)'),hand:rect('.hand')}});
 const overlaps=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
 expect(overlaps(boxes.allowance,boxes.board)).toBe(false);
 expect(overlaps(boxes.allowance,boxes.inspect)).toBe(false);
 expect(overlaps(boxes.allowance,boxes.player)).toBe(false);
 expect(overlaps(boxes.allowance,boxes.hand)).toBe(false);
 expect(boxes.allowance.width).toBeLessThanOrEqual(260);
 expect(boxes.allowance.height).toBeGreaterThanOrEqual(72);
});

test('Arena desktop composes inspect rail, central tabletop, corner HUDs, and overlapping hand from duel reference',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 await page.getByRole('button',{name:/Select REI ZERO/}).click();
 const geometry=await page.evaluate(()=>{const rect=(selector)=>{const r=document.querySelector(selector)?.getBoundingClientRect();return r&&{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};return{board:rect('.board'),inspect:rect('.inspect'),hand:rect('.hand'),enemy:rect('.stats.enemy'),player:rect('.stats:not(.enemy)'),commands:rect('.commands'),piles:[...document.querySelectorAll('.battlefield-territory>.piles')].map(node=>{const r=node.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom}})}});
 expect(geometry.inspect.width).toBeGreaterThanOrEqual(200);
 expect(geometry.inspect.height).toBeGreaterThanOrEqual(380);
 expect(geometry.inspect.right).toBeLessThanOrEqual(geometry.board.left+4);
 expect(geometry.board.width).toBeGreaterThanOrEqual(620);
 expect(geometry.board.width).toBeLessThanOrEqual(760);
 expect(geometry.hand.left).toBeGreaterThanOrEqual(geometry.board.left);
 expect(geometry.hand.right).toBeLessThanOrEqual(geometry.board.right);
 expect(geometry.hand.top).toBeLessThan(geometry.board.bottom);
 expect(geometry.enemy.left).toBeGreaterThan(geometry.board.right-40);
 expect(geometry.player.right).toBeLessThanOrEqual(geometry.board.left+80);
 expect(geometry.commands.left).toBeGreaterThan(geometry.board.right-40);
 expect(geometry.piles).toHaveLength(2);
});

for(const [label,width,height] of [['desktop-1280',1280,720],['desktop-1366',1366,768],['desktop-1536',1536,864],['desktop-1920',1920,1080]]){
 test(`Arena ${label} keeps desktop regions contained and readable`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.goto('/arena?arenaFixture=dense&arenaHand=10');
  await page.getByRole('button',{name:'CASUAL'}).click();
  await page.getByRole('button',{name:/ENTER DUEL/}).click();
  await expect(page.locator('.duel')).not.toHaveClass(/opening/);
  const regions=await Promise.all(['.board','.hand','.inspect','.commands'].map(selector=>page.locator(selector).boundingBox()));
  expect(regions.every(box=>box&&box.x>=0&&box.y>=64&&box.x+box.width<=width+.5&&box.y+box.height<=height+.5)).toBe(true);
  const boardTransform=await page.locator('.board').evaluate(node=>getComputedStyle(node).transform);
  expect(boardTransform).toBe('none');
  const cards=await page.locator('.hand .card').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return{left:box.left,top:box.top,right:box.right,bottom:box.bottom}}));
  expect(cards).toHaveLength(10);
  expect(cards.every(card=>card.left>=0&&card.top>=64&&card.right<=width+.5&&card.bottom<=height+.5)).toBe(true);
  for(const button of await page.locator('.commands button').all()){
   const box=await button.boundingBox();
   expect(box&&box.height>=40&&box.x>=0&&box.x+box.width<=width+.5&&box.y+box.height<=height+.5).toBe(true);
  }
 });
}

test('Arena desktop selected card keeps every inspect action visible without scrolling',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 await page.getByRole('button',{name:/Select REI ZERO/}).click();
 const inspect=page.locator('.inspect');
 await expect(inspect.getByRole('button',{name:'SUMMON'})).toBeVisible();
 await expect(inspect.getByRole('button',{name:'DEFENSE'})).toBeVisible();
 await expect(inspect.getByRole('button',{name:'CANCEL'})).toBeVisible();
 const metrics=await inspect.evaluate(node=>({clientHeight:node.clientHeight,scrollHeight:node.scrollHeight}));
 expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight);
});

test('Arena summon targeting aligns visible slots, hit targets, and command prompt',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
 await page.getByRole('button',{name:'SUMMON',exact:true}).click();
 await expect(page.locator('.commands .placement-hint')).toContainText('CHOOSE FRONT ROW SLOT');
 await expect(page.locator('.inspect .placement-hint')).toHaveCount(0);
 const slots=page.locator('.player-territory .hero-zone .slot.valid');
 await expect(slots).toHaveCount(5);
 const aligned=await slots.evaluateAll(nodes=>nodes.every(node=>{
  const r=node.getBoundingClientRect(),owner=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return r.width>=40&&r.height>=60&&(owner===node||node.contains(owner));
 }));
 expect(aligned).toBe(true);
});

test('Arena battlefield heroes expose attack or defense stance',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
 await page.getByRole('button',{name:'DEFENSE',exact:true}).click();
 await page.locator('.player-territory .hero-zone .slot.valid').first().click();
 const hero=page.locator('.player-territory .hero-zone .card').first();
 await expect(hero).toHaveAttribute('data-stance','defense');
 await expect(hero).toContainText('DEF');
 const geometry=await hero.evaluate(node=>{const card=node.getBoundingClientRect(),slot=node.parentElement?.getBoundingClientRect(),matrix=new DOMMatrixReadOnly(getComputedStyle(node).transform);return{landscape:card.width>card.height,rotation:Math.round(Math.atan2(matrix.b,matrix.a)*180/Math.PI),centered:Boolean(slot&&Math.abs(card.x+card.width/2-(slot.x+slot.width/2))<=1&&Math.abs(card.y+card.height/2-(slot.y+slot.height/2))<=1),slotPortrait:Boolean(slot&&slot.height>slot.width),contained:Boolean(slot&&card.left>=slot.left-.5&&card.right<=slot.right+.5&&card.top>=slot.top-.5&&card.bottom<=slot.bottom+.5)}});
 expect(geometry).toEqual({landscape:true,rotation:90,centered:true,slotPortrait:true,contained:true});
});

test('Arena dense desktop hand uses one overlapping physical row',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 const cards=page.locator('.hand .card');
 await expect(cards).toHaveCount(10);
 const geometry=await cards.evaluateAll(nodes=>{const r=nodes.map(x=>x.getBoundingClientRect());return{rows:new Set(r.map(x=>Math.round(x.top))).size,overlap:r.every((x,i)=>!i||x.left<r[i-1].right),inside:r.every(x=>x.bottom<=innerHeight+.5)}});
 expect(geometry).toEqual({rows:1,overlap:true,inside:true});
});

test('Arena enlarged battlefield lanes contain every physical slot',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 const geometry=await page.locator('.battlefield-semantics .slot').evaluateAll(slots=>slots.map(slot=>{const s=slot.getBoundingClientRect(),zone=slot.closest('.zone-wrap')?.getBoundingClientRect(),board=slot.closest('.board')?.getBoundingClientRect();return{laneHeight:zone?.height,insideLane:Boolean(zone&&s.top>=zone.top-.5&&s.bottom<=zone.bottom+.5),insideBoard:Boolean(board&&s.top>=board.top-.5&&s.bottom<=board.bottom+.5)}}));
 expect(geometry).toHaveLength(20);
 expect(geometry.every(item=>item.laneHeight>=82&&item.insideLane&&item.insideBoard)).toBe(true);
});

test('Arena occupied hero fills the same physical footprint as an empty slot',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
 await page.getByRole('button',{name:'SUMMON',exact:true}).click();
 await page.locator('.player-territory .hero-zone .slot.valid').first().click();
 const geometry=await page.locator('.player-territory .hero-zone .slot').evaluateAll(slots=>{const occupied=slots.find(slot=>slot.querySelector('.card')),empty=slots.find(slot=>!slot.querySelector('.card'));if(!occupied||!empty)return null;const card=occupied.querySelector('.card'),cr=card.getBoundingClientRect(),sr=occupied.getBoundingClientRect(),er=empty.getBoundingClientRect();return{slotWidth:sr.width,slotHeight:sr.height,slotPortrait:sr.height>sr.width,cardFillsSlot:Math.abs(cr.width-sr.width)<=2&&Math.abs(cr.height-sr.height)<=2,equalSlots:Math.abs(sr.width-er.width)<=1&&Math.abs(sr.height-er.height)<=1}});
 expect(geometry?.slotWidth).toBeGreaterThanOrEqual(58);
 expect(geometry?.slotHeight).toBeGreaterThanOrEqual(82);
 expect(geometry).toMatchObject({slotPortrait:true,cardFillsSlot:true,equalSlots:true});
});

test('Arena summoned hero stays inside its battlefield slot',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
 await page.getByRole('button',{name:'SUMMON',exact:true}).click();
 const target=page.locator('.player-territory .hero-zone .slot.valid').first();
 await target.click();
 const slot=page.locator('.player-territory .hero-zone .slot').first();
 const geometry=await slot.evaluate(node=>{const card=node.querySelector('.card');if(!card)return null;const slotRect=node.getBoundingClientRect(),cardRect=card.getBoundingClientRect(),owner=document.elementFromPoint(cardRect.x+cardRect.width/2,cardRect.y+cardRect.height/2);return{contained:cardRect.x>=slotRect.x&&cardRect.right<=slotRect.right&&cardRect.y>=slotRect.y&&cardRect.bottom<=slotRect.bottom,ownsCenter:owner===card||card.contains(owner)}});
 expect(geometry).toEqual({contained:true,ownsCenter:true});
});

test('Arena battlefield renders recognizable portrait cards with visible stance',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await page.locator('.duel:not(.opening)').waitFor();
 await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
 await page.getByRole('button',{name:'DEFENSE',exact:true}).click();
 await page.locator('.player-territory .hero-zone .slot.valid').first().click();
 const card=page.locator('.player-territory .hero-zone .card[data-stance="defense"]').first();
 await expect(card).toBeVisible();
 const geometry=await card.evaluate(node=>{const r=node.getBoundingClientRect(),style=getComputedStyle(node);return{portrait:Number(style.getPropertyValue('--card-ratio'))<1,opacity:Number(style.opacity),art:Boolean(node.querySelector('.card-art')),name:Boolean(node.querySelector('strong')),stat:Boolean(node.querySelector('em')),width:r.width,height:r.height,transform:style.transform}});
 expect(geometry.portrait).toBe(true);
 expect(geometry.opacity).toBe(1);
 expect(geometry.art&&geometry.name&&geometry.stat).toBe(true);
 expect(geometry.width).toBeGreaterThan(geometry.height);
 expect(geometry.transform).not.toBe('none');
});

for(const [name,width,height] of [['card-owner-1280',1280,720],['card-owner-1366',1366,768],['card-owner-1536',1536,864],['card-owner-1920',1920,1080]]){
 test(`Arena ${name} keeps every occupied card owned by its slot`,async({page})=>{
  await page.setViewportSize({width:Number(width),height:Number(height)});
  await page.goto('/arena?arenaFixture=dense&arenaHand=10');
  await page.getByRole('button',{name:'CASUAL'}).click();
  await page.getByRole('button',{name:/ENTER DUEL/}).click();
  await page.locator('.duel:not(.opening)').waitFor();
  await page.getByRole('button',{name:/Select YURI SCOUT/}).click();
  await page.getByRole('button',{name:'SUMMON',exact:true}).click();
  await page.locator('.player-territory .hero-zone .slot.valid').first().click();
  const cards=await page.locator('.battlefield-semantics .slot:has(.card)').evaluateAll(slots=>slots.map(slot=>{const card=slot.querySelector('.card');if(!card)return null;const s=slot.getBoundingClientRect(),c=card.getBoundingClientRect(),owner=document.elementFromPoint(c.x+c.width/2,c.y+c.height/2);return{contained:c.x>=s.x&&c.right<=s.right&&c.y>=s.y&&c.bottom<=s.bottom,ownsCenter:owner===card||card.contains(owner)}}));
  expect(cards.length).toBeGreaterThan(0);
  expect(cards.every(card=>card?.contained&&card.ownsCenter)).toBe(true);
 });
}

test('Arena landscape gives battlefield primary width without crossing the action rail',async({page})=>{
 await page.setViewportSize({width:844,height:390});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 const [board,hand,commands]=await Promise.all([page.locator('.board').boundingBox(),page.locator('.hand').boundingBox(),page.locator('.commands').boundingBox()]);
 expect(board&&board.width>=844*.55).toBe(true);
 expect(board&&hand&&board.x+board.width<=hand.x-.5).toBe(true);
 expect(board&&commands&&board.x+board.width<=commands.x-.5).toBe(true);
});

test('Arena separates hero and support rows inside each territory',async({page})=>{
 for(const viewport of [{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  await page.goto('/arena?arenaFixture=dense&arenaHand=10');
  await page.getByRole('button',{name:'CASUAL'}).click();
  await page.getByRole('button',{name:/ENTER DUEL/}).click();
  await expect(page.locator('.duel')).not.toHaveClass(/opening/);
  for(const territory of await page.locator('.battlefield-territory').all()){
   const rows=await territory.locator('.zone-wrap').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return{top:box.top,bottom:box.bottom}}));
   expect(rows).toHaveLength(2);
   expect(rows[1].top-rows[0].bottom).toBeGreaterThanOrEqual(8);
   const territoryBox=await territory.boundingBox();
   expect(territoryBox&&rows.every(row=>row.top>=territoryBox.y-.5&&row.bottom<=territoryBox.y+territoryBox.height+.5)).toBe(true);
  }
  const territories=await page.locator('.battlefield-territory').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();return{top:box.top,bottom:box.bottom}}));
  expect(territories[1].top-territories[0].bottom).toBeGreaterThanOrEqual(16);
 }
});

test('Arena pile rails never overlap battlefield slots',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 const piles=await page.locator('.pile').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}}));
 const slots=await page.locator('.board .slot').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}}));
 for(const pile of piles)for(const slot of slots){
  const overlaps=pile.x<slot.right&&pile.right>slot.x&&pile.y<slot.bottom&&pile.bottom>slot.y;
  expect(overlaps).toBe(false);
 }
});

test('Arena mobile battlefield exposes clear territory ownership',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 await expect(page.locator('.battlefield-territory')).toHaveCount(2);
 await expect(page.locator('.zone-label')).toHaveCount(4);
 await expect(page.locator('.zone-label')).toHaveText(['SUPPORT','HERO','HERO','SUPPORT']);
 for(const label of await page.locator('.zone-label').all()){
  const [labelBox,rowBox]=await Promise.all([label.boundingBox(),label.locator('..').boundingBox()]);
  expect(labelBox&&rowBox&&labelBox.x+labelBox.width<=rowBox.x+rowBox.width+.5).toBe(true);
 }
 await expect(page.locator('.enemy-territory')).toContainText('SILENTINDEX FIELD');
 await expect(page.locator('.player-territory')).toContainText('REINA FIELD');
 await expect(page.locator('.enemy-territory .piles')).toHaveCount(1);
 await expect(page.locator('.player-territory .piles')).toHaveCount(1);
 for(const hud of await page.locator('.duelist-information').all()){
  await expect(hud.locator('dl')).toBeHidden();
 }
});

test('Arena status belongs to command rail instead of battlefield',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/arena?arenaFixture=dense&arenaHand=5');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 await expect(page.locator('.board [role="status"]')).toHaveCount(0);
 await expect(page.locator('.commands [role="status"]')).toBeVisible();
 await page.setViewportSize({width:844,height:390});
 const status=page.locator('.commands [role="status"]');
 await expect(status).toHaveText('OPENING: Choose a card action.');
 const [statusBox,actionsBox]=await Promise.all([status.boundingBox(),page.locator('.phase-actions').boundingBox()]);
 expect(statusBox&&actionsBox&&statusBox.y+statusBox.height<=actionsBox.y+.5&&actionsBox.y+actionsBox.height<=390.5).toBe(true);
});

test('Arena selected-card sheet preserves mobile commands',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/arena?arenaFixture=dense&arenaHand=10');
 await page.getByRole('button',{name:'CASUAL'}).click();
 await page.getByRole('button',{name:/ENTER DUEL/}).click();
 await expect(page.locator('.duel')).not.toHaveClass(/opening/);
 await page.locator('.hand .card').nth(7).click();
 const inspect=page.locator('.inspect.has-card');
 await expect(inspect).toBeVisible();
 await expect(inspect).toHaveAttribute('role','dialog');
 await expect(page.locator('.inspect-backdrop')).toBeVisible();
 await expect(page.getByRole('button',{name:'Close card details'})).toBeVisible();
 const inspectBox=await inspect.boundingBox();
 expect(inspectBox.y).toBeGreaterThanOrEqual(0);
 expect(inspectBox.y+inspectBox.height).toBeLessThanOrEqual(844.5);
 await expect(page.locator('.commands')).toBeVisible();
 await page.getByRole('button',{name:'CANCEL'}).click();
 await expect(inspect).toHaveCount(0);
});
