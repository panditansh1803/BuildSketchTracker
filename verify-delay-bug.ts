const prisma = require('./src/lib/prisma').default
const { updateProjectBrain } = require('./src/lib/brain')

async function testDelayLogic() {
    console.log("1. Creating Test Project...")
    const user = await prisma.user.findFirst()
    if (!user) throw new Error("No user found")

    // Cleanup old
    await prisma.project.deleteMany({ where: { projectId: "TEST-DELAY" } })

    const start = new Date()
    const target = new Date()
    target.setDate(start.getDate() + 30) // 30 days out

    const project = await prisma.project.create({
        data: {
            projectId: "TEST-DELAY",
            name: "Delay Test",
            houseType: "Single",
            stage: "Project Setup",
            percentComplete: 0,
            status: "On Track",
            startDate: start,
            targetFinish: target,
            originalTarget: target, // Base
            createdById: user.id
        }
    })

    console.log("Original Target:", project.targetFinish.toISOString())

    // 2. Apply Delay via Brain
    console.log("2. Applying Client Delay (14 days)...")
    const updatePayload = {
        clientDelayDays: 14
    }

    try {
        const updated = await updateProjectBrain(project.id, updatePayload, user.id, user.name)

        console.log("Update Success!")
        console.log("New Client Delay:", updated.clientDelayDays)
        console.log("New Target Finish:", updated.targetFinish.toISOString())

        const diffTime = Math.abs(updated.targetFinish.getTime() - project.targetFinish.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const result = "Shift Validation: " + (diffDays === 14 ? "PASS" : "FAIL (Diff " + diffDays + ")");
        console.log(result)
        require('fs').writeFileSync('verify-result.txt', result)

    } catch (e) {
        console.error("Brain Update Failed:", e)
        require('fs').writeFileSync('verify-result.txt', "Brain Update Failed: " + e.toString())
    }

    // Cleanup
    // await prisma.project.delete({ where: { id: project.id } })
}

testDelayLogic()
