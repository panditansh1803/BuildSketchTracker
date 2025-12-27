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

async function seedHistory() {
    try {
        await client.connect();

        // 1. Get User Name and Project ID
        const userRes = await client.query('SELECT name, id FROM "User" WHERE email = $1', [TARGET_EMAIL]);
        const user = userRes.rows[0];
        if (!user) { throw new Error('User not found'); }

        const projRes = await client.query('SELECT id, "projectId" FROM "Project" WHERE "assignedToId" = $1 LIMIT 1', [user.id]);
        const project = projRes.rows[0];

        if (!project) {
            console.error('❌ No project found for user to attach history to.');
            process.exit(1);
        }

        console.log(`Seeding history for ${user.name} on project ${project.projectId}...`);

        const query = `
            INSERT INTO "ProjectHistory" (
                id,
                "projectId",
                "fieldName",
                "oldValue",
                "newValue",
                "changedBy",
                "createdAt"
            ) VALUES (
                $1, $2, $3, $4, $5, $6, NOW()
            )
        `;

        await client.query(query, [
            require('crypto').randomUUID(),
            project.id,
            'status',
            'Pending',
            'On Track',
            user.name
        ]);

        console.log('✅ History record created! User should now appear ONLINE.');
        await client.end();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

seedHistory();
