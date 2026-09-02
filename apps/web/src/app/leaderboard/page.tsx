'use client';

import { useState } from 'react';
import { AppShell } from '../../components/layout/app-shell';

interface Player {
  name: string;
  tier: string;
  tierHue: string;
  mmr: number;
  wins: number;
  losses: number;
  isYou?: boolean;
}

const DATA: Player[] = [
  { name: 'Voidmancer', tier: 'MASTER', tierHue: '#E03C4E', mmr: 3120, wins: 214, losses: 58 },
  { name: 'ShadowDrake', tier: 'MASTER', tierHue: '#E03C4E', mmr: 2960, wins: 198, losses: 62 },
  { name: 'Aeloria', tier: 'DIAMOND I', tierHue: '#8C6FD8', mmr: 2740, wins: 176, losses: 71 },
  { name: 'Nyxa88', tier: 'DIAMOND II', tierHue: '#8C6FD8', mmr: 2510, wins: 160, losses: 80 },
  { name: 'Kaiba99', tier: 'GOLD III', tierHue: '#E8B45C', mmr: 1840, wins: 92, losses: 58, isYou: true },
  { name: 'BotSlayerX', tier: 'GOLD III', tierHue: '#E8B45C', mmr: 1790, wins: 88, losses: 60 },
  { name: 'Rin_Herald', tier: 'GOLD IV', tierHue: '#E8B45C', mmr: 1650, wins: 80, losses: 64 },
  { name: 'ForgeMaster', tier: 'SILVER I', tierHue: '#B8C0C8', mmr: 1420, wins: 70, losses: 68 },
  { name: 'KomaVanguard', tier: 'SILVER II', tierHue: '#B8C0C8', mmr: 1280, wins: 62, losses: 66 },
  { name: 'YuiCleric', tier: 'BRONZE I', tierHue: '#C08552', mmr: 980, wins: 40, losses: 55 },
];

const SEASONS = ['S1', 'S2', 'S3'];

