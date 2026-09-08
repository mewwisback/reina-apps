'use client';
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {AppShell} from '../../components/layout/app-shell';

const offers={
 'HERO PACKS':['Hero packs','Packs are not available to purchase or open. No prices, odds or pack inventory are connected to this build.'],
 'SEASON PASS':['Season pass','There is no paid track, progression or reward claim service in this build.'],
 COSMETICS:['Card backs','This is the approved Reina card-back artwork. It is a visual preview, not an owned or purchasable cosmetic.'],
};
export default function ShopPage(){
 const [tab,setTab]=useState<keyof typeof offers>('HERO PACKS');
 return <AppShell><div className="destination-page vault-page"><div className="destination-filters" aria-label="Shop categories">{(Object.keys(offers) as (keyof typeof offers)[]).map(name=><button key={name} aria-pressed={tab===name} onClick={()=>setTab(name)}>{name}</button>)}</div><section className="vault-display"><div><p className="destination-kicker">SHOP / NOT CONNECTED</p><h1>{offers[tab][0]}</h1><p className="lead">{offers[tab][1]}</p><Link className="destination-action" href="/collection">View the visual roster ↗</Link><p className="destination-note">No checkout, top-ups or wallet transactions. Nothing is charged or granted.</p></div><figure><Image unoptimized src="/images/dashboard/back.webp" width={600} height={840} alt="Reina approved card back preview"/><figcaption>REINA / CARD BACK PREVIEW</figcaption></figure></section><footer className="vault-footer"><strong>PLAY WITHOUT A PURCHASE</strong><p>Arena’s starter deck is available in the demo. Browser-local decks use its ten-card catalog, not purchased inventory.</p><Link href="/arena">Enter Arena ↗</Link></footer></div></AppShell>;
}
