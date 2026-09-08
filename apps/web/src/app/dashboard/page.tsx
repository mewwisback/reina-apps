'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { roster } from './roster';
import './dashboard.css';
import {ActiveDeckSummary} from '../../components/local-decks';

const primary = [['Home', '/dashboard'], ['Collection', '/collection'], ['Deck Builder', '/deck-builder'], ['Shop', '/shop']];
const secondary = [['Quests', '/quests'], ['Leaderboard', '/leaderboard'], ['Docs', '/docs'], ['Wiki', '/wiki']];

export default function DashboardPage() {
  const [selected, setSelected] = useState('rei');
  const [failed, setFailed] = useState<string[]>([]);
  const hero = roster.find(hero => hero.id === selected)!;
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState('Profile');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [systemMotion, setSystemMotion] = useState(false);
  const reduced = reduceMotion || systemMotion;
  const [entering, setEntering] = useState(false);
  const entry = useRef<gsap.core.Tween | null>(null);
  const locked = useRef(false);
  const recovery = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemMotion(media.matches);
    update(); media.addEventListener('change', update);
    const cancel = () => { clearTimeout(recovery.current); entry.current?.kill(); locked.current = false; setEntering(false); if (root.current) gsap.set(root.current.querySelector('.deck-play'), { clearProps: 'transform' }); };
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
    recovery.current = setTimeout(() => { if (root.current) { locked.current = false; setEntering(false); gsap.set(root.current.querySelector('.deck-play'), { clearProps: 'transform' }); } }, 4000);
    if (reduced) navigate();
    else entry.current = gsap.to(root.current?.querySelector('.deck-play') ?? null, { y: 4, duration: .22, onComplete: navigate });
  };
  useEffect(() => {
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { entry.current?.progress(1); return; }
    const context = gsap.context(() => {
      gsap.fromTo('[data-front][data-selected="true"]', { y: 20, rotationY: -12, scale: .94 }, { y: 0, rotationY: 0, scale: 1, duration: .28, ease: 'power2.out' });
    }, root);
    const stop = () => { if (document.hidden) context.revert(); };
    document.addEventListener('visibilitychange', stop);
    return () => { context.revert(); document.removeEventListener('visibilitychange', stop); };
  }, [selected, reduced]);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const moreLinks = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!moreOpen) return;
    moreLinks.current?.querySelector('a')?.focus();
    const close = () => { setMoreOpen(false); moreButton.current?.focus(); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const outside = (event: PointerEvent) => {
      if (!moreLinks.current?.contains(event.target as Node) && !moreButton.current?.contains(event.target as Node)) close();
    };
    const resize = () => { if (window.innerWidth > 900) setMoreOpen(false); };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', resize); };
  }, [moreOpen]);
  return <div ref={root} className="deck-dashboard" data-reduced-motion={reduced} data-more-open={moreOpen}>
    <header className="deck-header"><Link className="deck-wordmark" href="/dashboard"><span>R</span>REINA</Link><nav aria-label="Primary navigation">{primary.map(([label, href]) => <Link key={href} href={href} aria-current={href === '/dashboard' ? 'page' : undefined}>{label}</Link>)}</nav><div className="deck-account">{['Profile', 'Settings'].map(name => <button key={name} onClick={() => { setPanel(name); dialog.current?.showModal(); }}>{name}</button>)}</div></header>
    <div className="deck-context"><strong>DASHBOARD <span>/ HOME</span></strong><nav aria-label="Explore Reina">{secondary.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav></div>
    <main className="deck-workbench">
      <aside className="deck-rail"><p className="deck-meta">ROSTER PREVIEW</p><h1>DECK</h1><label className="deck-meta" htmlFor="roster-hero">FEATURED HERO</label><select id="roster-hero" value={selected} onChange={event => setSelected(event.target.value)}>{roster.map(hero => <option key={hero.id} value={hero.id}>{hero.id.toUpperCase()}</option>)}</select><p className="deck-rail-selected">{hero.id.toUpperCase()} / {hero.role}</p><ActiveDeckSummary/><Link href="/deck-builder">Open Deck Builder</Link></aside>
      <section className="deck-table" data-deck-table><p className="deck-meta">HOME / DECK PLAY SPACE</p><h2 data-selected-hero>{hero.id.toUpperCase()}</h2>
        <div className="deck-fan" aria-label="Visual hero roster">{roster.map((card, index) => {
          const slot = card.id === selected ? 2 : index === 2 ? roster.findIndex(item => item.id === selected) : index;
          return <div className="deck-card" key={card.id} data-selected={card.id === selected} style={{ '--slot': slot, '--tilt': `${(slot - 2) * 9}deg`, '--lift': `${Math.abs(slot - 2) * 16}px` } as CSSProperties}>
            {/* Precompressed, fixed-ratio local art; no image optimizer request required. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={image => { if (image?.complete && !image.naturalWidth) setFailed(ids => ids.includes(card.id) ? ids : [...ids, card.id]); }} data-front data-selected={card.id === selected} src={`/images/dashboard/${failed.includes(card.id) ? 'back' : card.id}.webp`} onError={() => setFailed(ids => ids.includes(card.id) ? ids : [...ids, card.id])} width={600} height={840} alt={`${card.id.toUpperCase()} ${card.role} visual roster card`} />
          </div>;
        })}</div>
        {failed.length > 0 && <div role="status">{failed.map(id => <button className="deck-retry" key={id} onClick={() => setFailed(ids => ids.filter(item => item !== id))}>Retry {id.toUpperCase()} image</button>)}</div>}
        <div className="deck-roster" aria-label="Choose featured hero">{roster.map(card => <button key={card.id} aria-label={`Select ${card.id.toUpperCase()}`} aria-pressed={card.id === selected} onClick={() => setSelected(card.id)}><strong>{card.id.toUpperCase()}</strong><small>{card.role}</small></button>)}</div>
        <div className="deck-profile" aria-live="polite"><p className="deck-meta">ROSTER PROFILE / {hero.rarity}</p><p>{hero.profile}</p><p className="deck-meta">VISUAL ATK {hero.atk} / DEF {hero.def}</p></div>
        <div className="deck-launch"><p className="deck-boundary">Visual roster only. Arena uses its own cards.</p><div><button className="deck-play" aria-label="PLAY" disabled={entering} onClick={play}><span>PLAY</span><span aria-hidden="true">↗</span></button><p className="deck-meta" role="status">{entering ? 'Opening Arena…' : 'Choose a mode in Arena'}</p></div></div>
      </section>
    </main>
    <dialog ref={dialog} className="deck-dialog" aria-labelledby="deck-panel-title" onClick={event => { if (event.target === dialog.current) dialog.current?.close(); }}><h2 id="deck-panel-title">{panel}</h2>{panel === 'Profile' ? <p>No account profile is connected. This dashboard previews the visual roster, not owned cards. Gameplay decks are saved only in this browser.</p> : <><label><input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)} /> Reduce dashboard motion</label><p>Applies while this dashboard is open. Your system’s reduced-motion preference is always respected. No account settings are saved.</p></>}<button onClick={() => dialog.current?.close()}>Close</button></dialog>
    <div className="deck-mobile-dock">
      <nav id="deck-more" ref={moreLinks} className="deck-more" aria-label="More destinations" hidden={!moreOpen}>{secondary.map(([label, href]) => <Link key={href} href={href} onClick={() => setMoreOpen(false)}>{label}</Link>)}</nav>
      <nav className="deck-mobile-nav" aria-label="Mobile navigation">{primary.map(([label, href]) => <Link key={href} href={href} aria-current={href === '/dashboard' ? 'page' : undefined}>{label}</Link>)}<button ref={moreButton} aria-expanded={moreOpen} aria-controls="deck-more" onClick={() => setMoreOpen(open => !open)}>More</button></nav>
    </div>
  </div>;
}
