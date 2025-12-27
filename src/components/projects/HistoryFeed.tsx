import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type HistoryEntry = {
    id: string
    description: string
    date: Date
    userInitials: string
}

export function HistoryFeed({ history }: { history: HistoryEntry[] }) {
    return (
        <div className="space-y-4 h-full flex flex-col">
            <h3 className="font-semibold text-lg">Project History</h3>
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                    {history.map((entry) => (
                        <div key={entry.id} className="flex gap-3 text-sm">
                            <Avatar className="h-8 w-8 mt-0.5">
                                <AvatarFallback className="text-xs">{entry.userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="leading-snug">
                                    {entry.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {entry.date.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
