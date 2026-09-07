'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HEROES, RANKS, type Hero } from '../../data/heroes';
import { SUPPORT_CARDS, CARD_TYPES, type CardType } from '../../data/support';

const PAGE_SIZE = 10;
const TAB_ACTIVE = { color: '#0F0C16', background: '#E03C4E' };
const TAB_INACTIVE = { color: 'rgba(237,231,220,.6)', background: 'transparent' };

const RANK_HUE: Record<string, string> = { COMMON: '#C08552', RARE: '#B8C0C8', ELITE: '#E8B45C', LEGENDARY: '#E03C4E' };

export default function WikiPage() {
  const [view, setView] = useState<'roster' | 'fusion'>('roster');
  const [cardType, setCardType] = useState<CardType>('HEROES');
  const [cat, setCat] = useState('ALL');
  const [rank, setRank] = useState('ALL');
  const [search, setSearch] = useState('');
  const [abilityOnly, setAbilityOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<'stats' | 'tech' | 'lore'>('stats');

  const cats = useMemo(() => [...new Set(HEROES.map((h) => h.cat))].sort(), []);
  const cur = openId ? HEROES.find((h) => h.id === openId) ?? null : null;
  const curSupport = !cur ? SUPPORT_CARDS.find((s) => s.id === openId) ?? null : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HEROES.filter(
      (h) =>
        (cat === 'ALL' || h.cat === cat) &&
        (rank === 'ALL' || h.rank === rank) &&
        (!q || h.name.toLowerCase().includes(q)) &&
        (!abilityOnly || !!h.ability)
    );
  }, [cat, rank, search, abilityOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const p = Math.min(page, pageCount - 1);
  const paged = filtered.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);

  const typeFg = (t: CardType) => (cardType === t ? TAB_ACTIVE.color : TAB_INACTIVE.color);
  const typeBg = (t: CardType) => (cardType === t ? TAB_ACTIVE.background : TAB_INACTIVE.background);

  const legendaries = HEROES.filter((h) => h.rank === 'LEGENDARY');
  const featured = legendaries[0];

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B10', color: '#EDE7DC', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
      {/* sticky header */}
      <div className="wiki-header" style={{ background: '#0B0912', borderBottom: '1px solid rgba(237,231,220,.12)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: '.1em', color: 'rgba(237,231,220,.5)', paddingRight: 16, borderRight: '1px solid rgba(237,231,220,.18)' }}>&larr; SITE</Link>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, background: '#E03C4E', clipPath: 'polygon(30% 0,100% 0,100% 70%,70% 100%,0 100%,0 30%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <span style={{ fontWeight: 900, fontSize: 14, color: '#0F0C16' }}>R</span>
                </div>
                <div style={{ fontFamily: "'Zen Old Mincho', serif", fontWeight: 700, letterSpacing: '.28em', fontSize: 13, color: '#EDE7DC' }}>REINA</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.2em', color: 'rgba(237,231,220,.4)', marginLeft: 8 }}>CARD WIKI · {filtered.length}/100</div>
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(237,231,220,.25)', flex: 'none' }}>
              <TabBtn active={view === 'roster'} onClick={() => { setView('roster'); setOpenId(null); }} label="ROSTER" />
              <TabBtn active={view === 'fusion'} onClick={() => { setView('fusion'); setOpenId(null); }} label="FUSION" />
            </div>
          </div>

          {view === 'roster' && (
            <div className="wiki-filters">
              <input className="wiki-search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="SEARCH NAME" style={{ background: '#14101A', border: '1px solid rgba(237,231,220,.25)', color: '#EDE7DC', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: '9px 14px', letterSpacing: '.05em', width: 130 }} />
              <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(237,231,220,.25)' }}>
                {CARD_TYPES.map((t) => (
                  <button key={t} onClick={() => { setCardType(t); setPage(0); setOpenId(null); }} style={{ cursor: 'pointer', padding: '9px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', color: typeFg(t), background: typeBg(t), border: 'none' }}>{t}</button>
                ))}
              </div>
              {cardType === 'HEROES' && (
                <>
                  <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} style={{ background: '#14101A', border: '1px solid rgba(237,231,220,.25)', color: '#EDE7DC', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: '9px 14px', letterSpacing: '.05em' }}>
                    <option value="ALL">ALL CLASSES</option>
                    {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(237,231,220,.25)' }}>
                    {RANKS.map((r) => (
                      <button key={r} onClick={() => { setRank(r); setPage(0); }} style={{ cursor: 'pointer', padding: '9px 13px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: rank === r ? '#0F0C16' : 'rgba(237,231,220,.6)', background: rank === r ? '#E03C4E' : 'transparent', border: 'none' }}>{r}</button>
                    ))}
                  </div>
                  <button onClick={() => { setAbilityOnly(!abilityOnly); setPage(0); }} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.08em', padding: '9px 13px', color: abilityOnly ? '#0F0C16' : 'rgba(237,231,220,.6)', background: abilityOnly ? '#E03C4E' : 'transparent', border: `1px solid ${abilityOnly ? '#E03C4E' : 'rgba(237,231,220,.25)'}` }}>HAS ABILITY</button>
                  <div onClick={() => { setCat('ALL'); setRank('ALL'); setSearch(''); setAbilityOnly(false); setCardType('HEROES'); setPage(0); }} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.08em', padding: '9px 13px', color: 'rgba(237,231,220,.5)' }}>RESET</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* body */}
      {view === 'fusion' ? (
        <FusionView legendaries={legendaries} featured={featured} onBrowse={() => { setView('roster'); setCardType('SPELL'); setOpenId(null); }} />
      ) : openId ? (
        <DetailPanel cur={cur} curSupport={curSupport} tab={tab} setTab={setTab} onClose={() => setOpenId(null)} onOpen={(id) => { setOpenId(id); setTab('stats'); }} />
      ) : (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px clamp(20px,4vw,48px) 80px' }}>
          {cardType === 'HEROES' ? (
            <div className="wiki-card-grid">
              {paged.map((h) => (
                <HeroCard key={h.id} h={h} onOpen={() => { setOpenId(h.id); setTab('stats'); setPage(p); }} />
              ))}
            </div>
          ) : (
            <div className="wiki-card-grid">
              {SUPPORT_CARDS.filter((s) => s.rank === cardType).map((s) => (
                <SupportCardGrid key={s.id} s={s} onOpen={() => setOpenId(s.id)} />
              ))}
            </div>
          )}
          {/* pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 32 }}>
            <button onClick={() => setPage(Math.max(0, p - 1))} style={{ cursor: 'pointer', opacity: p > 0 ? 1 : 0.3, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.1em', color: '#EDE7DC', border: '1px solid rgba(237,231,220,.3)', padding: '8px 14px', background: 'transparent' }}>&larr; PREV</button>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: '.14em', color: 'rgba(237,231,220,.5)' }}>PAGE {p + 1} / {pageCount}</div>
            <button onClick={() => setPage(Math.min(pageCount - 1, p + 1))} style={{ cursor: 'pointer', opacity: p < pageCount - 1 ? 1 : 0.3, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.1em', color: '#EDE7DC', border: '1px solid rgba(237,231,220,.3)', padding: '8px 14px', background: 'transparent' }}>NEXT &rarr;</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button onClick={onClick} style={{ cursor: 'pointer', padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: active ? '#0F0C16' : 'rgba(237,231,220,.6)', background: active ? '#E03C4E' : 'transparent', border: 'none' }}>{label}</button>;
}

function HeroCard({ h, onOpen }: { h: Hero; onOpen: () => void }) {
  return (
    <div onClick={onOpen} style={{ cursor: 'pointer', position: 'relative', padding: 2, background: h.rankHue }}>
      <div style={{ position: 'relative', background: '#0B0910', border: '1px solid rgba(0,0,0,.5)', padding: 5, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 3, top: 3, width: 9, height: 9, borderTop: `1.5px solid ${h.rankHue}`, borderLeft: `1.5px solid ${h.rankHue}`, zIndex: 2 }}></div>
        <div style={{ position: 'absolute', right: 3, bottom: 3, width: 9, height: 9, borderBottom: `1.5px solid ${h.rankHue}`, borderRight: `1.5px solid ${h.rankHue}`, zIndex: 2 }}></div>
        <div style={{ position: 'absolute', right: 0, top: 6, zIndex: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 6, fontWeight: 900, letterSpacing: '.04em', color: '#0F0C16', background: h.rankHue, padding: '2px 6px 2px 8px', clipPath: 'polygon(14% 0,100% 0,100% 100%,0 100%)' }}>{h.rank}</div>
        <div style={{ position: 'relative', aspectRatio: '1/1', background: `linear-gradient(170deg,${h.hue}30,#0B0910 72%)`, marginTop: 2, overflow: 'hidden', clipPath: 'polygon(0 0,82% 0,100% 18%,100% 100%,0 100%)', border: `1px solid ${h.hue}44` }}>
          <div style={{ position: 'absolute', left: 3, top: 3, fontFamily: "'JetBrains Mono', monospace", fontSize: 6, color: 'rgba(237,231,220,.5)' }}>{h.no}</div>
        </div>
        <div style={{ marginTop: 5, background: '#100C14', borderLeft: `2px solid ${h.hue}`, padding: '3px 5px' }}>
          <div style={{ fontWeight: 800, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#F5F1E8' }}>{h.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 6, letterSpacing: '.06em', color: h.hue, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.cat}</div>
        </div>
      </div>
    </div>
  );
}

function SupportCardGrid({ s, onOpen }: { s: (typeof SUPPORT_CARDS)[number]; onOpen: () => void }) {
  return (
    <div onClick={onOpen} style={{ cursor: 'pointer', position: 'relative', padding: 4, background: `linear-gradient(155deg,${s.hue},rgba(13,11,16,.9) 62%)` }}>
      <div style={{ background: '#0F0C12', border: '1px solid rgba(237,231,220,.16)', padding: 4, position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: '.06em', color: s.hue }}>{s.rank}</div>
        <div style={{ position: 'relative', aspectRatio: '1/1', background: `linear-gradient(170deg,${s.hue}22,#0B0910 70%)`, marginTop: 4, overflow: 'hidden', clipPath: 'polygon(0 0,82% 0,100% 18%,100% 100%,0 100%)' }}></div>
        <div style={{ fontWeight: 800, fontSize: 11, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
      </div>
    </div>
  );
}

function statBar(label: string, val: number, hue: string) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 30px', alignItems: 'center', gap: 10 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(237,231,220,.6)' }}>{label}</div>
      <div style={{ position: 'relative', height: 11, background: 'rgba(237,231,220,.1)' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${val}%`, background: hue, clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 100%,0 100%)' }}></div>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{val}</div>
    </div>
  );
}

function DetailPanel({ cur, curSupport, tab, setTab, onClose, onOpen }: { cur: Hero | null; curSupport: (typeof SUPPORT_CARDS)[number] | null; tab: string; setTab: (t: 'stats' | 'tech' | 'lore') => void; onClose: () => void; onOpen: (id: string) => void }) {
  const h = cur;
  const sup = curSupport;
  const fusesWith = h ? HEROES.filter((x) => x.cat === h.cat && x.id !== h.id).slice(0, 3) : [];
  const tabBtn = (key: 'stats' | 'tech' | 'lore', label: string) => (
    <button onClick={() => setTab(key)} style={{ cursor: 'pointer', padding: '10px 18px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', color: tab === key ? '#F5F1E8' : 'rgba(237,231,220,.5)', border: 'none', background: 'transparent', borderBottom: `2px solid ${tab === key ? '#E03C4E' : 'transparent'}` }}>{label}</button>
  );

  return (
    <div style={{ background: '#0A0810', minHeight: '100vh', padding: 'clamp(30px,5vw,70px) clamp(20px,4vw,56px) 100px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div onClick={onClose} style={{ cursor: 'pointer', display: 'inline-flex', fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: '.16em', color: 'rgba(237,231,220,.5)', marginBottom: 20 }}>&larr; BACK TO ROSTER</div>
        {sup && (
          <>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.18em', color: sup.hue, border: `1.5px solid ${sup.hue}`, display: 'table', padding: '5px 11px', marginTop: 6 }}>{sup.rank}</div>
            <h1 style={{ margin: '16px 0 0', fontSize: 'clamp(36px,5vw,58px)', fontWeight: 900, letterSpacing: '-.03em', color: '#F5F1E8' }}>{sup.name}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,220px) 1fr', gap: 'clamp(24px,4vw,40px)', marginTop: 30, alignItems: 'start' }}>
              <div style={{ position: 'relative', padding: 6, background: `linear-gradient(155deg,${sup.hue},rgba(13,11,16,.9) 62%)` }}>
                <div style={{ background: '#0D0A0E', position: 'relative', aspectRatio: '3/4', overflow: 'hidden', clipPath: 'polygon(0 0,84% 0,100% 10%,100% 100%,0 100%)' }}></div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.24em', color: 'rgba(237,231,220,.5)' }}>EFFECT</div>
                <div style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(237,231,220,.85)', marginTop: 10, maxWidth: 420 }}>{sup.cat}</div>
              </div>
            </div>
          </>
        )}
        {h && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.16em', background: h.hue, color: '#0F0C16', padding: '6px 13px', clipPath: 'polygon(0 0,100% 0,90% 100%,0 100%)' }}>{h.cat}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.18em', color: h.rankHue, border: `1.5px solid ${h.rankHue}`, padding: '5px 11px' }}>{h.rank}</div>
              </div>
            </div>
            <h1 style={{ margin: '16px 0 0', fontSize: 'clamp(36px,5vw,58px)', fontWeight: 900, letterSpacing: '-.03em', color: '#F5F1E8' }}>{h.name}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,220px) 1fr', gap: 'clamp(24px,4vw,40px)', marginTop: 30, alignItems: 'start' }}>
              <div style={{ position: 'relative', padding: 6, background: `linear-gradient(155deg,${h.hue},rgba(13,11,16,.9) 62%)` }}>
                <div style={{ background: '#0D0A0E', position: 'relative', aspectRatio: '3/4', overflow: 'hidden', clipPath: 'polygon(0 0,84% 0,100% 10%,100% 100%,0 100%)' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: h.hue, color: '#0F0C16', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, fontWeight: 700, letterSpacing: '.1em', padding: '6px 0' }}>{h.name}</div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(237,231,220,.18)' }}>
                  {tabBtn('stats', 'STATS')}
                  {tabBtn('tech', 'TECHNIQUES')}
                  {tabBtn('lore', 'LORE')}
                </div>
                {tab === 'stats' && (
                  <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {statBar('ATK', h.atk, h.hue)}
                    {statBar('DEF', h.def, h.hue)}
                    {statBar('SPD', h.spd, h.hue)}
                    {statBar('LUCK', h.luck, h.hue)}
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(237,231,220,.4)', marginTop: 4 }}>ATK damage dealt · DEF damage absorbed · SPD turn priority · LUCK crit &amp; fusion odds</div>
                  </div>
                )}
                {tab === 'tech' && (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
                      {h.caps.map((c) => (
                        <div key={c} style={{ fontSize: 11.5, fontWeight: 600, background: 'rgba(237,231,220,.06)', border: '1px solid rgba(237,231,220,.2)', padding: '8px 13px', color: 'rgba(237,231,220,.85)', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)' }}>{c}</div>
                      ))}
                    </div>
                    {h.ability && (
                      <div style={{ position: 'relative', display: 'inline-block', marginTop: 22, maxWidth: 460 }}>
                        <div style={{ position: 'absolute', inset: '5px 5px -5px -5px', background: '#E03C4E', clipPath: 'polygon(0 0,100% 0,100% 80%,calc(100% - 14px) 100%,0 100%)' }}></div>
                        <div style={{ position: 'relative', background: '#0F0C16', border: '2px solid #E03C4E', clipPath: 'polygon(0 0,100% 0,100% 80%,calc(100% - 14px) 100%,0 100%)', padding: '14px 18px' }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.18em', color: '#E03C4E' }}>SPECIAL ABILITY</div>
                          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(237,231,220,.85)', marginTop: 5 }}>{h.ability}</div>
                        </div>
                      </div>
                    )}
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.2em', color: 'rgba(237,231,220,.5)', marginTop: 26 }}>FUSES WELL WITH</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      {fusesWith.map((f) => (
                        <button key={f.id} onClick={() => onOpen(f.id)} style={{ cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: '7px 12px', border: `1px solid ${f.hue}`, color: f.hue, background: 'transparent' }}>{f.name}</button>
                      ))}
                    </div>
                  </div>
                )}
                {tab === 'lore' && (
                  <div>
                    <div style={{ fontFamily: "'Zen Old Mincho', serif", fontSize: 19, lineHeight: 1.6, color: 'rgba(237,231,220,.85)', marginTop: 26 }}>「 {h.desc} 」</div>
                    <div style={{ fontSize: 14, lineHeight: 1.85, color: 'rgba(237,231,220,.68)', marginTop: 18, maxWidth: 480 }}>{h.lore}</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FusionView({ legendaries, featured, onBrowse }: { legendaries: Hero[]; featured: Hero | undefined; onBrowse: () => void }) {
  const hiddenCount = Math.max(0, legendaries.length - 1);
  return (
    <>
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0D0B10' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg,#0D0B10 0%,#0D0B10 34%,#5C1119 54%,#8C1420 72%,#0D0B10 92%)', opacity: 0.7 }}></div>
        <div style={{ position: 'relative', maxWidth: 960, margin: '0 auto', padding: '70px clamp(20px,4vw,48px) 60px' }}>
          <div style={{ display: 'inline-block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.3em', color: '#0F0C16', background: '#E03C4E', padding: '5px 12px', clipPath: 'polygon(0 0,100% 0,90% 100%,0 100%)' }}>THE FORGE</div>
          <h1 style={{ margin: '16px 0 0', fontSize: 'clamp(38px,5.4vw,64px)', fontWeight: 900, letterSpacing: '-.03em', color: '#F5F1E8', textShadow: '0 0 34px rgba(224,60,78,.7)' }}>Fuse cards.<br />Check your pair.</h1>
          <p style={{ margin: '18px 0 0', maxWidth: 600, fontSize: 14.5, lineHeight: 1.8, color: 'rgba(237,231,220,.8)' }}>Not every pair can fuse. Each hero only fuses with a specific set of known partners, listed on its own page as &quot;Fuses well with.&quot; Class is a compatibility filter, not a power tier: stats decide who wins a fight, not class.</p>
          <p style={{ margin: '12px 0 0', maxWidth: 600, fontSize: 13, lineHeight: 1.75, color: '#F5C6CC' }}>Incompatible pairs always fail, and both cards are lost. Check compatibility before fusing.</p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px clamp(20px,4vw,48px) 90px' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.24em', color: '#E03C4E' }}>OUTCOME LADDER</div>
        <h2 style={{ margin: '12px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Fusion odds by input rarity.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
          <LadderRow left="BOTH COMMON" leftColor="#C08552" segments={[{ w: 70, c: '#C08552', t: 'COMMON 70%' }, { w: 30, c: '#B8C0C8', t: 'RARE 30%' }]} />
          <LadderRow left="EITHER RARE" leftColor="#B8C0C8" segments={[{ w: 75, c: '#B8C0C8', t: 'RARE 75%' }, { w: 25, c: '#E8B45C', t: 'ELITE 25%' }]} />
          <LadderRow left="EITHER ELITE" leftColor="#E8B45C" segments={[{ w: 100, c: '#E8B45C', t: 'ELITE 100%, STAT-BOOSTED' }]} />
        </div>

        <div style={{ marginTop: 64, paddingTop: 44, borderTop: '1px solid rgba(237,231,220,.14)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.24em', color: '#8C6FD8' }}>THE BLANK CARD</div>
          <h2 style={{ margin: '12px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Common + Elite + Blank Card.</h2>
          <p style={{ margin: '12px 0 0', maxWidth: 600, fontSize: 14, lineHeight: 1.75, color: 'rgba(237,231,220,.68)' }}>Feed a Blank Card into a compatible Common + Elite pair and all three are consumed for a guaranteed Legendary, the only fusion that takes three inputs. Fusing is free, it draws from a cooldown that refills between matches. Blank Cards aren&apos;t sold or packed: every match shuffles one into the pre-game draw with a 20% chance.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28, flexWrap: 'wrap' }}>
            <MiniCard label="COMMON" hue="#C08552" />
            <Plus />
            <MiniCard label="ELITE" hue="#E8B45C" />
            <Plus />
            <MiniCard label="WILD" hue="#8C6FD8" />
            <Arrow />
            <LegendaryCard label="LEGENDARY" />
          </div>
        </div>

        <div style={{ marginTop: 64, paddingTop: 44, borderTop: '1px solid rgba(237,231,220,.14)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.24em', color: '#E03C4E' }}>FEATURED FUSION</div>
          <h2 style={{ margin: '12px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>One known Legendary recipe.</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 26, flexWrap: 'wrap' }}>
            <MiniCard label={`ELITE\n${featured?.cat ?? ''}`} hue={featured?.hue ?? '#E03C4E'} />
            <Plus />
            <MiniCard label={`ELITE\n${featured?.cat ?? ''}`} hue={featured?.hue ?? '#E03C4E'} />
            <Arrow />
            <div style={{ width: 66, height: 86, background: `linear-gradient(160deg,#E03C4E,#0F0C16 65%)`, border: '2px solid #E03C4E', clipPath: 'polygon(0 0,80% 0,100% 20%,100% 100%,0 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, boxShadow: '0 0 30px -8px rgba(224,60,78,.8)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 900, color: '#F5F1E8' }}>{featured?.name ?? ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
              {Array.from({ length: hiddenCount }).map((_, i) => (
                <div key={i} style={{ width: 36, height: 48, background: '#14101A', border: '1.5px dashed rgba(237,231,220,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'rgba(237,231,220,.3)' }}>?</div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.06em', color: 'rgba(237,231,220,.4)', marginTop: 12 }}>+ {hiddenCount} more Legendary recipes, undiscovered</div>
        </div>

        <div style={{ marginTop: 64, paddingTop: 44, borderTop: '1px solid rgba(237,231,220,.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.24em', color: '#3FA8A0' }}>SPELL &amp; TRAP</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8, color: 'rgba(237,231,220,.85)' }}>Spells and Traps fill deck slots alongside heroes, browse them under the roster&apos;s card-type tabs.</div>
          </div>
          <button onClick={onBrowse} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: '#0F0C16', background: '#3FA8A0', padding: '10px 18px', border: 'none' }}>BROWSE CARDS &rarr;</button>
        </div>
      </div>
    </>
  );
}

function LadderRow({ left, leftColor, segments }: { left: string; leftColor: string; segments: { w: number; c: string; t: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: 16, padding: '8px 10px', borderLeft: `2px solid ${leftColor}` }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: leftColor }}>{left}</div>
      <div style={{ display: 'flex', height: 26, clipPath: 'polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)', overflow: 'hidden' }}>
        {segments.map((s, i) => (
          <div key={i} style={{ width: `${s.w}%`, background: s.c, display: 'flex', alignItems: 'center', paddingLeft: i === 0 ? 10 : 0, justifyContent: i === 0 ? 'flex-start' : 'center', fontSize: 11, fontWeight: 800, color: '#0F0C16', whiteSpace: 'nowrap', overflow: 'hidden' }}>{s.t}</div>
        ))}
      </div>
    </div>
  );
}
function MiniCard({ label, hue }: { label: string; hue: string }) {
  return <div style={{ width: 56, height: 74, background: '#0F0C12', border: `2px solid ${hue}`, clipPath: 'polygon(0 0,80% 0,100% 20%,100% 100%,0 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 7, fontWeight: 700, color: hue, textAlign: 'center', whiteSpace: 'pre-line' }}>{label}</div>;
}
function Plus() { return <div style={{ fontSize: 20, color: 'rgba(237,231,220,.4)' }}>+</div>; }
function Arrow() { return <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: 'rgba(237,231,220,.5)' }}>&rarr;</div>; }
function LegendaryCard({ label }: { label: string }) {
  return <div style={{ width: 66, height: 86, background: 'linear-gradient(160deg,#E03C4E,#0F0C16 65%)', border: '2px solid #E03C4E', clipPath: 'polygon(0 0,80% 0,100% 20%,100% 100%,0 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, boxShadow: '0 0 30px -8px rgba(224,60,78,.8)', fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 800, color: '#F5F1E8' }}>{label}</div>;
}