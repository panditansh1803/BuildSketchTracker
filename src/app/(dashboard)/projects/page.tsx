import prisma from '@/lib/prisma'
import { ProjectTable } from '@/components/projects/ProjectTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { DownloadReportButton } from '@/components/reports/DownloadReportButton'

import { ProjectSearch } from '@/components/projects/ProjectSearch'
import { ProjectFilter } from '@/components/projects/ProjectFilter'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string
        status?: string
    }>
}) {
    const user = await getCurrentUser()
    if (!user) return <div>Please log in</div>

    const { q: query, status } = await searchParams

    const where: Prisma.ProjectWhereInput = {
        AND: []
    }
    const andConditions = where.AND as Prisma.ProjectWhereInput[]

    if (user.role === 'CLIENT') {
        andConditions.push({ clientId: user.id })
    } else if (user.role === 'EMPLOYEE') {
        andConditions.push({
            OR: [
                { assignedToId: user.id },
                { additionalAssignees: { some: { id: user.id } } }
            ]
        })
    }

    if (query) {
        andConditions.push({
            OR: [
                { name: { contains: query } },
                { projectId: { contains: query } },
            ],
        })
    }

    if (status && status !== 'ALL') {
        andConditions.push({ status: status })
    }

    const projects = await prisma.project.findMany({
        where,
        include: {
            assignedTo: true
        },
        orderBy: { updatedAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage and track all construction projects.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DownloadReportButton projects={projects} />
                    <Link href="/projects/new">
                        <Button className="gap-1">
                            <Plus className="h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <ProjectSearch />
                <ProjectFilter />
            </div>

            <ProjectTable projects={projects} />
        </div>
    )
}
