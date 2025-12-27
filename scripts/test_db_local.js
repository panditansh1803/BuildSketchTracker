const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
    console.error('.env.local not found');
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
const connectionString = envConfig.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

// Mask password for log
const masked = connectionString.replace(/:[^:]+@/, ':****@');
console.log('Testing DB connection to:', masked);

const client = new Client({ connectionString });
client.connect()
    .then(() => {
        console.log('✅ Connection Success!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });
