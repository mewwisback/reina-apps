'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { roster } from './roster';
import './dashboard.css';
import {ActiveDeckSummary} from '../../components/local-decks';
import {AppShell} from '../../components/layout/app-shell';


export default function DashboardPage() {
  const [selected, setSelected] = useState('rei');
  const [failed, setFailed] = useState<string[]>([]);
  const hero = roster.find(hero => hero.id === selected)!;
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [systemMotion, setSystemMotion] = useState(false);
  const reduced = reduceMotion || systemMotion;
  const [entering, setEntering] = useState(false);
  const entry = useRef<gsap.core.Timeline | null>(null);
  const locked = useRef(false);
  const previousHero = useRef(selected);
  const interruptedSlots = useRef<number[]>([]);
  const recovery = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemMotion(media.matches);
    update(); media.addEventListener('change', update);
    const cancel = () => { clearTimeout(recovery.current); entry.current?.kill(); entry.current = null; locked.current = false; setEntering(false); if (root.current) gsap.set(root.current.querySelectorAll('.deck-play, .deck-fan, .deck-roster'), { clearProps: 'transform,opacity' }); };
    const visibility = () => { if (document.hidden) cancel(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pageshow', cancel);
    return () => { media.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pageshow', cancel); clearTimeout(recovery.current); entry.current?.kill(); };
  }, []);
  const play = () => {
    if (locked.current) return;
    locked.current = true; setEntering(true);
    const navigate = () => { router.push('/arena'); };
    // ponytail: App Router exposes no navigation promise; allow retry if route stays mounted.
    recovery.current = setTimeout(() => { if (root.current) { locked.current = false; setEntering(false); gsap.set(root.current.querySelectorAll('.deck-play, .deck-fan, .deck-roster'), { clearProps: 'transform,opacity' }); } }, 4000);
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigate();
    else {
      const scope = root.current!;
      entry.current = gsap.timeline({ onComplete: navigate })
        .to(scope.querySelector('.deck-play'), { y: 4, duration: .1 })
        .to(scope.querySelector('.deck-fan'), { y: -24, scale: 1.035, opacity: 0, duration: .26, ease: 'power2.in' }, .06)
        .to(scope.querySelector('.deck-roster'), { y: 10, opacity: 0, duration: .18 }, .08);
    }
  };
  useLayoutEffect(() => {
    const previous = previousHero.current;
    previousHero.current = selected;
    const selectedIndex = roster.findIndex(card => card.id === selected);
    root.current!.querySelectorAll<HTMLElement>('.deck-card').forEach((element, index) => {
      const slot = index === selectedIndex ? 2 : index === 2 ? selectedIndex : index;
      element.style.setProperty('--slot', String(slot));
      element.style.setProperty('--tilt', `${(slot - 2) * 9}deg`);
      element.style.setProperty('--lift', `${Math.abs(slot - 2) * 16}px`);
    });
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { interruptedSlots.current = []; entry.current?.progress(1); return; }
    const context = gsap.context(() => {
      if (previous !== selected) {
        const oldIndex = roster.findIndex(card => card.id === previous);
        roster.forEach((card, index) => {
          const oldSlot = interruptedSlots.current[index] ?? (card.id === previous ? 2 : index === 2 ? oldIndex : index);
          const element = root.current!.querySelectorAll('.deck-card')[index];
          const slot = Number((element as HTMLElement).style.getPropertyValue('--slot'));
          if (slot !== oldSlot) gsap.fromTo(element, { '--slot': oldSlot, '--tilt': `${(oldSlot - 2) * 9}deg`, '--lift': `${Math.abs(oldSlot - 2) * 16}px` }, { '--slot': slot, '--tilt': `${(slot - 2) * 9}deg`, '--lift': `${Math.abs(slot - 2) * 16}px`, duration: .32, ease: 'power2.out' });
        });
      }
      gsap.fromTo('[data-front][data-selected="true"]', { y: 20, rotationY: -12, scale: .94 }, { y: 0, rotationY: 0, scale: 1, duration: .28, ease: 'power2.out' });
    }, root);
    const stop = () => { if (document.hidden) context.revert(); };
    document.addEventListener('visibilitychange', stop);
    const cards = root.current!.querySelectorAll<HTMLElement>('.deck-card');
    return () => {
      interruptedSlots.current = Array.from(cards, element => Number(element.style.getPropertyValue('--slot')));
      context.revert(); document.removeEventListener('visibilitychange', stop);
    };
  }, [selected, reduced]);
  return <AppShell settings={<><label><input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)} /> Reduce dashboard motion</label><p>Applies while this dashboard is open. System reduced motion is always respected.</p></>}><div ref={root} className="deck-dashboard" data-reduced-motion={reduced}>
    <div className="deck-workbench">
      <aside className="deck-rail"><p className="deck-meta">ROSTER PREVIEW</p><h1>DECK</h1><label className="deck-meta" htmlFor="roster-hero">FEATURED HERO</label><select id="roster-hero" value={selected} onChange={event => setSelected(event.target.value)}>{roster.map(hero => <option key={hero.id} value={hero.id}>{hero.id.toUpperCase()}</option>)}</select><p className="deck-rail-selected">{hero.id.toUpperCase()} / {hero.role}</p><ActiveDeckSummary/><Link href="/deck-builder">Open Deck Builder</Link></aside>
      <section className="deck-table" data-deck-table><div className="deck-stage-heading"><div><p className="deck-meta">FEATURED HERO / {hero.role}</p><h2 data-selected-hero>{hero.id.toUpperCase()}</h2></div><Link href="/collection">View roster ↗</Link></div>
        <div className="deck-fan" aria-label="Visual hero roster">{roster.map((card, index) => {
          // Slot motion owns these properties; React keeps their initial values stable.
          const slot = index;
          return <div className="deck-card" key={card.id} data-selected={card.id === selected} style={{ '--slot': slot, '--tilt': `${(slot - 2) * 9}deg`, '--lift': `${Math.abs(slot - 2) * 16}px` } as CSSProperties}>
            {/* Precompressed, fixed-ratio local art; no image optimizer request required. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={image => { if (image?.complete && !image.naturalWidth) setFailed(ids => ids.includes(card.id) ? ids : [...ids, card.id]); }} data-front data-selected={card.id === selected} src={`/images/dashboard/${failed.includes(card.id) ? 'back' : card.id}.webp`} onError={() => setFailed(ids => ids.includes(card.id) ? ids : [...ids, card.id])} width={600} height={840} alt={`${card.id.toUpperCase()} ${card.role} visual roster card`} />
          </div>;
        })}</div>
        {failed.length > 0 && <div role="status">{failed.map(id => <button className="deck-retry" key={id} onClick={() => setFailed(ids => ids.filter(item => item !== id))}>Retry {id.toUpperCase()} image</button>)}</div>}
        <div className="deck-roster" aria-label="Choose featured hero" onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const index = roster.findIndex(card => card.id === selected);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? roster.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + roster.length) % roster.length;
          setSelected(roster[next].id);
          event.currentTarget.querySelectorAll('button')[next]?.focus();
        }}>{roster.map(card => <button key={card.id} aria-label={`Select ${card.id.toUpperCase()}`} aria-pressed={card.id === selected} onClick={() => setSelected(card.id)}><strong>{card.id.toUpperCase()}</strong><small>{card.role}</small></button>)}</div>
        <div className="deck-profile" aria-live="polite"><p className="deck-meta">ROSTER PROFILE / {hero.rarity}</p><p>{hero.profile}</p><p className="deck-meta">VISUAL ATK {hero.atk} / DEF {hero.def}</p></div>
        <div className="deck-launch"><p className="deck-boundary">Visual roster only. Arena uses its own cards.</p><div><button className="deck-play" aria-label="PLAY" disabled={entering} onClick={play}><span>PLAY</span><span aria-hidden="true">↗</span></button><p className="deck-meta" role="status">{entering ? 'Opening Arena…' : 'Choose a mode in Arena'}</p></div></div>
      </section>
    </div>
    <nav className="home-paths" aria-label="Home destinations"><Link href="/collection"><span>COLLECTION</span><strong>Explore roster ↗</strong><small>Meet the five visual heroes</small></Link><Link href="/shop"><span>SHOP</span><strong>Inspect card vault ↗</strong><small>Preview the pack artwork</small></Link><Link href="/docs"><span>FIELD GUIDE</span><strong>Read field guide ↗</strong><small>Learn the Arena rules</small></Link></nav>
  </div></AppShell>;
}
