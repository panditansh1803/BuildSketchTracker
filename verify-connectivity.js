const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')

// Load `.env`
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

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
    log('--- START VERIFICATION ---')

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const dbUrl = process.env.DATABASE_URL || '' // Will be masked in logs if printed, but we just check presence.

    log(`ENV: DATABASE_URL exists? ${!!dbUrl}`)

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
    if (!url || !key) {
        log('  ❌ Missing specific Supabase env vars.')
        errors.push('Supabase Env Error: Missing URL or Key')
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
        log('ALL CHECKS PASSED.')
    }
}

main().catch(e => {
    log('FATAL SCRIPT ERROR: ' + e.message)
    process.exit(1)
})
