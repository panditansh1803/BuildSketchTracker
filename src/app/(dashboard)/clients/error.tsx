'use client'
import { PageError } from '@/components/ui/PageError'
export default function ClientsError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return <PageError error={error} reset={reset} title="Unable to Load Clients" />
}
