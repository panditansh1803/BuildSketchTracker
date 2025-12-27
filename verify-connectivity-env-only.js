const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')

// ONLY Load .env (ignore .env.local for this test)
dotenv.config({ path: '.env', override: true })

const prisma = new PrismaClient()
const logFile = 'connectivity-results.txt'

function log(msg) {
    console.log(msg)
    fs.appendFileSync(logFile, msg + '\n')
}

// Clear log file
if (fs.existsSync(logFile)) fs.unlinkSync(logFile)

async function main() {
    let errors = []
    log('--- START VERIFICATION (IGNORING .env.local) ---')

    const dbUrl = process.env.DATABASE_URL || ''
    log(`ENV: DATABASE_URL loaded? ${!!dbUrl}`)
    // Check if it looks like postgres
    if (dbUrl.startsWith('postgres')) {
        log(`ENV: Protocol seems correct (postgres...)`)
    } else {
        log(`ENV: Protocol might be wrong: ${dbUrl.substring(0, 10)}...`)
    }

    // 1. Prisma
    log('\n[1] Testing Prisma...')
    try {
        await prisma.$connect()
        log('  ✅ Prisma connected.')
        const count = await prisma.user.count()
        log(`  ✅ User count: ${count}`)
    } catch (e) {
        log('  ❌ Prisma connection failed.')
        errors.push('Prisma Error: ' + e.message)
    } finally {
        await prisma.$disconnect()
    }

    // 2. Supabase
    log('\n[2] Testing Supabase Client...')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        log('  ❌ Missing Supabase env vars in .env')
        errors.push('Supabase Env Error')
    } else {
        try {
            const supabase = createClient(url, key)
            const { error } = await supabase.auth.getSession()
            if (error) {
                log('  ❌ Supabase Auth check failed: ' + error.message)
                errors.push('Supabase Auth Error: ' + error.message)
            } else {
                log('  ✅ Supabase Auth check successful.')
            }
        } catch (e) {
            log('  ❌ Supabase Client crash.')
            errors.push('Supabase Client Crash: ' + e.message)
        }
    }

    log('\n--- VERIFICATION SUMMARY ---')
    if (errors.length > 0) {
        log('ERRORS FOUND:')
        errors.forEach(e => log(' - ' + e))
        process.exit(1)
    } else {
        log('ALL CHECKS PASSED with .env')
    }
}

main().catch(e => {
    log('FATAL SCRIPT ERROR: ' + e.message)
    process.exit(1)
})
