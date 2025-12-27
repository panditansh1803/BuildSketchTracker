const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    process.exit(1);
}

// Read raw content to preserve comments/structure if possible, 
// but dotenv.parse is safer for logic.
// We will just replace the DATABASE_URL line using regex to be least destructive.

let content = fs.readFileSync(envPath, 'utf8');
const envConfig = dotenv.parse(content);
const directUrl = envConfig.DIRECT_URL;

if (!directUrl) {
    console.error('❌ DIRECT_URL not found in .env');
    process.exit(1);
}

// Regex to replace DATABASE_URL=... with DATABASE_URL=<directUrl>
// Handles quoted or unquoted values.
const regex = /^DATABASE_URL=(.*)$/m;

if (regex.test(content)) {
    const newContent = content.replace(regex, `DATABASE_URL="${directUrl}"`);
    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('✅ Updated DATABASE_URL in .env');
} else {
    // If not found (weird?), append it? No, safer to fail.
    console.error('❌ Could not find DATABASE_URL line in .env to replace.');
    process.exit(1);
}
