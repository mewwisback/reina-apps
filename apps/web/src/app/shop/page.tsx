'use client';

import { useState } from 'react';
import { AppShell } from '../../components/layout/app-shell';

type Tab = 'packs' | 'pass' | 'cosmetics';
type ModalState = { type: 'topup' | 'buy'; name?: string; price?: string; hue?: string; packKey?: string } | null;

const PACKS = [
  { key: 'bronze', name: 'BRONZE', hue: '#8C5A34', odds: '2 Common + 1 Rare guaranteed', priceCr: '400', priceUsdt: '2.99', best: false, breakdown: [{ label: 'Common', pct: '55%', hue: '#C08552' }, { label: 'Rare', pct: '45%', hue: '#B8C0C8' }] },
  { key: 'silver', name: 'SILVER', hue: '#B8C0C8', odds: '1 Common + 2 Rare guaranteed', priceCr: '900', priceUsdt: '5.99', best: false, breakdown: [{ label: 'Rare', pct: '70%', hue: '#B8C0C8' }, { label: 'Elite', pct: '30%', hue: '#E8B45C' }] },
  { key: 'gold', name: 'GOLD', hue: '#E8B45C', odds: '1 Rare + 2 Elite guaranteed', priceCr: '1,800', priceUsdt: '11.99', best: true, breakdown: [{ label: 'Elite', pct: '85%', hue: '#E8B45C' }, { label: 'Legendary', pct: '15%', hue: '#E03C4E' }] },
];

const COSMETICS = [
  { name: 'Crimson Card Back', hue: '#E03C4E', price: '4.99 USDT', owned: true },
  { name: 'Gilded Frame', hue: '#E8B45C', price: '6.99 USDT', owned: false },
  { name: 'Void Card Back', hue: '#8C6FD8', price: '4.99 USDT', owned: false },
  { name: 'Duelist Emblem', hue: '#3FA893', price: '3.49 USDT', owned: false },
];

