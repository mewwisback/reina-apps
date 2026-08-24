'use client';

import { useState } from 'react';
import { AppShell } from '../../components/layout/app-shell';

type Mode = 'RANKED' | 'CAMPAIGN' | 'PRIVATE';
type Phase = 'queue' | 'battle' | 'result';
type Stance = 'ATK' | 'DEF';
type LogItem = { turn: number; actor: 'YOU' | 'ENEMY' | 'SYSTEM'; text: string };
type Unit = { name: string; rank: string; hue: string; atk: number; def: number; stance: Stance; faceDown?: boolean; exhausted?: boolean };

const HAND = [
  { name: 'YURI', type: 'HERO', hue: '#E8873C', cost: 2 },
  { name: 'SURGE PROTOCOL', type: 'SPELL', hue: '#3FA8A0', cost: 1 },
  { name: 'CHISE', type: 'HERO', hue: '#E8B45C', cost: 3 },
  { name: 'COUNTER SEAL', type: 'TRAP', hue: '#8C6FD8', cost: 1 },
  { name: 'BLANK CARD', type: 'WILD', hue: '#8C6FD8', cost: 0 },
];

const INITIAL_YOURS: (Unit | null)[] = [
  { name: 'TARI', rank: 'COMMON', hue: '#A63C3C', atk: 36, def: 59, stance: 'ATK' },
  null,
  { name: 'ZUMU', rank: 'ELITE', hue: '#F0C08A', atk: 70, def: 90, stance: 'DEF' },
  null,
  null,
];
const INITIAL_ENEMY: (Unit | null)[] = [
  null,
  { name: 'ODNA', rank: 'RARE', hue: '#5B7FA6', atk: 72, def: 65, stance: 'ATK' },
  null,
  { name: 'UNKNOWN', rank: 'SET', hue: '#665B74', atk: 0, def: 0, stance: 'DEF', faceDown: true },
  null,
];

