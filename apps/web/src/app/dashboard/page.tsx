import Link from 'next/link';
import { AppShell } from '../../components/layout/app-shell';

const STAT_CARD_STYLE: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(115deg,#100C14 0%,#100C14 55%,#E8B45C 160%)',
  clipPath: 'polygon(0 0,100% 0,100% 100%,22px 100%,0 calc(100% - 22px))',
  padding: '20px 20px 22px',
  borderBottom: '3px solid #E8B45C',
};

const CORNER: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 13,
  height: 13,
  borderTop: '1px solid rgba(245,241,232,.35)',
  borderLeft: '1px solid rgba(245,241,232,.35)',
};

const COLLECTION = [
  { name: 'HAKU', cat: 'SCOUT', rank: 'ELITE', hue: '#E8873C', rankHue: '#E8B45C' },
  { name: 'SORA', cat: 'STRATEGIST', rank: 'RARE', hue: '#7E8FA6', rankHue: '#B8C0C8' },
  { name: 'KOMA', cat: 'VANGUARD', rank: 'ELITE', hue: '#E8B45C', rankHue: '#E8B45C' },
  { name: 'RIN', cat: 'HERALD', rank: 'COMMON', hue: '#E03C4E', rankHue: '#C08552' },
  { name: 'GEN', cat: 'ARTIFICER', rank: 'RARE', hue: '#9A8B7E', rankHue: '#B8C0C8' },
  { name: 'YUI', cat: 'CLERIC', rank: 'COMMON', hue: '#F0C08A', rankHue: '#C08552' },
  { name: 'MIRA', cat: 'WARDEN', rank: 'RARE', hue: '#3FA893', rankHue: '#B8C0C8' },
  { name: 'KAI', cat: 'SENTINEL', rank: 'RARE', hue: '#5B7FA6', rankHue: '#B8C0C8' },
  { name: 'NANA', cat: 'MEDIC', rank: 'ELITE', hue: '#E86B7C', rankHue: '#E8B45C' },
  { name: 'REI', cat: 'BLADE', rank: 'LEGENDARY', hue: '#FFD24C', rankHue: '#E03C4E' },
];

const MATCHES = [
  { result: 'WIN', resultHue: '#4FA870', opponent: 'ShadowDrake', mode: 'RANKED', time: '12m ago' },
  { result: 'WIN', resultHue: '#4FA870', opponent: 'Aeloria', mode: 'RANKED', time: '1h ago' },
  { result: 'LOSS', resultHue: '#E03C4E', opponent: 'Nyxa88', mode: 'CASUAL', time: '3h ago' },
  { result: 'WIN', resultHue: '#4FA870', opponent: 'BotCampaign', mode: 'CAMPAIGN', time: 'Yesterday' },
  { result: 'LOSS', resultHue: '#E03C4E', opponent: 'Voidmancer', mode: 'RANKED', time: 'Yesterday' },
];

const DECK_PREVIEW = ['#E8873C', '#7E8FA6', '#E8B45C', '#E03C4E', '#3FA8A0', '#8C6FD8'];

