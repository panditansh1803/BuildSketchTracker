import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL. Default to dashboard.
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = new Map<string, { value: string; options: CookieOptions }>()

        // Create a temporary client to exchange the code
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        // In a route handler, we parse the request cookies manually
                        // We'll trust the request cookies for the exchange
                        // But for SSR exchange, we mostly need to just set them on the response.
                        const cookies = request.headers.get('cookie') || ''
                        // prevent crash on empty cookies
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
            // Create response with redirect
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            let redirectUrl = `${origin}${next}`
            if (!isLocalEnv && forwardedHost) {
                redirectUrl = `https://${forwardedHost}${next}`
            }

            const response = NextResponse.redirect(redirectUrl)

            // Apply cookies to response
            cookieStore.forEach(({ value, options }, name) => {
                response.cookies.set(name, value, options)
            })

            return response
        } else {
            console.error('Auth Exchange Error:', error)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
