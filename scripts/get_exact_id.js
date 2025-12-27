const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const connectionString = envConfig.DATABASE_URL;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const TARGET_EMAIL = 'vashisthaansh1803@gmail.com';

async function getID() {
    try {
        await client.connect();
        const res = await client.query('SELECT id FROM "User" WHERE email = $1', [TARGET_EMAIL]);
        if (res.rows.length === 0) {
            console.error('❌ User not found');
        } else {
            console.log(`✅ ID: ${res.rows[0].id}`);
        }
        await client.end();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

getID();
