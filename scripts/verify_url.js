
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUrl() {
    console.log('🔍 Fetching most recent photo URL from DB...');
    const photo = await prisma.sitePhoto.findFirst({
        orderBy: { takenAt: 'desc' }
    });

    if (!photo) {
        console.log('⚠️ No photo found in DB.');
        return;
    }

    console.log(`Checking URL: ${photo.url}`);

    try {
        const res = await fetch(photo.url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log(`Content-Type: ${res.headers.get('content-type')}`);
        console.log(`Content-Length: ${res.headers.get('content-length')}`);

        if (res.ok) {
            console.log('✅ URL is accessible!');
        } else {
            console.error('❌ URL is not accessible.');
        }
    } catch (e) {
        console.error('❌ Fetch failed:', e.message);
    }
}

verifyUrl()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
