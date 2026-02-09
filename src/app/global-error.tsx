'use client'

import React from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="bg-background text-foreground flex items-center justify-center h-screen flex-col gap-4">
                <h2 className="text-2xl font-bold">Something went wrong!</h2>
                <p className="text-muted-foreground max-w-md text-center">
                    {error.message || "A critical error occurred."}
                </p>
                <button
                    className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                    onClick={() => reset()}
                >
                    Try again
                </button>
            </body>
        </html>
    )
}
