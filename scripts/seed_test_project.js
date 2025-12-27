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

const USER_ID = 'cmj8qw9zr000011936bgpwmd2'; // vashisthaansh1803@gmail.com

async function seedProject() {
    try {
        await client.connect();

        const projectId = `TEST-${Math.floor(Math.random() * 1000)}`;

        console.log(`Seeding test project for User: ${USER_ID}`);

        const query = `
            INSERT INTO "Project" (
                id,
                "projectId",
                name,
                "houseType",
                stage,
                "assignedToId",
                "createdById",
                status,
                "startDate",
                "targetFinish",
                "isDelayed",
                "delayDays",
                "percentComplete",
                "updatedAt"
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW() + interval '30 days', false, 0, 10, NOW()
            )
        `;

        await client.query(query, [
            require('crypto').randomUUID(), // id
            projectId,                      // projectId
            'Demo Project Alpha',           // name
            'Single',                       // houseType
            'Project Setup',                // stage
            USER_ID,                        // assignedToId
            USER_ID,                        // createdById
            'On Track'                      // status
        ]);

        console.log('✅ Test project created successfully!');
        await client.end();
    } catch (err) {
        console.error('Error seeding project:', err.message);
        process.exit(1);
    }
}

seedProject();
