'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { clockIn, clockOut } from '@/app/actions/time-tracking'
import { useRouter } from 'next/navigation'

interface UserStat {
    name: string
    minutes: number
}

interface ProjectTimeTrackerProps {
    projectId: string
    totalMinutes: number
    valuableMinutes?: number // "Active working time" vs "Delay/Idle" if we distinguish
    userStats: UserStat[]
    hasActiveSession: boolean
}

export function ProjectTimeTracker({ projectId, totalMinutes, userStats, hasActiveSession }: ProjectTimeTrackerProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const formatTime = (totalMins: number) => {
        const h = Math.floor(totalMins / 60)
        const m = totalMins % 60
        return `${h}h ${m}m`
    }

    const handleStart = async () => {
        setLoading(true)
        try {
            await clockIn(projectId)
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePause = async () => {
        setLoading(true)
        try {
            await clockOut('Pause')
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleStop = async () => {
        const desc = prompt('End session? Enter generic description (optional):', 'Standard Work')
        if (desc === null) return

        setLoading(true)
        try {
            await clockOut(desc || 'Standard Work')
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Time Tracking
                        </h3>
                        <p className="text-2xl font-bold mt-1">{formatTime(totalMinutes)}</p>
                        <p className="text-xs text-muted-foreground">Total Project Time</p>
                    </div>
                    <div className="flex gap-2">
                        {hasActiveSession ? (
                            <>
                                <Button size="sm" variant="secondary" onClick={handlePause} disabled={loading}>
                                    <Pause className="h-4 w-4 mr-1" /> Pause
                                </Button>
                                <Button size="sm" variant="destructive" onClick={handleStop} disabled={loading}>
                                    <Square className="h-4 w-4 mr-1" /> Stop
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" onClick={handleStart} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                <Play className="h-4 w-4 mr-1" /> Start Work
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contributor Breakdown</h4>
                    {userStats.length === 0 && <p className="text-sm text-muted-foreground">No time logged yet.</p>}
                    {userStats.map((stat) => (
                        <div key={stat.name} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                                {stat.name}
                            </span>
                            <span className="font-mono text-muted-foreground">{formatTime(stat.minutes)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
