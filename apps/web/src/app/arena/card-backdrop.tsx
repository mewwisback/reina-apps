'use client';

import {useEffect,useRef} from 'react';

// Canonical reina-fe: 240 × 1280x720 frames, 24fps, ping-pong playback.
export function CardBackdrop(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas?.getContext('2d');if(!canvas||!ctx)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const frames=new Map<number,ImageBitmap>(),pending=new Map<number,AbortController>();
  let stopped=false,raf=0,frame=0,direction=1,last=0,generation=0;
  const active=()=>!stopped&&!media.matches&&!document.hidden;
  const windowFrames=()=>{const wanted:number[]=[];let i=frame,d=direction;for(let n=0;n<8;n++){wanted.push(i);i+=d;if(i===239||i===0)d*=-1}return wanted};
  const preload=()=>{
   if(!active())return;
   const wanted=windowFrames();
   for(const [i,image] of frames)if(!wanted.includes(i)){image.close();frames.delete(i)}
   for(const i of wanted){
    if(pending.size>=2)break;if(frames.has(i)||pending.has(i))continue;
    const controller=new AbortController(),run=generation;pending.set(i,controller);
    void fetch(`/arena/card-flip/frame-${String(i).padStart(3,'0')}.webp`,{signal:controller.signal})
     .then(response=>{if(!response.ok)throw new Error('Decorative frame unavailable');return response.blob()})
     .then(blob=>createImageBitmap(blob)).then(image=>{
      if(!active()||run!==generation||!windowFrames().includes(i)){image.close();return}frames.set(i,image);
     }).catch(()=>{
      // Failed decoration must never block entry; advance past a missing frame.
      if(active()&&run===generation&&frame===i){frame+=direction;if(frame===239||frame===0)direction*=-1}
     }).finally(()=>{if(pending.get(i)===controller)pending.delete(i)});
   }
  };
  const tick=(now:number)=>{
   if(!active())return;
   if(now-last>=1000/24){const image=frames.get(frame);if(image){ctx.drawImage(image,0,0,1280,720);last=now;frame+=direction;if(frame===239||frame===0)direction*=-1}preload()}
   raf=requestAnimationFrame(tick);
  };
  const stop=()=>{generation++;cancelAnimationFrame(raf);pending.forEach(controller=>controller.abort());pending.clear();frames.forEach(image=>image.close());frames.clear()};
  const sync=()=>{stop();if(media.matches)ctx.clearRect(0,0,1280,720);if(active()){last=0;preload();raf=requestAnimationFrame(tick)}};
  media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
  return()=>{stopped=true;stop();media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
 },[]);
 return <canvas ref={ref} width={1280} height={720} aria-hidden="true"/>;
}
