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

async function checkProjects() {
    try {
        await client.connect();
        // Check projects and their assignments
        const res = await client.query(`
            SELECT 
                p.id, 
                p.name, 
                p.status, 
                p."assignedToId", 
                u.name as "assignedUserName",
                u.email as "assignedUserEmail",
                p."createdById"
            FROM "Project" p
            LEFT JOIN "User" u ON p."assignedToId" = u.id
        `);

        console.log('\n--- PROJECTS & ASSIGNMENTS ---');
        if (res.rows.length === 0) {
            console.log('No projects found in database.');
        } else {
            console.table(res.rows);
        }
        await client.end();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

checkProjects();
