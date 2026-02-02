
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const count = await prisma.workLog.count()
        console.log(`✅ WorkLog model access confirmed. Count: ${count}`)
    } catch (e) {
        console.error('❌ Failed to access WorkLog model:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
