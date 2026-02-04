
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config();

// Load .env.local if exists
const localEnvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(localEnvPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(localEnvPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing credentials.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'project-assets';

async function setupBucket() {
    console.log(`🔧 Attempting to create bucket: ${BUCKET_NAME}`);

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Failed to list buckets:', listError.message);
        if (listError.message.includes('JWT')) {
            console.error('👉 Hint: You might be using an ANON KEY which cannot list/create buckets. You need the SERVICE_ROLE_KEY.');
        }
        return;
    }

    const exists = buckets.find(b => b.name === BUCKET_NAME);

    if (exists) {
        console.log('✅ Bucket already exists.');
        console.log(`Public: ${exists.public}`);
    } else {
        console.log('⏳ Bucket not found. Creating...');
        const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true
        });

        if (error) {
            console.error('❌ Failed to create bucket:', error.message);
        } else {
            console.log('✅ Bucket created successfully!');
        }
    }
}

setupBucket();
