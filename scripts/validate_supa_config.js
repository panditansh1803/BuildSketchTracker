const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
    console.error('.env.local not found');
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Config Validation ---');

if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is Missing');
} else {
    try {
        const urlObj = new URL(url);
        console.log(`✅ URL is a valid format. Host: ${urlObj.hostname}`);
        if (!url.startsWith('https://')) {
            console.warn('⚠️ URL does not start with https://');
        }
    } catch (e) {
        console.error('❌ NEXT_PUBLIC_SUPABASE_URL is invalid:', e.message);
    }
}

if (!key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is Missing');
} else {
    if (key.startsWith('ey')) {
        console.log('✅ Key looks like a JWT (starts with ey...)');
    } else {
        console.warn('⚠️ Key does NOT start with ey... (might be invalid)');
    }
}
