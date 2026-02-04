
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config();
// Load .env.local if exists (override)
const localEnvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(localEnvPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(localEnvPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const BUCKET_NAME = 'project-assets';

async function testStorage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env');
        console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
        console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Testing Supabase Storage Connection...');
    console.log(`Target Bucket: ${BUCKET_NAME}`);

    // List files in bucket as a test
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list();

    if (error) {
        console.error('❌ Storage Connection Failed:', error.message);
        if (error.message.includes('Bucket not found')) {
            console.error('👉 Hint: Check if bucket "project-assets" exists in your Supabase dashboard.');
        }
    } else {
        console.log('✅ Storage Connection Successful!');
        console.log(`Found ${data.length} files in bucket.`);
    }
}

testStorage();
