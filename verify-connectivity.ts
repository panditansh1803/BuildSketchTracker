import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

console.log('Environment Debug:')
console.log('DATABASE_URL loaded: ' + (process.env.DATABASE_URL ? 'YES' : 'NO'))
console.log('NEXT_PUBLIC_SUPABASE_URL loaded: ' + (process.env.NEXT_PUBLIC_SUPABASE_URL ? 'YES' : 'NO'))
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY loaded: ' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES' : 'NO'))

async function main() {
    console.log('Starting connectivity verification...')

    // 1. Verify Prisma
    console.log('\n--- Testing Prisma Database Connectivity ---')
    const prisma = new PrismaClient()
    try {
        const start = Date.now()
        await prisma.$connect()
        console.log(`[SUCCESS] Prisma connect successful (${Date.now() - start}ms)`)

        const userCount = await prisma.user.count()
        console.log(`[SUCCESS] Database Query Successful. User count: ${userCount}`)

    } catch (error: any) {
        console.error('[ERROR] Prisma Connection Failed:', error.message)
        if (error.code) console.error('Error Code:', error.code)
    } finally {
        await prisma.$disconnect()
    }

    // 2. Verify Supabase
    console.log('\n--- Testing Supabase Client Connectivity ---')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('[ERROR] Missing Supabase environment variables.')
    } else {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey)

            // Test Auth
            const { error: sessionError } = await supabase.auth.getSession()
            if (sessionError) {
                console.error('[ERROR] Supabase Auth Session Check Failed:', sessionError.message)
            } else {
                console.log('[SUCCESS] Supabase Auth Service Reachable.')
            }

            // Test Data
            const { error: dataError, status } = await supabase.from('Project').select('id').limit(1)

            if (dataError) {
                console.log(`[INFO] Supabase Data API reachable but returned error: [${status}] ${dataError.message}`)
            } else {
                console.log(`[SUCCESS] Supabase Data API Query Successful (Status: ${status}).`)
            }

        } catch (error: any) {
            console.error('[ERROR] Supabase Client Check Failed:', error.message)
            if (error.cause) console.error('Cause:', error.cause)
        }
    }
}

main()
