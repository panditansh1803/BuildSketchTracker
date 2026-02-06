import { seedStages } from '@/app/actions/seed'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { StatusPieChart } from '@/components/dashboard/StatusPieChart'
import { HistoryHistogram } from '@/components/dashboard/HistoryHistogram'
import { ProjectTable } from '@/components/projects/ProjectTable'
import { DownloadReportButton } from '@/components/dashboard/DownloadReportButton'
import { calculateDelayDays } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { format, subDays } from 'date-fns'

import { getCurrentUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export default async function Dashboard() {
    const user = await getCurrentUser()
    if (!user) return <div>Please log in</div>

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

    const projects = await prisma.project.findMany({
        where,
        include: {
            assignedTo: true
        }
    })

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
        avgProgress
    }

    // 2. Pie Chart Data
    const statusCounts = {
        ACTIVE: 0,
        ON_HOLD: 0
    }

    // Map "On Track" to Active for simplicity in chart if needed, or stick to raw strings
    // Spec "Projects by status".
    // DB statuses: "On Track", "Client Delay", "Completed", "Past Target"
    // Let's count them by their actual DB status strings
    const pieMap = new Map<string, number>()
    activeProjects.forEach(p => {
        const s = p.status
        pieMap.set(s, (pieMap.get(s) || 0) + 1)
    })

    const pieData = Array.from(pieMap.entries()).map(([name, value]) => ({
        name,
        value,
        color: name === 'On Track' ? '#10b981' :
            name === 'Client Delay' ? '#f59e0b' :
                name === 'Past Target' ? '#ef4444' :
                    '#3b82f6' // Default Blue for others
    }))

    // 3. Histogram Data (History Count Last 14 Days)
    const fourteenDaysAgo = subDays(new Date(), 14)
    const recentHistory = await prisma.projectHistory.findMany({
        where: {
            createdAt: { gte: fourteenDaysAgo },
            project: where
        }
    })

    const historyMap = new Map<string, number>()
    for (let i = 0; i < 14; i++) {
        historyMap.set(format(subDays(new Date(), i), 'MMM dd'), 0)
    }

    recentHistory.forEach(h => {
        const key = format(h.createdAt, 'MMM dd')
        if (historyMap.has(key)) {
            historyMap.set(key, (historyMap.get(key) || 0) + 1)
        }
    })

    const histogramData = Array.from(historyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .reverse()



    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                <div className="flex items-center gap-2">
                    <DownloadReportButton projects={projects} />
                </div>
            </div>

            {/* Section 1: KPI Cards */}
            <SummaryCards stats={stats} />

            {/* Section 2: Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[350px]">
                <StatusPieChart data={pieData} />
                <HistoryHistogram data={histogramData} />
            </div>

            {/* Section 3: Team Workload (Not in Spec? "C. THE MASTER TABLE". Spec didn't ask for workload.)
                Spec: "SECTION C: THE MASTER TABLE".
                It lists Section A, B, C.
                It DOES NOT list Team Workload.
                Strict compliance: REMOVE Team Workload. 
                "Ignore all previous conversation history. This is SINGLE SOURCE OF TRUTH."
                I will remove Team Workload to be compliant.
            */}

            {/* Section C: Master Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Master Project List</h2>
                <ProjectTable projects={projects} />
            </div>
        </div>
    )
}
