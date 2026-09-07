'use client';

import { useState } from 'react';
import { AppShell } from '../../components/layout/app-shell';

interface Card {
  id: string;
  name: string;
  cat: string;
  rank: string;
  hue: string;
  rankHue: string;
}

const CATS = [
  { cat: 'SCOUT', hue: '#E8873C' }, { cat: 'STRATEGIST', hue: '#7E8FA6' }, { cat: 'VANGUARD', hue: '#E8B45C' },
  { cat: 'HERALD', hue: '#E03C4E' }, { cat: 'ARTIFICER', hue: '#9A8B7E' }, { cat: 'CLERIC', hue: '#F0C08A' },
  { cat: 'WARDEN', hue: '#3FA893' }, { cat: 'SENTINEL', hue: '#5B7FA6' }, { cat: 'BLADE', hue: '#A63C3C' },
  { cat: 'SAGE', hue: '#7EC4A0' }, { cat: 'MEDIC', hue: '#E86B7C' }, { cat: 'NEGOTIATOR', hue: '#E0A23C' },
];

const RANKS = [
  { rank: 'COMMON', hue: '#C08552' }, { rank: 'RARE', hue: '#B8C0C8' },
  { rank: 'ELITE', hue: '#E8B45C' }, { rank: 'LEGENDARY', hue: '#E03C4E' },
];

function buildPool(): Card[] {
  const syl1 = ['YU', 'TO', 'CHI', 'GE', 'HI', 'ZU', 'OD', 'TA', 'KO', 'LU'];
  const syl2 = ['RI', 'MU', 'SE', 'NA', 'RA', 'MO', 'NE', 'DA', 'VI', 'KE'];
  const out: Card[] = [];
  for (let i = 0; i < 100; i++) {
    const c = CATS[i % CATS.length];
    const m = i % 10;
    const r = RANKS[m < 4 ? 0 : m < 7 ? 1 : m < 9 ? 2 : 3];
    const name = syl1[Math.floor(i / syl2.length)] + syl2[i % syl2.length];
    out.push({ id: 'h' + i, name, cat: c.cat, rank: r.rank, hue: c.hue, rankHue: r.hue });
  }
  return out;
}

const POOL = buildPool();
const RANK_FILTERS = ['ALL', 'COMMON', 'RARE', 'ELITE', 'LEGENDARY'];

interface Deck { id: string; name: string; cardIds: string[]; }

function rankHue(rank: string) {
  return RANKS.find((r) => r.rank === rank)?.hue || '#C08552';
}

