'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { calculateDelayDays } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

type Project = {
    id: string
    projectId: string
    name: string
    houseType: string
    stage: string
    percentComplete: number
    status: string
    startDate: Date
    targetFinish: Date
    actualFinish?: Date | null
    assignedTo?: { name: string } | null
    notes?: string | null
    isDelayed?: boolean
}

export function ProjectTable({ projects }: { projects: Project[] }) {
    const router = useRouter()

    return (
        <div className="rounded-md border bg-card overflow-x-auto">
            <Table className="min-w-[1200px]">
                <TableHeader>
                    <TableRow>
                        <TableHead>ProjID</TableHead>
                        <TableHead>Project Name</TableHead>
                        <TableHead>House Type</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Target Finish</TableHead>
                        <TableHead>Actual Finish</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>% Complete</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow
                            key={project.id}
                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${project.isDelayed ? 'bg-amber-950/30 hover:bg-amber-950/50 text-amber-50' : ''}`}
                            onClick={() => router.push(`/projects/${project.id}`)}
                        >
                            <TableCell className="font-medium">{project.projectId}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {project.name}
                                    {project.isDelayed && (
                                        <AlertTriangle className="h-4 w-4 text-amber-600" aria-label="Overdue" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{project.houseType}</TableCell>
                            <TableCell>{project.stage}</TableCell>
                            <TableCell>{project.assignedTo?.name || '-'}</TableCell>
                            <TableCell>{new Date(project.startDate).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell>{new Date(project.targetFinish).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell>{project.actualFinish ? new Date(project.actualFinish).toLocaleDateString('en-GB') : '-'}</TableCell>
                            <TableCell>
                                <Badge variant={project.status === 'On Track' ? 'default' : project.status === 'Completed' ? 'secondary' : 'destructive'}>
                                    {project.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-16 rounded-full bg-secondary">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${project.percentComplete}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{project.percentComplete}%</span>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={project.notes || ''}>
                                {project.notes || '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
