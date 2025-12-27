require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

console.log('Testing connection...');

const client = new Client({
    connectionString: connectionString,
});

client.connect()
    .then(() => {
        console.log('SUCCESS: Connected to database with new password!');
        return client.end();
    })
    .catch(err => {
        console.error('CONNECTION FAILED:', err.message);
        process.exit(1);
    });