export default function ArenaPage() {
  const [mode, setMode] = useState<Mode>('RANKED');
  const [phase, setPhase] = useState<Phase>('battle');
  const [stake, setStake] = useState(200);
  const [turn, setTurn] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [yourLp, setYourLp] = useState(3180);
  const [enemyLp, setEnemyLp] = useState(2460);
  const [selectedHand, setSelectedHand] = useState<number | null>(null);
  const [yourUnits, setYourUnits] = useState<(Unit | null)[]>(INITIAL_YOURS);
  const [enemyUnits, setEnemyUnits] = useState<(Unit | null)[]>(INITIAL_ENEMY);
  const [logs, setLogs] = useState<LogItem[]>([
    { turn: 4, actor: 'SYSTEM', text: 'Your turn. Draw: Blank Card.' },
    { turn: 3, actor: 'ENEMY', text: 'ODNA attacked TARI. 720 damage absorbed.' },
    { turn: 3, actor: 'YOU', text: 'Counter Seal triggered. Attack reduced.' },
    { turn: 2, actor: 'YOU', text: 'ZUMU entered defensive stance.' },
    { turn: 2, actor: 'ENEMY', text: 'One card set face-down.' },
  ]);

  const pushLog = (text: string, actor: LogItem['actor'] = 'YOU') => setLogs((l) => [{ turn, actor, text }, ...l].slice(0, 12));

  const playSelected = (slot: number) => {
    if (selectedHand === null || yourUnits[slot]) return;
    const card = HAND[selectedHand];
    if (card.cost > energy) return pushLog(`Not enough energy for ${card.name}.`, 'SYSTEM');
    if (card.type === 'HERO') {
      const stats = card.name === 'CHISE' ? { atk: 60, def: 53 } : { atk: 58, def: 51 };
      setYourUnits((u) => u.map((x, i) => i === slot ? { name: card.name, rank: card.name === 'CHISE' ? 'RARE' : 'COMMON', hue: card.hue, ...stats, stance: 'ATK' } : x));
      pushLog(`${card.name} deployed to lane ${slot + 1}.`);
    } else {
      pushLog(`${card.name} cannot occupy a hero lane. Select PLAY CARD.`);
      return;
    }
    setEnergy((e) => e - card.cost);
    setSelectedHand(null);
  };

  const playSupport = () => {
    if (selectedHand === null) return;
    const card = HAND[selectedHand];
    if (card.type === 'HERO') return pushLog('Select an empty battlefield lane for hero cards.', 'SYSTEM');
    if (card.cost > energy) return pushLog(`Not enough energy for ${card.name}.`, 'SYSTEM');
    if (card.type === 'SPELL') {
      setEnemyLp((v) => Math.max(0, v - 240));
      pushLog(`${card.name} resolved. Enemy LP -240.`);
    } else if (card.type === 'TRAP') {
      pushLog(`${card.name} set face-down.`);
    } else {
      pushLog('Blank Card held for a three-card Forge recipe.', 'SYSTEM');
      return;
    }
    setEnergy((e) => e - card.cost);
    setSelectedHand(null);
  };

  const attack = (index: number) => {
    const unit = yourUnits[index];
    if (!unit || unit.exhausted || unit.stance !== 'ATK') return;
    const targetIndex = enemyUnits.findIndex(Boolean);
    const damage = targetIndex < 0 ? unit.atk * 10 : Math.max(120, (unit.atk - (enemyUnits[targetIndex]?.def ?? 0)) * 10 + 300);
    if (targetIndex < 0) {
      setEnemyLp((v) => Math.max(0, v - damage));
      pushLog(`${unit.name} direct attack. Enemy LP -${damage}.`);
    } else {
      const target = enemyUnits[targetIndex]!;
      setEnemyUnits((u) => u.map((x, i) => i === targetIndex ? null : x));
      pushLog(`${unit.name} defeated ${target.faceDown ? 'a set card' : target.name}.`);
    }
    setYourUnits((u) => u.map((x, i) => i === index && x ? { ...x, exhausted: true } : x));
  };

  const toggleStance = (index: number) => {
    setYourUnits((u) => u.map((x, i) => i === index && x ? { ...x, stance: x.stance === 'ATK' ? 'DEF' : 'ATK' } : x));
    const unit = yourUnits[index];
    if (unit) pushLog(`${unit.name} switched stance.`);
  };

  const endTurn = () => {
    setTurn((t) => t + 1);
    setEnergy(5);
    setYourUnits((u) => u.map((x) => x ? { ...x, exhausted: false } : x));
    setYourLp((v) => Math.max(0, v - 180));
    setLogs((l): LogItem[] => [
      { turn: turn + 1, actor: 'SYSTEM' as const, text: 'Your turn. Energy restored to 5.' },
      { turn, actor: 'ENEMY' as const, text: 'Opponent ended turn. Direct damage: 180.' },
      ...l,
    ].slice(0, 12));
  };

  return (
    <AppShell>
      <div style={{ padding: '30px clamp(18px,3vw,42px) 0' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', borderBottom: '1px solid rgba(237,231,220,.14)', paddingBottom: 18 }}>
          <div>
            <div style={monoLabel('#E03C4E')}>ARENA / LIVE MATCH</div>
            <h1 style={{ margin: '7px 0 0', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-.025em', color: '#F5F1E8' }}>Ranked duel: Kaiba99 vs. SilentIndex</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ ...monoLabel('rgba(237,231,220,.5)'), border: '1px solid rgba(237,231,220,.18)', padding: '8px 11px' }}>MATCH M-5521</div>
            <div style={{ ...monoLabel('#0F0C16'), background: '#E03C4E', padding: '8px 12px' }}>TURN {turn} / YOUR MOVE</div>
          </div>
        </header>

        {/* Queue and mode strip, separate from board */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid rgba(237,231,220,.1)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['RANKED', 'CAMPAIGN', 'PRIVATE'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{ cursor: 'pointer', border: `1px solid ${mode === m ? '#E03C4E' : 'rgba(237,231,220,.2)'}`, background: mode === m ? '#E03C4E' : 'transparent', color: mode === m ? '#0F0C16' : 'rgba(237,231,220,.65)', padding: '9px 13px', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 800, letterSpacing: '.11em' }}>{m}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {mode === 'RANKED' && <><span style={monoLabel('rgba(237,231,220,.45)')}>STAKE</span><input type="number" min={0} value={stake} onChange={(e) => setStake(Number(e.target.value))} style={{ width: 74, background: '#100C14', border: '1px solid rgba(237,231,220,.2)', color: '#F5F1E8', padding: '8px 9px', fontFamily: "'JetBrains Mono', monospace" }} /><span style={monoLabel('#E8B45C')}>CR</span></>}
            <button onClick={() => setPhase(phase === 'queue' ? 'battle' : 'queue')} style={{ cursor: 'pointer', background: '#F5F1E8', color: '#0F0C16', border: 'none', padding: '10px 16px', fontSize: 10, fontWeight: 900, letterSpacing: '.1em', clipPath: 'polygon(0 0,100% 0,100% 65%,calc(100% - 9px) 100%,0 100%)' }}>{phase === 'queue' ? 'CANCEL SEARCH' : 'FIND NEW MATCH'}</button>
          </div>
        </section>

        {phase === 'queue' ? <QueuePanel mode={mode} stake={stake} /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 14, marginTop: 14 }}>
            {/* battlefield dossier */}
            <section style={{ border: '1px solid rgba(237,231,220,.16)', background: '#0B0910' }}>
              <PlayerRail enemy name="SilentIndex" tier="DIAMOND II" lp={enemyLp} maxLp={4000} deck={17} hand={4} />
              <div style={{ position: 'relative', padding: '18px clamp(12px,2vw,24px)', backgroundImage: 'linear-gradient(rgba(237,231,220,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(237,231,220,.035) 1px,transparent 1px)', backgroundSize: '32px 32px' }}>
                <div style={{ ...monoLabel('rgba(237,231,220,.3)'), position: 'absolute', left: 8, top: '50%', transform: 'rotate(-90deg) translateX(-50%)', transformOrigin: 'left top' }}>TACTICAL FIELD / FIVE LANES</div>
                <FieldRow units={enemyUnits} enemy onSlot={() => {}} onUnit={() => {}} />
                <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <div style={{ height: 1, flex: 1, background: 'rgba(224,60,78,.26)' }}></div>
                  <div style={monoLabel('#E03C4E')}>ENGAGEMENT LINE</div>
                  <div style={{ height: 1, flex: 1, background: 'rgba(224,60,78,.26)' }}></div>
                </div>
                <FieldRow units={yourUnits} onSlot={playSelected} onUnit={attack} onStance={toggleStance} />
              </div>
              <PlayerRail name="Kaiba99" tier="GOLD III" lp={yourLp} maxLp={4000} deck={18} hand={5} energy={energy} />

              {/* hand */}
              <div style={{ borderTop: '1px solid rgba(237,231,220,.14)', padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={monoLabel('rgba(237,231,220,.5)')}>YOUR HAND / SELECT CARD, THEN LANE</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button disabled={selectedHand === null} onClick={playSupport} style={actionButton(selectedHand !== null, '#3FA8A0')}>PLAY CARD</button>
                    <button onClick={endTurn} style={actionButton(true, '#E03C4E')}>END TURN</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(90px,1fr))', gap: 8 }}>
                  {HAND.map((c, i) => {
                    const selected = selectedHand === i;
                    return <button key={c.name} onClick={() => setSelectedHand(selected ? null : i)} style={{ cursor: 'pointer', textAlign: 'left', minHeight: 88, background: selected ? `${c.hue}18` : '#100C14', border: `1px solid ${selected ? c.hue : 'rgba(237,231,220,.16)'}`, borderTop: `3px solid ${c.hue}`, color: '#F5F1E8', padding: '9px 10px', clipPath: 'polygon(0 0,88% 0,100% 14%,100% 100%,0 100%)', transform: selected ? 'translateY(-4px)' : 'none', transition: 'transform .12s' }}>
                      <div style={{ ...monoLabel(c.hue), fontSize: 7.5 }}>{c.type} / {c.cost} EN</div>
                      <div style={{ marginTop: 16, fontSize: 11.5, fontWeight: 800 }}>{c.name}</div>
                    </button>;
                  })}
                </div>
              </div>
            </section>

            {/* opponent + log panel */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <section style={{ border: '1px solid rgba(237,231,220,.15)', background: '#100C14', padding: 15 }}>
                <div style={monoLabel('#E03C4E')}>OPPONENT FILE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 12, alignItems: 'center', marginTop: 14 }}>
                  <div style={{ width: 50, height: 50, border: '1px solid #8C6FD8', background: 'linear-gradient(145deg,#24172B,#0B0910)', clipPath: 'polygon(0 0,78% 0,100% 22%,100% 100%,0 100%)' }}></div>
                  <div><div style={{ fontSize: 16, fontWeight: 900 }}>SilentIndex</div><div style={{ ...monoLabel('#8C6FD8'), marginTop: 4 }}>DIAMOND II / 2510 MMR</div></div>
                </div>
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(237,231,220,.1)' }}>
                  <Intel label="DECK" value="Control / Sentinel" />
                  <Intel label="RECORD" value="160W / 80L" />
                  <Intel label="KNOWN TRAPS" value="2 / 4" />
                  <Intel label="TURN TIME" value="00:41" />
                </div>
              </section>
              <section style={{ flex: 1, minHeight: 320, border: '1px solid rgba(237,231,220,.15)', background: '#100C14', padding: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={monoLabel('#E03C4E')}>MATCH LOG</div><div style={monoLabel('rgba(237,231,220,.35)')}>NEWEST FIRST</div></div>
                <div style={{ marginTop: 13 }}>
                  {logs.map((l, i) => <div key={`${l.turn}-${i}`} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 9, padding: '9px 0', borderTop: '1px solid rgba(237,231,220,.08)' }}>
                    <div style={{ ...monoLabel(l.actor === 'YOU' ? '#3FA8A0' : l.actor === 'ENEMY' ? '#E0596A' : 'rgba(237,231,220,.4)'), fontSize: 8 }}>T{l.turn}</div>
                    <div><div style={{ ...monoLabel(l.actor === 'YOU' ? '#3FA8A0' : l.actor === 'ENEMY' ? '#E0596A' : 'rgba(237,231,220,.4)'), fontSize: 7.5 }}>{l.actor}</div><div style={{ fontSize: 11.5, lineHeight: 1.45, color: 'rgba(237,231,220,.72)', marginTop: 3 }}>{l.text}</div></div>
                  </div>)}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function QueuePanel({ mode, stake }: { mode: Mode; stake: number }) {
  return <section style={{ marginTop: 20, border: '1px solid rgba(237,231,220,.16)', background: '#0B0910', minHeight: 440, display: 'grid', placeItems: 'center', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(237,231,220,.06)', pointerEvents: 'none' }}></div>
    <div style={{ textAlign: 'center', maxWidth: 420, padding: 30 }}>
      <div style={{ fontFamily: "'Zen Old Mincho', serif", fontSize: 58, color: '#E03C4E', lineHeight: 1 }}>対</div>
      <div style={{ ...monoLabel('#E03C4E'), marginTop: 18 }}>SEARCHING / {mode}</div>
      <h2 style={{ margin: '10px 0 0', fontSize: 26, fontWeight: 900 }}>Finding a compatible deck</h2>
      <p style={{ margin: '10px auto 0', fontSize: 13, lineHeight: 1.6, color: 'rgba(237,231,220,.55)' }}>Matchmaking uses rank and deck power. {mode === 'RANKED' ? `${stake} CR is locked until the match resolves.` : 'No stake is attached to this mode.'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(237,231,220,.12)', marginTop: 24 }}>
        {[['REGION','ASIA'],['RANGE','±180 MMR'],['EST.','00:24']].map(([a,b]) => <div key={a} style={{ background: '#100C14', padding: 12 }}><div style={monoLabel('rgba(237,231,220,.35)')}>{a}</div><div style={{ fontSize: 12, fontWeight: 800, marginTop: 5 }}>{b}</div></div>)}
      </div>
    </div>
  </section>;
}

function FieldRow({ units, enemy, onSlot, onUnit, onStance }: { units: (Unit | null)[]; enemy?: boolean; onSlot: (i: number) => void; onUnit: (i: number) => void; onStance?: (i: number) => void }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9 }}>
    {units.map((u, i) => <div key={i} onClick={() => u ? onUnit(i) : onSlot(i)} style={{ position: 'relative', minHeight: 112, background: u ? '#100C14' : 'rgba(237,231,220,.025)', border: `1px ${u ? 'solid' : 'dashed'} ${u ? u.hue : 'rgba(237,231,220,.13)'}`, cursor: enemy ? 'default' : 'pointer', clipPath: 'polygon(0 0,90% 0,100% 10%,100% 100%,0 100%)', padding: 9 }}>
      <div style={{ ...monoLabel('rgba(237,231,220,.25)'), fontSize: 7 }}>LANE {i + 1}</div>
      {u && <>
        <div style={{ ...monoLabel(u.faceDown ? '#8C6FD8' : u.hue), marginTop: 12, fontSize: 7.5 }}>{u.faceDown ? 'SET / HIDDEN' : `${u.rank} / ${u.stance}`}</div>
        <div style={{ fontSize: 13, fontWeight: 900, marginTop: 7, color: u.faceDown ? 'rgba(237,231,220,.45)' : '#F5F1E8' }}>{u.faceDown ? 'UNKNOWN' : u.name}</div>
        {!u.faceDown && <div style={{ ...monoLabel('rgba(237,231,220,.5)'), marginTop: 7 }}>ATK {u.atk} / DEF {u.def}</div>}
        {u.exhausted && <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,11,.68)', display: 'grid', placeItems: 'center', ...monoLabel('#E0596A') }}>EXHAUSTED</div>}
        {!enemy && onStance && <button onClick={(e) => { e.stopPropagation(); onStance(i); }} style={{ position: 'absolute', right: 5, bottom: 5, cursor: 'pointer', border: '1px solid rgba(237,231,220,.2)', background: '#0B0910', color: 'rgba(237,231,220,.6)', fontFamily: "'JetBrains Mono', monospace", fontSize: 7, padding: '3px 5px' }}>STANCE</button>}
      </>}
    </div>)}
  </div>;
}

function PlayerRail({ enemy, name, tier, lp, maxLp, deck, hand, energy }: { enemy?: boolean; name: string; tier: string; lp: number; maxLp: number; deck: number; hand: number; energy?: number }) {
  const pct = Math.max(0, lp / maxLp * 100);
  return <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr auto', gap: 16, alignItems: 'center', padding: '12px 16px', borderBottom: enemy ? '1px solid rgba(237,231,220,.14)' : undefined, borderTop: enemy ? undefined : '1px solid rgba(237,231,220,.14)', background: enemy ? '#100C14' : '#0F0C12' }}>
    <div><div style={{ fontSize: 13, fontWeight: 900 }}>{name}</div><div style={{ ...monoLabel(enemy ? '#8C6FD8' : '#E8B45C'), marginTop: 3 }}>{tier}</div></div>
    <div><div style={{ display: 'flex', justifyContent: 'space-between', ...monoLabel('rgba(237,231,220,.45)') }}><span>LIFE POINTS</span><span style={{ color: pct < 35 ? '#E03C4E' : '#F5F1E8' }}>{lp} / {maxLp}</span></div><div style={{ height: 7, background: 'rgba(237,231,220,.1)', marginTop: 5 }}><div style={{ width: `${pct}%`, height: '100%', background: enemy ? '#8C6FD8' : '#E03C4E', clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 100%,0 100%)' }}></div></div></div>
    <div style={{ display: 'flex', gap: 12 }}><span style={monoLabel('rgba(237,231,220,.5)')}>DECK {deck}</span><span style={monoLabel('rgba(237,231,220,.5)')}>HAND {hand}</span>{energy !== undefined && <span style={monoLabel('#3FA8A0')}>EN {energy}/5</span>}</div>
  </div>;
}

function Intel({ label, value }: { label: string; value: string }) { return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderBottom: '1px solid rgba(237,231,220,.07)' }}><span style={monoLabel('rgba(237,231,220,.35)')}>{label}</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: 'rgba(237,231,220,.7)', textAlign: 'right' }}>{value}</span></div>; }
function monoLabel(color: string): React.CSSProperties { return { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color }; }
function actionButton(active: boolean, hue: string): React.CSSProperties { return { cursor: active ? 'pointer' : 'not-allowed', opacity: active ? 1 : .35, border: `1px solid ${hue}`, background: active ? hue : 'transparent', color: active ? '#0F0C16' : hue, padding: '8px 11px', fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, fontWeight: 800, letterSpacing: '.09em' }; }