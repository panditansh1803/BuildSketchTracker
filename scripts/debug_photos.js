
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

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BUCKET_NAME = 'project-assets';

async function debugPhotos() {
    console.log('🔍 Inspecting photos in bucket:', BUCKET_NAME);

    // List files in 'photos' folder
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list('photos', {
        limit: 10,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
        console.error('❌ Failed to list photos:', error.message);
    } else if (!data || data.length === 0) {
        console.log('⚠️ No photos found in "photos" folder.');
    } else {
        console.log(`✅ Found ${data.length} photos in "photos" folder.`);
        // ... loop ...
        for (const file of data) {
            console.log(`[photos/${file.name}] ${file.metadata.mimetype} ${(file.metadata.size / 1024).toFixed(2)}KB`);
        }
    }

    // List root files just in case
    const { data: rootData } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 10 });
    if (rootData && rootData.length > 0) {
        console.log(`📂 Found ${rootData.length} files in ROOT:`);
        for (const file of rootData) {
            console.log(`[${file.name}] ${file.metadata?.mimetype}`);
        }
    }

    for (const file of data) {
        console.log('---------------------------------------------------');
        console.log(`File: ${file.name}`);
        console.log(`Size: ${(file.metadata.size / 1024).toFixed(2)} KB`);
        console.log(`MIME Type: ${file.metadata.mimetype}`);

        // Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(`photos/${file.name}`);

        console.log(`URL: ${publicUrlData.publicUrl}`);

        if (file.metadata.mimetype === 'application/octet-stream') {
            console.warn('⚠️ WARNING: MIME type is incorrect. Browser might treat this as a download instead of an image.');
        }
    }
}

debugPhotos();
