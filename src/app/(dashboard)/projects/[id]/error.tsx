'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ProjectError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log to console for debugging (will show in Vercel logs)
        console.error('Project page error:', error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle>Unable to Load Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        There was an error loading this project. This could be due to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>The project may have been deleted</li>
                        <li>You may not have permission to view it</li>
                        <li>A temporary database connection issue</li>
                    </ul>

                    {error.digest && (
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Error ID: {error.digest}
                        </p>
                    )}

                    <div className="flex gap-2 justify-center pt-4">
                        <Button onClick={reset} variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Link href="/projects">
                            <Button variant="default" className="gap-2">
                                <Home className="h-4 w-4" />
                                All Projects
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
