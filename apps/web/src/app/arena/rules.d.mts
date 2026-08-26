export type BattleCard={atk:number;def:number;defense?:boolean};
export function spellDamage(name:string):number;
export function tributeIndices(front:(BattleCard|null)[],count:number):number[];
export function resultWinner(playerLp:number,enemyLp:number,deckOut:'REINA'|'SILENTINDEX'|null):'REINA'|'SILENTINDEX'|null;
export function battleOutcome(attackerAtk:number,target:BattleCard|null):{destroyed:boolean;damage:number};
export function trapOutcome(name:string,attackerAtk:number,turn:number,setAt:number):{armed:boolean;reflected:number};
export function attackOutcome(attackerAtk:number,target:BattleCard|null,trap:{name:string;setAt:number}|null,turn:number):{negated:boolean;reflected:number;destroyed:boolean;damage:number};
