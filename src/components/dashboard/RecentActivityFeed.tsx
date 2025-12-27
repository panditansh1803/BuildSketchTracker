import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Activity = {
    id: string
    projectId: string
    projectName: string
    description: string
    date: Date
    userInitials: string
}

export function RecentActivityFeed({ activities }: { activities: Activity[] }) {
    return (
        <Card className="col-span-full md:col-span-3">
            <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{activity.userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    <span className="font-bold">{activity.projectId}</span> {activity.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.projectName} • {activity.date.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
