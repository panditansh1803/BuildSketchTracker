import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    const supabase = await createClient()

    // 1. Prefer Token Hash (Stateless, works cross-browser/device)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url))
        }
        console.error('Auth Confirm: Token Hash verification failed:', error.message)
        return NextResponse.redirect(new URL(`/auth/auth-code-error?error=token_hash_failed&message=${encodeURIComponent(error.message)}`, request.url))
    }

    // 2. Fallback to PKCE Code (Stateful, requires same browser cookie)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url))
        }
        console.error('Auth Confirm: PKCE Code exchange failed:', error.message)
        return NextResponse.redirect(new URL(`/auth/auth-code-error?error=pkce_failed&message=${encodeURIComponent(error.message)}`, request.url))
    }

    // 3. If everything fails, redirect to error page
    return NextResponse.redirect(new URL(`/auth/auth-code-error?error=verification_failed&message=${encodeURIComponent('Verification failed. Please try logging in directly.')}`, request.url))
}
