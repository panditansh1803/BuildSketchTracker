import { StatusPieChart } from '@/components/dashboard/StatusPieChart'
import { HistoryHistogram } from '@/components/dashboard/HistoryHistogram'
import { Prisma } from '@prisma/client'
import { format, subDays } from 'date-fns'

type ProjectWithAssignee = Prisma.ProjectGetPayload<{
    include: { assignedTo: true }
}>

interface ChartsWrapperProps {
    projectsPromise: Promise<ProjectWithAssignee[]>
    historyPromise: Promise<any[]> // Using any for history to match usage, ideally strictly typed
}

export default async function ChartsWrapper({ projectsPromise, historyPromise }: ChartsWrapperProps) {
    const [projects, recentHistory] = await Promise.all([projectsPromise, historyPromise])

    const activeProjects = projects.filter(p => p.status !== 'Completed' && p.status !== 'Archived')

    // 2. Pie Chart Data
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[350px]">
            <StatusPieChart data={pieData} />
            <HistoryHistogram data={histogramData} />
        </div>
    )
}
