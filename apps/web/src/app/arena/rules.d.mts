export type BattleCard={atk:number;def:number;defense?:boolean};
export function spellDamage(name:string):number;
export function tributeIndices(front:(BattleCard|null)[],count:number):number[];
export function resultWinner(playerLp:number,enemyLp:number,deckOut:'REINA'|'SILENTINDEX'|null):'REINA'|'SILENTINDEX'|null;
