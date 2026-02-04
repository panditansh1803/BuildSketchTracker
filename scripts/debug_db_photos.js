
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSitePhotos() {
    console.log('🔍 Checking SitePhoto records in DB...');
    const photos = await prisma.sitePhoto.findMany({
        take: 5,
        orderBy: { takenAt: 'desc' }
    });

    if (photos.length === 0) {
        console.log('⚠️ No SitePhoto records found in database.');
    } else {
        console.log(`✅ Found ${photos.length} records.`);
        photos.forEach(p => {
            console.log(`ID: ${p.id}`);
            console.log(`URL: ${p.url}`);
            console.log(`Stage: ${p.stage}`);
            console.log('---');
        });
    }
}

checkSitePhotos()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
