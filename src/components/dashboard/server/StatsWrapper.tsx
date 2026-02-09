import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { calculateDelayDays } from '@/lib/utils'
import { Prisma } from '@prisma/client'

// Define the shape of the data we expect from the promise
type ProjectWithAssignee = Prisma.ProjectGetPayload<{
    include: { assignedTo: true }
}>

interface StatsWrapperProps {
    projectsPromise: Promise<ProjectWithAssignee[]>
    userRole: string
    clientCountPromise: Promise<number>
}

export default async function StatsWrapper({ projectsPromise, userRole, clientCountPromise }: StatsWrapperProps) {
    const [projects, totalClients] = await Promise.all([projectsPromise, clientCountPromise])

    const activeProjects = projects.filter(p => p.status !== 'Completed' && p.status !== 'Archived')

    // Delayed projects are those that are Active AND have a delay > 0
    const delayedProjects = activeProjects.filter(p => {
        // If status effectively says delay, include it
        if (p.status === 'Client Delay' || p.status === 'Past Target') return true

        // precise calc
        const delay = calculateDelayDays(p.targetFinish, p.actualFinish)
        return delay > 0
    })

    const avgProgress = activeProjects.length > 0
        ? activeProjects.reduce((acc, p) => acc + p.percentComplete, 0) / activeProjects.length
        : 0

    const stats = {
        active: activeProjects.length,
        delayed: delayedProjects.length,
        completed: projects.filter(p => p.status === 'Completed').length,
        avgProgress,
        totalClients
    }

    return <SummaryCards stats={stats} />
}
