'use client';

import { useState } from 'react';
import { AppShell } from '../../components/layout/app-shell';

interface QuestDef {
  key: string;
  label: string;
  hue: string;
  reward: string;
  pct: number;
  done: boolean;
}

const DAILY: QuestDef[] = [
  { key: 'ranked2', label: 'Win 2 ranked duels', hue: '#E03C4E', reward: '+120 CR', pct: 50, done: false },
  { key: 'openpack', label: 'Open 1 pack', hue: '#E8B45C', reward: '+1 Blank Card', pct: 100, done: true },
  { key: 'fuse1', label: 'Fuse 1 hero', hue: '#8C6FD8', reward: '+80 CR', pct: 0, done: false },
];

const WEEKLY: QuestDef[] = [
  { key: 'win10', label: 'Win 10 duels of any mode', hue: '#3FA893', reward: '+500 CR', pct: 70, done: false },
  { key: 'openpack5', label: 'Open 5 packs', hue: '#E8B45C', reward: '+1 Gilded Frame', pct: 100, done: true },
  { key: 'legendary', label: 'Pull a Legendary hero', hue: '#FFD24C', reward: '+1,000 CR', pct: 0, done: false },
];

function QuestRow({ q, claimed, onClaim }: { q: QuestDef; claimed: boolean; onClaim: () => void }) {
  const ready = q.done && !claimed;
  return (
    <div className="quest-row" style={{ background: '#100C14', borderLeft: `3px solid ${q.hue}` }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#F5F1E8' }}>{q.label}</div>
        <div style={{ marginTop: 9, height: 5, background: 'rgba(237,231,220,.12)' }}>
          <div style={{ height: '100%', width: `${q.pct}%`, background: q.hue }} />
        </div>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: q.hue, textAlign: 'right' }}>{q.reward}</div>
      <button
        onClick={onClaim}
        disabled={!ready}
        style={{
          cursor: ready ? 'pointer' : 'default',
          textAlign: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: '.06em',
          padding: 10,
          background: claimed ? 'transparent' : ready ? q.hue : 'rgba(237,231,220,.1)',
          color: claimed ? 'rgba(237,231,220,.35)' : ready ? '#0F0C16' : 'rgba(237,231,220,.4)',
          clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)',
          border: 'none',
        }}
      >
        {claimed ? 'CLAIMED' : ready ? 'CLAIM' : 'IN PROGRESS'}
      </button>
    </div>
  );
}

export default function QuestsPage() {
  const [claims, setClaims] = useState<Record<string, boolean>>({});

  const claim = (key: string) => setClaims((s) => ({ ...s, [key]: true }));

  return (
    <AppShell>
      <div className="product-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg,#1A0E10 0%,#4C1018 46%,#8C1420 62%,#1A0E10 100%)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,0 0,3% 14%,3% 86%,0 100%)' }} />
        <div style={{ position: 'relative', padding: '32px clamp(20px,3.2vw,40px)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.28em', color: 'rgba(245,241,232,.65)' }}>DAILY &amp; WEEKLY</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-.02em', color: '#F5F1E8', textShadow: '0 0 24px rgba(0,0,0,.5)' }}>Quests</h1>
        </div>
      </div>

      <div className="product-content">
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.2em', color: '#E03C4E' }}>DAILY QUESTS</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(237,231,220,.4)' }}>RESETS IN 09:24:11</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {DAILY.map((q) => (
            <QuestRow key={q.key} q={q} claimed={!!claims[q.key]} onClaim={() => claim(q.key)} />
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.2em', color: '#E8B45C' }}>WEEKLY QUESTS</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(237,231,220,.4)' }}>RESETS IN 4D 09H</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {WEEKLY.map((q) => (
            <QuestRow key={q.key} q={q} claimed={!!claims[q.key]} onClaim={() => claim(q.key)} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}