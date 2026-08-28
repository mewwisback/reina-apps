export type CancellableDelay={promise:Promise<boolean>;cancel:()=>void};
export function cancellableDelay(milliseconds:number):CancellableDelay;
