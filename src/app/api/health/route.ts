import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Health Check API Endpoint
 * 
 * This endpoint is called by GitHub Actions every 6 hours to:
 * 1. Keep the Supabase project active (prevents pausing)
 * 2. Monitor database connectivity
 * 3. Provide health status for monitoring tools
 */
export async function GET() {
    const startTime = Date.now()

    try {
        // Perform a simple query to keep the database active
        // This resets the Supabase inactivity timer
        await prisma.$queryRaw`SELECT 1 as ping`

        const responseTime = Date.now() - startTime

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            responseTimeMs: responseTime,
            message: 'Database connection successful - Supabase stay-alive ping'
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
            }
        })
    } catch (error: unknown) {
        const responseTime = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        console.error('Health check failed:', errorMessage)

        // Check for specific Supabase pause error
        const isPaused = errorMessage.includes('Tenant') ||
            errorMessage.includes('user not found') ||
            errorMessage.includes('ECONNREFUSED')

        return NextResponse.json({
            status: 'unhealthy',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
            responseTimeMs: responseTime,
            error: errorMessage,
            isPaused: isPaused,
            message: isPaused
                ? 'Supabase project may be paused - visit dashboard to resume'
                : 'Database connection failed'
        }, {
            status: 503,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            }
        })
    }
}
