'use client'
import { PageError } from '@/components/ui/PageError'
export default function SettingsError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return <PageError error={error} reset={reset} title="Unable to Load Settings" />
}
