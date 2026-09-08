'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {AppShell} from '../../components/layout/app-shell';
import {browserDeckStorage, useLocalDecks} from '../../components/local-decks';
import {CATALOG, DECK_SIZE, STARTER_IDS, assertDraftRevision, emptyLibrary, loadLibrary, saveLibrary, type Deck, type Library} from '../arena/decks.mjs';
import './local-builder.css';

// ponytail: tab-memory recovery covers client routes; full unload remains guarded, not durable storage.
let recovery: {draft:Deck; revision:string|null; dirty:boolean} | null = null;
const warn = (event:BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = '';};

export default function DeckBuilderPage() {
  const {loaded, setLoaded} = useLocalDecks();
  const [draft, setDraft] = useState<Deck | null>(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [revision, setRevision] = useState<string|null>(null);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (recovery) {setDraft(recovery.draft); setRevision(recovery.revision); setDirty(recovery.dirty);}
    setRestored(true);
  }, []);
  useEffect(() => {
    if (restored && !draft && loaded.library.decks.length) {
      const deck=loaded.library.decks.find(deck => deck.id === loaded.library.activeId) || loaded.library.decks[0];
      setDraft(deck); setRevision(JSON.stringify(deck));
    }
  }, [loaded, draft, restored]);
  useEffect(() => {
    if (!restored) return;
    recovery = draft ? {draft, revision, dirty} : null;
    // Keep unload guard alive on other client routes while recoverable edits exist.
    window.removeEventListener('beforeunload', warn);
    if (dirty) window.addEventListener('beforeunload', warn);
  }, [draft, revision, dirty, restored]);
  const discard = () => !dirty || window.confirm('Discard unsaved editor changes?');
  const edit = (next:Deck) => {setDraft(next); setDirty(true); setMessage('Unsaved changes. Active selection still uses the saved version.');};
  const persist = (library:Library, success:string) => {
    try {
      saveLibrary(browserDeckStorage, library, loaded.raw);
      setLoaded({library, raw:JSON.stringify(library), error:null}); setMessage(success); return true;
    } catch (error) {setMessage(error instanceof Error ? error.message : 'Save failed. Nothing saved.'); return false;}
  };
  const save = () => {
    if (!draft || loaded.error) return;
    try {assertDraftRevision(loaded.library, draft.id, revision);}
    catch (error) {setDirty(true); setMessage((error as Error).message); return;}
    const record = {...draft, name:draft.name.trim(), cardIds:[...draft.cardIds]};
    const decks = loaded.library.decks.some(deck => deck.id === record.id) ? loaded.library.decks.map(deck => deck.id === record.id ? record : deck) : [...loaded.library.decks, record];
    const deactivated = loaded.library.activeId === record.id && record.cardIds.length !== DECK_SIZE;
    if (persist({...loaded.library, decks, activeId:deactivated ? null : loaded.library.activeId}, deactivated ? 'Saved draft. Active selection cleared because it is not 20 cards; Arena uses starter.' : 'Saved in this browser.')) {setDraft(record); setRevision(JSON.stringify(record)); setDirty(false);}
  };
  const saved = loaded.library.decks.find(deck => deck.id === draft?.id);
  const ready = loaded.raw !== undefined && !loaded.error;
  return <AppShell><main className="local-builder">
    <header className="deck-builder-hero"><p>DECK BUILDER / BROWSER LOCAL</p><h1>Arena decks</h1><p>20 cards for the current Arena format. Repeated cards allowed; no per-card copy limit is defined. Starter has two of each, not a copy limit.</p><p>No account, inventory ownership or cloud sync. Saved order is draw order.</p><Link href="/dashboard">Back to dashboard</Link></header>
    <div className="local-builder-body">
      <p role="status">{message || loaded.error || 'Create a deck or edit a saved deck. Drafts can have 0–20 cards; only 20-card decks can be active.'}</p>
      {loaded.error && <section aria-label="Storage recovery"><p>{loaded.error} Saving is blocked to preserve existing data.</p>{typeof loaded.raw === 'string' && <><a download="reina-decks-recovery.txt" href={`data:text/plain;charset=utf-8,${encodeURIComponent(loaded.raw)}`}>Download stored data</a><button onClick={() => {if (window.confirm('Replace unreadable local decks with an empty library? Download stored data first. This cannot be undone.') && persist(emptyLibrary(), 'Local library reset.')) {setDraft(null); setDirty(false);}}}>RESET LOCAL LIBRARY</button></>}</section>}
      <div className="local-builder-actions"><button onClick={() => {if (discard()) {setLoaded(loadLibrary(browserDeckStorage)); setDraft(null); setDirty(false); setMessage('Reloaded saved decks.');}}}>RELOAD SAVED DECKS</button><button disabled={!ready || loaded.library.decks.length >= 20} onClick={() => {if (discard()) {setRevision(null); edit({id:crypto.randomUUID(),name:'New deck',cardIds:[]});}}}>NEW DECK</button></div>
      <nav aria-label="Saved local decks" className="deck-tabs">{loaded.library.decks.map(deck => <button key={deck.id} aria-pressed={draft?.id === deck.id} onClick={() => {if (discard()) {setDraft({...deck,cardIds:[...deck.cardIds]}); setRevision(JSON.stringify(deck)); setDirty(false); setMessage('Editing saved deck.');}}}>{deck.name} / {deck.cardIds.length}{loaded.library.activeId === deck.id ? ' / ACTIVE' : ''}</button>)}</nav>
      {draft && <>
        <div className="local-editor"><label>Deck name<input maxLength={60} value={draft.name} onChange={event => edit({...draft,name:event.target.value})}/></label><strong>{draft.cardIds.length} / 20 CARDS{dirty ? ' / UNSAVED' : ''}</strong><div className="local-builder-actions"><button onClick={() => edit({...draft,cardIds:[...STARTER_IDS]})}>LOAD STARTER</button><button onClick={() => edit({...draft,cardIds:[]})}>CLEAR CARDS</button><button disabled={!ready} onClick={save}>SAVE DECK</button><button disabled={!ready || dirty || saved?.cardIds.length !== DECK_SIZE} onClick={() => persist({...loaded.library,activeId:draft.id}, 'Active gameplay deck selected for next duel.')}>USE SAVED DECK</button></div></div>
        <div className="deck-workspace"><section aria-label="Arena catalog"><h2>Arena catalog</h2><label>Search cards<input value={search} onChange={event => setSearch(event.target.value)}/></label><div className="vault-grid">{CATALOG.filter(card => `${card.name} ${card.kind}`.toLowerCase().includes(search.toLowerCase())).map(card => <button key={card.id} aria-label={`Add ${card.name}`} disabled={draft.cardIds.length >= DECK_SIZE} onClick={() => edit({...draft,cardIds:[...draft.cardIds,card.id]})}><small>{card.rarity} / {card.kind}</small><strong>{card.name}</strong><span>{card.kind === 'HERO' ? `ATK ${card.atk} / DEF ${card.def}` : 'Arena tactical card'}</span><span>+ ADD / {draft.cardIds.filter(id => id === card.id).length} in deck</span></button>)}</div></section>
        <section aria-label="Deck cards"><h2>Draw order</h2><p>Tap a card to remove one copy. Additions go last.</p><ol>{draft.cardIds.map((id,index) => {const card=CATALOG.find(card => card.id === id)!; return <li key={index} data-deck-list-item><button aria-label={`Remove ${card.name}, card ${index+1}`} onClick={() => edit({...draft,cardIds:draft.cardIds.filter((_id,i) => i !== index)})}>{index+1}. {card.name} <span>REMOVE</span></button></li>;})}</ol></section></div>
      </>}
    </div>
  </main></AppShell>;
}
