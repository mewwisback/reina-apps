'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '../../components/layout/app-shell';
import './arena.css';

type Card = { id: string; name: string; kind: 'HERO' | 'SPELL' | 'TRAP'; rank: string; atk: number; def: number; hue: string; sigil: string; text: string; faceDown?: boolean; spent?: boolean };
type Slot = Card | null;

const cards: Card[] = [
  { id: 'yuri', name: 'YURI', kind: 'HERO', rank: 'COMMON', atk: 620, def: 580, hue: '#d76c42', sigil: '斥', text: 'Quick scout. Gains 200 ATK when summoned beside a face-down card.' },
  { id: 'chise', name: 'CHISE', kind: 'HERO', rank: 'RARE', atk: 1380, def: 1120, hue: '#d7ad63', sigil: '刃', text: 'A disciplined blade whose attack cannot be reduced during your turn.' },
  { id: 'surge', name: 'SURGE PROTOCOL', kind: 'SPELL', rank: 'SPELL', atk: 0, def: 0, hue: '#4eaaa1', sigil: '術', text: 'Deal 400 direct damage to opponent.' },
  { id: 'seal', name: 'COUNTER SEAL', kind: 'TRAP', rank: 'TRAP', atk: 0, def: 0, hue: '#8d6cc1', sigil: '罠', text: 'Set face-down. Negates next attack.' },
  { id: 'tari', name: 'TARI', kind: 'HERO', rank: 'COMMON', atk: 760, def: 910, hue: '#b65050', sigil: '盾', text: 'Vanguard with high defensive value.' },
];

const initialEnemy: Slot[] = [
  null,
  { id: 'odna', name: 'ODNA', kind: 'HERO', rank: 'RARE', atk: 1260, def: 1050, hue: '#617fa3', sigil: '槍', text: 'SilentIndex core attacker.' },
  { id: 'hidden', name: 'UNKNOWN', kind: 'TRAP', rank: 'SET', atk: 0, def: 0, hue: '#766487', sigil: '?', text: 'Identity concealed.', faceDown: true },
  null,
  { id: 'mira', name: 'MIRA', kind: 'HERO', rank: 'ELITE', atk: 1700, def: 1450, hue: '#4f9a87', sigil: '守', text: 'Sentinel commander.' },
];
const initialPlayer: Slot[] = [null, null, { ...cards[4], id: 'field-tari' }, null, null];

