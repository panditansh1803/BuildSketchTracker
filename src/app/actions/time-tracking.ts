'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function clockIn(projectId?: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Check for existing active session
    const activeLog = await prisma.workLog.findFirst({
        where: {
            userId: user.id,
            endTime: null
        }
    })

    if (activeLog) {
        throw new Error('You already have an active session.')
    }

    await prisma.workLog.create({
        data: {
            userId: user.id,
            projectId,
            startTime: new Date()
        }
    })

    revalidatePath('/dashboard')
    return { success: true }
}

export async function clockOut(description?: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const activeLog = await prisma.workLog.findFirst({
        where: {
            userId: user.id,
            endTime: null
        }
    })

    if (!activeLog) {
        throw new Error('No active session found.')
    }

    const now = new Date()
    const durationMinutes = Math.round((now.getTime() - activeLog.startTime.getTime()) / 1000 / 60)

    await prisma.workLog.update({
        where: { id: activeLog.id },
        data: {
            endTime: now,
            duration: durationMinutes,
            description
        }
    })

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getActiveSession() {
    const user = await getCurrentUser()
    if (!user) return null

    return await prisma.workLog.findFirst({
        where: {
            userId: user.id,
            endTime: null
        },
        include: {
            project: {
                select: { name: true, projectId: true }
            }
        }
    })
}

export async function getRecentLogs() {
    const user = await getCurrentUser()
    if (!user) return []

    return await prisma.workLog.findMany({
        where: {
            userId: user.id,
            endTime: { not: null }
        },
        orderBy: { startTime: 'desc' },
        take: 5,
        include: {
            project: true
        }
    })
}

export async function getProjectsForDropdown() {
    const user = await getCurrentUser()
    if (!user) return []
    return await prisma.project.findMany({
        where: {
            status: { not: 'Completed' }
        },
        select: {
            id: true,
            name: true,
            projectId: true
        }
    })
}

export async function getAllWorkLogs() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') return []

    return await prisma.workLog.findMany({
        orderBy: { startTime: 'desc' },
        take: 500,
        include: {
            user: {
                select: { name: true, email: true }
            },
            project: {
                select: { name: true, projectId: true }
            }
        }
    })
}

export async function getProjectTimeStats(projectId: string) {
    const logs = await prisma.workLog.findMany({
        where: { projectId },
        include: { user: true }
    })

    let totalMinutes = 0
    const userStats: Record<string, { name: string, minutes: number }> = {}

    for (const log of logs) {
        let duration = log.duration || 0

        // If still active, calculate current duration
        if (!log.endTime) {
            const now = new Date()
            duration = Math.round((now.getTime() - log.startTime.getTime()) / 1000 / 60)
        }

        totalMinutes += duration

        if (!userStats[log.userId]) {
            // Safety: log.user might be null if referential integrity broke somehow
            const userName = log.user?.name || 'Unknown User'
            userStats[log.userId] = { name: userName, minutes: 0 }
        }
        userStats[log.userId].minutes += duration
    }

    return {
        totalMinutes,
        userStats: Object.values(userStats),
        activeSession: logs.find(l => !l.endTime) ? true : false
    }
}

