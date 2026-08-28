export const cancellableDelay=(milliseconds)=>{
 let timer,settled=false,resolvePromise;
 const promise=new Promise(resolve=>{resolvePromise=resolve;timer=setTimeout(()=>{settled=true;resolve(true)},milliseconds)});
 return{promise,cancel(){if(settled)return;settled=true;clearTimeout(timer);resolvePromise(false)}};
};
