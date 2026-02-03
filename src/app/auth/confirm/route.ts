import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const supabase = await createClient()

    // This is a Route Handler, so cookieStore.set() inside createClient WILL work
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error("Auth confirmation error:", error)
        return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
    }

    return NextResponse.redirect(new URL(next, request.url))
}
