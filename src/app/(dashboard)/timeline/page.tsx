import prisma from '@/lib/prisma'
import { GanttChart } from '@/components/timeline/GanttChart'
import { getCurrentUser } from '@/lib/auth'

export default async function TimelinePage() {
    const user = await getCurrentUser()
    const projects = await prisma.project.findMany({
        where: {},
        orderBy: { startDate: 'asc' }
    })

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
                <p className="text-muted-foreground">Visual schedule of all active projects.</p>
            </div>

            <div className="flex-1 min-h-0">
                <GanttChart projects={projects} />
            </div>
        </div>
    )
}
