'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface EmployeeStats {
    id: string
    name: string
    role: string
    email: string
    activeProjects: number
    completedProjects: number
    slaBreaches: number
    lastActiveAt: Date | null
}

export function EmployeeCard({ stats }: { stats: EmployeeStats }) {
    // Status Logic: "Active" if seen in last 15 minutes
    const isActive = stats.lastActiveAt
        ? (new Date().getTime() - new Date(stats.lastActiveAt).getTime()) < 15 * 60 * 1000
        : false

    return (
        <Card className="hover:bg-accent/5 transition-colors border-l-4" style={{
            borderLeftColor: stats.slaBreaches > 0 ? 'var(--destructive)' : 'var(--primary)'
        }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${stats.name}`} />
                        <AvatarFallback>{stats.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <CardTitle className="text-base font-bold">{stats.name}</CardTitle>
                        <span className="text-xs text-muted-foreground">{stats.role}</span>
                    </div>
                </div>
                {isActive ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Online
                    </Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {stats.lastActiveAt ? formatDistanceToNow(new Date(stats.lastActiveAt), { addSuffix: true }) : 'Offline'}
                    </span>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="flex flex-col items-center p-2 rounded-md bg-secondary/30">
                        <span className="text-2xl font-bold text-primary">{stats.activeProjects}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-md bg-secondary/30">
                        <span className="text-2xl font-bold text-foreground">{stats.completedProjects}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Done</span>
                    </div>
                    <div className={
                        `flex flex-col items-center p-2 rounded-md ${stats.slaBreaches > 0 ? 'bg-destructive/10' : 'bg-secondary/30'}`
                    }>
                        <span className={`text-2xl font-bold ${stats.slaBreaches > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {stats.slaBreaches}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            Breaches
                            {stats.slaBreaches > 0 && <AlertCircle className="h-3 w-3 text-destructive" />}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
