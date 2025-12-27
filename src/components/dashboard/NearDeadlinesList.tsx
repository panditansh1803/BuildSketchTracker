import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type Project = {
    id: string
    projectId: string
    name: string
    targetFinish: Date
    daysLeft: number
}

export function NearDeadlinesList({ projects }: { projects: Project[] }) {
    return (
        <Card className="col-span-full md:col-span-3">
            <CardHeader>
                <CardTitle>Approaching Deadlines (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {projects.length === 0 && <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>}
                    {projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                                    {project.name}
                                </Link>
                                <p className="text-xs text-muted-foreground">{project.projectId}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold">{project.targetFinish.toLocaleDateString()}</div>
                                <Badge variant={project.daysLeft < 3 ? "destructive" : "secondary"} className="text-xs">
                                    {project.daysLeft} days left
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
