'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {ArenaEntry} from './arena-entry';
import gsap from 'gsap';
import './arena.css';
import {battleOutcome,damageOutcome,drawOutcome,spellDamage,terminalWinner,trapOutcome,tributeIndices,tributeUpgrade} from './rules.mjs';
import {cancellableDelay} from './async-control.mjs';

type Kind='HERO'|'SPELL'|'TRAP'; type Phase='DRAW'|'MAIN'|'BATTLE'; type Rarity='COMMON'|'RARE'|'EPIC'; type Action='SUMMON'|'DEFENSE'|'ACTIVATE'|'SET'|null; type MatchCategory='casual'|'ranked'|'event';
type Card={id:string;name:string;kind:Kind;atk:number;def:number;mark:string;color:string;rarity:Rarity;face?:boolean;used?:boolean;ready?:number;setAt?:number;defense?:boolean};
type Side={deck:Card[];hand:Card[];front:(Card|null)[];back:(Card|null)[];grave:Card[];lp:number}; type Economy={summon:number;set:number;spell:number};
const base=[
 ['rei','REI ZERO','HERO',2200,1200,'crown','#9e3347','EPIC'],['chise','CHISE BLADE','HERO',1750,1100,'blade','#ad7540','RARE'],['yuri','YURI SCOUT','HERO',1100,900,'scout','#a84d38','COMMON'],['tari','TARI GUARD','HERO',900,1700,'guard','#85333d','COMMON'],['mira','MIRA VEIL','HERO',1350,1400,'veil','#586f8d','RARE'],
 ['surge','CRIMSON SURGE','SPELL',0,0,'surge','#397b74','RARE'],['edge','QUEEN’S EDGE','SPELL',0,0,'edge','#956039','EPIC'],['seal','COUNTER SEAL','TRAP',0,0,'seal','#684e82','RARE'],['mirror','MIRROR WARD','TRAP',0,0,'mirror','#526783','COMMON'],['pulse','LAST PULSE','SPELL',0,0,'pulse','#39726c','COMMON'],
] as const;
const makeDeck=(enemy=false):Card[]=>[...base,...base].map((x,i)=>({id:`${enemy?'e':'p'}-${x[0]}-${i}`,name:x[1],kind:x[2],atk:x[3],def:x[4],mark:x[5],color:x[6],rarity:x[7]} as Card));
const fresh=(enemy=false):Side=>({deck:makeDeck(enemy),hand:[],front:Array(5).fill(null),back:Array(5).fill(null),grave:[],lp:4000});
const emptyEco=():Economy=>({summon:0,set:0,spell:0});
const stage=(turn:number)=>turn<3?{name:'OPENING',slots:1,cap:1400}:turn<5?{name:'ESCALATION',slots:3,cap:1800}:{name:'REIGN',slots:5,cap:Infinity};
const summonReason=(c:Card,s:Side,turn:number,eco:Economy)=>{const g=stage(turn),cost=tributeCost(c),field=s.front.filter(Boolean).length;if(eco.summon)return'Summon allowance used (1/1).';if(field-cost>=g.slots)return`${g.name}: maximum ${g.slots} active hero${g.slots>1?'es':''}.`;if(turn<3&&(c.atk>1400||!['COMMON','RARE'].includes(c.rarity)))return'Opening: Common/Rare hero with 1400 ATK or less only.';if(turn<5&&c.atk>1800)return'Escalation: hero above 1800 ATK requires fusion.';if(field<cost)return cost===1?'Requires one tribute.':'Requires two tributes.';return''};
const tributeCost=(c:Card)=>c.atk<=1400?0:c.atk<=2000?1:2;
const count=(s:Side)=>({field:s.front.filter(Boolean).length+s.back.filter(Boolean).length,total:s.deck.length+s.hand.length+s.front.filter(Boolean).length+s.back.filter(Boolean).length+s.grave.length});

