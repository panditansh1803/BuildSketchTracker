import { DownloadReportButton } from '@/components/dashboard/DownloadReportButton'
import { Prisma } from '@prisma/client'

type ProjectWithAssignee = Prisma.ProjectGetPayload<{
    include: { assignedTo: true }
}>

interface DownloadButtonWrapperProps {
    projectsPromise: Promise<ProjectWithAssignee[]>
}

export default async function DownloadButtonWrapper({ projectsPromise }: DownloadButtonWrapperProps) {
    const projects = await projectsPromise
    return <DownloadReportButton projects={projects} />
}
