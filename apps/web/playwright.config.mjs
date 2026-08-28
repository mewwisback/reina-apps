import {defineConfig} from '@playwright/test';

export default defineConfig({
 testDir:'./tests/arena',
 fullyParallel:false,
 reporter:'line',
 use:{baseURL:'http://127.0.0.1:3000',headless:true},
 webServer:{command:'npm run dev',url:'http://127.0.0.1:3000/arena',reuseExistingServer:true,timeout:120000},
});