export default function ShopPage() {
  const [tab, setTab] = useState<Tab>('packs');
  const [modal, setModal] = useState<ModalState>(null);
  const [topUpAmount, setTopUpAmount] = useState(25);
  const [justBought, setJustBought] = useState<string | null>(null);

  const openBuy = (m: Exclude<ModalState, null>) => setModal(m);
  const topUpTiers = [10, 25, 50, 100];

  return (
    <AppShell>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, padding: '36px clamp(20px,3.5vw,48px) 0' }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.2em', color: '#E03C4E' }}>SHOP</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(24px,2.6vw,32px)', fontWeight: 900, letterSpacing: '-.02em', color: '#F5F1E8' }}>Packs, pass &amp; cosmetics</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 15, height: 15, flex: 'none', background: 'linear-gradient(160deg,#E8B45C,#8C6019 75%)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.18em', color: 'rgba(237,231,220,.5)' }}>CR</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#E8B45C', lineHeight: 1 }}>2,450</div>
            </div>
          </div>
          <div style={{ width: 1, height: 26, background: 'rgba(237,231,220,.2)', transform: 'skewX(-12deg)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 15, height: 15, flex: 'none', background: 'linear-gradient(160deg,#3FA893,#1F5A50 75%)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.18em', color: '#3FA893' }}>USDT</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#F5F1E8', lineHeight: 1 }}>128.40</div>
            </div>
          </div>
          <button onClick={() => openBuy({ type: 'topup' })} style={{ cursor: 'pointer', background: '#3FA893', color: '#0F0C16', fontSize: 11, fontWeight: 900, letterSpacing: '.1em', padding: '11px 16px', clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 10px) 100%,0 100%)' }}>
            TOP UP
          </button>
        </div>
      </div>

      {/* starter bundle */}
      <div style={{ position: 'relative', overflow: 'hidden', marginTop: 28, padding: '32px clamp(20px,3.5vw,48px)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg,#120E12 0%,#120E12 36%,#5C1119 60%,#8C1420 76%,#120E12 94%)' }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.2em', color: '#F5C6CC' }}>LIMITED: ENDS IN 2 DAYS 14H</div>
            <div style={{ fontWeight: 900, fontSize: 26, marginTop: 10, color: '#F5F1E8' }}>Starter Bundle</div>
            <div style={{ fontSize: 13, color: 'rgba(237,231,220,.75)', marginTop: 6, maxWidth: 420 }}>1 Gold Pack, 1 guaranteed Blank Card, and the Crimson Card Back cosmetic. Priced below buying each alone.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'rgba(237,231,220,.5)', textDecoration: 'line-through' }}>24.97 USDT</div>
            <button onClick={() => openBuy({ type: 'buy', name: 'Starter Bundle', price: '16.99 USDT', hue: '#E03C4E' })} style={{ cursor: 'pointer', marginTop: 6, background: '#E03C4E', color: '#0F0C16', fontSize: 14, fontWeight: 900, letterSpacing: '.1em', padding: '14px 26px', clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 12px) 100%,0 100%)' }}>
              16.99 USDT
            </button>
          </div>
        </div>
      </div>

      {/* tabs + content */}
      <div className="product-content">
        <div className="shop-tabs">
          {(['packs', 'pass', 'cosmetics'] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button key={t} data-active={active} onClick={() => setTab(t)}>
                {t === 'packs' ? 'HERO PACKS' : t === 'pass' ? 'SEASON PASS' : 'COSMETICS'}
              </button>
            );
          })}
        </div>

        {tab === 'packs' && (
          <div className="shop-pack-grid">
            {PACKS.map((p) => (
              <div key={p.key} style={{ position: 'relative', display: 'flex', flexDirection: 'column', border: `1px solid rgba(237,231,220,.16)`, padding: 0, overflow: 'hidden' }}>
                {p.best && <div style={{ position: 'absolute', top: 0, right: 0, background: p.hue, color: '#0F0C16', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 900, letterSpacing: '.1em', padding: '5px 10px', clipPath: 'polygon(15% 0,100% 0,100% 100%,0 100%)', zIndex: 2 }}>BEST VALUE</div>}
                <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', padding: '32px 0 20px', background: `linear-gradient(115deg,#100C14 0%,#100C14 45%,${p.hue} 130%)` }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 14, borderTop: '1px solid rgba(245,241,232,.35)', borderLeft: '1px solid rgba(245,241,232,.35)' }} />
                  <div style={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderBottom: '1px solid rgba(245,241,232,.35)', borderRight: '1px solid rgba(245,241,232,.35)' }} />
                  <div style={{ position: 'relative', width: 88, height: 120, background: `linear-gradient(160deg,${p.hue},#0F0C16 65%)`, border: `2px solid ${p.hue}`, clipPath: 'polygon(0 0,80% 0,100% 15%,100% 100%,0 100%)' }} />
                </div>
                <div style={{ padding: 22, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.16em', color: p.hue }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(237,231,220,.6)', marginTop: 8 }}>{p.odds}</div>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(237,231,220,.1)' }}>
                    <div style={{ display: 'flex', height: 6, gap: 2 }}>
                      {p.breakdown.map((b, i) => (
                        <div key={i} style={{ height: '100%', background: b.hue, width: b.pct }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      {p.breakdown.map((b, i) => (
                        <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: b.hue }}>{b.label} {b.pct}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: 18 }}>
                    <button onClick={() => openBuy({ type: 'buy', name: `${p.name} PACK`, price: `${p.priceUsdt} USDT`, hue: p.hue, packKey: p.key })} style={{ cursor: 'pointer', width: '100%', textAlign: 'center', background: '#3FA893', color: '#0F0C16', fontSize: 13, fontWeight: 900, letterSpacing: '.04em', padding: 13, clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 10px) 100%,0 100%)' }}>
                      {p.priceUsdt} USDT
                    </button>
                    <button onClick={() => openBuy({ type: 'buy', name: `${p.name} PACK`, price: `${p.priceCr} CR`, hue: p.hue, packKey: p.key })} style={{ cursor: 'pointer', marginTop: 8, width: '100%', textAlign: 'center', border: `1px solid rgba(237,231,220,.22)`, color: 'rgba(237,231,220,.6)', fontSize: 11, fontWeight: 700, padding: 9, background: 'transparent' }}>
                      or {p.priceCr} CR
                    </button>
                    {justBought === p.key && (
                      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.08em', color: '#4FA870' }}>&#10003; ADDED TO VAULT</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'pass' && (
          <div style={{ marginTop: 24, border: '1px solid rgba(237,231,220,.16)', padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.16em', color: '#E8B45C' }}>SEASON PASS</div>
                <div style={{ fontWeight: 900, fontSize: 20, marginTop: 8, color: '#F5F1E8' }}>Season 1: First Duel</div>
                <div style={{ fontSize: 12.5, color: 'rgba(237,231,220,.6)', marginTop: 6, maxWidth: 420 }}>40 tiers of rewards, exclusive cosmetics, and bonus Blank Card odds all season.</div>
              </div>
              <button onClick={() => openBuy({ type: 'buy', name: 'Season 1 Pass: First Duel', price: '9.99 USDT', hue: '#E8B45C' })} style={{ cursor: 'pointer', background: '#E8B45C', color: '#0F0C16', fontSize: 13, fontWeight: 900, letterSpacing: '.1em', padding: '14px 24px', clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 10px) 100%,0 100%)', whiteSpace: 'nowrap' }}>
                9.99 USDT
              </button>
            </div>
            <div style={{ position: 'relative', marginTop: 28, paddingTop: 22 }}>
              <div style={{ position: 'absolute', left: 'calc(60% - 1px)', top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, fontWeight: 900, letterSpacing: '.08em', color: '#E8B45C', whiteSpace: 'nowrap' }}>YOU: TIER 6</div>
                <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '6px 5px 0 5px', borderColor: '#E8B45C transparent transparent transparent', marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const unlocked = i < 6;
                  return (
                    <div key={i} style={{ flex: 1, height: `${30 + (i % 3) * 8}px`, background: unlocked ? '#E8B45C' : 'repeating-linear-gradient(135deg,rgba(237,231,220,.08) 0 6px,rgba(237,231,220,.03) 6px 12px)', clipPath: 'polygon(0 0,100% 0,100% 100%,15% 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700, color: unlocked ? '#0F0C16' : 'rgba(237,231,220,.35)' }}>
                      {i * 4 + 1}–{i * 4 + 4}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.08em', color: 'rgba(237,231,220,.4)', marginTop: 10 }}>TIER 6 OF 40 UNLOCKED</div>
          </div>
        )}

        {tab === 'cosmetics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 20, marginTop: 32 }}>
            {COSMETICS.map((c) => (
              <div key={c.name} style={{ position: 'relative', background: '#100C14', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,0 16px,16px 0)', borderTop: `3px solid ${c.hue}` }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 16px' }}>
                  <div style={{ width: 72, height: 98, background: `linear-gradient(160deg,${c.hue},#0F0C16 65%)`, border: `2px solid ${c.hue}`, clipPath: 'polygon(0 0,80% 0,100% 15%,100% 100%,0 100%)' }} />
                </div>
                <div style={{ padding: '0 14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#F5F1E8', lineHeight: 1.3 }}>{c.name}</div>
                  {c.owned ? (
                    <div style={{ flex: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 900, color: '#0F0C16', background: '#4FA870', padding: '4px 8px', clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)' }}>OWNED</div>
                  ) : (
                    <button onClick={() => openBuy({ type: 'buy', name: c.name, price: c.price, hue: c.hue })} style={{ cursor: 'pointer', flex: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 900, color: c.hue, border: `1px solid ${c.hue}`, padding: '6px 9px', clipPath: 'polygon(0 0,100% 0,85% 100%,0 100%)', background: 'transparent' }}>
                      {c.price}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* modal */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(6,4,8,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: 'min(440px,92vw)', background: '#100C14', borderTop: `3px solid ${modal.hue || '#3FA893'}`, clipPath: 'polygon(0 0,100% 0,100% 100%,20px 100%,0 calc(100% - 20px))', padding: 30 }}>
            <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: 'rgba(237,231,220,.5)', background: 'transparent', border: 'none' }}>&#10005;</button>

            {modal.type === 'topup' && (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.2em', color: '#3FA893' }}>TOP UP</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 8, color: '#F5F1E8' }}>Add funds</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.14em', color: 'rgba(237,231,220,.4)', marginTop: 18 }}>DEPOSIT USDT</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                  {topUpTiers.map((v) => {
                    const active = topUpAmount === v;
                    return (
                      <button key={v} onClick={() => setTopUpAmount(v)} style={{ cursor: 'pointer', textAlign: 'center', padding: '12px 4px', fontWeight: 900, fontSize: 14, background: active ? '#3FA893' : 'transparent', color: active ? '#0F0C16' : 'rgba(237,231,220,.7)', border: `1px solid ${active ? '#3FA893' : 'rgba(237,231,220,.22)'}` }}>
                        {v} USDT
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setModal(null)} style={{ cursor: 'pointer', marginTop: 22, width: '100%', textAlign: 'center', background: '#3FA893', color: '#0F0C16', fontSize: 13, fontWeight: 900, letterSpacing: '.08em', padding: 14, clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 12px) 100%,0 100%)' }}>
                  CONFIRM TOP UP: {topUpAmount} USDT
                </button>
              </>
            )}

            {modal.type === 'buy' && (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.2em', color: modal.hue }}>CONFIRM PURCHASE</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginTop: 8, color: '#F5F1E8' }}>{modal.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(237,231,220,.12)' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.1em', color: 'rgba(237,231,220,.5)' }}>TOTAL</div>
                  <div style={{ fontWeight: 900, fontSize: 19, color: modal.hue }}>{modal.price}</div>
                </div>
                <button
                  onClick={() => {
                    if (modal.packKey) {
                      setJustBought(modal.packKey);
                      setTimeout(() => setJustBought(null), 1800);
                    }
                    setModal(null);
                  }}
                  style={{ cursor: 'pointer', marginTop: 22, width: '100%', textAlign: 'center', background: modal.hue, color: '#0F0C16', fontSize: 13, fontWeight: 900, letterSpacing: '.08em', padding: 14, clipPath: 'polygon(0 0,100% 0,100% 62%,calc(100% - 12px) 100%,0 100%)' }}
                >
                  CONFIRM &amp; ADD TO VAULT
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}