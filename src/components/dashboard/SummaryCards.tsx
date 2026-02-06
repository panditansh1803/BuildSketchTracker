import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react'

type SummaryStats = {
    active: number
    delayed: number
    completed: number
    avgProgress: number
    totalClients?: number
}

export function SummaryCards({ stats }: { stats: SummaryStats }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Active Projects</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Delayed Projects</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">{stats.delayed}</div>
                </CardContent>
            </Card>
            {stats.totalClients !== undefined && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{stats.totalClients}</div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
