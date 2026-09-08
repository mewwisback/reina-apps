import {test} from 'node:test';
import assert from 'node:assert/strict';

const decks = await import('./decks.mjs');
const valid = () => ({version: 1, activeId: 'one', decks: [{id: 'one', name: 'One', cardIds: [...decks.STARTER_IDS]}]});
const memory = initial => {
  let raw = initial;
  return {getItem: () => raw, setItem: (_key, value) => {raw = value;}};
};
for (const [label, mutate] of [
  ['unknown card', x => {x.decks[0].cardIds[0] = 'h0';}],
  ['unknown version', x => {x.version = 2;}],
  ['duplicate record IDs', x => {x.decks.push({...x.decks[0]});}],
  ['missing selected record', x => {x.activeId = 'missing';}],
  ['short active deck', x => {x.decks[0].cardIds.pop();}],
  ['oversized deck', x => {x.decks[0].cardIds.push('rei');}],
  ['blank name', x => {x.decks[0].name = ' ';}],
  ['long name', x => {x.decks[0].name = 'x'.repeat(61);}],
  ['invalid record ID', x => {x.decks[0].id = '../one';}],
  ['excess records', x => {x.decks = Array.from({length: 21}, (_, i) => ({...x.decks[0], id: `d${i}`})); x.activeId = null;}],
  ['missing cards', x => {delete x.decks[0].cardIds;}],
]) test(`rejects ${label} without overwriting stored bytes`, () => {
  const library = valid(); mutate(library);
  const raw = JSON.stringify(library), storage = memory(raw);
  const result = decks.loadLibrary(storage);
  assert.ok(result.error);
  assert.equal(result.raw, raw);
  assert.equal(decks.activeSnapshot(result).id, null);
  assert.throws(() => decks.saveLibrary(storage, library, raw));
  assert.equal(storage.getItem(), raw);
});
test('corrupt JSON stays intact; fallback explains starter', () => {
  const storage = memory('{bad');
  const loaded = decks.loadLibrary(storage);
  assert.match(loaded.error, /invalid|corrupt/i);
  assert.match(decks.activeSnapshot(loaded).notice, /starter/i);
  assert.equal(storage.getItem(), '{bad');
});
test('storage read and write failures remain explicit', () => {
  const storage = {getItem() {throw Error('blocked');}, setItem() {throw Error('quota');}};
  assert.match(decks.loadLibrary(storage).error, /storage/i);
  assert.throws(() => decks.saveLibrary(storage, valid(), null), /storage/i);
  assert.throws(() => decks.saveLibrary({...storage, getItem: () => null}, valid(), null), /storage/i);
});
test('draft record revision stays bound across live library refresh', () => {
  const original=valid().decks[0], library=valid();
  const revision=JSON.stringify(original);
  library.decks[0].name='Other tab';
  assert.throws(()=>decks.assertDraftRevision(library, original.id, revision), /changed in another tab/);
  assert.doesNotThrow(()=>decks.assertDraftRevision(valid(), original.id, revision));
  assert.throws(()=>decks.assertDraftRevision(decks.emptyLibrary(), original.id, revision), /changed/);
  assert.doesNotThrow(()=>decks.assertDraftRevision(library, 'new', null));
});
test('stale tab cannot overwrite newer saved library', () => {
  const storage = memory(JSON.stringify(valid()));
  assert.throws(() => decks.saveLibrary(storage, valid(), null), /changed/i);
});
test('empty draft saves but cannot activate; no invented per-card copy cap', () => {
  const library = valid(), storage = memory(null);
  library.activeId = null; library.decks[0].cardIds = [];
  decks.saveLibrary(storage, library, null);
  assert.deepEqual(decks.loadLibrary(storage).library, library);
  library.activeId = 'one';
  assert.throws(() => decks.saveLibrary(storage, library, storage.getItem()), /20/);
  library.decks[0].cardIds = Array(20).fill('rei');
  decks.saveLibrary(storage, library, storage.getItem());
  assert.equal(decks.activeSnapshot(decks.loadLibrary(storage)).cardIds.length, 20);
});
test('combat instances keep catalog IDs separate and cannot mutate catalog', () => {
  assert.equal(typeof decks.makeCombatDeck, 'function');
  const cards = decks.makeCombatDeck(Array(20).fill('yuri'));
  assert.equal(new Set(cards.map(card => card.id)).size, 20);
  assert.equal(cards[0].id, 'p-yuri-0');
  cards[0].atk = 0;
  assert.equal(decks.CATALOG.find(card => card.id === 'yuri').atk, 1100);
  assert.equal(decks.makeCombatDeck(decks.STARTER_IDS, true)[0].id, 'e-rei-0');
  assert.throws(() => decks.makeCombatDeck(['h0']));
});
test('local library saves draft then activates customized 20-card snapshot', () => {
  assert.equal(typeof decks.saveLibrary, 'function', 'local persistence missing');
  let raw = null;
  const storage = {getItem: () => raw, setItem: (_key, value) => {raw = value;}};
  const library = {version: 1, activeId: null, decks: [{id: 'custom', name: 'Custom', cardIds: Array(20).fill('yuri')}]};
  decks.saveLibrary(storage, library, null);
  const loaded = decks.loadLibrary(storage);
  assert.deepEqual(loaded.library, library);
  library.activeId = 'custom';
  decks.saveLibrary(storage, library, loaded.raw);
  const snapshot = decks.activeSnapshot(decks.loadLibrary(storage));
  assert.equal(snapshot.name, 'Custom');
  assert.deepEqual(snapshot.cardIds, Array(20).fill('yuri'));
  library.decks[0].cardIds[0] = 'rei';
  assert.equal(snapshot.cardIds[0], 'yuri');
});
