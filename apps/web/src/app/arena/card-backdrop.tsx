'use client';

import {useEffect,useRef} from 'react';

// Canonical frames 0…239…1, 24fps. Native decoding avoids per-frame network stalls.
export function CardBackdrop(){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const video=ref.current;if(!video)return;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>{
   if(media.matches||document.hidden){video.pause();video.hidden=media.matches;return}
   video.hidden=false;
   if(!video.getAttribute('src'))video.src='/arena/card-flip.mp4';
   void video.play().catch(()=>{video.hidden=true});
  };
  const fail=()=>{video.hidden=true};
  media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);video.addEventListener('error',fail);sync();
  return()=>{media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);video.removeEventListener('error',fail);video.pause();video.removeAttribute('src');video.load()};
 },[]);
 return <video ref={ref} width={1280} height={720} muted loop playsInline preload="none" aria-hidden="true"/>;
}
