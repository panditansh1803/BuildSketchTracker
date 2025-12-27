import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
    id: string
    description: string
    date: Date
    userInitials: string
}

export function SiteActivityFeed({ activities }: { activities: ActivityItem[] }) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Site Activity Feed
                    <span className="text-xs font-normal text-muted-foreground ml-auto">Last 5 Updates</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[400px]">
                    <div className="flex flex-col gap-0">
                        {activities.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground text-sm">No recent activity.</div>
                        ) : (
                            activities.map((activity, index) => (
                                <div
                                    key={activity.id}
                                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${index !== activities.length - 1 ? 'border-b' : ''
                                        }`}
                                >
                                    <Avatar className="h-8 w-8 mt-1 border-2 border-background">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {activity.userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none text-foreground">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(activity.date, { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
