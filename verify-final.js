const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Load `.env.local` which user says contains the right URLs now
dotenv.config({ path: '.env.local', override: true })

async function checkUrl(name, url, isDirect) {
    console.log(`\n--- TESTING ${name} ---`)
    console.log(`URL: ${url ? url.substring(0, 20) + '...' : 'UNDEFINED'}`)

    if (!url) return false;

    // Direct connection usually doesn't need pgbouncer=true, ensure we clean it if testing direct specifically? 
    // Actually user provided DIRECT_URL usually lacks it.

    const client = new PrismaClient({
        datasources: {
            db: { url: url }
        },
        // Log queries to see if we even get that far
        log: ['error']
    })

    try {
        const start = Date.now()
        console.log(`[${name}] Connecting...`)
        await client.$connect()
        console.log(`[${name}] ✅ Connected in ${Date.now() - start}ms`)

        console.log(`[${name}] Querying User table...`)
        try {
            const count = await client.user.count()
            console.log(`[${name}] ✅ Query Success! Count: ${count}`)
        } catch (queryErr) {
            if (queryErr.message.includes('does not exist')) {
                console.log(`[${name}] ✅ Connected, but table missing (Migrations needed).`)
            } else {
                console.error(`[${name}] ⚠️ Query Failed: ${queryErr.message}`)
            }
        }
        return true

    } catch (e) {
        console.error(`[${name}] ❌ Connection Failed:`)
        console.error(e.message)
        return false
    } finally {
        await client.$disconnect()
    }
}

async function main() {
    const dbUrl = process.env.DATABASE_URL
    const directUrl = process.env.DIRECT_URL

    let successDb = await checkUrl('DATABASE_URL (Pooler)', dbUrl)
    let successDirect = await checkUrl('DIRECT_URL (Direct)', directUrl)

    console.log('\n--- SUMMARY ---')
    console.log(`Pooler: ${successDb ? 'PASSED' : 'FAILED'}`)
    console.log(`Direct: ${successDirect ? 'PASSED' : 'FAILED'}`)

    if (successDirect && !successDb) {
        console.log('Suggestion: Use DIRECT_URL for migrations, check port 6543 firewall for Pooler.')
    }
}

main()
