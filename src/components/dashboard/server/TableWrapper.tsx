import { ProjectTable } from '@/components/projects/ProjectTable'
import { Prisma } from '@prisma/client'

type ProjectWithAssignee = Prisma.ProjectGetPayload<{
    include: { assignedTo: true }
}>

interface TableWrapperProps {
    projectsPromise: Promise<ProjectWithAssignee[]>
}

export default async function TableWrapper({ projectsPromise }: TableWrapperProps) {
    const projects = await projectsPromise

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Master Project List</h2>
            <ProjectTable projects={projects} />
        </div>
    )
}
