import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import MapClientWrapper from '@/components/projects/MapClientWrapper'

export default async function MapPage() {
    const user = await getCurrentUser()
    if (!user) return <div>Please log in</div>

    const where: Prisma.ProjectWhereInput = user.role === 'CLIENT'
        ? { assignedToId: user.id }
        : {}

    const projects = await prisma.project.findMany({
        where,
        select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            status: true
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Project Map</h1>
            <p className="text-muted-foreground">View all active project locations.</p>

            <div className="border rounded-lg overflow-hidden">
                <MapClientWrapper projects={projects} />
            </div>
        </div>
    )
}
