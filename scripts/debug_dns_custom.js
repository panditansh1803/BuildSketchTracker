const dns = require('dns');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars to get hostname
const envLocalPath = path.resolve(process.cwd(), '.env.local');
let hostname = 'supabase.co'; // Fallback

if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
    if (url) {
        try {
            hostname = new URL(url).hostname;
        } catch (e) { }
    }
}

async function testWithCustomDNS() {
    console.log(`--- DNS BYPASS TEST ---`);
    console.log(`Target Host: ${hostname}`);

    try {
        // Force Node to use Google DNS
        console.log(`\n[1] Setting DNS servers to Google (8.8.8.8)...`);
        dns.setServers(['8.8.8.8']);

        console.log(`[2] Resolving ${hostname}...`);
        const addresses = await resolve4(hostname);

        console.log(`\n✅ SUCCESS! Google DNS found address: ${addresses[0]}`);
        console.log(`\nCONCLUSION: Your default Internet DNS is corrupt or blocked.`);
        console.log(`FIX: Change your Network Adapter DNS settings to 8.8.8.8`);

    } catch (err) {
        console.log(`\n❌ FAILED even with Google DNS.`);
        console.log(`Error: ${err.code}`);
        console.log(`\nCONCLUSION: Something is blocking ALL DNS lookups or Firewall is active.`);
    }
}

testWithCustomDNS();
