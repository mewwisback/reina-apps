import Link from 'next/link';

const NAV = [
  { href: '#start', label: 'Getting Started' },
  { href: '#collect', label: 'Collecting Heroes' },
  { href: '#forge', label: 'Forge (Fusion)' },
  { href: '#deck', label: 'Building a Deck' },
  { href: '#arena', label: 'Battle & Arena' },
  { href: '#packs', label: 'Packs & Odds' },
  { href: '#support', label: 'Spell, Trap & Wild' },
  { href: '#api', label: 'API Reference' },
  { href: '#faq', label: 'FAQ' },
];

function SectionTag({ children }: { children: string }) {
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: '.24em', color: '#E0596A' }}>{children}</span>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ margin: '10px 0 0', fontSize: 'clamp(24px,2.6vw,32px)', fontWeight: 800, letterSpacing: '-.02em', color: '#F5F1E8' }}>{children}</h2>;
}
function P({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return <p style={{ margin: '14px 0 0', fontSize: small ? 14 : 15, lineHeight: 1.8, color: 'rgba(237,231,220,.75)', maxWidth: 620 }}>{children}</p>;
}
function Section({ id, tag, title, children }: { id: string; tag?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginTop: 56, paddingTop: 36, borderTop: '1px solid rgba(237,231,220,.12)' }}>
      {tag && <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}><SectionTag>{tag}</SectionTag></div>}
      <H2>{title}</H2>
      {children}
    </section>
  );
}
function TableGrid({ cols, rows, hueRows }: { cols: string[]; rows: (string | React.ReactNode)[][]; hueRows?: number[] }) {
  return (
    <div className="docs-table" style={{ marginTop: 22, border: '1px solid rgba(237,231,220,.14)' }}>
      <div className="docs-table-head" style={{ gridTemplateColumns: `repeat(${cols.length},1fr)`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: '.14em', color: 'rgba(237,231,220,.5)', padding: '10px 14px', borderBottom: '1px solid rgba(237,231,220,.14)' }}>
        {cols.map((c) => <div key={c}>{c}</div>)}
      </div>
      {rows.map((r, i) => (
        <div className="docs-table-row" key={i} style={{ gridTemplateColumns: `repeat(${r.length},1fr)`, fontSize: 14, padding: '12px 14px', borderBottom: i < rows.length - 1 ? '1px solid rgba(237,231,220,.1)' : 'none' }}>
          {r.map((cell, j) => <div key={j} data-label={cols[j]} style={hueRows?.includes(j) ? { color: String(cell), fontWeight: 700 } : undefined}>{String(cell)}</div>)}
        </div>
      ))}
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="docs-shell" style={{ background: '#14111A', color: '#E5E0D8', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
      {/* docs sidebar */}
      <aside className="docs-sidebar" style={{ background: '#0F0C13', borderRight: '1px solid rgba(237,231,220,.1)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#E03C4E', clipPath: 'polygon(30% 0,100% 0,100% 70%,70% 100%,0 100%,0 30%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <span style={{ fontWeight: 900, fontSize: 14, color: '#0F0C16' }}>R</span>
          </div>
          <div style={{ fontFamily: "'Zen Old Mincho', serif", fontWeight: 700, letterSpacing: '.28em', fontSize: 13, color: '#EDE7DC' }}>REINA</div>
        </Link>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: '.24em', color: 'rgba(237,231,220,.4)' }}>DOCUMENTATION</div>
        <nav className="docs-nav" style={{ fontSize: 13.5 }}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} style={{ padding: '9px 10px', borderLeft: '2px solid transparent', color: 'rgba(237,231,220,.82)' }}>{n.label}</a>
          ))}
        </nav>
        <Link href="/" style={{ marginTop: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.16em', color: 'rgba(237,231,220,.45)' }}>&larr; BACK TO SITE</Link>
      </aside>

      {/* content */}
      <main className="docs-content">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: '.26em', color: '#E0596A' }}>REINA DOCS</div>
        <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(34px,4.4vw,52px)', fontWeight: 900, letterSpacing: '-.03em', color: '#F5F1E8' }}>Everything you need to enter the arena.</h1>
        <p style={{ margin: '16px 0 0', maxWidth: 560, fontSize: 15.5, lineHeight: 1.75, color: 'rgba(237,231,220,.68)' }}>Collect heroes, build a speed deck, fuse your spares into something stronger, and battle. This reference covers the mechanics end to end.</p>

        <Section id="start" tag="START" title="Getting started">
          <P>No wallet is required to start. Sign up with an email and you're in the roster screen in under a minute.</P>
          <ol style={{ margin: '20px 0 0', paddingLeft: 22, fontSize: 15, lineHeight: 2, color: 'rgba(237,231,220,.8)' }}>
            <li>Create your account and confirm your email.</li>
            <li>Open your first pack from the Packs screen. Every pack guarantees three hero cards.</li>
            <li>Build your first deck: 20 to 30 cards, heroes plus Spell and Trap cards.</li>
            <li>Clear a few Campaign battles against bot decks, then take your deck to the ranked ladder.</li>
          </ol>
        </Section>

        <Section id="collect" tag="COLLECT" title="Collecting heroes & rarity tiers">
          <P>Every hero is a card with a class (12 total: Scout, Strategist, Vanguard, Herald, Artificer, Cleric, Warden, Sentinel, Blade, Sage, Medic, Negotiator) and a rarity. Rarity sets the range your hero's stats roll into. Class is a compatibility filter for Forge fusion, not a power tier: stats decide who wins a fight.</P>
          <TableGrid
            cols={['RARITY', 'STAT RANGE', 'SHARE OF ROSTER']}
            hueRows={[0]}
            rows={[
              ['Common', '35–65', '50%'],
              ['Rare', '50–80', '30%'],
              ['Elite', '65–92', '15%'],
              ['Legendary', '85–99', '5%'],
            ]}
          />
          <P small>Stats are ATK, DEF, SPD and LUCK. A small number of heroes, regardless of rarity, also carry a unique Special Ability: three of the five Legendaries have one, and at least one Common does too. Check a hero's own page in the Wiki to see if it has one.</P>
        </Section>

        <Section id="forge" tag="FORGE" title="Forge (Fusion)">
          <P>The Forge combines two cards into one. It's how spares turn into real power instead of sitting idle in your vault.</P>
          <ol style={{ margin: '20px 0 0', paddingLeft: 22, fontSize: 15, lineHeight: 2, color: 'rgba(237,231,220,.8)' }}>
            <li>Not every pair can fuse. Each hero only fuses with a specific set of known partners, mostly within its own class, with a few curated cross-class pairs discovered by players.</li>
            <li>Ranks don't need to match: a Common can fuse with a Rare, an Elite with a Common, any mix, as long as the pair is compatible.</li>
            <li>Try an incompatible pair anyway and the Forge still runs: it always fails, and both cards are lost.</li>
            <li>Fusing itself is free. It draws from a cooldown that refills between matches, and can also happen mid-match, in-hand, the instant you play two compatible cards together.</li>
          </ol>
          <TableGrid
            cols={['COMPATIBLE PAIR', 'OUTCOME ODDS']}
            hueRows={[0]}
            rows={[
              ['Both Common', 'Common (70%), Rare (30%)'],
              ['Either Rare', 'Rare (75%), Elite (25%)'],
              ['Either Elite', 'Elite (100%, stat-boosted)'],
            ]}
          />
          <P small>One recipe breaks the two-card rule: a Common, an Elite, and a Blank Card together guarantee a Legendary. Blank Cards aren't sold or packed: every match shuffles one into the pre-game draw with a 20% chance. Vault cap is 3 copies per hero, extra pulls beyond that are best spent in the Forge.</P>
        </Section>

        <Section id="deck" tag="DECK" title="Building a deck">
          <P>A deck is 20 to 30 cards, a speed format built for matches around 5–8 minutes. Heroes, Spells, and Traps all fill the same deck, there's no separate equip pool. You can rebuild your deck any time you aren't mid-match.</P>
        </Section>

        <Section id="arena" tag="ARENA" title="Battle & arena">
          <P>Matches are turn-based on a visible battlefield, with face-down cards for bluffing, the same hidden-information play as a physical card game. Each player starts at 4000 life points.</P>
          <ol style={{ margin: '20px 0 0', paddingLeft: 22, fontSize: 15, lineHeight: 2, color: 'rgba(237,231,220,.8)' }}>
            <li>Win by draining the opponent's life points to zero, or by decking them out, running their draw pile dry.</li>
            <li>On your turn you can attack with a hero, play or equip a support card, fuse two compatible hand cards, activate a trap, set a card face-down, or switch a hero's stance.</li>
            <li><strong>Campaign</strong> is solo play against bot decks: it teaches the mechanics and pays out early packs.</li>
            <li><strong>Ranked Ladder</strong> is seasonal PvP with resets; you wager your own stake going in and matchmaking weighs both rank and deck power level.</li>
            <li><strong>Guild &amp; Friend Battles</strong> are private challenges and team play between guildmates, no ranked stakes attached.</li>
          </ol>
        </Section>

        <Section id="packs" tag="PACKS" title="Packs & odds">
          <P>Every hero pack contains three cards with a guaranteed floor per tier, no purely random duds. Spell and Trap cards are sold in their own dedicated packs, separate from hero packs, and are also earned through Campaign and PvE clears.</P>
          <TableGrid
            cols={['TIER', 'GUARANTEED']}
            hueRows={[0]}
            rows={[
              ['Bronze', '2 Common + 1 Rare'],
              ['Silver', '1 Common + 2 Rare'],
              ['Gold', '1 Rare + 2 Elite'],
            ]}
          />
        </Section>

        <Section id="support" tag="SUPPORT" title="Spell, Trap & Wild cards">
          <P>Spells resolve instantly when played face-up. Traps get set face-down and trigger on their own during the opponent's turn, the same bluff as a face-down monster. Wild cards, like the Blank Card, never enter a hand or a fight: they exist only to complete specific Forge recipes.</P>
          <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <CardExample type="SPELL" hue="#3FA8A0" name="Surge Protocol" desc="Boost one hero's ATK for the turn." />
            <CardExample type="TRAP" hue="#8C6FD8" name="Counter Seal" desc="Negate one incoming attack." />
            <CardExample type="SPELL" hue="#3FA8A0" name="Supply Drop" desc="Draw two extra cards." />
            <CardExample type="WILD" hue="#3FA8A0" name="Blank Card" desc="Third slot for the Legendary Forge recipe." />
          </div>
        </Section>

        <Section id="api" tag="API" title="API reference">
          <P>Authenticate with a bearer token in the <code style={{ background: 'rgba(237,231,220,.08)', padding: '2px 6px' }}>Authorization</code> header.</P>
          <ApiBlock method="GET" hue="#4FA870" path="/v1/heroes" code={'[{ "id": "yuri0", "name": "YURI", "class": "SCOUT", "rarity": "COMMON", "atk": 62, "def": 58, "spd": 60, "luck": 55 }]'} />
          <ApiBlock method="GET" hue="#4FA870" path="/v1/decks/:id" code='{ "id": "d_01", "cards": 24, "heroes": ["yuri0","tomu1","chise2"], "spells": ["surge"], "traps": ["counter"] }' />
          <ApiBlock method="POST" hue="#E8873C" path="/v1/forge" code='{ "cardA": "yuri0", "cardB": "tomu1" }\n\u2192 { "status": "success", "result": "chise2", "rank": "RARE" }' />
          <ApiBlock method="POST" hue="#E8873C" path="/v1/matches" code='{ "deckId": "d_01", "mode": "ranked", "stake": 200 }\n\u2192 { "status": "matched", "opponent": "d_88", "matchId": "m_5521" }' />
        </Section>

        <Section id="faq" tag="FAQ" title="Frequently asked">
          <Faq q="What exactly goes into a deck?" a="20 to 30 cards total: heroes, Spells, and Traps together. No separate equip pool." />
          <Faq q="Can I swap cards mid-match?" a="No. Your deck locks for the duration of a match; any changes apply to your next battle." />
          <Faq q="What's the difference between Bronze, Silver, and Gold packs?" a="The guaranteed rarity floor. See Packs & Odds above for the exact breakdown." />
          <Faq q="How do I get a Legendary?" a="Pull one directly (rare), or Forge one: fuse two Elites of a compatible pair, or complete the Common + Elite + Blank Card recipe for a guaranteed result." />
          <Faq q="Do I need to wager real stakes to play ranked?" a="You choose your own stake going into a Ranked Ladder match. Campaign and Guild/Friend battles carry no wager at all." />
        </Section>
      </main>
    </div>
  );
}

function CardExample({ type, hue, name, desc }: { type: string; hue: string; name: string; desc: string }) {
  return (
    <div className="docs-card-example" style={{ border: `1px solid ${hue}`, padding: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.14em', color: hue }}>{type}</div>
      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{name}</div>
      <div style={{ fontSize: 12.5, color: 'rgba(237,231,220,.6)', marginTop: 4 }}>{desc}</div>
    </div>
  );
}

function ApiBlock({ method, hue, path, code }: { method: string; hue: string; path: string; code: string }) {
  return (
    <div className="docs-api-block" style={{ marginTop: 16, border: '1px solid rgba(237,231,220,.14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(237,231,220,.14)' }}>
        <span style={{ background: hue, color: '#0F0C16', fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', padding: '3px 8px' }}>{method}</span>
        <code style={{ fontSize: 13, color: 'rgba(237,231,220,.85)' }}>{path}</code>
      </div>
      <pre style={{ margin: 0, padding: 14, fontSize: 12.5, lineHeight: 1.7, color: 'rgba(237,231,220,.72)', overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{code}</pre>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#F5F1E8' }}>{q}</div>
      <div style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.75, color: 'rgba(237,231,220,.72)' }}>{a}</div>
    </div>
  );
}