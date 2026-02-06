'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { User, Project } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// SCHEMA
import { z } from 'zod'

const ClientSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
})

/**
 * CREATE A NEW CLIENT (Guest Role initially, or Direct Client?)
 * Spec says: "Admin Portal: Restrict 'Create Project/Client' to Admin"
 * So we create a User with role 'CLIENT'.
 */
export async function createClient(data: z.infer<typeof ClientSchema>) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const validData = ClientSchema.parse(data)

    try {
        const newClient = await prisma.user.create({
            data: {
                name: validData.name,
                email: validData.email,
                role: 'CLIENT',
                isActive: true
            }
        })
        revalidatePath('/dashboard/clients')
        return { success: true, client: newClient }
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: 'Email already exists' }
        console.error("Create Client Error:", error)
        return { success: false, error: 'Failed to create client' }
    }
}

/**
 * ASSIGN EMPLOYEE TO CLIENT
 * Connects an Employee to a Client's "allowedEmployees" list.
 */
export async function assignEmployeeToClient(clientId: string, employeeId: string) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') { // Strict Admin/CEO control
        throw new Error('Unauthorized')
    }

    try {
        await prisma.user.update({
            where: { id: clientId },
            data: {
                allowedEmployees: {
                    connect: { id: employeeId } // Connect the relation
                }
            }
        })
        revalidatePath('/dashboard/clients')
        return { success: true }
    } catch (e) {
        console.error("Assign Employee Error:", e)
        return { success: false, error: 'Failed' }
    }
}

/**
 * REMOVE EMPLOYEE FROM CLIENT
 */
export async function removeEmployeeFromClient(clientId: string, employeeId: string) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    try {
        await prisma.user.update({
            where: { id: clientId },
            data: {
                allowedEmployees: {
                    disconnect: { id: employeeId }
                }
            }
        })
        revalidatePath('/dashboard/clients')
        return { success: true }
    } catch (e) {
        console.error("Remove Employee Error:", e)
        return { success: false, error: 'Failed' }
    }
}
