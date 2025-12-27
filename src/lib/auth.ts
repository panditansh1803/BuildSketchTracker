import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export type UserRole = 'ADMIN' | 'PROJECT_OWNER' | 'CLIENT'

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
