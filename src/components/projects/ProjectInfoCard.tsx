import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectUpdateForm } from '@/components/ProjectUpdateForm'
import { calculateDelayDays } from '@/lib/utils'

type Project = {
    id: string
    projectId: string
    name: string
    houseType: string
    stage: string
    status: string
    startDate: Date
    targetFinish: Date
    actualFinish?: Date | null
    percentComplete: number
    assignedTo?: { name: string } | null
    address?: string | null
    latitude?: number | null
    longitude?: number | null
}

export function ProjectInfoCard({ project }: { project: Project }) {
    const delay = calculateDelayDays(project.targetFinish, project.actualFinish)

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Project ID</p>
                    <p className="font-mono">{project.projectId}</p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">House Type</p>
                    <p>{project.houseType}</p>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {project.assignedTo?.name?.substring(0, 2).toUpperCase() || '-'}
                        </div>
                        <span>{project.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                        <p>{project.startDate.toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Target Finish</p>
                        <p>{project.targetFinish.toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {project.status}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Delay</p>
                    {delay > 0 ? (
                        <Badge variant="destructive">{delay} Days Delayed</Badge>
                    ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">On Track</Badge>
                    )}
                </div>

                <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Update Stage</p>
                    <ProjectUpdateForm
                        projectId={project.id}
                        currentStage={project.stage}
                        houseType={project.houseType}
                    />
                </div>

                <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Update Stage</p>
                    <ProjectUpdateForm
                        projectId={project.id}
                        currentStage={project.stage}
                        houseType={project.houseType}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