export default function ArenaPage(){
 const [screen,setScreen]=useState<'category'|'search'|'found'|'duel'>('category'),[category,setCategory]=useState<MatchCategory|null>(null),[p,setP]=useState(()=>fresh()),[e,setE]=useState(()=>fresh(true));
 const [phase,setPhase]=useState<Phase>('DRAW'),[turn,setTurn]=useState(1),[mine,setMine]=useState(true),[sel,setSel]=useState<Card|null>(null),[viewedEnemy,setViewedEnemy]=useState<Card|null>(null),[action,setAction]=useState<Action>(null),[att,setAtt]=useState<number|null>(null),[tributePick,setTributePick]=useState<number[]>([]),[message,setMessage]=useState('Opponent signal acquired.'),[opening,setOpening]=useState(false),[eco,setEco]=useState<Economy>(emptyEco),[enemyEco,setEnemyEco]=useState<Economy>(emptyEco),[winner,setWinner]=useState<'REINA'|'SILENTINDEX'|null>(null),[queueTime,setQueueTime]=useState(0),[duelRun,setDuelRun]=useState(0),[soundOn,setSoundOn]=useState(true);
 useEffect(()=>{try{setSoundOn(localStorage.getItem('reina-sound')!=='off')}catch{}},[]);
 const toggleSound=()=>{const next=!soundOn;setSoundOn(next);try{localStorage.setItem('reina-sound',next?'on':'off')}catch{}};
 const acceptedRef=useRef(false),duelRoot=useRef<HTMLElement>(null);
 const winnerRef=useRef<typeof winner>(null),playerLpRef=useRef(4000),enemyLpRef=useRef(4000),playerDrawnTurnRef=useRef(0),fixtureUsedRef=useRef(false),g=stage(turn);
 const soundOnRef=useRef(soundOn);
 useEffect(()=>{soundOnRef.current=soundOn},[soundOn]);
 const sound=useCallback((cue:'select'|'connecting'|'open'|'press')=>{if(!soundOnRef.current)return;const audio=new Audio(`/arena/audio/${cue}.ogg`);audio.volume=cue==='connecting'?.18:.32;void audio.play().catch(()=>{})},[]);
 const sidesRef=useRef({p,e});
 useLayoutEffect(()=>{sidesRef.current={p,e}},[p,e]);
 const finish=useCallback((requested:'REINA'|'SILENTINDEX',deckOut:'REINA'|'SILENTINDEX'|null=null)=>{if(winnerRef.current)return false;const next=terminalWinner(playerLpRef.current,enemyLpRef.current,deckOut,requested);if(!next)return false;winnerRef.current=next;setWinner(next);setSel(null);setAction(null);setAtt(null);setTributePick([]);return true},[]);
 const damage=useCallback((who:'p'|'e',amount:number)=>{if(winnerRef.current)return;const lpRef=who==='p'?playerLpRef:enemyLpRef,result=damageOutcome(lpRef.current,amount);lpRef.current=result.lp;if(result.lethal)finish(who==='p'?'SILENTINDEX':'REINA');const setter=who==='p'?setP:setE;setter(side=>({...side,lp:result.lp}))},[finish]);
 useEffect(()=>{if(screen!=='search')return;setQueueTime(0);sound('connecting');const testFixture=process.env.NODE_ENV!=='production'&&new URLSearchParams(location.search).has('arenaFixture'),tick=setInterval(()=>setQueueTime(t=>t+1),1000),found=setTimeout(()=>{setScreen('found');sound('open')},testFixture?0:4200);return()=>{clearInterval(tick);clearTimeout(found)}},[screen,sound]);
 const draw=useCallback((who:'p'|'e')=>{if(winnerRef.current)return false;const side=sidesRef.current[who],result=drawOutcome(side.deck,side.hand);if(result.deckOut){const next=who==='p'?'SILENTINDEX':'REINA';finish(next,next);setMessage(`${who==='p'?'REINA':'SILENTINDEX'} cannot draw. Deck out.`);return false}const setter=who==='p'?setP:setE;sidesRef.current[who]={...side,deck:result.deck,hand:result.hand};setter(s=>({...s,deck:result.deck,hand:result.hand}));return true},[finish]);
 const accept=()=>{if(acceptedRef.current)return;acceptedRef.current=true;let a=fresh(),b=fresh(true);const params=new URLSearchParams(location.search),fixture=process.env.NODE_ENV==='production'?null:params.get('arenaFixture'),requestedHand=process.env.NODE_ENV==='production'?null:Number(params.get('arenaHand'));if(fixture&&!fixtureUsedRef.current){fixtureUsedRef.current=true;if(fixture==='deck-out'||fixture==='final-draw')a={...a,deck:a.deck.slice(0,fixture==='deck-out'?5:6)}}const openingCount=fixture==='dense'&&Number.isInteger(requestedHand)&&requestedHand!>=1&&requestedHand!<=10?requestedHand!-1:5;playerLpRef.current=a.lp;enemyLpRef.current=b.lp;a={...a,hand:a.deck.slice(0,openingCount),deck:a.deck.slice(openingCount)};b={...b,hand:b.deck.slice(0,5),deck:b.deck.slice(5)};setP(a);setE(b);setOpening(true);setScreen('duel');setDuelRun(x=>x+1);setMessage(`Opening draw complete. ${openingCount} cards in hand.`)};
 useEffect(()=>{if(!opening)return;const delay=cancellableDelay(window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:400);void delay.promise.then(active=>{if(active)setOpening(false)});return delay.cancel},[opening,duelRun]);
 useEffect(()=>{
  if(screen!=='duel')return;
  const media=gsap.matchMedia(),context=gsap.context(()=>media.add('(prefers-reduced-motion: no-preference)',()=>{
   gsap.timeline({defaults:{ease:'power3.out'}}).addLabel('open').from('.board',{scale:.97,duration:.38},'open').from('.duelist-information',{x:(_i:number)=>_i?-24:24,duration:.3},'open+=.06').from('.arena-duel-nav',{y:-14,duration:.25},'open+=.1').from('.commands',{y:14,duration:.22},'open+=.16');
  }),duelRoot);
  return()=>{media.revert();context.revert()};
 },[screen,duelRun]);
 useEffect(()=>{if(screen==='duel'&&!opening)duelRoot.current?.querySelector<HTMLButtonElement>('.command-primary')?.focus({preventScroll:true})},[screen,opening]);
 const resetDuel=(next:'duel'|'category')=>{acceptedRef.current=false;winnerRef.current=null;playerLpRef.current=4000;enemyLpRef.current=4000;playerDrawnTurnRef.current=0;setWinner(null);setP(fresh());setE(fresh(true));setPhase('DRAW');setTurn(1);setMine(true);setSel(null);setAction(null);setAtt(null);setTributePick([]);setOpening(false);setEco(emptyEco());setEnemyEco(emptyEco());setMessage(next==='duel'?'Rematch ready. Opening hands dealt.':'Choose a duel category.');setScreen(next);if(next==='duel')accept()};
 const endTurn=()=>{if(!mine||winner)return;setSel(null);setAction(null);setAtt(null);setTributePick([]);setMine(false);setMessage('SILENTINDEX turn.');};
 useEffect(()=>{if(screen!=='duel'||!mine||phase!=='DRAW'||winnerRef.current||playerDrawnTurnRef.current===turn)return;playerDrawnTurnRef.current=turn;if(draw('p')){setPhase('MAIN');setMessage(`${g.name}: Choose a card action.`)}},[screen,mine,phase,turn,duelRun,draw,g.name]);
 const tribute=(s:Side,n:number)=>{const victims=tributeIndices(s.front,n),front=[...s.front],grave=[...s.grave];victims.forEach(i=>{grave.push(front[i]!);front[i]=null});return{side:{...s,front,grave},slot:victims[0]??front.findIndex(x=>!x)}};
 const chooseTribute=(i:number)=>{if(!sel||(action!=='SUMMON'&&action!=='DEFENSE'))return;const card=sel,cost=tributeCost(card);if(!cost||!p.front[i])return;const next=tributePick.includes(i)?tributePick.filter(x=>x!==i):tributePick.length<cost?[...tributePick,i]:tributePick;if(next.length<cost){setTributePick(next);setMessage(`Choose ${cost} tribute${cost>1?'s':''}. ${next.length}/${cost} selected.`);return}setP(s=>{const front=[...s.front],grave=[...s.grave];next.forEach(x=>{const victim=front[x];if(victim){grave.push(victim);front[x]=null}});front[next[0]]={...card,defense:action==='DEFENSE',ready:turn+1};return{...s,hand:s.hand.filter(x=>x.id!==card.id),front,grave}});setEco(x=>({...x,summon:1}));setMessage(`${card.name} summoned using ${cost} chosen tribute${cost>1?'s':''}. Summoning sickness active.`);setTributePick([]);setSel(null);setAction(null)};
 const place=(i:number)=>{if(!sel||phase!=='MAIN'||!mine)return;if(action==='SUMMON'||action==='DEFENSE'){const reason=summonReason(sel,p,turn,eco);if(reason){setMessage(reason);return}const cost=tributeCost(sel);if(cost){setMessage(`Choose ${cost} tribute${cost>1?'s':''} first.`);return}setP(s=>{const front=[...s.front];front[i]={...sel,defense:action==='DEFENSE',ready:turn+1};return{...s,hand:s.hand.filter(x=>x.id!==sel.id),front}});setEco(x=>({...x,summon:1}));setMessage(`${sel.name} summoned. Summoning sickness active.`)}else if(action==='SET'){if(eco.set){setMessage('Set allowance used (1/1).');return}setP(s=>{const back=[...s.back];back[i]={...sel,face:true,setAt:turn};return{...s,hand:s.hand.filter(x=>x.id!==sel.id),back}});setEco(x=>({...x,set:1}));setMessage(`${sel.name} set. Armed for opponent turn.`)}setSel(null);setAction(null)};
 const setSupport=()=>{if(!sel||!mine||phase!=='MAIN')return;if(eco.set){setMessage('Set allowance used (1/1).');return}const slot=p.back.findIndex(x=>!x);if(slot<0){setMessage('Support row full. Clear one slot before setting a card.');return}setP(s=>{const back=[...s.back];back[slot]={...sel,face:true,setAt:turn};return{...s,hand:s.hand.filter(x=>x.id!==sel.id),back}});setEco(x=>({...x,set:1}));setMessage(`${sel.name} set in support slot ${slot+1}. Armed for opponent turn.`);setSel(null);setAction(null)};
 const activate=()=>{if(!sel||sel.kind!=='SPELL'||winnerRef.current)return;if(eco.spell){setMessage('Direct spell allowance used (1/1).');return}if(turn<3){setMessage('Opening: direct damage spells unavailable.');return}const amount=spellDamage(sel.name);damage('e',amount);setP(s=>({...s,hand:s.hand.filter(x=>x.id!==sel.id),grave:[...s.grave,sel]}));setEco(x=>({...x,spell:1}));setMessage(`${sel.name} resolves. ${amount} direct damage.`);setSel(null);setAction(null)};
 const activateSupport=(i:number)=>{const card=p.back[i];if(!mine||phase!=='MAIN'||!card||card.kind!=='SPELL'||winnerRef.current)return;if((card.setAt??turn)>=turn){setMessage(`${card.name} is not armed until your next turn.`);return}if(eco.spell){setMessage('Spell allowance used (1/1).');return}const amount=spellDamage(card.name);damage('e',amount);setP(s=>{const back=[...s.back];back[i]=null;return{...s,back,grave:[...s.grave,card]}});setEco(x=>({...x,spell:1}));setMessage(`${card.name} activates from support. ${amount} direct damage.`)};
 const attack=(target:number|null)=>{
  if(!mine||winnerRef.current||phase!=='BATTLE'||att===null)return;
  if(turn===1){setMessage('Opening turn: attacks unavailable.');return}
  const attacker=att,hero=p.front[attacker];
  if(!hero||hero.used)return;
  if((hero.ready??0)>turn){setMessage('Summoning sickness: hero attacks next own turn.');return}
  if(target===null&&e.front.some(Boolean)){setMessage('Direct attack blocked while enemy hero remains.');return}
  const trap=e.back.findIndex(x=>x?.kind==='TRAP'&&trapOutcome(x.name,hero.atk,turn,x.setAt??turn).armed);
  if(trap>=0){
   const card=e.back[trap]!,effect=trapOutcome(card.name,hero.atk,turn,card.setAt??turn);
   setE(s=>{const back=[...s.back];back[trap]=null;return{...s,back,grave:[...s.grave,card]}});
   if(effect.reflected)damage('p',effect.reflected);
   setMessage(effect.reflected?`MIRROR WARD reflects ${effect.reflected} damage.`:'COUNTER SEAL negates the attack.');
  }else{
   const defender=target===null?null:e.front[target];
   if(target!==null&&!defender)return;
   const outcome=battleOutcome(hero.atk,defender);
   if(target===null){damage('e',outcome.damage);setMessage(`Direct attack lands. ${outcome.damage} damage.`)}
   else{
    if(outcome.targetDestroyed)setE(s=>{const front=[...s.front];front[target]=null;return{...s,front,grave:[...s.grave,defender!]}});
    if(outcome.damage)damage(outcome.targetDestroyed?'e':'p',outcome.damage);
    setMessage(outcome.attackerDestroyed?`${hero.name} and ${defender!.name} destroyed.`:outcome.targetDestroyed?`${defender!.name} destroyed. ${outcome.damage} damage to SILENTINDEX.`:outcome.damage?`Attack repelled. ${outcome.damage} damage to REINA.`:'Equal battle. no hero destroyed.');
    if(outcome.attackerDestroyed)setP(s=>{const front=[...s.front];front[attacker]=null;return{...s,front,grave:[...s.grave,hero]}});
   }
  }
  if(!winnerRef.current)setP(s=>{const front=[...s.front];if(front[attacker])front[attacker]={...front[attacker]!,used:true};return{...s,front}});
  setAtt(null);
 };
 useEffect(()=>{
  if(mine||screen!=='duel'||winner)return;
  let stop=false;
  const halted=()=>stop||winnerRef.current!==null;
  let delay:ReturnType<typeof cancellableDelay>|null=null;
  const wait=async()=>{delay=cancellableDelay(650);return delay.promise};
  const run=async()=>{
   setEnemyEco(emptyEco());setPhase('DRAW');if(!draw('e'))return;setPhase('MAIN');if(!await wait()||halted())return;
   let summoned=false;
   setE(s=>{if(winnerRef.current)return s;const heroes=s.hand.filter(c=>c.kind==='HERO').sort((a,b)=>b.atk-a.atk);const c=heroes.find(c=>{if(summonReason(c,s,turn,emptyEco()))return false;const cost=tributeCost(c);return !cost||tributeUpgrade(c,s.front,cost)});if(!c)return s;const cost=tributeCost(c),q=tribute(s,cost),i=cost?q.slot:q.side.front.findIndex((x,j)=>!x&&j<g.slots);if(i<0)return s;const front=[...q.side.front];front[i]={...c,ready:turn+1};summoned=true;setMessage(`SILENTINDEX summons ${c.name}.`);return{...q.side,hand:q.side.hand.filter(x=>x.id!==c.id),front}});
   if(summoned)setEnemyEco(x=>({...x,summon:1}));if(!await wait()||halted())return;
   setE(s=>{if(winnerRef.current)return s;const c=s.hand.find(x=>x.kind==='TRAP'||(x.kind==='SPELL'&&turn<3));if(!c)return s;const i=s.back.findIndex(x=>!x);if(i<0)return s;const back=[...s.back];back[i]={...c,face:true,setAt:turn};setEnemyEco(x=>({...x,set:1}));setMessage('SILENTINDEX sets one support.');return{...s,hand:s.hand.filter(x=>x.id!==c.id),back}});
   if(!await wait()||halted())return;
   if(turn>=3){
    const s=sidesRef.current.e,c=s.hand.find(x=>x.kind==='SPELL');
    if(c){const amount=spellDamage(c.name);damage('p',amount);setEnemyEco(x=>({...x,spell:1}));setMessage(`SILENTINDEX activates ${c.name}. ${amount} damage.`);setE({...s,hand:s.hand.filter(x=>x.id!==c.id),grave:[...s.grave,c]})}
    if(!await wait()||halted())return;
   }
   setPhase('BATTLE');
   const resolveBattle=(s:Side)=>{
    if(winnerRef.current)return s;
    const attacker=turn===1?-1:s.front.findIndex(x=>x&&!x.used&&(x.ready??0)<=turn),hero=attacker>=0?s.front[attacker]:null;
    if(!hero)return s;
    let next=s;
    const player=sidesRef.current.p;
    const targets=player.front.map((card,index)=>({card,index})).filter(x=>x.card);
    const trap=player.back.findIndex(x=>x?.kind==='TRAP'&&trapOutcome(x.name,hero.atk,turn,x.setAt??turn).armed);
    if(trap>=0){
     const card=player.back[trap]!,effect=trapOutcome(card.name,hero.atk,turn,card.setAt??turn);
     setP(q=>{const back=[...q.back];back[trap]=null;return{...q,back,grave:[...q.grave,card]}});
     if(effect.reflected){const result=damageOutcome(enemyLpRef.current,effect.reflected);enemyLpRef.current=result.lp;next={...next,lp:result.lp};if(result.lethal)finish('REINA')}
     setMessage(effect.reflected?`MIRROR WARD reflects ${effect.reflected} damage to SILENTINDEX.`:'COUNTER SEAL negates SILENTINDEX attack.');
    }else if(!targets.length){
     damage('p',hero.atk);setMessage(`${hero.name} attacks directly. ${hero.atk}.`);
    }else{
     const target=targets.sort((a,b)=>(a.card!.defense?a.card!.def:a.card!.atk)-(b.card!.defense?b.card!.def:b.card!.atk))[0],outcome=battleOutcome(hero.atk,target.card!);
     if(outcome.targetDestroyed)setP(q=>{const front=[...q.front];front[target.index]=null;return{...q,front,grave:[...q.grave,target.card!]}});
     if(outcome.damage){if(outcome.targetDestroyed)damage('p',outcome.damage);else{const result=damageOutcome(enemyLpRef.current,outcome.damage);enemyLpRef.current=result.lp;next={...next,lp:result.lp};if(result.lethal)finish('REINA')}}
     setMessage(outcome.attackerDestroyed?`${hero.name} and ${target.card!.name} destroyed.`:outcome.targetDestroyed?`${target.card!.name} destroyed. ${outcome.damage} damage to REINA.`:outcome.damage?`Attack repelled. ${outcome.damage} damage to SILENTINDEX.`:'Equal battle. no hero destroyed.');
     if(outcome.attackerDestroyed){const front=[...next.front];front[attacker]=null;return{...next,front,grave:[...next.grave,hero]}}
    }
    if(winnerRef.current)return next;
    const front=[...next.front];front[attacker]={...hero,used:true};return{...next,front};
   };
   // Resolve once outside React's replayable state updaters.
   setE(resolveBattle(sidesRef.current.e));
   if(!await wait()||halted())return;
   setTurn(t=>t+1);setP(s=>({...s,front:s.front.map(x=>x?{...x,used:false}:x)}));setE(s=>({...s,front:s.front.map(x=>x?{...x,used:false}:x)}));setEco(emptyEco());setPhase('DRAW');setMine(true);setMessage('Your turn. Draw, then act.');
  };
  run();return()=>{stop=true;delay?.cancel()};
 },[mine,screen,winner,turn,g.slots,draw,damage,finish,duelRun]);
 const reason=useMemo(()=>!sel?'':sel.kind==='HERO'?summonReason(sel,p,turn,eco):sel.kind==='SPELL'?(turn<3?'Opening: direct damage spells unavailable.':eco.spell?'Spell allowance used (1/1).':''):eco.set?'Set allowance used (1/1).':'',[sel,p,turn,eco]);
 const preview=att===null?'':!e.front.some(Boolean)?`${p.front[att]?.atk??0} direct damage`: 'Choose target to compare ATK against battle value';const pc=count(p),ec=count(e),inspected=action?null:sel??viewedEnemy,tributeRequired=reason.startsWith('Requires one tribute')||reason.startsWith('Requires two tributes');
 if(screen!=='duel')return <ArenaEntry screen={screen} category={category} elapsed={queueTime} soundOn={soundOn} onSound={toggleSound} onSelect={key=>{sound('select');setCategory(key)}} onStart={()=>{if(category)setScreen('search')}} onCancel={()=>setScreen('category')} onAccept={accept}/>;
 return <main ref={duelRoot} className="arena arena-route-enter"><header className="arena-duel-nav"><Link className="duel-leave" href="/dashboard"><span aria-hidden="true">←</span> EXIT</Link><div className="duel-identity"><i aria-hidden="true">R</i><span><b>REINA ARENA</b><small>QUEEN’S QUIET COURTYARD</small></span></div><div className="duel-state"><span><small>TURN</small><b>{turn}</b></span><span><small>STAGE</small><b>{g.name}</b></span><span><small>PHASE</small><b>{phase}</b></span><em>{mine?'YOUR MOVE':'OPPONENT'}</em></div></header><section inert={opening} data-entry-ready={!opening} className={`duel ${opening?'opening':''}`}>
  <Stats enemy side={e} c={ec}/><div className="board canvas-board"><BattlefieldCanvas enemy={e} player={p}/><div className="battlefield-lanes battlefield-semantics" aria-label="Interactive battlefield controls"><section className="battlefield-territory enemy-territory" aria-label="SILENTINDEX field"><header>SILENTINDEX FIELD</header><div className="territory-rows"><Zone cards={e.back} back enemy/><Zone cards={e.front} enemy onCard={i=>att!==null?attack(i):setViewedEnemy(e.front[i])} targetable/></div><Piles side={e} enemy/></section><div className="battlefield-divider" aria-hidden="true"/><section className="battlefield-territory player-territory" aria-label="REINA field"><header>REINA FIELD</header><div className="territory-rows"><Zone cards={p.front} onEmpty={i=>place(i)} onCard={i=>action==='SUMMON'||action==='DEFENSE'?chooseTribute(i):mine&&turn>1&&phase==='BATTLE'?setAtt(i):setViewedEnemy(p.front[i])} selected={att} selectedMany={tributePick} valid={!!sel&&(action==='SUMMON'||action==='DEFENSE')}/><Zone cards={p.back} back onEmpty={i=>place(i)} onCard={activateSupport} onInspect={i=>setViewedEnemy(p.back[i])} valid={!!sel&&action==='SET'}/></div><Piles side={p}/></section></div></div><Stats side={p} c={pc}/>
  <div className="perimeter"><div className="resource-strip"><span><b>SUMMON</b><strong>{eco.summon}<i>/1</i></strong></span><span><b>SET</b><strong>{eco.set}<i>/1</i></strong></span><span><b>SPELL</b><strong>{eco.spell}<i>/1</i></strong></span><span className="board-rule"><b>FIELD</b><strong>{g.slots}<i> slots</i></strong><small>{g.name} / cap {g.cap===Infinity?'OPEN':g.cap}</small></span></div></div>
  <div className={`hand hand-size-${Math.min(p.hand.length,10)}`}>{p.hand.map((c,i)=><CardView key={c.id} card={c} hand index={i} active={sel?.id===c.id} onClick={()=>{if(mine&&phase==='MAIN'){setSel(c);setAction(null);setTributePick([])}}}/>)}</div>
  {inspected&&<button className="inspect-backdrop" aria-label="Dismiss card details" onClick={()=>{setSel(null);setViewedEnemy(null);setAction(null)}}/>}<aside className={`inspect ${inspected?'has-card':''}`} role={inspected?'dialog':undefined} aria-modal={inspected?'true':undefined} aria-label={inspected?`${inspected.name} card details`:undefined}>{inspected?<><div className="inspect-kicker"><span>CARD DETAILS / {inspected.kind}</span><button aria-label="Close card details" onClick={()=>{setSel(null);setViewedEnemy(null);setAction(null)}}>CLOSE</button></div><div className="inspect-card"><CardView card={inspected}/><div className="inspect-info"><h2>{inspected.name}</h2><p><b>{inspected.rarity}</b><span>{inspected.kind==='HERO'?`ATK ${inspected.atk} / DEF ${inspected.def}`:'TACTICAL EFFECT'}</span></p></div></div>{sel&&<div className="inspect-actions">{sel.kind==='HERO'?<><button disabled={!!reason&&!tributeRequired} onClick={()=>{setAction('SUMMON');setMessage(tributeRequired?reason:'Summon selected. Choose an illuminated front slot.')}}>SUMMON</button><button disabled={!!reason&&!tributeRequired} onClick={()=>{setAction('DEFENSE');setMessage(tributeRequired?reason:'Defense selected. Choose an illuminated front slot.')}}>DEFENSE</button></>:sel.kind==='SPELL'?<><button disabled={!!reason} onClick={activate}>ACTIVATE</button><button disabled={!!eco.set||p.back.every(Boolean)} onClick={setSupport}>SET SUPPORT</button></>:<button disabled={!!eco.set||p.back.every(Boolean)} onClick={setSupport}>SET SUPPORT</button>}<button className="cancel-action" onClick={()=>{setSel(null);setAction(null)}}>CANCEL</button></div>}{reason&&<em className="inspect-reason">{reason}</em>}</>:<p className="inspect-empty">Select a card in hand to inspect.</p>}</aside>
  <div className="commands">{action&&<small className="placement-hint">{action==='SET'?'CHOOSE BACK ROW SLOT':'CHOOSE FRONT ROW SLOT'}</small>}<div className="phase-actions"><span className="phase-label">{phase==='DRAW'?'DRAWING CARD':phase==='MAIN'?'MAIN PHASE':'BATTLE PHASE'}</span>{action&&<button aria-label="Cancel placement" onClick={()=>{setAction(null);setSel(null);setTributePick([]);setMessage('Placement cancelled. Choose a card action.')}}>CANCEL</button>}{phase==='MAIN'&&mine&&!action&&<button className="command-primary" onClick={()=>{setPhase('BATTLE');setSel(null);setAction(null);setMessage(turn===1?'First turn: attacks unavailable. End turn when ready.':'Battle phase. Select attacker.')}}>ENTER BATTLE</button>}{att!==null&&!e.front.some(Boolean)&&turn>1&&<button className="command-danger" onClick={()=>attack(null)}>DIRECT ATTACK</button>}<button className="command-end" disabled={!mine||!!winner} onClick={endTurn}>END TURN <i>↗</i></button></div><span className="command-status" role="status" aria-live="polite">{winner?`${winner} wins`:preview||message}</span></div>
  {winner&&<section className="duel-result" role="dialog" aria-modal="true" aria-labelledby="duel-result-title"><small>DUEL COMPLETE</small><h2 id="duel-result-title">{winner==='REINA'?'VICTORY':'DEFEAT'}</h2><p>{winner} wins / turn {turn}</p><div><button className="command-primary" onClick={()=>resetDuel('duel')}>REMATCH</button><button className="command-end" onClick={()=>resetDuel('category')}>CHANGE CATEGORY</button></div></section>}
 </section></main>;
}
function BattlefieldCanvas({enemy,player}:{enemy:Side;player:Side}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const draw=()=>{const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),width=Math.max(1,Math.round(box.width*dpr)),height=Math.max(1,Math.round(box.height*dpr));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}const ctx=canvas.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,box.width,box.height);const w=box.width,h=box.height,pad=Math.max(8,w*.025),pileW=Math.max(38,Math.min(58,w*.1)),fieldW=w-pad*2-pileW-12,laneGap=1,divider=18,territory=(h-divider)/2,header=18,laneH=(territory-header-laneGap)/2;
  const territoryFill=(y:number,playerSide:boolean)=>{ctx.fillStyle=playerSide?'rgba(65,22,31,.56)':'rgba(20,26,38,.62)';ctx.fillRect(pad,y,fieldW+pileW+8,territory);ctx.fillStyle='#d8c9b5';ctx.font=`700 ${Math.max(8,Math.min(11,w*.018))}px ui-monospace, monospace`;ctx.textBaseline='middle';ctx.fillText(playerSide?'REINA FIELD':'SILENTINDEX FIELD',pad+6,y+header/2)};
  territoryFill(0,false);territoryFill(territory+divider,true);ctx.fillStyle='rgba(224,60,78,.7)';ctx.fillRect(pad,territory+divider/2-1,fieldW+pileW+8,2);
  const drawLane=(cards:(Card|null)[],label:string,y:number,enemySide:boolean)=>{const labelW=Math.max(42,Math.min(66,fieldW*.16)),slotsX=pad+labelW,slotsW=fieldW-labelW,slotGap=Math.max(3,slotsW*.012),slotW=(slotsW-slotGap*4)/5;ctx.fillStyle='rgba(5,5,8,.72)';ctx.fillRect(pad,y,fieldW,laneH);ctx.fillStyle='#ad9b83';ctx.font=`700 ${Math.max(7,Math.min(9,w*.015))}px ui-monospace, monospace`;ctx.fillText(label,pad+5,y+laneH/2);};
  const enemyBase=header+4,playerBase=territory+divider+header+4;drawLane(enemy.back,'SUPPORT',enemyBase,true);drawLane(enemy.front,'HERO',enemyBase+laneH+laneGap,true);drawLane(player.front,'HERO',playerBase,false);drawLane(player.back,'SUPPORT',playerBase+laneH+laneGap,false);
  const piles=(side:Side,y:number)=>{const x=pad+fieldW+12,cellH=(territory-header-12)/2;ctx.strokeStyle='rgba(224,60,78,.58)';ctx.beginPath();ctx.moveTo(x-6,y+header);ctx.lineTo(x-6,y+territory-4);ctx.stroke();ctx.fillStyle='#ad9b83';ctx.font='700 7px ui-monospace, monospace';ctx.textAlign='center';ctx.fillText('PILES',x+pileW/2,y+header/2);[['DECK',side.deck.length],['GRAVE',side.grave.length]].forEach(([label,count],i)=>{const py=y+header+4+i*(cellH+4);ctx.fillStyle='rgba(5,5,8,.78)';ctx.fillRect(x,py,pileW,cellH);ctx.strokeStyle='rgba(173,155,131,.42)';ctx.strokeRect(x+.5,py+.5,pileW-1,cellH-1);ctx.fillStyle='#d8c9b5';ctx.textAlign='center';ctx.font=`700 ${Math.max(7,Math.min(10,pileW*.18))}px ui-monospace, monospace`;ctx.fillText(String(count),x+pileW/2,py+cellH*.42);ctx.font=`700 ${Math.max(6,Math.min(8,pileW*.14))}px ui-monospace, monospace`;ctx.fillText(String(label),x+pileW/2,py+cellH*.7);ctx.textAlign='start'})};piles(enemy,0);piles(player,territory+divider)};draw();const observer=new ResizeObserver(draw);observer.observe(canvas);return()=>observer.disconnect()},[enemy,player]);
 return <canvas ref={ref} className="battlefield-canvas" data-renderer="canvas-2d" data-lane-gap="1" aria-hidden="true"/>;
}
function Stats({side,c,enemy}:{side:Side;c:{field:number;total:number};enemy?:boolean}){return <aside className={`stats duelist-information ${enemy?'enemy':''}`}><div className="duelist-name"><small>{enemy?'OPPONENT':'DUELIST'}</small><strong>{enemy?'SILENTINDEX':'REINA'}</strong></div><b className="duelist-lp">LP {String(side.lp).padStart(4,'0')}</b><dl><div><dt>DECK</dt><dd>{side.deck.length}</dd></div><div><dt>HAND</dt><dd>{side.hand.length}</dd></div><div><dt>FIELD</dt><dd>{c.field}</dd></div><div><dt>GRAVE</dt><dd>{side.grave.length}</dd></div><div><dt>TOTAL</dt><dd>{c.total}</dd></div></dl>{enemy&&<div className="hidden-hand">{side.hand.map(x=><i key={x.id}/>)}</div>}</aside>}
function Piles({side,enemy}:{side:Side;enemy?:boolean}){return <div className={`piles ${enemy?'enemy':''}`}><div className="pile deck"><b>{side.deck.length}</b><span>DECK</span></div><div className="pile grave"><b>{side.grave.length}</b><span>GRAVE</span></div></div>}
function Zone({cards,back,enemy,onEmpty,onCard,onInspect,selected,selectedMany=[],valid,targetable}:{cards:(Card|null)[];back?:boolean;enemy?:boolean;onEmpty?:(i:number)=>void;onCard?:(i:number)=>void;onInspect?:(i:number)=>void;selected?:number|null;selectedMany?:number[];valid?:boolean;targetable?:boolean}){return <div className={`zone-wrap ${back?'support-zone':'hero-zone'} ${enemy?'enemy-zone':''}`}><small className="zone-label">{back?'SUPPORT':'HERO'}</small><div className={`zone ${back?'back':''}`}>{cards.map((c,i)=>{const cardInteractive=Boolean(onCard&&(targetable??true));const interactive=Boolean(c?cardInteractive:onEmpty&&valid);const activate=()=>{if(c&&cardInteractive)onCard?.(i);else if(!c&&valid)onEmpty?.(i)};return <div key={i} role={interactive?'button':undefined} tabIndex={interactive?0:-1} aria-label={c?`${c.name}, slot ${i+1}`:`Empty slot ${i+1}`} className={`slot ${selected===i||selectedMany.includes(i)?'selected':''} ${!c&&valid?'valid':''} ${c&&targetable?'targetable':''}`} onClick={activate} onKeyDown={event=>{if(event.shiftKey&&event.key==='Enter'&&c&&onInspect){event.preventDefault();onInspect(i);return}if((event.key==='Enter'||event.key===' ')&&interactive){event.preventDefault();activate()}}}>{c?<CardView card={c} hidden={enemy&&c.face} onClick={event=>{event.stopPropagation();if(cardInteractive)onCard?.(i)}}/>:<span aria-hidden="true"/>}</div>})}</div></div>}
function CardView({card,hidden,hand,index=0,active,onClick}:{card:Card;hidden?:boolean;hand?:boolean;index?:number;active?:boolean;onClick?:(event:React.MouseEvent<HTMLButtonElement>)=>void}){const label=hidden?'Set card':onClick?`${hand?'Select':'Activate'} ${card.name}`:card.name;const stance=card.kind==='HERO'?(card.defense?'defense':'attack'):undefined;return <button type="button" aria-label={label} data-stance={stance} onClick={onClick} className={`card ${hand?'in-hand':''} ${active?'active':''} ${card.used?'used':''} ${hidden?'concealed':''}`} style={{'--tone':card.color,'--i':index} as React.CSSProperties}><small>{hidden?'SET':`${card.rarity} / ${card.kind}`}</small><div className={`card-art art-${card.mark}`} aria-hidden="true"><i/><i/><i/></div><strong>{hidden?'UNKNOWN':card.name}</strong>{!hidden&&<em>{card.kind==='HERO'?<>{card.defense?'DEF':'ATK'} {card.defense?card.def:card.atk}<span className="card-full-stats"> / {card.atk}/{card.def}</span></>:'TACTICAL CARD'}</em>}</button>}
