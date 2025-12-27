'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
    id: string
    projectId: string
    changedBy: string
    fieldName: string
    oldValue: string | null
    newValue: string | null
    createdAt: Date
    project: {
        name: string
        projectId: string
    }
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
    if (activities.length === 0) {
        return <div className="text-muted-foreground text-sm p-4">No recent activity.</div>
    }

    return (
        <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-card/30">
            <div className="space-y-4">
                {activities.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0">
                        <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                                {item.changedBy.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm">
                                <span className="font-semibold text-primary">{item.changedBy}</span>
                                <span className="text-muted-foreground"> updated </span>
                                <span className="font-medium text-foreground">{item.fieldName}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.project.projectId} - {item.project.name}
                            </p>
                            <div className="text-xs mt-1 px-2 py-1 bg-secondary/20 rounded font-mono text-muted-foreground break-all">
                                {item.oldValue ? item.oldValue.substring(0, 20) + (item.oldValue.length > 20 ? '...' : '') : 'Empty'}
                                {' -> '}
                                <span className="text-foreground">
                                    {item.newValue ? item.newValue.substring(0, 20) + (item.newValue.length > 20 ? '...' : '') : 'Empty'}
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground pt-1">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
