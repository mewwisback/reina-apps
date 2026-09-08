export const CATALOG = [
  ['rei','REI ZERO','HERO',2200,1200,'crown','#9e3347','EPIC'],
  ['chise','CHISE BLADE','HERO',1750,1100,'blade','#ad7540','RARE'],
  ['yuri','YURI SCOUT','HERO',1100,900,'scout','#a84d38','COMMON'],
  ['tari','TARI GUARD','HERO',900,1700,'guard','#85333d','COMMON'],
  ['mira','MIRA VEIL','HERO',1350,1400,'veil','#586f8d','RARE'],
  ['surge','CRIMSON SURGE','SPELL',0,0,'surge','#397b74','RARE'],
  ['edge','QUEEN’S EDGE','SPELL',0,0,'edge','#956039','EPIC'],
  ['seal','COUNTER SEAL','TRAP',0,0,'seal','#684e82','RARE'],
  ['mirror','MIRROR WARD','TRAP',0,0,'mirror','#526783','COMMON'],
  ['pulse','LAST PULSE','SPELL',0,0,'pulse','#39726c','COMMON'],
].map(([id,name,kind,atk,def,mark,color,rarity]) => Object.freeze({id,name,kind,atk,def,mark,color,rarity}));
export const DECK_SIZE = 20;
export const STORAGE_KEY = 'reina-decks-v1';
export const STARTER_IDS = [...CATALOG, ...CATALOG].map(card => card.id);
export const emptyLibrary = () => ({version: 1, decks: [], activeId: null});
export function validateLibrary(value) {
  const fail = message => {throw Error(message);};
  if (!value || value.version !== 1 || !Array.isArray(value.decks) || value.decks.length > 20) fail('Invalid local library or unsupported version.');
  const ids = new Set();
  for (const deck of value.decks) {
    if (!deck || typeof deck.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(deck.id) || ids.has(deck.id)) fail('Invalid or duplicate deck ID.');
    ids.add(deck.id);
    if (typeof deck.name !== 'string' || !deck.name.trim() || deck.name.length > 60 || /[\u0000-\u001f]/.test(deck.name)) fail('Deck name must contain 1–60 readable characters.');
    if (!Array.isArray(deck.cardIds) || deck.cardIds.length > DECK_SIZE || !deck.cardIds.every(id => CATALOG.some(card => card.id === id))) fail('Invalid cards: use up to 20 Arena catalog cards.');
  }
  if (value.activeId !== null && (!ids.has(value.activeId) || value.decks.find(deck => deck.id === value.activeId).cardIds.length !== DECK_SIZE)) fail('Active deck must exist and contain exactly 20 cards.');
  return value;
}
export function loadLibrary(storage) {
  let raw;
  try {raw = storage.getItem(STORAGE_KEY);} catch {return {library: emptyLibrary(), raw: undefined, error: 'Browser storage unavailable. Retry when storage is enabled.'};}
  try {
    if (raw !== null && raw.length > 100000) throw Error('Library too large.');
    return {library: raw === null ? emptyLibrary() : validateLibrary(JSON.parse(raw)), raw, error: null};
  } catch {return {library: emptyLibrary(), raw, error: 'Invalid or corrupt local decks (or unsupported version). Stored data kept unchanged.'};}
}
export function assertDraftRevision(library, id, revision) {
  if (JSON.stringify(library.decks.find(deck => deck.id === id) ?? null) !== (revision ?? 'null')) throw Error('Saved deck changed in another tab. Draft kept. Reload saved decks to explicitly discard it before retrying.');
}
export function saveLibrary(storage, library, expectedRaw) {
  validateLibrary(library);
  let current;
  try {current = storage.getItem(STORAGE_KEY);} catch {throw Error('Browser storage unavailable. Nothing saved.');}
  if (current !== expectedRaw) throw Error('Saved decks changed in another tab. Reload saved decks before retrying.');
  try {storage.setItem(STORAGE_KEY, JSON.stringify(library));} catch {throw Error('Browser storage write failed. Nothing saved; keep this editor open and retry.');}
}
export function activeSnapshot(loaded) {
  let deck;
  try {validateLibrary(loaded.library); if (!loaded.error) deck = loaded.library.decks.find(deck => deck.id === loaded.library.activeId);} catch {}
  return deck ? {...deck, cardIds: [...deck.cardIds], notice: 'Saved in this browser only.'} : {id: null, name: 'Arena starter', cardIds: [...STARTER_IDS], notice: `${loaded.error || 'No active local deck.'} Using Arena starter.`};
}
export function makeCombatDeck(cardIds = STARTER_IDS, enemy = false) {
  validateLibrary({version: 1, activeId: 'combat', decks: [{id: 'combat', name: 'Combat', cardIds}]});
  return cardIds.map((id, index) => ({...CATALOG.find(card => card.id === id), id: `${enemy ? 'e' : 'p'}-${id}-${index}`}));
}
