const dns = require('dns');
const net = require('net');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envLocalPath)) {
    env = dotenv.parse(fs.readFileSync(envLocalPath));
} else {
    console.error('❌ .env.local NOT FOUND');
    process.exit(1);
}

const DB_URL = env.DATABASE_URL;
const SUPA_URL = env.NEXT_PUBLIC_SUPABASE_URL;

async function checkDNS(domain, label) {
    if (!domain) return { success: false, msg: 'Missing URL' };
    try {
        console.log(`\n🔍 [DNS] Checking ${label} (${domain})...`);
        const ips = await resolve4(domain);
        console.log(`   ✅ Resolved: ${ips[0]}`);
        return { success: true, ip: ips[0] };
    } catch (e) {
        console.log(`   ❌ DNS FAILED: ${e.code}`);
        return { success: false, msg: e.code };
    }
}

async function checkTCP(host, port, label) {
    if (!host || !port) return;
    console.log(`\n🔌 [TCP] Connecting to ${label} (${host}:${port})...`);
    return new Promise(resolve => {
        const socket = new net.Socket();
        socket.setTimeout(5000);

        socket.connect(port, host, () => {
            console.log(`   ✅ Connected! Port is open.`);
            socket.destroy();
            resolve(true);
        });

        socket.on('error', (err) => {
            console.log(`   ❌ Connection Refused/Timed Out: ${err.message}`);
            resolve(false);
        });

        socket.on('timeout', () => {
            console.log(`   ❌ Timeout (Firewall blocked?)`);
            socket.destroy();
            resolve(false);
        });
    });
}

async function runDoctor() {
    console.log('👨‍⚕️ -- BUILD SKETCH TRACKER DOCTOR -- 👨‍⚕️\n');
    let issues = 0;

    // 1. Auth Endpoint
    if (SUPA_URL) {
        try {
            const authHost = new URL(SUPA_URL).hostname;
            const dnsAuth = await checkDNS(authHost, 'Supabase Auth');
            if (!dnsAuth.success) issues++;

            // Should test HTTPS but node fetch/https previously failed. 
            // Stick to DNS/TCP for network layer diagnosis.
        } catch (e) {
            console.log('   ❌ Invalid Auth URL');
            issues++;
        }
    } else {
        console.log('❌ NEXT_PUBLIC_SUPABASE_URL missing');
        issues++;
    }

    // 2. Database Endpoint
    if (DB_URL) {
        // Extract host and port
        // postgres://user:pass@host:port/db?params
        const match = DB_URL.match(/@([^:/]+):(\d+)/);
        if (match) {
            const dbHost = match[1];
            const dbPort = parseInt(match[2]);

            const dnsDb = await checkDNS(dbHost, 'Supabase Database');
            if (!dnsDb.success) issues++;
            else {
                // Only try TCP if DNS resolved
                const tcpDb = await checkTCP(dbHost, dbPort, 'Database Port');
                if (!tcpDb) issues++;
            }
        } else {
            console.log('   ⚠️ Could not parse Host/Port from DATABASE_URL');
        }
    } else {
        console.log('❌ DATABASE_URL missing');
        issues++;
    }

    console.log('\n--- DIAGNOSIS REPORT ---');
    if (issues === 0) {
        console.log('✅ CLEAN BILL OF HEALTH. System appears connected.');
        console.log('   If app fails, check Application Code/Logic.');
    } else {
        console.log(`❌ FOUND ${issues} CRITICAL NETWORK ISSUES.`);
        console.log('   This confirms a System/Network level failure.');
    }
}

runDoctor();
