'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw, ArrowLeft, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const errorType = searchParams.get('error') || 'unknown'
    const errorMessage = searchParams.get('message') || ''


    const getErrorDetails = () => {
        switch (errorType) {
            case 'exchange_failed':
                return {
                    title: 'Email Confirmation Failed',
                    description: 'We couldn\'t verify your email confirmation link. This can happen if the link has expired or was already used.',
                    suggestions: [
                        'Try signing up again with a new confirmation email',
                        'Check if you\'ve already confirmed your email and try logging in',
                        'Make sure you\'re using the most recent confirmation link'
                    ]
                }
            case 'server_error':
                return {
                    title: 'Server Error',
                    description: 'Our servers encountered an issue while processing your request. This is usually temporary.',
                    suggestions: [
                        'Wait a few minutes and try again',
                        'Clear your browser cache and cookies',
                        'If the problem persists, contact support'
                    ]
                }
            case 'database_paused':
                return {
                    title: 'Service Temporarily Unavailable',
                    description: 'Our database service is currently starting up. This should only take a moment.',
                    suggestions: [
                        'Wait 2-3 minutes and refresh this page',
                        'Try the confirmation link again',
                        'Contact support if this persists for more than 5 minutes'
                    ]
                }

            case 'token_hash_failed':
            case 'pkce_failed':
                return {
                    title: 'Verification Issue',
                    description: 'The verification link could not be processed completely. This often happens if the link was already clicked by an email scanner.',
                    suggestions: [
                        'Your account might already be verified. Please try logging in below.',
                        'If login fails, request a new confirmation email.',
                        'Ensure you are opening the link in the same browser you signed up with.'
                    ]
                }
            default:
                return {
                    title: 'Authentication Error',
                    description: 'Something went wrong during the authentication process.',
                    suggestions: [
                        'Try logging in directly - you might already be verified.',
                        'Try signing up again if you cannot log in.',
                        'Clear your browser cache'
                    ]
                }
        }
    }

    const { title, description, suggestions } = getErrorDetails()

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
                    <CardDescription className="text-zinc-400 mt-2">
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Error message if provided */}
                    {errorMessage && (
                        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                            <p className="font-mono text-xs break-all">{errorMessage}</p>
                        </div>
                    )}


                    {/* Suggestions */}
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400 font-medium">What you can try:</p>
                        <ul className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <span className="text-primary mt-0.5">•</span>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-white text-black hover:bg-zinc-200"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>

                        <Link href="/login" className="w-full">
                            <Button
                                variant="outline"
                                className="w-full border-white/10 text-white hover:bg-white/5"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Button>
                        </Link>

                        <Link href="mailto:support@buildsketch.com" className="w-full">
                            <Button
                                variant="ghost"
                                className="w-full text-zinc-400 hover:text-white hover:bg-white/5"
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    )
}
