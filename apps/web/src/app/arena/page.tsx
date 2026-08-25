'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/app-shell';

type Mode = 'RANKED' | 'CAMPAIGN' | 'PRIVATE';
type Phase = 'setup' | 'queue' | 'battle' | 'result' | 'replay';
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
  const [phase, setPhase] = useState<Phase>('setup');
  const [queueSeconds, setQueueSeconds] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
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

  const replayEvents = [...logs].reverse();

  useEffect(() => {
    if (phase !== 'queue') return;
    const timer = window.setInterval(() => {
      setQueueSeconds((s) => {
        if (s >= 6) {
          window.clearInterval(timer);
          setMatchFound(true);
          return s;
        }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'replay' || !replayPlaying) return;
    const timer = window.setInterval(() => setReplayStep((s) => {
      if (s >= replayEvents.length - 1) {
        setReplayPlaying(false);
        return s;
      }
      return s + 1;
    }), 900);
    return () => window.clearInterval(timer);
  }, [phase, replayPlaying, replayEvents.length]);

  const startQueue = () => {
    setQueueSeconds(0);
    setMatchFound(false);
    setPhase('queue');
  };

  const startBattle = () => {
    setTurn(1);
    setEnergy(5);
    setYourLp(4000);
    setEnemyLp(4000);
    setYourUnits(INITIAL_YOURS);
    setEnemyUnits(INITIAL_ENEMY);
    setLogs([{ turn: 1, actor: 'SYSTEM', text: 'Match started. Your turn.' }]);
    setPhase('battle');
  };

  const finishMatch = () => {
    setEnemyLp(0);
    setLogs((l) => [{ turn, actor: 'SYSTEM', text: 'Match complete. SilentIndex reached 0 LP.' }, ...l]);
    setPhase('result');
  };

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
            <div style={monoLabel('#E03C4E')}>ARENA / {phase.toUpperCase()}</div>
            <h1 style={{ margin: '7px 0 0', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-.025em', color: '#F5F1E8' }}>{phase === 'setup' ? 'Select a match protocol' : phase === 'queue' ? 'Matchmaking in progress' : phase === 'result' ? 'Match report: victory' : phase === 'replay' ? 'Replay M-5521' : 'Ranked duel: Kaiba99 vs. SilentIndex'}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ ...monoLabel('rgba(237,231,220,.5)'), border: '1px solid rgba(237,231,220,.18)', padding: '8px 11px' }}>MATCH M-5521</div>
            <div style={{ ...monoLabel('#0F0C16'), background: '#E03C4E', padding: '8px 12px' }}>{phase === 'battle' ? `TURN ${turn} / YOUR MOVE` : phase.toUpperCase()}</div>
          </div>
        </header>

        {/* Queue and mode strip, separate from board */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid rgba(237,231,220,.1)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['RANKED', 'CAMPAIGN', 'PRIVATE'] as Mode[]).map((m) => (
              <button disabled={phase !== 'setup'} key={m} onClick={() => setMode(m)} style={{ cursor: phase === 'setup' ? 'pointer' : 'default', opacity: phase === 'setup' ? 1 : .55, border: `1px solid ${mode === m ? '#E03C4E' : 'rgba(237,231,220,.2)'}`, background: mode === m ? '#E03C4E' : 'transparent', color: mode === m ? '#0F0C16' : 'rgba(237,231,220,.65)', padding: '9px 13px', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 800, letterSpacing: '.11em' }}>{m}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {mode === 'RANKED' && <><span style={monoLabel('rgba(237,231,220,.45)')}>STAKE</span><input disabled={phase !== 'setup'} type="number" min={0} value={stake} onChange={(e) => setStake(Number(e.target.value))} style={{ width: 74, background: '#100C14', border: '1px solid rgba(237,231,220,.2)', color: '#F5F1E8', padding: '8px 9px', fontFamily: "'JetBrains Mono', monospace" }} /><span style={monoLabel('#E8B45C')}>CR</span></>}
            {phase === 'setup' && <button onClick={startQueue} style={{ cursor: 'pointer', background: '#F5F1E8', color: '#0F0C16', border: 'none', padding: '10px 16px', fontSize: 10, fontWeight: 900, letterSpacing: '.1em', clipPath: 'polygon(0 0,100% 0,100% 65%,calc(100% - 9px) 100%,0 100%)' }}>FIND MATCH</button>}
            {phase === 'queue' && <button onClick={() => setPhase('setup')} style={{ cursor: 'pointer', background: 'transparent', color: '#E0596A', border: '1px solid #E0596A', padding: '9px 15px', fontSize: 10, fontWeight: 900, letterSpacing: '.1em' }}>CANCEL SEARCH</button>}
            {(phase === 'result' || phase === 'replay') && <button onClick={() => setPhase('setup')} style={{ cursor: 'pointer', background: '#F5F1E8', color: '#0F0C16', border: 'none', padding: '10px 16px', fontSize: 10, fontWeight: 900, letterSpacing: '.1em' }}>NEW MATCH</button>}
          </div>
        </section>

        {phase === 'setup' ? <SetupPanel mode={mode} stake={stake} onStart={startQueue} /> : phase === 'queue' ? <QueuePanel mode={mode} stake={stake} seconds={queueSeconds} found={matchFound} onAccept={startBattle} /> : phase === 'result' ? <ResultPanel stake={stake} turn={turn} logs={logs} onReplay={() => { setReplayStep(0); setReplayPlaying(false); setPhase('replay'); }} onNew={() => setPhase('setup')} /> : phase === 'replay' ? <ReplayPanel events={replayEvents} step={replayStep} playing={replayPlaying} onPlay={() => setReplayPlaying((v) => !v)} onStep={(n) => setReplayStep(Math.max(0, Math.min(replayEvents.length - 1, replayStep + n)))} /> : (
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
                    <button onClick={finishMatch} style={actionButton(true, '#E8B45C')}>RESOLVE DEMO</button>
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

function SetupPanel({ mode, stake, onStart }: { mode: Mode; stake: number; onStart: () => void }) {
  const rows = mode === 'RANKED' ? [['MATCH RULE', 'SEASON 3 RANKED'], ['STAKE', `${stake} CR`], ['RANK RANGE', 'GOLD I TO DIAMOND III'], ['DECK', 'CRIMSON RUSH / 24']] : mode === 'CAMPAIGN' ? [['MATCH RULE', 'CAMPAIGN NODE 07'], ['STAKE', 'NONE'], ['OPPONENT', 'WARDEN BOT'], ['DECK', 'CRIMSON RUSH / 24']] : [['MATCH RULE', 'PRIVATE DUEL'], ['STAKE', 'NONE'], ['ROOM', 'INVITE CODE'], ['DECK', 'CRIMSON RUSH / 24']];
  return <section style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 320px', border: '1px solid rgba(237,231,220,.16)', background: '#0B0910', minHeight: 430 }}>
    <div style={{ padding: '42px clamp(24px,4vw,54px)', borderRight: '1px solid rgba(237,231,220,.12)' }}><div style={monoLabel('#E03C4E')}>MATCH PROTOCOL / {mode}</div><h2 style={{ margin: '12px 0 0', fontSize: 32, fontWeight: 900 }}>Deck locked when matchmaking starts.</h2><p style={{ maxWidth: 520, marginTop: 14, color: 'rgba(237,231,220,.58)', lineHeight: 1.7, fontSize: 14 }}>Rank and deck power determine opponent range. Cards cannot change after search begins.</p><button onClick={onStart} style={{ marginTop: 28, cursor: 'pointer', background: '#E03C4E', color: '#0F0C16', border: 0, padding: '13px 22px', fontWeight: 900, letterSpacing: '.1em', clipPath: 'polygon(0 0,100% 0,100% 65%,calc(100% - 11px) 100%,0 100%)' }}>LOCK DECK / SEARCH</button></div>
    <div style={{ padding: 24 }}>{rows.map(([a,b]) => <Intel key={a} label={a} value={b} />)}<div style={{ marginTop: 28, borderTop: '2px solid #E8B45C', padding: 14, background: '#100C14' }}><div style={monoLabel('#E8B45C')}>ACTIVE DECK</div><div style={{ marginTop: 7, fontSize: 17, fontWeight: 900 }}>Crimson Rush</div><div style={{ ...monoLabel('rgba(237,231,220,.4)'), marginTop: 5 }}>18 HERO / 3 SPELL / 3 TRAP</div></div></div>
  </section>;
}

function QueuePanel({ mode, stake, seconds, found, onAccept }: { mode: Mode; stake: number; seconds: number; found: boolean; onAccept: () => void }) {
  const time = `00:${String(seconds).padStart(2, '0')}`;
  return <section style={{ marginTop: 20, border: `1px solid ${found ? '#E8B45C' : 'rgba(237,231,220,.16)'}`, background: '#0B0910', minHeight: 440, display: 'grid', placeItems: 'center', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(237,231,220,.06)', pointerEvents: 'none' }}></div>
    <div style={{ textAlign: 'center', maxWidth: 450, padding: 30 }}><div style={{ fontFamily: "'Zen Old Mincho', serif", fontSize: 58, color: found ? '#E8B45C' : '#E03C4E', lineHeight: 1 }}>{found ? '決' : '対'}</div><div style={{ ...monoLabel(found ? '#E8B45C' : '#E03C4E'), marginTop: 18 }}>{found ? 'OPPONENT FOUND' : `SEARCHING / ${mode}`}</div><h2 style={{ margin: '10px 0 0', fontSize: 26, fontWeight: 900 }}>{found ? 'SilentIndex / Diamond II' : 'Finding a compatible deck'}</h2><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 34, fontWeight: 900, marginTop: 18 }}>{time}</div><p style={{ margin: '10px auto 0', fontSize: 13, lineHeight: 1.6, color: 'rgba(237,231,220,.55)' }}>{found ? 'Control / Sentinel. Deck power difference: +4%.' : mode === 'RANKED' ? `${stake} CR is locked until the match resolves.` : 'No stake is attached to this mode.'}</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(237,231,220,.12)', marginTop: 24 }}>{[['REGION','ASIA'],['RANGE','±180 MMR'],['PING','38 MS']].map(([a,b]) => <div key={a} style={{ background: '#100C14', padding: 12 }}><div style={monoLabel('rgba(237,231,220,.35)')}>{a}</div><div style={{ fontSize: 12, fontWeight: 800, marginTop: 5 }}>{b}</div></div>)}</div>{found && <button onClick={onAccept} style={{ marginTop: 24, cursor: 'pointer', background: '#E8B45C', border: 0, color: '#0F0C16', padding: '12px 22px', fontWeight: 900, letterSpacing: '.11em' }}>ENTER BATTLE</button>}</div>
  </section>;
}

function ResultPanel({ stake, turn, logs, onReplay, onNew }: { stake: number; turn: number; logs: LogItem[]; onReplay: () => void; onNew: () => void }) {
  return <section style={{ marginTop: 20, border: '1px solid rgba(237,231,220,.16)', background: '#0B0910', minHeight: 460, display: 'grid', gridTemplateColumns: '1fr 330px' }}><div style={{ padding: '46px clamp(24px,4vw,58px)', borderRight: '1px solid rgba(237,231,220,.12)' }}><div style={{ fontFamily: "'Zen Old Mincho', serif", fontSize: 64, color: '#E8B45C' }}>勝</div><div style={{ ...monoLabel('#E8B45C'), marginTop: 12 }}>VICTORY / LP REDUCTION</div><h2 style={{ margin: '8px 0 0', fontSize: 38, fontWeight: 900 }}>SilentIndex reached 0 LP.</h2><div style={{ display: 'flex', gap: 8, marginTop: 26 }}><button onClick={onReplay} style={actionButton(true, '#E8B45C')}>WATCH REPLAY</button><button onClick={onNew} style={actionButton(true, '#E03C4E')}>NEW MATCH</button></div></div><div style={{ padding: 24 }}><Intel label="DURATION" value={`${Math.max(4, turn)} TURNS / 06:42`} /><Intel label="LP REMAINING" value="3,180 / 4,000" /><Intel label="STAKE RETURN" value={`+${stake * 2} CR`} /><Intel label="MMR CHANGE" value="+28 / 1,868" /><Intel label="SEASON XP" value="+240" /><div style={{ marginTop: 24 }}><div style={monoLabel('rgba(237,231,220,.4)')}>FINAL EVENTS</div>{logs.slice(0,3).map((l,i) => <div key={i} style={{ fontSize: 11.5, color: 'rgba(237,231,220,.65)', borderTop: '1px solid rgba(237,231,220,.08)', padding: '9px 0' }}>T{l.turn} / {l.text}</div>)}</div></div></section>;
}

function ReplayPanel({ events, step, playing, onPlay, onStep }: { events: LogItem[]; step: number; playing: boolean; onPlay: () => void; onStep: (n: number) => void }) {
  const current = events[step] ?? { turn: 0, actor: 'SYSTEM', text: 'No replay events.' };
  return <section style={{ marginTop: 20, border: '1px solid rgba(237,231,220,.16)', background: '#0B0910', minHeight: 460, display: 'grid', gridTemplateRows: '1fr auto' }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 300px' }}><div style={{ padding: 28, backgroundImage: 'linear-gradient(rgba(237,231,220,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(237,231,220,.035) 1px,transparent 1px)', backgroundSize: '32px 32px' }}><div style={monoLabel('#E03C4E')}>REPLAY FIELD / TURN {current.turn}</div><div style={{ height: 270, display: 'grid', placeItems: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Zen Old Mincho', serif", fontSize: 48, color: current.actor === 'YOU' ? '#3FA8A0' : current.actor === 'ENEMY' ? '#E0596A' : '#E8B45C' }}>{current.actor === 'YOU' ? '自' : current.actor === 'ENEMY' ? '敵' : '記'}</div><div style={{ marginTop: 16, fontSize: 20, fontWeight: 800 }}>{current.text}</div></div></div></div><div style={{ padding: 20, borderLeft: '1px solid rgba(237,231,220,.12)' }}><div style={monoLabel('#E03C4E')}>EVENT TIMELINE</div>{events.map((e,i) => <button key={i} onClick={() => onStep(i-step)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 0, borderLeft: `2px solid ${i === step ? '#E03C4E' : 'transparent'}`, background: i === step ? 'rgba(224,60,78,.07)' : 'transparent', color: i === step ? '#F5F1E8' : 'rgba(237,231,220,.5)', padding: '9px 10px', fontSize: 10.5 }}>T{e.turn} / {e.actor}</button>)}</div></div><div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 15, borderTop: '1px solid rgba(237,231,220,.14)', padding: '13px 18px' }}><div style={{ display: 'flex', gap: 7 }}><button onClick={() => onStep(-1)} style={actionButton(step > 0, '#EDE7DC')}>PREV</button><button onClick={onPlay} style={actionButton(true, '#E03C4E')}>{playing ? 'PAUSE' : 'PLAY'}</button><button onClick={() => onStep(1)} style={actionButton(step < events.length - 1, '#EDE7DC')}>NEXT</button></div><div style={{ height: 5, background: 'rgba(237,231,220,.1)' }}><div style={{ height: '100%', width: `${events.length > 1 ? step / (events.length - 1) * 100 : 0}%`, background: '#E03C4E' }}></div></div><div style={monoLabel('rgba(237,231,220,.5)')}>{step + 1} / {events.length}</div></div></section>;
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