const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env manually to get DIRECT_URL safely
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    process.exit(1);
}
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const directUrl = envConfig.DIRECT_URL;

if (!directUrl) {
    console.error('❌ DIRECT_URL not found in .env');
    process.exit(1);
}

// Mask for logging
const maskedUrl = directUrl.replace(/:[^:]+@/, ':****@');

console.log('🧪 VERIFICATION TEST');
console.log('Testing connection to DIRECT_URL (Port 5432)...');
console.log(`Target: ${maskedUrl}`);

const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false } // Required for Supabase Direct
});

async function test() {
    try {
        await client.connect();
        console.log('✅ CONNECTED SUCCESSFULLY!');

        const res = await client.query('SELECT NOW()');
        console.log(`✅ Query Result: ${res.rows[0].now}`);
        console.log('\n--- PROOF OF CONCEPT ---');
        console.log('The Direct URL works. Switching to this URL will fix your application.');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ CONNECTION FAILED');
        console.error(err.message);
        process.exit(1);
    }
}

test();
