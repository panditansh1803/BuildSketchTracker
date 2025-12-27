'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type Project = {
    id: string
    name: string
    status: string
    stage: string
}

type WorkloadData = {
    userId: string
    name: string
    activeProjects: number
    delayedProjects: number
    projects: Project[]
}

export function WorkloadTable({ workload }: { workload: WorkloadData[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Workload</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Delayed</TableHead>
                            <TableHead className="w-[300px]">Current Projects</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workload.map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.activeProjects}</TableCell>
                                <TableCell>
                                    {user.delayedProjects > 0 ? (
                                        <span className="text-red-500 font-bold">{user.delayedProjects}</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {user.projects.slice(0, 3).map((p) => (
                                            <Badge key={p.id} variant="secondary" className="text-xs">
                                                {p.name}
                                            </Badge>
                                        ))}
                                        {user.projects.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{user.projects.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
