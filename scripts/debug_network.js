const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log('--- Network Connectivity Test ---');
console.log('Target:', url);

if (!url) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
}

// 1. Test via HTTPS module (Node native)
console.log('\n[1] Testing Native HTTPS Request...');
https.get(url, (res) => {
    console.log(`✅ HTTPS Status: ${res.statusCode}`);
    console.log(`✅ Headers received: ${JSON.stringify(res.headers['content-type'])}`);
    res.resume();
}).on('error', (e) => {
    console.error(`❌ HTTPS Error: ${e.message}`);
    if (e.cause) console.error('   Cause:', e.cause);
});

// 2. Test via Fetch (Node 18+)
console.log('\n[2] Testing global fetch()...');
fetch(url)
    .then(res => {
        console.log(`✅ Fetch Status: ${res.status} ${res.statusText}`);
        return res.text();
    })
    .then(txt => {
        console.log(`✅ Fetch Body Length: ${txt.length} chars`);
    })
    .catch(e => {
        console.error(`❌ Fetch Failed: ${e.message}`);
        if (e.cause) console.error('   Cause:', e.cause);
    });
