import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

/**
 * Auth Callback Handler
 * 
 * Handles two types of auth callbacks:
 * 1. PKCE flow (code parameter) - when user opens link in SAME browser as signup
 * 2. Token hash flow (hash fragment) - when user opens link in DIFFERENT browser
 * 
 * For cross-browser email confirmation, we redirect to a client-side handler
 * that can access the hash fragment.
 */
export async function GET(request: Request) {
    const { searchParams, origin, hash } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // Check for error in URL (from Supabase)
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const errorCode = searchParams.get('error_code')

    // Get forwarded host for production environment
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    const getRedirectUrl = (path: string) => {
        if (!isLocalEnv && forwardedHost) {
            return `https://${forwardedHost}${path}`
        }
        return `${origin}${path}`
    }

    // Handle errors passed in URL from Supabase
    if (error) {
        console.error('Auth Callback - Supabase Error:', error, errorCode, errorDescription)

        let errorType = 'exchange_failed'
        if (errorCode === 'otp_expired') {
            errorType = 'link_expired'
        } else if (error === 'access_denied') {
            errorType = 'access_denied'
        }

        const message = encodeURIComponent(errorDescription || error)
        return NextResponse.redirect(
            getRedirectUrl(`/auth/auth-code-error?error=${errorType}&message=${message}`)
        )
    }

    // If no code, redirect to client-side confirm page to handle hash fragment
    // This handles the case where user opens email in different browser
    if (!code) {
        console.log('Auth Callback: No code, redirecting to client-side confirm')
        // Redirect to a client-side page that can handle the hash fragment
        return NextResponse.redirect(getRedirectUrl('/auth/confirm'))
    }

    try {
        const cookieStore = new Map<string, { value: string; options: CookieOptions }>()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        const cookies = request.headers.get('cookie') || ''
                        if (!cookies) return []
                        return cookies.split(';').map(c => {
                            const [key, ...v] = c.split('=')
                            return { name: key.trim(), value: v.join('=') }
                        })
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, { value, options })
                        })
                    },
                },
            }
        )

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError) {
            const response = NextResponse.redirect(getRedirectUrl(next))
            cookieStore.forEach(({ value, options }, name) => {
                response.cookies.set(name, value, options)
            })
            console.log('Auth Callback: Success, redirecting to', next)
            return response
        }

        // Handle PKCE error specifically
        console.error('Auth Exchange Error:', exchangeError.message)

        let errorType = 'exchange_failed'
        let errorMessage = encodeURIComponent(exchangeError.message)

        if (exchangeError.message?.includes('code verifier')) {
            // PKCE error - user is on different browser
            // Redirect to client-side confirm to try token-based auth
            return NextResponse.redirect(getRedirectUrl('/auth/confirm?retry=true'))
        } else if (exchangeError.message?.includes('expired')) {
            errorType = 'link_expired'
        } else if (exchangeError.message?.includes('already')) {
            errorType = 'already_used'
        }

        return NextResponse.redirect(
            getRedirectUrl(`/auth/auth-code-error?error=${errorType}&message=${errorMessage}`)
        )

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Auth Callback - Unexpected Error:', errorMessage)

        const isPaused = errorMessage.includes('Tenant') ||
            errorMessage.includes('user not found') ||
            errorMessage.includes('ECONNREFUSED')

        const errorType = isPaused ? 'database_paused' : 'server_error'

        return NextResponse.redirect(
            getRedirectUrl(`/auth/auth-code-error?error=${errorType}&message=${encodeURIComponent(errorMessage)}`)
        )
    }
}
