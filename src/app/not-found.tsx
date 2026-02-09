import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-muted/10">
            <div className="rounded-full bg-accent p-4">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground">Could not find requested resource</p>
            <Link
                href="/dashboard"
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
                Return to Dashboard
            </Link>
        </div>
    )
}
