const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envLocalPath = path.resolve(process.cwd(), '.env.local');

console.log('Checking .env.local at:', envLocalPath);

if (!fs.existsSync(envLocalPath)) {
    console.error('❌ .env.local file NOT FOUND.');
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
let missing = [];

required.forEach(key => {
    if (!envConfig[key]) {
        missing.push(key);
    } else {
        console.log(`✅ ${key} is present.`);
    }
});

if (missing.length > 0) {
    console.error(`❌ Missing keys in .env.local: ${missing.join(', ')}`);
    process.exit(1);
} else {
    console.log('✅ All required keys present in .env.local');
}
