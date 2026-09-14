import Fastify from 'fastify';
export function buildApp(){
 const app=Fastify({logger:false,bodyLimit:65536});
 app.get('/health',async()=>({status:'ok',databaseReady:false}));
 return app;
}
