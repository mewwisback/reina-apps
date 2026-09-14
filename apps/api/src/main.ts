import {buildApp} from './app.js';
const app=buildApp();
try{await app.listen({host:'127.0.0.1',port:3100});console.log('REINA API listening on localhost:3100');}
catch{console.error('API startup failed');process.exitCode=1;}
for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>{void app.close();});
