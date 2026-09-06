'use client';

import Link from 'next/link';
import {useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import './entry.css';
import {CardBackdrop} from './card-backdrop';

type Mode='casual'|'ranked'|'event';
const modes={casual:['CASUAL','Standard rules. No rank stakes.'],ranked:['RANKED','Demo rules. Ranking not connected.'],event:['EVENT','Demo rules. No event rewards.']} as const;

export function ArenaEntry({screen,category,elapsed,soundOn,onSound,onSelect,onStart,onCancel,onAccept}:{screen:'category'|'search'|'found';category:Mode|null;elapsed:number;soundOn:boolean;onSound:()=>void;onSelect:(mode:Mode)=>void;onStart:()=>void;onCancel:()=>void;onAccept:()=>void}){
 const root=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const media=gsap.matchMedia();
  const context=gsap.context(()=>media.add('(prefers-reduced-motion: no-preference)',()=>{
   if(screen==='search')gsap.from('.threshold-wait',{borderTopColor:'#e03c4e',duration:.6,ease:'power2.out'});
   if(screen==='found')gsap.from('.threshold-opponent',{x:16,opacity:0,duration:.35,ease:'power3.out'});
  }),root);
  if(screen==='found')root.current?.querySelector<HTMLButtonElement>('.threshold-primary')?.focus({preventScroll:true});
  return()=>{media.revert();context.revert()};
 },[screen]);
 useLayoutEffect(()=>{
  const media=gsap.matchMedia();
  const context=gsap.context(()=>media.add('(prefers-reduced-motion: no-preference)',()=>{
   if(category)gsap.fromTo('.threshold-mode[aria-pressed="true"] .threshold-mode-line',{scaleX:0},{scaleX:1,duration:.4,ease:'expo.out'});
  }),root);
  return()=>{media.revert();context.revert()};
 },[category]);
 return <main ref={root} className="threshold" data-entry-state={screen}>
  <header className="threshold-nav"><Link href="/dashboard">← LEAVE</Link><div className="threshold-brand"><i aria-hidden="true">R</i><span>REINA<small>ARENA</small></span></div><button aria-label={`${soundOn?'Mute':'Enable'} sound`} aria-pressed={soundOn} onClick={onSound}>SOUND {soundOn?'ON':'OFF'}</button></header>
  <section className="threshold-hero">
   <div className="threshold-environment" aria-hidden="true"><CardBackdrop/></div>
   <div className="threshold-title"><p className="threshold-kicker">REINA / DEMO ARENA</p><h1 aria-label={screen==='category'?'Choose your fight':screen==='search'?'Searching the courtyard':'Duelist found'}>{(screen==='category'?['SELECT MODE']:screen==='search'?['SEARCHING']:['DUELIST FOUND']).map(line=><span className="threshold-line" key={line}><span>{line}</span></span>)}</h1>{screen!=='category'&&<p className="threshold-intro">{screen==='search'?'Finding your practice opponent. Cancel at any time.':'Your practice opponent is ready. Enter when you are.'}</p>}</div>
   <section className="threshold-deck-copy" aria-label="Demo deck"><p className="threshold-kicker">YOUR DEMO DECK</p><h2>Quiet Blade</h2><p>20 cards · standard starter</p><small>Playing as REINA · demo identity</small></section>
  </section>
  <section className="threshold-stage">
   {screen==='category'?<section className="threshold-selection" aria-label="Ruleset selection">{(Object.keys(modes) as Mode[]).map(key=><button key={key} className="threshold-mode" aria-pressed={category===key} onClick={()=>onSelect(key)}><span className="threshold-mode-line" aria-hidden="true"/><span><b>{modes[key][0]}</b><em>{modes[key][1]}</em></span><i aria-hidden="true">{category===key?'✓':'+'}</i></button>)}</section>:screen==='search'?<section className="threshold-wait"><div><p className="threshold-kicker">SIMULATED SEARCH</p><h2>Awaiting a duelist</h2></div><p className="threshold-timer"><span aria-label="Elapsed time">{elapsed}s elapsed</span><small>{category?.toUpperCase()} / BEST OF ONE</small></p></section>:<section className="threshold-opponent"><span className="threshold-versus" aria-hidden="true">VS</span><div><p className="threshold-kicker">DEMO OPPONENT</p><h2>SILENTINDEX</h2><p>Control · Sentinel</p></div><small>Local practice opponent.<br/>No network match.</small></section>}
   <footer className="threshold-footer"><div><p role="status">Simulated matchmaking · no live players</p><small>{screen==='category'?'No rank changes. No rewards.':`${category?.toUpperCase()} · best of one · standard rules`}</small></div><div className="threshold-actions">{screen!=='category'&&<button onClick={onCancel}>CANCEL</button>}{screen==='category'?<button className="threshold-primary" disabled={!category} onClick={onStart}>START DEMO MATCH <span aria-hidden="true">↗</span></button>:screen==='found'?<button className="threshold-primary" onClick={onAccept}>ENTER DUEL <span aria-hidden="true">↗</span></button>:null}</div></footer>
  </section>
 </main>;
}
