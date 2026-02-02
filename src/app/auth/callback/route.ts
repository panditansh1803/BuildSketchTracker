import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL. Default to dashboard.
    const next = searchParams.get('next') ?? '/dashboard'

    // Get forwarded host for production environment
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    const getRedirectUrl = (path: string) => {
        if (!isLocalEnv && forwardedHost) {
            return `https://${forwardedHost}${path}`
        }
        return `${origin}${path}`
    }

    if (!code) {
        console.error('Auth Callback: No code provided')
        return NextResponse.redirect(
            getRedirectUrl('/auth/auth-code-error?error=no_code&message=No+authorization+code+provided')
        )
    }

    try {
        const cookieStore = new Map<string, { value: string; options: CookieOptions }>()

        // Create a temporary client to exchange the code
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

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Success! Create response with redirect
            const response = NextResponse.redirect(getRedirectUrl(next))

            // Apply cookies to response
            cookieStore.forEach(({ value, options }, name) => {
                response.cookies.set(name, value, options)
            })

            console.log('Auth Callback: Successfully exchanged code, redirecting to', next)
            return response
        }

        // Handle Supabase-specific errors
        console.error('Auth Exchange Error:', error.message, error.status)

        let errorType = 'exchange_failed'
        let errorMessage = encodeURIComponent(error.message)

        if (error.message?.includes('expired')) {
            errorType = 'link_expired'
        } else if (error.message?.includes('already')) {
            errorType = 'already_used'
        }

        return NextResponse.redirect(
            getRedirectUrl(`/auth/auth-code-error?error=${errorType}&message=${errorMessage}`)
        )

    } catch (err: unknown) {
        // Handle unexpected errors (network issues, Supabase paused, etc.)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Auth Callback - Unexpected Error:', errorMessage)

        // Check if this is a Supabase pause error
        const isPaused = errorMessage.includes('Tenant') ||
            errorMessage.includes('user not found') ||
            errorMessage.includes('ECONNREFUSED') ||
            errorMessage.includes('fetch failed')

        const errorType = isPaused ? 'database_paused' : 'server_error'

        return NextResponse.redirect(
            getRedirectUrl(`/auth/auth-code-error?error=${errorType}&message=${encodeURIComponent(errorMessage)}`)
        )
    }
}

