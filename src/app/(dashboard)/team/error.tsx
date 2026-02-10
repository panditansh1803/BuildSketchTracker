'use client'
import { PageError } from '@/components/ui/PageError'
export default function TeamError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return <PageError error={error} reset={reset} title="Unable to Load Team" />
}
