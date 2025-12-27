
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Finding latest project...')
    const project = await prisma.project.findFirst({
        orderBy: { updatedAt: 'desc' }
    })

    if (!project) {
        console.error('No projects found!')
        return
    }

    console.log(`Time-traveling project: ${project.name} (${project.projectId})`)

    // Set start date to 48 hours ago
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // Reset delay flags to ensure fresh trigger
    await prisma.project.update({
        where: { id: project.id },
        data: {
            startDate: twoDaysAgo,
            isDelayed: false,
            delayDays: 0,
            targetFinish: new Date(), // Set target to now to ensure it's "past target" for diff logic
            originalTarget: new Date() // Reset baseline
        }
    })

    console.log(`SUCCESS: Project ${project.projectId} moved to start 48 hours ago. Visit page to trigger SLA.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
