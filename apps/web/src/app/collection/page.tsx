'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/app-shell';

interface OwnedCard {
  name: string;
  cat: string;
  rank: string;
  hue: string;
  rankHue: string;
  count: number;
}

const POOL: OwnedCard[] = [
  { name: 'HAKU', cat: 'SCOUT', rank: 'ELITE', hue: '#E8873C', rankHue: '#E8B45C', count: 1 },
  { name: 'SORA', cat: 'STRATEGIST', rank: 'RARE', hue: '#7E8FA6', rankHue: '#B8C0C8', count: 2 },
  { name: 'KOMA', cat: 'VANGUARD', rank: 'ELITE', hue: '#E8B45C', rankHue: '#E8B45C', count: 1 },
  { name: 'RIN', cat: 'HERALD', rank: 'COMMON', hue: '#E03C4E', rankHue: '#C08552', count: 3 },
  { name: 'GEN', cat: 'ARTIFICER', rank: 'RARE', hue: '#9A8B7E', rankHue: '#B8C0C8', count: 1 },
  { name: 'YUI', cat: 'CLERIC', rank: 'COMMON', hue: '#F0C08A', rankHue: '#C08552', count: 2 },
  { name: 'MIRA', cat: 'WARDEN', rank: 'RARE', hue: '#3FA893', rankHue: '#B8C0C8', count: 1 },
  { name: 'KAI', cat: 'SENTINEL', rank: 'RARE', hue: '#5B7FA6', rankHue: '#B8C0C8', count: 1 },
  { name: 'NANA', cat: 'MEDIC', rank: 'ELITE', hue: '#E86B7C', rankHue: '#E8B45C', count: 2 },
  { name: 'REI', cat: 'BLADE', rank: 'LEGENDARY', hue: '#FFD24C', rankHue: '#E03C4E', count: 1 },
  { name: 'AME', cat: 'ARTIFICER', rank: 'ELITE', hue: '#C77DA6', rankHue: '#E8B45C', count: 1 },
  { name: 'TETSU', cat: 'SCOUT', rank: 'COMMON', hue: '#8C6A4A', rankHue: '#C08552', count: 3 },
];

const RANKS = ['ALL', 'COMMON', 'RARE', 'ELITE', 'LEGENDARY'];
const RANK_HUE: Record<string, string> = { COMMON: '#C08552', RARE: '#B8C0C8', ELITE: '#E8B45C', LEGENDARY: '#E03C4E' };
const RANK_TOTALS: Record<string, number> = { COMMON: 40, RARE: 30, ELITE: 22, LEGENDARY: 5 };

export default function CollectionPage() {
  const [filter, setFilter] = useState('ALL');
  const filtered = filter === 'ALL' ? POOL : POOL.filter((c) => c.rank === filter);
  const dupeCount = POOL.reduce((s, c) => s + Math.max(0, c.count - 1), 0);

  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, padding: '36px clamp(20px,3.5vw,48px) 0' }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.2em', color: '#E03C4E' }}>MY COLLECTION</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(24px,2.6vw,32px)', fontWeight: 900, letterSpacing: '-.02em', color: '#F5F1E8' }}>{POOL.length} of 100 heroes</h1>
        </div>
        <Link href="/wiki" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#E0596A', textDecoration: 'none' }}>BROWSE FULL WIKI &gt;</Link>
      </div>

      <div style={{ padding: '0 clamp(20px,3.5vw,48px)' }}>
        {/* rarity stats */}
        <div className="collection-stats">
          {RANKS.filter((r) => r !== 'ALL').map((r) => {
            const owned = POOL.filter((c) => c.rank === r).length;
            return (
              <div key={r} style={{ border: '1px solid rgba(237,231,220,.14)', padding: 16 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.14em', color: RANK_HUE[r] }}>{r}</div>
                <div style={{ fontWeight: 900, fontSize: 20, marginTop: 8, color: '#F5F1E8' }}>{owned}<span style={{ fontSize: 12, color: 'rgba(237,231,220,.4)' }}> / {RANK_TOTALS[r]}</span></div>
              </div>
            );
          })}
        </div>

        {/* filters */}
        <div style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap' }}>
          {RANKS.map((r) => {
            const activeF = filter === r;
            return (
              <button key={r} onClick={() => setFilter(r)} style={{ cursor: 'pointer', padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: activeF ? '#0F0C16' : 'rgba(237,231,220,.7)', background: activeF ? '#E0596A' : 'transparent', border: `1px solid ${activeF ? '#E0596A' : 'rgba(237,231,220,.25)'}` }}>
                {r}
              </button>
            );
          })}
        </div>

        {/* card grid */}
        <div className="collection-grid">
          {filtered.map((c) => (
            <div key={c.name} style={{ position: 'relative', background: '#100C14', border: '1px solid rgba(237,231,220,.16)', clipPath: 'polygon(0 0,100% 0,100% 88%,88% 100%,0 100%)', padding: 10 }}>
              {c.count > 1 && <div style={{ position: 'absolute', top: 6, right: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 900, color: '#0F0C16', background: '#E8B45C', padding: '1px 5px' }}>x{c.count}</div>}
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: c.rankHue }}>{c.rank}</div>
              <div style={{ fontWeight: 900, fontSize: 13, marginTop: 8, color: '#F5F1E8' }}>{c.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7.5, letterSpacing: '.08em', color: c.hue, marginTop: 3 }}>{c.cat}</div>
            </div>
          ))}
        </div>

        {/* forge banner */}
        <div style={{ marginTop: 28, border: '1px solid rgba(237,231,220,.14)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.16em', color: 'rgba(237,231,220,.5)' }}>DUPLICATES READY TO FORGE</div>
            <div style={{ fontWeight: 900, fontSize: 16, marginTop: 6, color: '#F5F1E8' }}>{dupeCount} spare cards sitting idle in your vault</div>
          </div>
          <Link href="/wiki" style={{ border: '1px solid #E03C4E', color: '#E03C4E', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: '11px 18px', textDecoration: 'none' }}>OPEN FORGE</Link>
        </div>
      </div>
    </AppShell>
  );
}