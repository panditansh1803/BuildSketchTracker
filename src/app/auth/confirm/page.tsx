'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Client-side auth confirmation page
 * 
 * This page handles email confirmation when the user opens the link
 * in a different browser than where they signed up.
 * 
 * It extracts tokens from the URL hash fragment (which is only accessible client-side)
 * and completes the authentication.
 */
export default function AuthConfirmPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // Check URL hash for tokens (Supabase magic link format)
                const hash = window.location.hash

                if (hash) {
                    // Parse hash fragment for access_token and refresh_token
                    const params = new URLSearchParams(hash.substring(1))
                    const accessToken = params.get('access_token')
                    const refreshToken = params.get('refresh_token')
                    const error = params.get('error')
                    const errorDescription = params.get('error_description')

                    if (error) {
                        console.error('Auth error from hash:', error, errorDescription)
                        setErrorMessage(errorDescription || error)
                        setStatus('error')
                        return
                    }

                    if (accessToken && refreshToken) {
                        // Set the session manually
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        })

                        if (sessionError) {
                            console.error('Session error:', sessionError)
                            setErrorMessage(sessionError.message)
                            setStatus('error')
                            return
                        }

                        setStatus('success')
                        // Redirect to dashboard after a brief success message
                        setTimeout(() => {
                            router.push('/dashboard')
                            router.refresh()
                        }, 1500)
                        return
                    }
                }

                // No hash tokens - check if there's a code in the search params
                const urlParams = new URLSearchParams(window.location.search)
                const code = urlParams.get('code')

                if (code) {
                    // Try to exchange the code (might fail if cross-browser)
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

                    if (exchangeError) {
                        console.error('Code exchange error:', exchangeError)
                        setErrorMessage(exchangeError.message)
                        setStatus('error')
                        return
                    }

                    setStatus('success')
                    setTimeout(() => {
                        router.push('/dashboard')
                        router.refresh()
                    }, 1500)
                    return
                }

                // Check if user is already logged in
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setStatus('success')
                    setTimeout(() => {
                        router.push('/dashboard')
                        router.refresh()
                    }, 1500)
                    return
                }

                // No tokens, no code, not logged in - show error
                setErrorMessage('No authentication data found. Please try signing up again.')
                setStatus('error')

            } catch (err) {
                console.error('Auth confirmation error:', err)
                setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred')
                setStatus('error')
            }
        }

        handleAuth()
    }, [router, supabase.auth])

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    {status === 'loading' && (
                        <>
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">Confirming Email</CardTitle>
                            <CardDescription className="text-zinc-400 mt-2">
                                Please wait while we verify your email...
                            </CardDescription>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">Email Confirmed!</CardTitle>
                            <CardDescription className="text-zinc-400 mt-2">
                                Redirecting you to the dashboard...
                            </CardDescription>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-red-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">Confirmation Failed</CardTitle>
                            <CardDescription className="text-zinc-400 mt-2">
                                We couldn't confirm your email
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                {status === 'error' && (
                    <CardContent className="space-y-4">
                        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                            {errorMessage}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/login" className="w-full">
                                <Button className="w-full bg-white text-black hover:bg-zinc-200">
                                    Try Signing Up Again
                                </Button>
                            </Link>

                            <Link href="/login" className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full border-white/10 text-white hover:bg-white/5"
                                >
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
