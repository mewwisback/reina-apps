import {defineConfig} from '@playwright/test';

export default defineConfig({
 testDir:'./tests/arena',
 fullyParallel:false,
 reporter:'line',
 // Cadence needs an idle renderer; run after functional workers have exited.
 projects:[{name:'functional',testIgnore:'**/backdrop-cadence.spec.mjs'},{name:'cadence',testMatch:'**/backdrop-cadence.spec.mjs',dependencies:['functional']}],
 use:{baseURL:process.env.ENTRY_BASE_URL||'http://127.0.0.1:3000',headless:true},
 webServer:{command:'npm run dev',url:'http://127.0.0.1:3000/arena',reuseExistingServer:true,timeout:120000},
});