export default function ArenaPage() {
  const [hand, setHand] = useState(cards.slice(0, 4));
  const [player, setPlayer] = useState<Slot[]>(initialPlayer);
  const [enemy, setEnemy] = useState<Slot[]>(initialEnemy);
  const [selected, setSelected] = useState<string[]>([]);
  const [attacker, setAttacker] = useState<number | null>(null);
  const [playerLp, setPlayerLp] = useState(4000);
  const [enemyLp, setEnemyLp] = useState(4000);
  const [turn, setTurn] = useState(3);
  const [phase, setPhase] = useState('MAIN');
  const [notice, setNotice] = useState('Select a card from your hand.');
  const [impact, setImpact] = useState<'enemy' | 'player' | null>(null);
  const [trapArmed, setTrapArmed] = useState(false);

  const selectedCards = useMemo(() => hand.filter((c) => selected.includes(c.id)), [hand, selected]);
  const reset = () => {
    setHand(cards.slice(0, 4)); setPlayer(initialPlayer); setEnemy(initialEnemy); setSelected([]); setAttacker(null);
    setPlayerLp(4000); setEnemyLp(4000); setTurn(3); setPhase('MAIN'); setNotice('Select a card from your hand.'); setTrapArmed(false);
  };
  const flash = (side: 'enemy' | 'player') => { setImpact(side); window.setTimeout(() => setImpact(null), 420); };
  const toggleHand = (id: string) => {
    setAttacker(null);
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length < 2 ? [...s, id] : [id]);
    setNotice('Choose an empty field slot, or select two heroes to fuse.');
  };
  const summon = (slot: number) => {
    if (player[slot] || selectedCards.length !== 1) return;
    const card = selectedCards[0];
    if (card.kind === 'SPELL') {
      setEnemyLp((lp) => Math.max(0, lp - 400)); setHand((h) => h.filter((c) => c.id !== card.id)); flash('enemy'); setSelected([]); setNotice('Surge Protocol resolves. SilentIndex loses 400 LP.'); return;
    }
    if (card.kind === 'TRAP') {
      setTrapArmed(true); setHand((h) => h.filter((c) => c.id !== card.id)); setSelected([]); setNotice('Counter Seal set face-down behind your field.'); return;
    }
    setPlayer((f) => f.map((c, i) => i === slot ? { ...card, id: `field-${card.id}` } : c));
    setHand((h) => h.filter((c) => c.id !== card.id)); setSelected([]); setNotice(`${card.name} summoned. Select it to declare an attack.`);
  };
  const fuse = () => {
    if (selectedCards.length !== 2 || selectedCards.some((c) => c.kind !== 'HERO')) return;
    const fused: Card = { id: 'rei-fused', name: 'REI', kind: 'HERO', rank: 'ELITE FUSION', atk: 2100, def: 1650, hue: '#e9c665', sigil: '零', text: 'Born from aligned speed and blade attributes.' };
    setHand((h) => [...h.filter((c) => !selected.includes(c.id)), fused]); setSelected([fused.id]); setNotice('Fusion complete: REI. Choose an empty field slot.');
  };
  const chooseAttacker = (index: number) => {
    const card = player[index]; if (!card || card.spent) return;
    setSelected([]); setAttacker(index); setPhase('BATTLE'); setNotice(`${card.name} ready. Select an enemy card as target.`);
  };
  const attack = (target: number) => {
    if (attacker === null || !enemy[target]) return;
    const source = player[attacker]!; const victim = enemy[target]!;
    if (victim.faceDown) {
      setEnemy((f) => f.map((c, i) => i === target ? null : c)); setNotice(`${source.name} reveals and destroys Counter Seal.`);
    } else if (source.atk >= victim.def) {
      const damage = source.atk - victim.def;
      setEnemy((f) => f.map((c, i) => i === target ? null : c)); setEnemyLp((lp) => Math.max(0, lp - damage)); flash('enemy');
      setNotice(`${source.name} defeats ${victim.name}. ${damage} battle damage.`);
    } else {
      const damage = victim.def - source.atk;
      setPlayerLp((lp) => Math.max(0, lp - damage)); flash('player'); setNotice(`${victim.name} holds. You take ${damage} battle damage.`);
    }
    setPlayer((f) => f.map((c, i) => i === attacker && c ? { ...c, spent: true } : c)); setAttacker(null);
  };
  const directAttack = () => {
    if (attacker === null || enemy.some(Boolean)) return;
    const source = player[attacker]!; setEnemyLp((lp) => Math.max(0, lp - source.atk)); flash('enemy');
    setPlayer((f) => f.map((c, i) => i === attacker && c ? { ...c, spent: true } : c)); setAttacker(null); setNotice(`Direct attack. SilentIndex loses ${source.atk} LP.`);
  };
  const endTurn = () => {
    const incoming = trapArmed ? 0 : 360;
    if (incoming) { setPlayerLp((lp) => Math.max(0, lp - incoming)); flash('player'); }
    setTrapArmed(false); setPlayer((f) => f.map((c) => c ? { ...c, spent: false } : c)); setTurn((t) => t + 1); setPhase('DRAW'); setSelected([]); setAttacker(null);
    setNotice(trapArmed ? 'Counter Seal negates enemy attack. Your next draw begins.' : 'Enemy attacks directly for 360. Your next draw begins.');
    window.setTimeout(() => setPhase('MAIN'), 700);
  };

  return <AppShell>
    <main className="fm-arena">
      <header className="fm-header">
        <div><span>RANKED DUEL / M-5521</span><h1>Ruins of the First Queen</h1></div>
        <div className="fm-turn"><b>TURN {turn}</b><span>{phase} PHASE</span></div>
      </header>

      <section className={`fm-stage ${impact ? `impact-${impact}` : ''}`}>
        <div className="fm-atmosphere" />
        <Duelist enemy name="SILENTINDEX" rank="DIAMOND II" lp={enemyLp} />
        <div className="fm-perspective">
          <div className="fm-stone-board">
            <div className="fm-row enemy-row">{enemy.map((card, i) => <FieldCard key={i} card={card} enemy selected={attacker !== null && !!card} onClick={() => attack(i)} />)}</div>
            <div className="fm-seal"><span>REINA</span><i>王</i></div>
            <div className="fm-row player-row">{player.map((card, i) => <FieldCard key={i} card={card} selected={attacker === i} onClick={() => card ? chooseAttacker(i) : summon(i)} />)}</div>
            {trapArmed && <div className="fm-set-trap">COUNTER SEAL / SET</div>}
          </div>
        </div>
        <Duelist name="KAIBA99" rank="GOLD III" lp={playerLp} />

        <div className="fm-command">
          <div className="fm-message"><span>{phase}</span>{notice}</div>
          <div className="fm-actions">
            {selectedCards.length === 2 && <button onClick={fuse}>FUSE SELECTED</button>}
            {attacker !== null && !enemy.some(Boolean) && <button onClick={directAttack}>DIRECT ATTACK</button>}
            <button onClick={endTurn}>END TURN</button><button className="quiet" onClick={reset}>RESET DUEL</button>
          </div>
        </div>

        <div className="fm-hand" aria-label="Your hand">
          {hand.map((card, i) => <HandCard key={card.id} card={card} index={i} selected={selected.includes(card.id)} onClick={() => toggleHand(card.id)} />)}
        </div>
      </section>
      <p className="fm-help">HAND: select card · FIELD: summon or attack · ENEMY: choose target · two HERO cards: fusion</p>
    </main>
  </AppShell>;
}

