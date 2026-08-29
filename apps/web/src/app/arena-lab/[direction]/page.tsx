'use client';

import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useState} from 'react';
import '../arena-lab.css';

const directions={
 'crimson-courtyard':{title:'Crimson Courtyard',place:'Royal duel ground',material:'Lacquer and stone'},
 'tactical-table':{title:'Tactical War Table',place:'Field command table',material:'Leather and brass'},
 'arcane-chamber':{title:'Arcane Duel Chamber',place:'Resonance vault',material:'Obsidian and light'},
} as const;

type Direction=keyof typeof directions;
type HandCard={id:string;name:string;kind:'HERO'|'SPELL'|'TRAP';power:string;mark:string};

const openingHand:HandCard[]=[
 {id:'rei',name:'REI ZERO',kind:'HERO',power:'2200 / 1200',mark:'R'},
 {id:'chise',name:'CHISE BLADE',kind:'HERO',power:'1750 / 1100',mark:'C'},
 {id:'surge',name:'CRIMSON SURGE',kind:'SPELL',power:'600 DAMAGE',mark:'S'},
 {id:'seal',name:'COUNTER SEAL',kind:'TRAP',power:'NEGATE',mark:'V'},
 {id:'mira',name:'MIRA VEIL',kind:'HERO',power:'1350 / 1400',mark:'M'},
];

export default function ArenaDirectionPage(){
 const params=useParams<{direction:string}>();
 const direction=(params.direction in directions?params.direction:'tactical-table') as Direction;
 const copy=directions[direction];
 const [selected,setSelected]=useState<HandCard|null>(null);
 const [hero,setHero]=useState<HandCard|null>(null);
 const [message,setMessage]=useState('Main phase. Choose a card from your hand.');
 const select=(card:HandCard)=>{
  setSelected(card);
  setMessage(card.kind==='HERO'?`Choose a hero slot for ${card.name}.`:`${card.name} ready. Choose a support slot.`);
 };
 const summon=()=>{
  if(!selected||selected.kind!=='HERO')return;
  setHero(selected);
  setMessage(`${titleCase(selected.name)} summoned. Hero enters exhausted.`);
  setSelected(null);
 };
 const hand=openingHand.filter(card=>card.id!==hero?.id);
 return <main className={`arena-lab direction-${direction}`} data-arena-direction={direction}>
  <header className="lab-header">
   <Link href="/arena" className="lab-exit">← ARENA</Link>
   <div className="lab-title"><small>{copy.place}</small><h1>{copy.title}</h1></div>
   <nav aria-label="Arena directions">
    {Object.entries(directions).map(([slug,item])=><Link key={slug} href={`/arena-lab/${slug}`} aria-current={slug===direction?'page':undefined}>{item.title}</Link>)}
   </nav>
  </header>

  <section className="battlefield" aria-label={`${copy.title} battlefield`}>
   <div className="arena-depth" aria-hidden="true"><i/><i/><i/></div>

   <section className="combatant opponent-anchor" data-hud-anchor aria-label="Opponent status">
    <div className="sigil" aria-hidden="true">S</div>
    <span><small>OPPONENT</small><strong>SILENTINDEX</strong></span>
    <b>4000 <small>LP</small></b>
   </section>
   <div className="opponent-reserve" data-hud-anchor aria-label="Opponent reserves"><span>15 DECK</span><span>5 HAND</span><span>0 GRAVE</span></div>

   <section className="board-plane" data-motion-surface>
    <div className="priority-path" aria-hidden="true"><i/><i/><i/></div>
    <div className="phase-mark" data-hud-anchor><small>TURN 1</small><strong>MAIN</strong><span>YOUR PRIORITY</span></div>

    <div className="zone-line opponent-line" aria-label="Opponent hero line">
     {Array.from({length:5},(_,index)=><div className="field-mark" key={index} aria-hidden="true"><span>{index+1}</span></div>)}
    </div>
    <div className="zone-line opponent-support" aria-label="Opponent support row">
     {Array.from({length:5},(_,index)=><div className="support-mark" key={index} aria-hidden="true"/>)}
    </div>

    <div className="duel-axis" role="status" aria-live="polite" data-motion-surface><i aria-hidden="true"/><span>{message}</span></div>

    <div className="zone-line player-support" aria-label="Player support row">
     {Array.from({length:5},(_,index)=><button className="support-mark" key={index} aria-label={`Set support in slot ${index+1}`} disabled={!selected||selected.kind==='HERO'}/>) }
    </div>
    <div className="zone-line player-line" aria-label="Player hero line">
     {Array.from({length:5},(_,index)=>index===0&&hero?<FieldCard key={index} card={hero}/>:<button className={`field-mark ${selected?.kind==='HERO'?'legal':''}`} key={index} aria-label={selected?.kind==='HERO'?`Summon ${titleCase(selected.name)} to hero slot ${index+1}`:`Hero slot ${index+1}`} onClick={index===0?summon:undefined} disabled={!selected||selected.kind!=='HERO'}><span>{index+1}</span></button>)}
    </div>

    <div className="physical-pile opponent-deck" data-hud-anchor aria-label="Opponent deck"><i/><span>15</span></div>
    <div className="physical-pile opponent-grave" data-hud-anchor aria-label="Opponent grave"><span>0</span></div>
    <div className="physical-pile player-deck" data-hud-anchor aria-label="Player deck"><i/><span>14</span><small>DECK</small></div>
    <div className="physical-pile player-grave" data-hud-anchor aria-label="Player grave"><span>0</span><small>GRAVE</small></div>
   </section>

   <section className="combatant player-anchor" data-hud-anchor aria-label="Player status">
    <div className="sigil" aria-hidden="true">R</div>
    <span><small>DUELIST</small><strong>REINA</strong></span>
    <b>4000 <small>LP</small></b>
   </section>
   <div className="turn-allowance" data-hud-anchor aria-label="Turn allowance"><span>SUMMON <b>{hero?'1':'0'}/1</b></span><span>SET <b>0/1</b></span><span>SPELL <b>0/1</b></span></div>
  </section>

  <section className="hand-rail" aria-label="Player hand" data-motion-surface>
   <div className="hand-caption"><small>QUIET BLADE</small><strong>YOUR HAND</strong><span>{hand.length} CARDS</span></div>
   <div className="hand-cards">{hand.map((card,index)=><button key={card.id} className={`hand-card kind-${card.kind.toLowerCase()} ${selected?.id===card.id?'selected':''}`} style={{'--card-index':index} as React.CSSProperties} aria-label={`Select ${titleCase(card.name)}`} aria-pressed={selected?.id===card.id} onClick={()=>select(card)} data-motion-surface><small>{card.kind}</small><i aria-hidden="true">{card.mark}</i><strong>{card.name}</strong><span>{card.power}</span></button>)}</div>
  </section>
  <footer className="lab-note"><span>{copy.material}</span><p>Shared fixture. Select a card, place it, compare battlefield hierarchy.</p></footer>
 </main>;
}

function FieldCard({card}:{card:HandCard}){return <article className="field-card" data-motion-surface><small>{card.kind}</small><i aria-hidden="true">{card.mark}</i><strong>{card.name}</strong><span>ATK {card.power.split(' / ')[0]}</span></article>}
function titleCase(value:string){return value.toLowerCase().replace(/\b\w/g,letter=>letter.toUpperCase())}
