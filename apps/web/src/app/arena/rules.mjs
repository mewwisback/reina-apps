export const spellDamage=name=>name.includes('EDGE')?500:300;

export const tributeIndices=(front,count)=>front
 .map((card,index)=>({card,index}))
 .filter(x=>x.card!==null)
 .sort((a,b)=>(a.card.defense?a.card.def:a.card.atk)-(b.card.defense?b.card.def:b.card.atk)||a.card.atk-b.card.atk)
 .slice(0,count)
 .map(x=>x.index);

export const tributeUpgrade=(candidate,front,count)=>{const ids=tributeIndices(front,count),strongest=Math.max(...front.filter(Boolean).map(card=>card.defense?card.def:card.atk));return ids.length===count&&candidate.atk>strongest};

export const resultWinner=(playerLp,enemyLp,deckOut)=>playerLp<=0?'SILENTINDEX':enemyLp<=0?'REINA':deckOut;

export const battleOutcome=(attackerAtk,target)=>{
 if(!target)return{destroyed:false,damage:attackerAtk};
 const power=target.defense?target.def:target.atk;
 return attackerAtk>=power?{destroyed:true,damage:0}:{destroyed:false,damage:power-attackerAtk};
};

export const trapOutcome=(name,attackerAtk,turn,setAt)=>{
 const armed=setAt<turn;
 return{armed,reflected:armed&&name==='MIRROR WARD'?attackerAtk:0};
};

export const attackOutcome=(attackerAtk,target,trap,turn)=>{
 if(trap){const effect=trapOutcome(trap.name,attackerAtk,turn,trap.setAt);if(effect.armed)return{negated:true,reflected:effect.reflected,destroyed:false,damage:0}}
 return{negated:false,reflected:0,...battleOutcome(attackerAtk,target)};
};
