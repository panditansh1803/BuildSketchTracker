import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export type UserRole = 'ADMIN' | 'PROJECT_OWNER' | 'CLIENT' | 'EMPLOYEE'

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    // Find user by Supabase ID, or fallback to email (for migration)
    let dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
    })

    if (!dbUser && user.email) {
        dbUser = await prisma.user.findUnique({
            where: { email: user.email }
        })

        // Link Supabase ID if found by email
        if (dbUser) {
            dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { supabaseId: user.id }
            })
        } else {
            // Create new user if not found
            dbUser = await prisma.user.create({
                data: {
                    supabaseId: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email.split('@')[0],
                    role: 'PROJECT_OWNER',
                }
            })
        }
    }

    return dbUser
}

export async function checkRole(allowedRoles: UserRole[]) {
    const user = await getCurrentUser()
    if (!user) return false
    return allowedRoles.includes(user.role as UserRole)
}

export const MAIN_ADMIN_EMAIL = 'admin@buildsketch.com'

/**
 * Check if the current user can remove the target user.
 * Rules:
 * 1. Main Admin can remove anyone (except self, handled in UI/Action).
 * 2. Admin can remove PROJECT_OWNER or EMPLOYEE.
 * 3. Admin CANNOT remove other ADMINs or MAIN ADMIN.
 * 4. Employees/Users cannot remove anyone.
 */
export function canRemoveUser(currentUser: { role: string, email: string }, targetUser: { role: string, email: string }) {
    if (currentUser.email === MAIN_ADMIN_EMAIL) return true
    if (currentUser.role !== 'ADMIN') return false

    // Current User is ADMIN (but not Main)
    if (targetUser.email === MAIN_ADMIN_EMAIL) return false
    if (targetUser.role === 'ADMIN') return false

    return true
}
