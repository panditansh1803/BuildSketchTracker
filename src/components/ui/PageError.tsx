'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export function PageError({
    error,
    reset,
    title = 'Something went wrong',
    backHref = '/dashboard',
    backLabel = 'Dashboard',
}: {
    error: Error & { digest?: string }
    reset: () => void
    title?: string
    backHref?: string
    backLabel?: string
}) {
    useEffect(() => {
        console.error('Page error:', error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        An unexpected error occurred. Please try again.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground text-center">
                            Error ID: {error.digest}
                        </p>
                    )}
                    <div className="flex gap-2 justify-center pt-4">
                        <Button onClick={reset} variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Link href={backHref}>
                            <Button variant="default" className="gap-2">
                                <Home className="h-4 w-4" />
                                {backLabel}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
