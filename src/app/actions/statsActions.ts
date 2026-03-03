'use server'

import 'server-only'

import prisma from '@/lib/prisma'
import { calculateDelayDays } from '@/lib/utils'
import { subDays, format } from 'date-fns'
import { Prisma, Project } from '@prisma/client'

export async function getDashboardStats(userId: string, userRole: string) {
    const where: Prisma.ProjectWhereInput = userRole === 'CLIENT'
        ? { assignedToId: userId }
        : {}

    const projects = await prisma.project.findMany({
        where,
        include: {
            assignedTo: true
        }
    })

    const activeProjects = projects.filter((p: Project) => p.status !== 'Completed' && p.status !== 'Archived')

    const delayedProjects = activeProjects.filter((p: Project) => {
        if (p.status === 'Client Delay' || p.status === 'Past Target') return true
        const delay = calculateDelayDays(p.targetFinish, p.actualFinish)
        return delay > 0
    })

    const avgProgress = activeProjects.length > 0
        ? activeProjects.reduce((acc: number, p: Project) => acc + p.percentComplete, 0) / activeProjects.length
        : 0

    const stats = {
        active: activeProjects.length,
        delayed: delayedProjects.length,
        completed: projects.filter(p => p.status === 'Completed').length,
        avgProgress
    }

    // Pie Chart Data
    const pieMap = new Map<string, number>()
    activeProjects.forEach((p: Project) => {
        const s = p.status
        pieMap.set(s, (pieMap.get(s) || 0) + 1)
    })

    const pieData = Array.from(pieMap.entries()).map(([name, value]) => ({
        name,
        value,
        color: name === 'On Track' ? 'oklch(0.6 0.15 150)' : // Greenish
            name === 'Client Delay' ? 'oklch(0.7 0.15 80)' : // Orange/Yellow
                name === 'Past Target' ? 'oklch(0.5 0.15 20)' : // Red
                    'oklch(0.6 0.15 250)' // Blue (Primary)
    }))

    // Histogram Data
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

    recentHistory.forEach((h: any) => {
        const key = format(h.createdAt, 'MMM dd')
        if (historyMap.has(key)) {
            historyMap.set(key, (historyMap.get(key) || 0) + 1)
        }
    })

    const histogramData = Array.from(historyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .reverse()

    return {
        projects,
        stats,
        pieData,
        histogramData
    }
}
