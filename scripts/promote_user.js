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

const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error('❌ Please provide an email address.');
    console.log('Usage: node scripts/promote_user.js <email>');
    process.exit(1);
}

async function promoteUser() {
    try {
        await client.connect();

        console.log(`Checking user: ${targetEmail}...`);
        const checkRes = await client.query('SELECT id, name, role FROM "User" WHERE email = $1', [targetEmail]);

        if (checkRes.rows.length === 0) {
            console.error('❌ User not found in database.');
            console.log('Ensure they have logged in at least once.');
            process.exit(1);
        }

        const user = checkRes.rows[0];
        console.log(`Found: ${user.name} (Role: ${user.role})`);

        if (user.role === 'ADMIN') {
            console.log('ℹ️ User is already an ADMIN.');
            process.exit(0);
        }

        console.log(`Promoting to ADMIN...`);
        await client.query('UPDATE "User" SET role = $1 WHERE email = $2', ['ADMIN', targetEmail]);

        console.log(`✅ Success! ${user.name} (${targetEmail}) is now an Administrator/CEO.`);
        await client.end();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

promoteUser();
