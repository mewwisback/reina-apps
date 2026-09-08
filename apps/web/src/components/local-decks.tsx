'use client';
import {useEffect, useState} from 'react';
import {activeSnapshot, emptyLibrary, loadLibrary, STORAGE_KEY, type Loaded} from '../app/arena/decks.mjs';
// Access localStorage inside guarded I/O, including browsers that throw on the getter.
export const browserDeckStorage = {
  getItem: (key:string) => window.localStorage.getItem(key),
  setItem: (key:string, value:string) => window.localStorage.setItem(key, value),
};
export function useLocalDecks() {
  const [loaded, setLoaded] = useState<Loaded>({library:emptyLibrary(),raw:undefined,error:null});
  useEffect(() => {
    const refresh = () => setLoaded(loadLibrary(browserDeckStorage));
    const storage = (event:StorageEvent) => {if (event.key === STORAGE_KEY || event.key === null) refresh();};
    refresh(); window.addEventListener('storage', storage); window.addEventListener('pageshow', refresh);
    return () => {window.removeEventListener('storage', storage); window.removeEventListener('pageshow', refresh);};
  }, []);
  return {loaded, setLoaded};
}
export function ActiveDeckSummary() {
  const {loaded} = useLocalDecks();
  const snapshot = activeSnapshot(loaded);
  return <section aria-label="Active gameplay deck" className="local-deck-summary"><strong>ACTIVE GAMEPLAY DECK</strong><p>{loaded.raw === undefined && !loaded.error ? 'Reading local decks…' : `${snapshot.name} / ${snapshot.cardIds.length} cards`}</p><small>{snapshot.notice}</small></section>;
}