export default function DashboardPage() {
  return (
    <AppShell>
      {/* ===== HERO BANNER ===== */}
      <div style={{ position: 'relative', overflow: 'hidden', margin: '0 clamp(20px,3.5vw,48px)' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(100deg,#1A0E10 0%,#4C1018 46%,#8C1420 62%,#1A0E10 100%)',
            clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,0 0,3% 14%,3% 86%,0 100%)',
          }}
        />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 26, height: 26, borderTop: '2px solid #F5F1E8', borderLeft: '2px solid #F5F1E8', opacity: 0.8 }} />
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 26, height: 26, borderBottom: '2px solid #F5F1E8', borderRight: '2px solid #F5F1E8', opacity: 0.8 }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: '26px clamp(20px,3.2vw,40px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 58,
                height: 58,
                flex: 'none',
                background: 'linear-gradient(160deg,#E8B45C,#0F0C16 68%)',
                border: '2px solid #E8B45C',
                clipPath: 'polygon(30% 0,100% 0,100% 70%,70% 100%,0 100%,0 30%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: "'Zen Old Mincho', serif", fontWeight: 900, fontSize: 22, color: '#F5F1E8' }}>K</span>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.28em', color: 'rgba(245,241,232,.65)' }}>WELCOME BACK, DUELIST</div>
              <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(22px,2.4vw,30px)', fontWeight: 900, letterSpacing: '-.02em', color: '#F5F1E8', textShadow: '0 0 24px rgba(0,0,0,.5)' }}>Kaiba99</h1>
              <div style={{ display: 'inline-block', marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '.16em', color: '#0F0C16', background: '#E8B45C', padding: '3px 9px', clipPath: 'polygon(0 0,100% 0,90% 100%,0 100%)' }}>GOLD III</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 17, height: 17, flex: 'none', background: 'linear-gradient(160deg,#E8B45C,#8C6019 75%)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.2em', color: 'rgba(245,241,232,.55)' }}>CR</div>
                <div style={{ fontWeight: 900, fontSize: 19, color: '#E8B45C', lineHeight: 1 }}>2,450</div>
              </div>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(245,241,232,.25)', transform: 'skewX(-12deg)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 17, height: 17, flex: 'none', background: 'linear-gradient(160deg,#3FA893,#1F5A50 75%)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '.2em', color: '#3FA893' }}>USDT</div>
                <div style={{ fontWeight: 900, fontSize: 19, color: '#F5F1E8', lineHeight: 1 }}>128.40</div>
              </div>
            </div>
            <Link
              href="/shop"
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 6,
                background: '#F5F1E8',
                color: '#0F0C16',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '.14em',
                padding: '13px 24px 13px 30px',
                clipPath: 'polygon(14% 0,100% 0,100% 100%,0 100%,0 30%)',
                textDecoration: 'none',
              }}
            >
              SHOP
            </Link>
          </div>
        </div>

        {/* daily login strip */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '0 clamp(20px,3.2vw,40px) 20px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(245,241,232,.55)' }}>DAILY LOGIN</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const claimed = d < 4;
              const current = d === 4;
              return (
                <div
                  key={d}
                  style={{ width: 9, height: 9, background: claimed ? '#E8B45C' : current ? 'rgba(232,180,92,.55)' : 'rgba(245,241,232,.18)' }}
                />
              );
            })}
          </div>
          <button
            style={{
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              fontWeight: 900,
              letterSpacing: '.06em',
              color: '#0F0C16',
              background: '#E8B45C',
              padding: '5px 10px',
              clipPath: 'polygon(0 0,100% 0,85% 100%,0 100%)',
            }}
          >
            CLAIM DAY 4
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ padding: '0 clamp(20px,3.5vw,48px)' }}>
        {/* stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr 1.3fr', gap: 14, marginTop: 32 }}>
          <div style={STAT_CARD_STYLE}>
            <div style={CORNER} />
            <div style={{ position: 'relative', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.2em', color: 'rgba(237,231,220,.5)' }}>RANK</div>
            <div style={{ position: 'relative', fontWeight: 900, fontSize: 26, marginTop: 10, color: '#E8B45C', letterSpacing: '-.01em' }}>GOLD III</div>
            <div style={{ position: 'relative', fontSize: 11.5, color: 'rgba(237,231,220,.5)', marginTop: 5, fontFamily: "'JetBrains Mono', monospace" }}>+120 MMR THIS SEASON</div>
          </div>

          <div style={{ ...STAT_CARD_STYLE, background: 'linear-gradient(115deg,#100C14 0%,#100C14 55%,#E0596A 160%)', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 22px),calc(100% - 22px) 100%,0 100%)', borderBottom: '3px solid #E0596A' }}>
            <div style={CORNER} />
            <div style={{ position: 'relative', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.2em', color: 'rgba(237,231,220,.5)' }}>COLLECTION</div>
            <div style={{ position: 'relative', fontWeight: 900, fontSize: 30, marginTop: 8, color: '#F5F1E8', letterSpacing: '-.02em', lineHeight: 1 }}>34<span style={{ fontSize: 14, color: 'rgba(237,231,220,.4)' }}>/100</span></div>
            <div style={{ position: 'relative', marginTop: 9, height: 3, background: 'rgba(237,231,220,.14)' }}>
              <div style={{ height: '100%', width: '34%', background: '#E0596A' }} />
            </div>
          </div>

          <div style={{ ...STAT_CARD_STYLE, background: 'linear-gradient(115deg,#100C14 0%,#100C14 55%,#3FA8A0 160%)', clipPath: 'polygon(0 0,100% 0,100% 100%,18px 100%,0 calc(100% - 18px))', borderBottom: '3px solid #3FA8A0' }}>
            <div style={CORNER} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.2em', color: 'rgba(237,231,220,.5)' }}>DAILY QUEST</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: '#3FA8A0' }}>50%</div>
            </div>
            <div style={{ position: 'relative', fontWeight: 900, fontSize: 15.5, marginTop: 10, color: '#F5F1E8' }}>Win 2 ranked duels</div>
            <div style={{ position: 'relative', marginTop: 12, height: 6, background: 'rgba(237,231,220,.12)', clipPath: 'polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%)' }}>
              <div style={{ height: '100%', width: '50%', background: '#3FA8A0' }} />
            </div>
          </div>
        </div>

        {/* active deck */}
        <div style={{ marginTop: 16, position: 'relative', background: '#100C14', clipPath: 'polygon(0 0,100% 0,100% 100%,18px 100%,0 calc(100% - 18px))', borderTop: '3px solid #E03C4E', padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'inline-block', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '.16em', color: '#0F0C16', background: '#E03C4E', padding: '4px 10px', clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)' }}>ACTIVE DECK</div>
              <div style={{ fontWeight: 900, fontSize: 22, marginTop: 10, color: '#F5F1E8' }}>Crimson Rush</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <div style={{ fontSize: 12.5, color: 'rgba(237,231,220,.55)' }}>24 cards</div>
                <div style={{ width: 1, height: 12, background: 'rgba(237,231,220,.25)' }} />
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: '#4FA870' }}>62% WIN RATE</div>
              </div>
            </div>
            <Link href="/deck-builder" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: '#E0596A', border: '1px solid #E0596A', padding: '9px 16px', clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)', textDecoration: 'none' }}>
              EDIT DECK
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            {DECK_PREVIEW.map((hue, i) => (
              <div key={i} style={{ width: 48, height: 66, background: `linear-gradient(160deg,${hue},#0F0C16 65%)`, border: `1.5px solid ${hue}`, clipPath: 'polygon(0 0,80% 0,100% 18%,100% 100%,0 100%)' }} />
            ))}
          </div>
        </div>

        {/* your collection */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.2em', color: '#E03C4E' }}>YOUR COLLECTION</div>
          <Link href="/collection" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#E0596A', textDecoration: 'none' }}>VIEW ALL &gt;</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 10, marginTop: 16 }}>
          {COLLECTION.map((c) => (
            <div key={c.name} style={{ position: 'relative', overflow: 'hidden', background: '#100C14', clipPath: 'polygon(0 0,100% 0,100% 88%,88% 100%,0 100%)' }}>
              <div style={{ height: 34, background: `linear-gradient(115deg,#100C14 0%,#100C14 40%,${c.hue} 140%)` }} />
              <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '15px 15px 0 0', borderColor: `${c.rankHue} transparent transparent transparent` }} />
              <div style={{ padding: '9px 10px 10px' }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: '#F5F1E8' }}>{c.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7.5, letterSpacing: '.08em', color: c.hue, marginTop: 3 }}>{c.cat}</div>
              </div>
            </div>
          ))}
        </div>

        {/* recent duels */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.2em', color: '#E03C4E' }}>RECENT DUELS</div>
          <div style={{ marginTop: 16, border: '1px solid rgba(237,231,220,.14)' }}>
            {MATCHES.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto auto', alignItems: 'center', gap: 14, padding: '12px 16px 12px 13px', borderBottom: '1px solid rgba(237,231,220,.1)', borderLeft: `3px solid ${m.resultHue}` }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 900, letterSpacing: '.12em', color: '#0F0C16', background: m.resultHue, textAlign: 'center', padding: '4px 0', clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)' }}>{m.result}</div>
                <div style={{ fontSize: 13, color: 'rgba(237,231,220,.85)' }}>vs <span style={{ fontWeight: 700, color: '#F5F1E8' }}>{m.opponent}</span></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.08em', color: 'rgba(237,231,220,.55)', border: '1px solid rgba(237,231,220,.2)', padding: '3px 8px' }}>{m.mode}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(237,231,220,.4)', minWidth: 76, textAlign: 'right' }}>{m.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}