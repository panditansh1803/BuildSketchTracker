import prisma from '@/lib/prisma'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { getCurrentUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export default async function KanbanPage() {
    const user = await getCurrentUser()
    // Use permissive access for now to show all projects, or strict if needed
    // Assuming simple access for demo "full potential"

    // Using loose fetching to populate board
    const projects = await prisma.project.findMany({
        where: {}, // Get all projects
        select: {
            id: true,
            projectId: true,
            name: true,
            stage: true,
            status: true,
            percentComplete: true,
            houseType: true
        }
    })

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Workflow</h1>
                    <p className="text-muted-foreground">Drag and drop projects to update their stage.</p>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <KanbanBoard projects={projects} />
            </div>
        </div>
    )
}
