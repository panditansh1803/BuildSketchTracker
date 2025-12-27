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

async function diagnose() {
    try {
        await client.connect();
        console.log('--- DIAGNOSTIC RUN ---');

        // 1. Get User
        const userRes = await client.query('SELECT id, name, email FROM "User" WHERE email = $1', [TARGET_EMAIL]);
        const user = userRes.rows[0];

        if (!user) {
            console.error('User not found!');
            process.exit(1);
        }
        console.log(`User: ${user.name} (${user.id})`);

        // 2. Count Assigned Projects (Mimic filter)
        const projRes = await client.query('SELECT id, status FROM "Project" WHERE "assignedToId" = $1', [user.id]);
        const projects = projRes.rows;

        const active = projects.filter(p => p.status !== 'Completed').length;
        console.log(`\nFiltered Stats:`);
        console.log(`Total Assigned: ${projects.length}`);
        console.log(`Active Count (status != 'Completed'): ${active}`);
        console.log(`Project Details:`);
        console.table(projects);

        // 3. Check History (For Online/Offline status)
        const histRes = await client.query('SELECT * FROM "ProjectHistory" WHERE "changedBy" = $1 ORDER BY "createdAt" DESC LIMIT 1', [user.name]);
        console.log(`\nHistory Check (for Offline status):`);
        if (histRes.rows.length === 0) {
            console.log('❌ No History Found (User will appear OFFLINE)');
        } else {
            console.log(`✅ Last Activity: ${histRes.rows[0].createdAt}`);
        }

        await client.end();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

diagnose();