function Duelist({ enemy, name, rank, lp }: { enemy?: boolean; name: string; rank: string; lp: number }) {
  return <div className={`fm-duelist ${enemy ? 'enemy' : 'player'}`}><div><small>{enemy ? 'OPPONENT' : 'DUELIST'}</small><strong>{name}</strong><em>{rank}</em></div><div className="fm-lp"><small>LIFE POINTS</small><b>{String(lp).padStart(4, '0')}</b><i style={{ width: `${Math.max(0, lp / 40)}%` }} /></div></div>;
}
function FieldCard({ card, enemy, selected, onClick }: { card: Slot; enemy?: boolean; selected?: boolean; onClick: () => void }) {
  return <button aria-label={card ? card.name : 'Empty field slot'} onClick={onClick} className={`fm-field-card ${card ? 'occupied' : ''} ${card?.faceDown ? 'face-down' : ''} ${card?.spent ? 'spent' : ''} ${selected ? 'targeted' : ''}`} style={card ? { '--hue': card.hue } as React.CSSProperties : undefined}>
    {card ? <><div className="card-art"><span>{card.faceDown ? '封' : card.sigil}</span></div><div className="card-name">{card.faceDown ? 'SET CARD' : card.name}</div>{!card.faceDown && <div className="card-stats">ATK {card.atk} · DEF {card.def}</div>}</> : <span className="empty-mark">◇</span>}
  </button>;
}
function HandCard({ card, index, selected, onClick }: { card: Card; index: number; selected: boolean; onClick: () => void }) {
  const angle = (index - 1.5) * 6;
  return <button onClick={onClick} className={`fm-hand-card ${selected ? 'selected' : ''}`} style={{ '--hue': card.hue, '--angle': `${angle}deg`, '--offset': `${Math.abs(index - 1.5) * 4}px` } as React.CSSProperties}>
    <div className="hand-rank">{card.rank}</div><div className="hand-art"><span>{card.sigil}</span></div><strong>{card.name}</strong><div className="hand-stats">{card.kind === 'HERO' ? `${card.atk} / ${card.def}` : card.kind}</div><p>{card.text}</p>
  </button>;
}
