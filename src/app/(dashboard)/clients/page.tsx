import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ClientRegistry } from '@/components/clients/ClientRegistry'

export default async function ClientsPage() {
    const user = await getCurrentUser()
    if (!user) return redirect('/login')

    // 1. Fetch Registered Clients (with Allowed Employees)
    const registeredClients = await prisma.user.findMany({
        where: { role: 'CLIENT' },
        include: {
            clientProjects: true,
            allowedEmployees: { select: { id: true, name: true, email: true } }, // Fetch explicit assignments
        }
    })

    // 2. Fetch Employees (for assignment dropdowns)
    const employees = await prisma.user.findMany({
        where: { role: { in: ['EMPLOYEE', 'ADMIN', 'PROJECT_OWNER'] } }, // Anyone who can be assigned
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            _count: {
                select: { allowedClients: true }
            }
        }
    })

    // 3. Manual Clients Logic (Keep existing)
    const manualClientProjects = await prisma.project.findMany({
        where: {
            clientName: { not: null },
            clientId: null
        }
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Client Registry</h2>
            </div>

            <ClientRegistry
                currentUserRole={user.role}
                registeredClients={registeredClients}
                manualProjects={manualClientProjects}
                allEmployees={employees}
            />
        </div>
    )
}
