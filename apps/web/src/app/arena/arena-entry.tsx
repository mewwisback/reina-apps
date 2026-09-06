'use client';

import Link from 'next/link';
import {useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import './entry.css';

type Mode='casual'|'ranked'|'event';
const modes={casual:['01','CASUAL','Standard rules. Practice without rank stakes.'],ranked:['02','RANKED','Demo ruleset. Ranking is not connected.'],event:['03','EVENT','Demo ruleset. No event rewards.']} as const;

export function ArenaEntry({screen,category,elapsed,soundOn,onSound,onSelect,onStart,onCancel,onAccept}:{screen:'category'|'search'|'found';category:Mode|null;elapsed:number;soundOn:boolean;onSound:()=>void;onSelect:(mode:Mode)=>void;onStart:()=>void;onCancel:()=>void;onAccept:()=>void}){
 const root=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const media=gsap.matchMedia();
  const context=gsap.context(()=>{
   media.add('(prefers-reduced-motion: no-preference)',()=>{
    const timeline=gsap.timeline({defaults:{ease:'power3.out'}});
    timeline.addLabel('threshold').from('.threshold-title',{y:18,duration:.28},'threshold').from('.threshold-rule',{scaleX:0,transformOrigin:'left',duration:.4},'threshold');
    if(screen==='category')timeline.from('.threshold-mode',{x:24,duration:.32,stagger:.045},'threshold');
    if(screen==='found')timeline.addLabel('arrival',.08).from('.threshold-opponent',{x:16,duration:.48},'arrival').from('.threshold-versus',{scale:1.5,opacity:0,duration:.18},'arrival+=.18').from('.threshold-opponent h2',{x:14,duration:.22},'arrival+=.28');
    const ambient=screen==='search'?gsap.timeline({repeat:-1,yoyo:true}).to('.threshold-deck',{y:-5,rotation:-1,duration:1.7,ease:'sine.inOut'}).to('.threshold-thread',{scaleX:.78,duration:2.1,ease:'sine.inOut'},0):null;
    const visibility=()=>{if(document.hidden)ambient?.pause();else ambient?.resume()};
    document.addEventListener('visibilitychange',visibility);visibility();
    return()=>{document.removeEventListener('visibilitychange',visibility);ambient?.kill()};
   });
  },root);
  if(screen==='found')root.current?.querySelector<HTMLButtonElement>('.threshold-primary')?.focus({preventScroll:true});
  return()=>{media.revert();context.revert()};
 },[screen]);
 useLayoutEffect(()=>{
  const media=gsap.matchMedia();
  const context=gsap.context(()=>media.add('(prefers-reduced-motion: no-preference)',()=>{
   gsap.timeline().to('.threshold-mode[aria-pressed="true"]',{x:-8,duration:.18,ease:'power2.out'}).fromTo('.threshold-deck',{rotation:-4},{rotation:0,duration:.24,ease:'back.out(1.4)'},0);
  }),root);
  return()=>{media.revert();context.revert()};
 },[category]);
 return <main ref={root} className="threshold" data-entry-state={screen}>
  <div className="threshold-environment" aria-hidden="true"/>
  <header className="threshold-nav"><Link href="/dashboard">← LEAVE</Link><span>REINA <small>ARENA</small></span><button aria-label={`${soundOn?'Mute':'Enable'} sound`} aria-pressed={soundOn} onClick={onSound}>SOUND {soundOn?'ON':'OFF'}</button></header>
  <section className="threshold-court">
   <div className="threshold-title"><p className="threshold-kicker">QUEEN’S QUIET COURTYARD</p><h1>{screen==='category'?'Choose your fight':screen==='search'?'Searching the courtyard':'Duelist found'}</h1><p>{screen==='category'?'Choose a ruleset. Bring the quiet blade.':screen==='search'?'Your deck stays here. Cancel at any time.':'The opposing seat is ready.'}</p></div>
   <div className="threshold-rule"/>
   <div className="threshold-table">
    <section className="threshold-player" aria-label="Demo deck"><div className="threshold-deck" aria-hidden="true"><i/><i/><div><small>REINA</small><b>R</b><span>QUIET BLADE</span></div></div><div className="threshold-deck-copy"><p className="threshold-kicker">YOUR DEMO DECK</p><h2>Quiet Blade</h2><p>20 cards · standard starter</p><small>Playing as REINA · demo identity</small></div></section>
    <div className="threshold-thread" aria-hidden="true"/>
    {screen==='category'?<section className="threshold-selection" aria-label="Ruleset selection">{(Object.keys(modes) as Mode[]).map(key=><button key={key} className="threshold-mode" aria-pressed={category===key} onClick={()=>onSelect(key)}><small>{modes[key][0]}</small><span><b>{modes[key][1]}</b><em>{modes[key][2]}</em></span><i aria-hidden="true">{category===key?'◆':'◇'}</i></button>)}</section>:screen==='search'?<section className="threshold-wait"><span className="threshold-seat" aria-hidden="true">Ⅱ</span><p className="threshold-kicker">OPPOSING SEAT</p><h2>Awaiting a duelist</h2><p>{category?.toUpperCase()} · <span aria-label="Elapsed time">{elapsed}s elapsed</span></p></section>:<section className="threshold-opponent"><span className="threshold-versus" aria-hidden="true">VS</span><p className="threshold-kicker">DEMO OPPONENT</p><div className="threshold-opponent-mark" aria-hidden="true">S</div><h2>SILENTINDEX</h2><p>Control · Sentinel</p><small>Local practice opponent. No network match.</small></section>}
   </div>
   <footer className="threshold-footer"><div><p role="status">Simulated matchmaking · no live players</p><small>{screen==='category'?'No rank changes. No rewards.':`${category?.toUpperCase()} · best of one · standard rules`}</small></div><div className="threshold-actions">{screen!=='category'&&<button onClick={onCancel}>CANCEL</button>}{screen==='category'?<button className="threshold-primary" disabled={!category} onClick={onStart}>START DEMO MATCH <span aria-hidden="true">↗</span></button>:screen==='found'?<button className="threshold-primary" onClick={onAccept}>ENTER DUEL <span aria-hidden="true">↗</span></button>:null}</div></footer>
  </section>
 </main>;
}