export default function DeckBuilderPage() {
  const [decks, setDecks] = useState<Deck[]>([
    { id: 'd1', name: 'Crimson Rush', cardIds: ['h0', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'] },
    { id: 'd2', name: 'Deck 2', cardIds: [] },
    { id: 'd3', name: 'Deck 3', cardIds: [] },
  ]);
  const [activeId, setActiveId] = useState('d1');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [deckFilter, setDeckFilter] = useState('ALL');
  const [vaultPage, setVaultPage] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const active = decks.find((d) => d.id === activeId) || decks[0];
  const deckIds = active.cardIds;
  const deckCards = deckIds.map((id) => POOL.find((p) => p.id === id)).filter(Boolean) as Card[];
  const count = deckCards.length;

  const updateActive = (fn: (ids: string[]) => string[]) =>
    setDecks((s) => s.map((d) => (d.id === activeId ? { ...d, cardIds: fn(d.cardIds) } : d)));

  const rankCounts = RANKS.map((r) => {
    const n = deckCards.filter((d) => d.rank === r.rank).length;
    return { ...r, count: n, pct: count ? Math.max((n / count) * 100, n ? 3 : 0) : 0 };
  });

  const term = search.trim().toLowerCase();
  const filteredPool = POOL.filter(
    (c) => (filter === 'ALL' || c.rank === filter) && (!term || c.name.toLowerCase().includes(term) || c.cat.toLowerCase().includes(term)),
  );
  const VAULT_PAGE_SIZE = 16;
  const vaultPageCount = Math.max(1, Math.ceil(filteredPool.length / VAULT_PAGE_SIZE));
  const page = Math.min(vaultPage, vaultPageCount - 1);
  const pagedVault = filteredPool.slice(page * VAULT_PAGE_SIZE, page * VAULT_PAGE_SIZE + VAULT_PAGE_SIZE).map((c) => {
    const inDeck = deckIds.includes(c.id);
    return { ...c, inDeck, cursor: inDeck || count >= 30 ? 'default' : 'pointer', opacity: inDeck ? 0.45 : 1, add: () => { if (!inDeck && count < 30) updateActive((ids) => [...ids, c.id]); } };
  });

  const deckCardsFiltered = deckCards.filter((d) => deckFilter === 'ALL' || d.rank === deckFilter).map((d, i) => ({ ...d, index: String(i + 1).padStart(2, '0'), rankShort: d.rank.slice(0, 3), remove: () => updateActive((ids) => ids.filter((x) => x !== d.id)) }));

  const countHue = count === 30 ? '#4FA870' : '#E03C4E';

  return (
    <AppShell>
      {/* header hero */}
      <div className="deck-builder-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg,#1A0E10 0%,#4C1018 44%,#8C1420 60%,#1A0E10 100%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 20, height: 20, borderTop: '2px solid #F5F1E8', borderLeft: '2px solid #F5F1E8', opacity: 0.7 }} />
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 20, borderBottom: '2px solid #F5F1E8', borderRight: '2px solid #F5F1E8', opacity: 0.7 }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.28em', color: 'rgba(245,241,232,.65)' }}>DECK BUILDER</div>
            {isEditingName ? (
              <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onBlur={() => { setIsEditingName(false); setDecks((s) => s.map((d) => (d.id === activeId ? { ...d, name: nameInput.trim() || d.name } : d))); }} style={{ margin: '6px 0 0', fontSize: 'clamp(22px,2.4vw,28px)', fontWeight: 900, letterSpacing: '-.02em', color: '#F5F1E8', background: 'transparent', border: 'none', borderBottom: '2px solid #E03C4E', padding: '2px 0', fontFamily: "'Zen Kaku Gothic New', sans-serif", width: '100%', maxWidth: 340, outline: 'none' }} />
            ) : (
              <h1 onClick={() => { setIsEditingName(true); setNameInput(active.name); }} style={{ cursor: 'pointer', margin: '6px 0 0', fontSize: 'clamp(24px,2.6vw,32px)', fontWeight: 900, letterSpacing: '-.02em', color: '#F5F1E8', textShadow: '0 0 24px rgba(0,0,0,.5)' }}>
                {active.name} <span style={{ fontSize: 12, color: 'rgba(245,241,232,.4)', fontWeight: 400 }}>&#9998; rename</span>
              </h1>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {rankCounts.map((r) => (
                <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(245,241,232,.75)' }}>
                  <div style={{ width: 8, height: 8, background: r.hue }} />{r.rank} {r.count}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: countHue }}>{count} / 30 CARDS</div>
            <button onClick={() => updateActive(() => [...POOL].sort(() => Math.random() - 0.5).slice(0, 30).map((c) => c.id))} style={{ cursor: 'pointer', flex: 'none', whiteSpace: 'nowrap', background: 'transparent', border: '1px solid #E8B45C', color: '#E8B45C', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', padding: '12px 20px', clipPath: 'polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px))' }}>
              AUTO-BUILD
            </button>
            <button onClick={() => {}} style={{ cursor: 'pointer', flex: 'none', whiteSpace: 'nowrap', background: '#F5F1E8', color: '#0F0C16', fontSize: 12, fontWeight: 900, letterSpacing: '.14em', padding: '13px 24px 13px 30px', clipPath: 'polygon(14% 0,100% 0,100% 100%,0 100%,0 30%)' }}>
              SAVE DECK
            </button>
          </div>
        </div>
      </div>

      {/* deck slots */}
      <div className="deck-tabs">
        {decks.map((d) => {
          const isActive = d.id === activeId;
          const n = d.cardIds.length;
          return (
            <button key={d.id} onClick={() => { setActiveId(d.id); setIsEditingName(false); }} style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: isActive ? 'rgba(224,60,78,.14)' : '#100C14', border: `1px solid ${isActive ? '#E03C4E' : 'rgba(237,231,220,.18)'}`, clipPath: 'polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px))' }}>
              {isActive && <div style={{ width: 6, height: 6, background: '#4FA870', flex: 'none' }} />}
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: isActive ? '#F5F1E8' : 'rgba(237,231,220,.65)', maxWidth: 120, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{d.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: n === 30 ? '#4FA870' : 'rgba(237,231,220,.4)' }}>{n}/30</div>
            </button>
          );
        })}
        {decks.length < 5 && (
          <button onClick={() => { const id = 'd' + Date.now(); setDecks((s) => [...s, { id, name: `Deck ${s.length + 1}`, cardIds: [] }]); setActiveId(id); }} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: 'rgba(237,231,220,.5)', padding: '9px 14px', border: '1px dashed rgba(237,231,220,.3)', background: 'transparent' }}>
            + NEW DECK
          </button>
        )}
      </div>

      <div className="deck-workspace">
        {/* vault */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.16em', color: 'rgba(237,231,220,.5)' }}>YOUR VAULT: TAP TO ADD</div>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setVaultPage(0); }} placeholder="SEARCH HEROES" style={{ background: '#100C14', border: '1px solid rgba(237,231,220,.2)', color: '#F5F1E8', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.08em', padding: '8px 12px', width: 160 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {RANK_FILTERS.map((f) => {
              const activeF = filter === f;
              const hue = RANKS.find((r) => r.rank === f)?.hue || '#F5F1E8';
              return (
                <button key={f} onClick={() => { setFilter(f); setVaultPage(0); }} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.1em', padding: '6px 12px', clipPath: 'polygon(0 0,100% 0,90% 100%,0 100%)', background: activeF ? hue : 'transparent', color: activeF ? '#0F0C16' : 'rgba(237,231,220,.6)', border: `1px solid ${activeF ? hue : 'rgba(237,231,220,.25)'}` }}>
                  {f}
                </button>
              );
            })}
          </div>
          <div className="vault-grid">
            {pagedVault.map((c) => (
              <button key={c.id} onClick={c.add} disabled={c.inDeck || count >= 30} style={{ position: 'relative', cursor: c.cursor, overflow: 'hidden', height: 118, background: '#100C14', border: '1px solid rgba(237,231,220,.16)', clipPath: 'polygon(0 0,100% 0,100% 88%,88% 100%,0 100%)', padding: 8, opacity: c.opacity, textAlign: 'left' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '16px 16px 0 0', borderColor: `${c.rankHue} transparent transparent transparent` }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 6.5, fontWeight: 700, color: c.rankHue }}>{c.rank}</div>
                </div>
                <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
                  <div style={{ fontWeight: 900, fontSize: 11.5, color: '#F5F1E8', lineHeight: 1.1 }}>{c.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 6.5, letterSpacing: '.06em', color: c.hue, marginTop: 3 }}>{c.cat}</div>
                </div>
                {c.inDeck && <div style={{ position: 'absolute', top: 6, left: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 7.5, fontWeight: 900, color: '#4FA870' }}>IN DECK</div>}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button onClick={() => setVaultPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={{ cursor: page > 0 ? 'pointer' : 'default', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: page > 0 ? '#F5F1E8' : 'rgba(237,231,220,.25)', padding: '8px 14px', border: '1px solid rgba(237,231,220,.2)', background: 'transparent' }}>
              &lsaquo; PREV
            </button>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(237,231,220,.5)' }}>PAGE {page + 1} / {vaultPageCount}</div>
            <button onClick={() => setVaultPage((p) => Math.min(vaultPageCount - 1, p + 1))} disabled={page >= vaultPageCount - 1} style={{ cursor: page < vaultPageCount - 1 ? 'pointer' : 'default', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: page < vaultPageCount - 1 ? '#F5F1E8' : 'rgba(237,231,220,.25)', padding: '8px 14px', border: '1px solid rgba(237,231,220,.2)', background: 'transparent' }}>
              NEXT &rsaquo;
            </button>
          </div>
        </div>

        {/* deck list */}
        <div style={{ position: 'relative', background: '#100C14', clipPath: 'polygon(0 0,100% 0,100% 100%,16px 100%,0 calc(100% - 16px))', padding: 20, alignSelf: 'start', borderTop: '2px solid #E03C4E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: "'Zen Old Mincho', serif", fontWeight: 700, fontSize: 16, letterSpacing: '.04em', color: '#F5F1E8' }}>Deck List</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: '#0F0C16', background: countHue, padding: '3px 9px', clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)' }}>{count}/30</div>
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 12, flexWrap: 'wrap' }}>
            {RANK_FILTERS.map((f) => {
              const activeF = deckFilter === f;
              const hue = RANKS.find((r) => r.rank === f)?.hue || '#F5F1E8';
              return (
                <button key={f} onClick={() => setDeckFilter(f)} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.06em', padding: '5px 9px', clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)', background: activeF ? hue : 'transparent', color: activeF ? '#0F0C16' : 'rgba(237,231,220,.55)', border: `1px solid ${activeF ? hue : 'rgba(237,231,220,.22)'}` }}>
                  {f}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12, maxHeight: 460, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#E03C4E #17121B' }}>
            {deckCardsFiltered.map((d) => (
              <div data-deck-list-item key={d.id} style={{ display: 'grid', gridTemplateColumns: '20px auto 1fr auto', alignItems: 'center', gap: 10, padding: '9px 4px', borderBottom: '1px solid rgba(237,231,220,.08)' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(237,231,220,.3)' }}>{d.index}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, fontWeight: 900, letterSpacing: '.04em', color: '#0F0C16', background: d.rankHue, padding: '3px 5px' }}>{d.rankShort}</div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F5F1E8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{d.name}</div>
                <button onClick={d.remove} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(237,231,220,.35)', background: 'transparent', border: 'none' }}>&#10005;</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(237,231,220,.12)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.1em', color: 'rgba(237,231,220,.45)' }}>RANK CURVE</div>
            <div style={{ display: 'flex', height: 8, marginTop: 8, gap: 1 }}>
              {rankCounts.map((r) => (
                <div key={r.rank} style={{ height: '100%', background: r.hue, width: `${r.pct}%` }} />
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(237,231,220,.5)', marginTop: 10 }}>Decks require exactly 30 cards: heroes, Spells, and Traps together.</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}