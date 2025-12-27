const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

let env = {};
if (fs.existsSync(envLocalPath)) Object.assign(env, dotenv.parse(fs.readFileSync(envLocalPath)));
if (fs.existsSync(envPath)) Object.assign(env, dotenv.parse(fs.readFileSync(envPath)));

const dbUrl = env.DATABASE_URL;
const directUrl = env.DIRECT_URL;

console.log('--- URL COMPARISON ---');

function parse(u, label) {
    if (!u) {
        console.log(`❌ ${label}: MISSING`);
        return null;
    }
    try {
        // Handle postgres://
        const match = u.match(/@([^:/]+):(\d+)/);
        if (match) {
            console.log(`✅ ${label}: Host=${match[1]}, Port=${match[2]}`);
            return { host: match[1], port: match[2] };
        }
    } catch (e) { }
    console.log(`⚠️ ${label}: Could not parse`);
    return null;
}

const db = parse(dbUrl, 'DATABASE_URL');
const direct = parse(directUrl, 'DIRECT_URL');

if (db && direct) {
    if (db.host !== direct.host) {
        console.log('\n💡 OPPORTUNITY: Hosts are different!');
        console.log(`   Try using DIRECT_URL hostname (${direct.host}) instead of Pooler.`);
    } else {
        console.log('\n⚠️ Hosts are the same. Switching won\'t help DNS/Block.');
        if (db.port !== direct.port) {
            console.log(`   But ports differ (${db.port} vs ${direct.port}). Might help if Port 6543 is blocked.`);
        }
    }
}
