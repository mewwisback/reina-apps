'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import './app-shell.css';

const primary = [['Home','/dashboard'],['Collection','/collection'],['Deck Builder','/deck-builder'],['Shop','/shop']];
const secondary = [['Quests','/quests'],['Leaderboard','/leaderboard'],['Docs','/docs'],['Wiki','/wiki']];

export function AppShell({children}:{children:ReactNode}) {
 const pathname=usePathname();
 const [more,setMore]=useState(false);
 const [panel,setPanel]=useState('Profile');
 const button=useRef<HTMLButtonElement>(null);
 const links=useRef<HTMLElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  if(!more)return;
  links.current?.querySelector('a')?.focus();
  const close=()=>{setMore(false);button.current?.focus();};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};
  const outside=(event:PointerEvent)=>{if(!links.current?.contains(event.target as Node)&&!button.current?.contains(event.target as Node))close();};
  const resize=()=>{if(window.innerWidth>900)setMore(false);};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);
  return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);};
 },[more]);
 const destinations=(items:string[][])=>items.map(([label,href])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined} onClick={()=>setMore(false)}>{label}</Link>);
 return <div className="destination-shell app-shell" data-destination-shell data-more-open={more}>
  <a className="destination-skip" href="#destination-content">Skip to content</a>
  <header className="destination-header"><Link className="destination-brand" href="/dashboard"><span>R</span>REINA</Link><nav aria-label="Primary navigation">{destinations(primary)}</nav><div className="destination-account">{['Profile','Settings'].map(name=><button key={name} onClick={()=>{setPanel(name);dialog.current?.showModal();}}>{name}</button>)}</div></header>
  <div className="destination-context"><strong>{[...primary,...secondary].find(([,href])=>href===pathname)?.[0]}</strong><nav aria-label="Explore Reina">{destinations(secondary)}</nav><Link href="/arena">Enter Arena ↗</Link></div>
  <main id="destination-content" tabIndex={-1} className="app-main" data-route={pathname}>{children}</main>
  <dialog ref={dialog} aria-labelledby="destination-panel" onClick={event=>{if(event.target===dialog.current)dialog.current.close();}}><p className="destination-kicker">BROWSER SESSION</p><h2 id="destination-panel">{panel}</h2>{panel==='Profile'?<p>No account profile is connected. Gameplay decks live in this browser, not an account. No wallet or inventory is linked.</p>:<><p>System reduced-motion preferences are respected. Arena sound controls remain inside Arena; dashboard motion controls remain in dashboard Settings.</p><p>No account settings or preferences are saved here.</p></>}<button onClick={()=>dialog.current?.close()}>Close</button></dialog>
  <div className="destination-dock"><nav ref={links} id="destination-more" aria-label="More destinations" hidden={!more}>{destinations(secondary)}</nav><nav aria-label="Mobile navigation">{destinations(primary)}<button ref={button} aria-expanded={more} aria-controls="destination-more" onClick={()=>setMore(value=>!value)}>More</button></nav></div>
 </div>;
}
