'use client';
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {AppShell} from '../../components/layout/app-shell';
import {roster} from '../dashboard/roster';

export default function CollectionPage(){
 const [rarity,setRarity]=useState('ALL');
 const cards=roster.filter(card=>rarity==='ALL'||card.rarity===rarity);
 return <AppShell><div className="destination-page"><header className="collection-intro"><div><p className="destination-kicker">FIVE HEROES / VISUAL ROSTER</p><h1>Collection</h1></div><div><p className="lead">Visual roster, not owned inventory.</p><p>Meet Reina’s featured heroes. These artwork profiles are separate from the ten playable Arena cards.</p><Link className="destination-action" href="/deck-builder">Build an Arena deck ↗</Link></div></header><div className="destination-filters" aria-label="Filter roster rarity">{['ALL','COMMON','RARE','ELITE','LEGENDARY'].map(value=><button key={value} aria-pressed={rarity===value} onClick={()=>setRarity(value)}>{value}</button>)}</div><div className="collection-roster">{cards.map(card=><figure key={card.id}><Image unoptimized src={`/images/dashboard/${card.id}.webp`} width={600} height={840} alt={`${card.id.toUpperCase()} visual roster card`}/><figcaption><small>{card.role} / {card.rarity}</small><h2>{card.id.toUpperCase()}</h2><p>{card.profile}</p></figcaption></figure>)}</div><p className="destination-note">No collection ownership, duplicate counts or forging is connected. <Link href="/wiki">Read the card reference ↗</Link></p></div></AppShell>;
}
