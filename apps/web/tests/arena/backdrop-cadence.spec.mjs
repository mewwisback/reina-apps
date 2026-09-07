import {expect,test} from '@playwright/test';

for(const slow of [false,true])test(`backdrop sustains canonical cadence (${slow?'cold 4Mbps 100ms':'warm'})`,async({page},testInfo)=>{
 test.setTimeout(60000);
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Network.enable');
 const mediaRequests=new Set();let networkBytes=0;
 cdp.on('Network.responseReceived',e=>{if(e.response.url.includes('/card-flip'))mediaRequests.add(e.requestId)});
 cdp.on('Network.dataReceived',e=>{if(mediaRequests.has(e.requestId))networkBytes+=e.encodedDataLength});
 if(slow){await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:500000,uploadThroughput:500000});}
 await page.addInitScript(()=>{
  window.paintTimes=[];
  const draw=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.closest('.threshold-environment'))window.paintTimes.push(performance.now());return draw.apply(this,args)};
 });
 await page.goto('/arena');
 if(!slow){await page.waitForTimeout(12000);await page.reload();}
 await page.waitForFunction(()=>window.paintTimes.length>0||document.querySelector('.threshold-environment video')?.readyState>=2);
 const result=await page.evaluate(async()=>{
  const video=document.querySelector('.threshold-environment video');
  const times=[];let handle;
  if(video){const frame=(now)=>{times.push(now);handle=video.requestVideoFrameCallback(frame)};handle=video.requestVideoFrameCallback(frame);}
  const start=performance.now();window.paintTimes=[];
  await new Promise(r=>setTimeout(r,8000));
  if(video)video.cancelVideoFrameCallback(handle);else times.push(...window.paintTimes);
  const intervals=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b);
  const quality=video?.getVideoPlaybackQuality();
  return {renderer:video?'video':'canvas',frames:times.length,fps:times.length/((performance.now()-start)/1000),p50:intervals[Math.floor(intervals.length*.5)],p95:intervals[Math.floor(intervals.length*.95)],max:Math.max(...intervals),dropped:quality?.droppedVideoFrames,total:quality?.totalVideoFrames,bytes:performance.getEntriesByType('resource').filter(r=>/card-flip/.test(r.name)).reduce((n,r)=>n+r.transferSize,0)};
 });
 result.networkBytes=networkBytes;
 console.log(JSON.stringify({slow,...result}));
 await testInfo.attach('cadence.json',{body:JSON.stringify({slow,...result},null,2),contentType:'application/json'});
 expect(result.fps).toBeGreaterThan(22);
 expect(result.p95).toBeLessThan(85);
});
