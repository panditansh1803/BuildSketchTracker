import { getCurrentUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { Suspense } from 'react'
import StatsWrapper from '@/components/dashboard/server/StatsWrapper'
import ChartsWrapper from '@/components/dashboard/server/ChartsWrapper'
import TableWrapper from '@/components/dashboard/server/TableWrapper'
import DownloadButtonWrapper from '@/components/dashboard/server/DownloadButtonWrapper'
import { subDays } from 'date-fns'

export default async function Dashboard() {
    const user = await getCurrentUser()
    if (!user) return <div>Please log in</div>

    // Security: Block GUEST access
    if (user.role === 'GUEST') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-2">Account Pending Approval</h2>
                    <p className="text-zinc-400">
                        Your account has been created but requires administrator approval to access project data.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-ping" />
                    </div>
                </div>
            </div>
        )
    }

    // Spec: KPI Cards (Total Active, Total Delayed)

    let where: Prisma.ProjectWhereInput = {}

    if (user.role === 'CLIENT') {
        where = { clientId: user.id }
    } else if (user.role === 'EMPLOYEE') {
        where = {
            OR: [
                { assignedToId: user.id },
                { additionalAssignees: { some: { id: user.id } } }
            ]
        }
    }

    const fourteenDaysAgo = subDays(new Date(), 14)

    // START FETCHES (Do not await here)
    const projectsPromise = prisma.project.findMany({
        where,
        include: {
            assignedTo: true
        }
    })

    const historyPromise = prisma.projectHistory.findMany({
        where: {
            createdAt: { gte: fourteenDaysAgo },
            project: where
        }
    })

    const clientCountPromise = user.role === 'ADMIN'
        ? prisma.user.count({ where: { role: 'CLIENT' } })
        : Promise.resolve(0)

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Suspense fallback={<div className="h-10 w-32 bg-muted animate-pulse rounded" />}>
                        <DownloadButtonWrapper projectsPromise={projectsPromise} />
                    </Suspense>
                </div>
            </div>

            {/* Section 1: KPI Cards */}
            <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-32 bg-muted/20 animate-pulse rounded-xl" />}>
                <StatsWrapper
                    projectsPromise={projectsPromise}
                    userRole={user.role}
                    clientCountPromise={clientCountPromise}
                />
            </Suspense>

            {/* Section 2: Visuals */}
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[350px] bg-muted/20 animate-pulse rounded-xl" />}>
                <ChartsWrapper
                    projectsPromise={projectsPromise}
                    historyPromise={historyPromise}
                />
            </Suspense>

            {/* Section C: Master Table */}
            <Suspense fallback={<div className="space-y-4"><div className="h-8 w-48 bg-muted animate-pulse rounded" /><div className="h-64 w-full bg-muted/20 animate-pulse rounded-xl" /></div>}>
                <TableWrapper projectsPromise={projectsPromise} />
            </Suspense>
        </div>
    )
}
