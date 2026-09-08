'use client';
import {useState} from 'react';
import Link from 'next/link';
import {AppShell} from '../../components/layout/app-shell';
import {CATALOG} from '../arena/decks.mjs';
import {roster} from '../dashboard/roster';
export default function WikiPage(){
 const [visual,setVisual]=useState(false);
 const [search,setSearch]=useState('');
 const cards=CATALOG.filter(card=>`${card.name} ${card.kind} ${card.rarity}`.toLowerCase().includes(search.toLowerCase()));
 return <AppShell><div className="destination-page reference-page"><header><p className="destination-kicker">WIKI / TWO DISTINCT CATALOGS</p><h1>Card reference</h1><p className="lead">Playable definitions and visual profiles. Never interchangeable.</p></header><div className="destination-filters"><button aria-pressed={!visual} onClick={()=>setVisual(false)}>ARENA CATALOG</button><button aria-pressed={visual} onClick={()=>setVisual(true)}>VISUAL ROSTER</button></div>{visual?<><h2>Five artwork profiles. Not Arena inputs.</h2><div className="reference-list">{roster.map(card=><article className="reference-entry" key={card.id}><div><small>{card.role} / {card.rarity}</small><h2>{card.id.toUpperCase()}</h2></div><p>{card.profile}</p><p>VISUAL ATK {card.atk} / DEF {card.def}</p></article>)}</div><Link className="destination-action" href="/collection">View the artwork ↗</Link></>:<><label className="reference-search">Search Arena cards<input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Name, type or rarity"/></label><p className="destination-note">Ten playable definitions. No ownership implied. Repeated cards are allowed in a 20-card deck.</p><div className="reference-list">{cards.map(card=><article className="reference-entry" key={card.id}><div><small>{card.kind} / {card.rarity}</small><h2>{card.name}</h2></div><p>{card.kind==='HERO'?`ATK ${card.atk} / DEF ${card.def}`:'Tactical card / Arena rules'}</p><code>{card.id}</code></article>)}</div>{!cards.length&&<p role="status">No Arena cards match.</p>}<Link className="destination-action" href="/deck-builder">Use Arena cards in a deck ↗</Link></>}<p className="destination-note">Visual REI is not REI ZERO. Fusion and the legacy extended roster are not implemented combat definitions. <Link href="/docs">Read the current build manual.</Link></p></div></AppShell>;
}
