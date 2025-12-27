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

async function findUser() {
    try {
        await client.connect();
        // Fuzzy search for 'vashistha'
        const res = await client.query(`SELECT id, email, role FROM "User" WHERE email ILIKE '%vashistha%'`);

        console.log('\n--- MATCHED USERS ---');
        if (res.rows.length === 0) {
            console.log('No matches found.');
        } else {
            res.rows.forEach(u => {
                console.log(`ID: ${u.id}`);
                console.log(`Email: ${u.email}`);
                console.log(`Role: ${u.role}`);
                console.log('---');
            });
        }
        await client.end();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

findUser();
