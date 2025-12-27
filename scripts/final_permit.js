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

async function forceAdmin() {
    try {
        await client.connect();

        console.log(`Updating ${TARGET_EMAIL} to ADMIN...`);
        const res = await client.query('UPDATE "User" SET role = $1 WHERE email = $2', ['ADMIN', TARGET_EMAIL]);

        if (res.rowCount > 0) {
            console.log(`✅ Success! Updated ${res.rowCount} user(s).`);
        } else {
            console.log('❌ No user found to update. (Is the email exact?)');
        }

        await client.end();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

forceAdmin();
