'use client'

import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getAllWorkLogs } from '@/app/actions/time-tracking'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Users, Calendar, Download } from 'lucide-react'
import { convertToCSV } from '@/lib/utils'

interface WorkLog {
    id: string
    user: { name: string; email: string }
    project: { projectId: string; name: string } | null
    startTime: Date
    endTime: Date | null
    duration: number | null
    description: string | null
}

export function UserWorkLog() {
    const [logs, setLogs] = useState<WorkLog[]>([])
    const [filter, setFilter] = useState('')
    const [stats, setStats] = useState({ totalHours: 0, activeNow: 0, uniqueUsers: 0 })

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await getAllWorkLogs();
            // Convert string dates back to Date objects if needed (server actions serialize dates)
            // But Prisma usually handles this. Let's ensure types.
            setLogs(data as any); // Casting for safety with serialized dates
            calculateStats(data as any);
        }
        fetchLogs()
    }, [])

    const calculateStats = (data: WorkLog[]) => {
        const totalMinutes = data.reduce((acc, log) => acc + (log.duration || 0), 0)
        const active = data.filter(l => !l.endTime).length
        const unique = new Set(data.map(l => l.user.email)).size

        setStats({
            totalHours: Math.round(totalMinutes / 60),
            activeNow: active,
            uniqueUsers: unique
        })
    }

    const filteredLogs = logs.filter(log =>
        log.user.name.toLowerCase().includes(filter.toLowerCase()) ||
        log.description?.toLowerCase().includes(filter.toLowerCase()) ||
        log.project?.name.toLowerCase().includes(filter.toLowerCase())
    )

    const handleExport = () => {
        const flatData = filteredLogs.map(log => ({
            Employee: log.user.name,
            Email: log.user.email,
            Project: log.project ? log.project.name : 'General',
            ProjectId: log.project ? log.project.projectId : '-',
            Date: new Date(log.startTime).toLocaleDateString(),
            StartTime: new Date(log.startTime).toLocaleTimeString(),
            EndTime: log.endTime ? new Date(log.endTime).toLocaleTimeString() : 'Active',
            DurationMinutes: log.duration || 0,
            Description: log.description || ''
        }))
        convertToCSV(flatData, `work-logs-${new Date().toISOString().split('T')[0]}`)
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours Tracked</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalHours}h</div>
                        <p className="text-xs text-muted-foreground">Across all projects</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.activeNow}</div>
                        <p className="text-xs text-muted-foreground">Employees working now</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
                        <p className="text-xs text-muted-foreground">Active contributors</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Detailed Time Logs</CardTitle>
                            <CardDescription>Recent work activity across the organization.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Filter users or projects..."
                                className="w-[200px]"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <Button onClick={handleExport} variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="font-medium">{log.user.name}</div>
                                            <div className="text-xs text-muted-foreground">{log.user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            {log.project ? (
                                                <div className="text-sm">
                                                    <Badge variant="outline" className="mr-2 font-mono text-xs">
                                                        {log.project.projectId}
                                                    </Badge>
                                                    {log.project.name}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">General Task</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {new Date(log.startTime).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {log.duration ? (
                                                <span className="font-mono">{log.duration} min</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={log.description || ''}>
                                            {log.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {!log.endTime ? (
                                                <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Completed</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
