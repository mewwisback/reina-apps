export const spellDamage=name=>name.includes('EDGE')?500:300;

export const tributeIndices=(front,count)=>front
 .map((card,index)=>({card,index}))
 .filter(x=>x.card!==null)
 .sort((a,b)=>(a.card.defense?a.card.def:a.card.atk)-(b.card.defense?b.card.def:b.card.atk)||a.card.atk-b.card.atk)
 .slice(0,count)
 .map(x=>x.index);

export const resultWinner=(playerLp,enemyLp,deckOut)=>playerLp<=0?'SILENTINDEX':enemyLp<=0?'REINA':deckOut;