function PodiumCard({ pos, hue, title, player, big }: { pos: number; hue: string; title?: string; player: Player; big?: boolean }) {
  const rankColor = pos === 1 ? '#E8B45C' : pos === 2 ? '#B8C0C8' : '#C08552';
  return (
    <div
      style={{
        position: 'relative',
        background: '#100C14',
        padding: big ? '30px 20px 26px' : '22px 18px',
        borderTop: big ? '4px solid #E8B45C' : `3px solid ${hue}`,
        clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,0 16px,16px 0)',
        boxShadow: `0 0 26px -14px ${hue}`,
        textAlign: 'center',
      }}
    >
      {title && (
        <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: '.06em', color: '#0F0C16', background: '#E8B45C', padding: '5px 18px', clipPath: 'polygon(4% 0,96% 0,100% 100%,0 100%)' }}>
          {title}
        </div>
      )}
      <div
        style={{
          width: big ? 54 : 38,
          height: big ? 54 : 38,
          margin: big ? '8px auto 0' : '0 auto',
          background: `linear-gradient(160deg,${hue},#0F0C16 70%)`,
          border: `2px solid ${hue}`,
          clipPath: 'polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)',
        }}
      />
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: big ? 30 : 20, fontWeight: 900, color: rankColor, marginTop: big ? 12 : 10, textShadow: pos === 1 ? '0 0 24px rgba(232,180,92,.7)' : undefined }}>#{pos}</div>
      <div style={{ fontWeight: 900, fontSize: big ? 21 : 16, marginTop: 8, color: '#F5F1E8' }}>{player.name}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(237,231,220,.5)', marginTop: 4 }}>{player.tier}</div>
      <div style={{ fontWeight: 900, fontSize: big ? 20 : 15, marginTop: 10, color: rankColor }}>{player.mmr} MMR</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [season, setSeason] = useState('S3');
  const ladder = DATA.map((p, i) => {
    const pos = i + 1;
    const winRate = Math.round((p.wins / (p.wins + p.losses)) * 100);
    const rankColor = pos === 1 ? '#E8B45C' : pos === 2 ? '#B8C0C8' : pos === 3 ? '#C08552' : 'rgba(237,231,220,.5)';
    return { ...p, pos, winRate, rankColor, accent: p.isYou ? '3px solid #E03C4E' : '3px solid transparent', rowBg: p.isYou ? 'rgba(224,60,78,.06)' : 'transparent' };
  });

  return (
    <AppShell>
      <div style={{ position: 'relative', overflow: 'hidden', margin: '0 clamp(20px,3.5vw,48px)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg,#1A0E10 0%,#4C1018 46%,#8C1420 62%,#1A0E10 100%)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,0 0,3% 14%,3% 86%,0 100%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 26, height: 26, borderTop: '2px solid #F5F1E8', borderLeft: '2px solid #F5F1E8', opacity: 0.8 }} />
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 26, height: 26, borderBottom: '2px solid #F5F1E8', borderRight: '2px solid #F5F1E8', opacity: 0.8 }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, padding: '32px clamp(20px,3.2vw,40px)' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.28em', color: 'rgba(245,241,232,.65)' }}>SEASON 3: RANKED LADDER</div>
            <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-.02em', color: '#F5F1E8', textShadow: '0 0 24px rgba(0,0,0,.5)' }}>Leaderboard</h1>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SEASONS.map((s) => {
              const active = season === s;
              return (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  style={{
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    padding: '8px 14px',
                    clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)',
                    background: active ? '#E03C4E' : 'transparent',
                    color: active ? '#0F0C16' : 'rgba(237,231,220,.6)',
                    border: `1px solid ${active ? '#E03C4E' : 'rgba(237,231,220,.25)'}`,
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 clamp(20px,3.5vw,48px)' }}>
        {/* podium */}
        <div style={{ position: 'relative', marginTop: 32, padding: '30px 22px 8px', background: 'radial-gradient(ellipse at 50% 0%,rgba(224,60,78,.14),transparent 65%)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 18, height: 18, borderTop: '1px solid rgba(245,241,232,.3)', borderLeft: '1px solid rgba(245,241,232,.3)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, width: 18, height: 18, borderTop: '1px solid rgba(245,241,232,.3)', borderRight: '1px solid rgba(245,241,232,.3)' }} />
          <div className="leaderboard-podium" style={{ position: 'relative' }}>
            <PodiumCard pos={2} hue="#B8C0C8" player={ladder[1]} />
            <PodiumCard pos={1} hue="#E8B45C" player={ladder[0]} title="CHAMPION" big />
            <PodiumCard pos={3} hue="#C08552" player={ladder[2]} />
          </div>
        </div>

        {/* ladder */}
        <div style={{ marginTop: 36 }}>
          <div className="leaderboard-row leaderboard-head" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.14em', color: 'rgba(237,231,220,.4)', borderBottom: '1px solid rgba(237,231,220,.14)' }}>
            <div>RANK</div>
            <div>DUELIST</div>
            <div>TIER</div>
            <div>MMR</div>
            <div>RECORD</div>
            <div>WIN%</div>
          </div>
          {ladder.map((p) => (
            <div className="leaderboard-row" key={p.name} style={{ borderBottom: '1px solid rgba(237,231,220,.08)', borderLeft: p.accent, background: p.rowBg }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 900, color: p.rankColor }}>{p.pos}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: '#F5F1E8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name}</div>
                {p.isYou && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 900, color: '#0F0C16', background: '#E03C4E', padding: '2px 6px', flex: 'none' }}>YOU</div>}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, color: p.tierHue }}>{p.tier}</div>
              <div className="leaderboard-metric leaderboard-mmr" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#F5F1E8' }}>{p.mmr}</div>
              <div className="leaderboard-metric" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(237,231,220,.55)' }}>{p.wins}W–{p.losses}L</div>
              <div className="leaderboard-metric" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#4FA870' }}>{p.winRate}%</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}