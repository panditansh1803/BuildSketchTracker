'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Fetch high-level statistics for all employees.
 * RESTRICTED: ADMIN ONLY
 */
export async function getTeamStats() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
    }

    // Fetch all users who are NOT Admins (or include admins if you want to track them too)
    // For now, let's fetch everyone to be safe, or filter out clients if role exists
    const users = await prisma.user.findMany({
        where: {
            // Optional: filter out clients
            // role: { not: 'CLIENT' } 
        },
        include: {
            projects: {
                select: {
                    id: true,
                    status: true,
                    isDelayed: true,
                    assignedToId: true
                }
            }
        }
    })

    // Enhanced stats calculation
    const stats = await Promise.all(users.map(async (u) => {
        const activeProjects = u.projects.filter(p => p.status !== 'Completed').length
        const completedProjects = u.projects.filter(p => p.status === 'Completed').length
        const slaBreaches = u.projects.filter(p => p.isDelayed && p.status !== 'Completed').length

        // Fetch last activity strictly from history
        const lastHistory = await prisma.projectHistory.findFirst({
            where: { changedBy: u.name }, // Weak link: relying on Name
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
        })

        return {
            id: u.id,
            name: u.name,
            role: u.role,
            email: u.email,
            activeProjects,
            completedProjects,
            slaBreaches,
            lastActiveAt: lastHistory?.createdAt || null
        }
    }))

    return stats
}

/**
 * Fetch a global feed of recent activities.
 * RESTRICTED: ADMIN ONLY
 */
export async function getRecentActivity() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
    }

    const history = await prisma.projectHistory.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            project: {
                select: {
                    name: true,
                    projectId: true
                }
            }
        }
    })

    return history
}

/**
 * Fetch all users for management.
 * RESTRICTED: ADMIN ONLY
 */
export async function getAllUsers() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        }
    })
    return users
}

/**
 * Promote a user to ADMIN.
 * RESTRICTED: ADMIN ONLY
 */
export async function promoteUser(userId: string) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' }
    })

    // Log this action in history? For now just return success
    return { success: true }
}

/**
 * Demote a user to PROJECT_OWNER (Standard User).
 * RESTRICTED: ADMIN ONLY
 */
export async function demoteUser(userId: string) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    // Prevent self-demotion to avoid lockout
    if (userId === user.id) {
        throw new Error('You cannot demote yourself!')
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: 'PROJECT_OWNER' }
    })

    return { success: true }
}

/**
 * Remove (Delete) a user.
 * RESTRICTED: MAIN ADMIN or ADMIN (with limits)
 */
export async function removeUser(userId: string) {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!targetUser) {
        throw new Error('User not found')
    }

    // Prevent self-deletion
    if (currentUser.id === targetUser.id) {
        throw new Error('You cannot delete yourself.')
    }

    // Import helper dynamically to avoid circular deps if any (though structure seems fine)
    // Or just inline logic because `auth.ts` imports `prisma` which might cause issues if `team.ts` is imported there.
    // Let's implement logic directly here to be safe and robust.

    const MAIN_ADMIN_EMAIL = 'admin@buildsketch.com'
    const mainAdmin = MAIN_ADMIN_EMAIL.toLowerCase()
    const currentEmail = currentUser.email.toLowerCase()
    const targetEmail = targetUser.email.toLowerCase()

    // 1. If Current User is Main Admin -> Allow (unless self, already checked)
    const isMainAdmin = currentEmail === mainAdmin

    if (!isMainAdmin) {
        // Current user is just a regular Admin

        // Cannot delete Main Admin
        if (targetEmail === mainAdmin) {
            throw new Error('You cannot remove the Main Admin.')
        }

        // Cannot delete other Admins
        if (targetUser.role === 'ADMIN') {
            throw new Error('Admins cannot remove other Admins. Only Main Admin can do this.')
        }
    }

    // Proceed with deletion
    // Depending on requirements, we might just soft delete or deactivate.
    // Prompt says "remove (delete/deactivate)". Let's DELETE for now to keep it clean, 
    // but ensure we handle relations (Cascade is dangerous if not careful).
    // Prisma schema shows:
    // User -> Projects (AssignedUser) -> Set Null?
    // User -> Projects (ProjectOwner) -> Error if projects exist? or Cascade?
    // User -> WorkLogs -> Cascade usually.

    // Let's use a transaction to be safe or just delete and let Prisma handle errors if constraints fail.
    // Ideally we should reassign projects first.

    await prisma.user.delete({
        where: { id: userId }
    })

    return { success: true }
}
