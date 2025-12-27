const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Load `.env` (and .env.local)
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

async function main() {
    const directUrl = process.env.DIRECT_URL
    const dbUrl = process.env.DATABASE_URL

    console.log('--- DIRECT CONNECTION TEST ---')
    if (!directUrl) {
        console.log('❌ DIRECT_URL not found in environment.')
        return
    }

    console.log(`Using DIRECT_URL: ${directUrl.substring(0, 15)}... (Masked)`)

    // Override the datasource url via constructor? 
    // Prisma Client constructor accepts `datasources` option.
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: directUrl,
            },
        },
    })

    try {
        console.log('Attempting connection to Port 5432 (Direct)...')
        const start = Date.now()
        await prisma.$connect()
        console.log(`✅ Success! Connected in ${Date.now() - start}ms`)

        const count = await prisma.user.count()
        console.log(`✅ Query Success. User count: ${count}`)

    } catch (e) {
        console.log('❌ Connection Failed:')
        console.log(e.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
