'use server'

import prisma from '@/lib/prisma'
import { updateProjectBrain } from '@/lib/brain'
import { revalidatePath } from 'next/cache'

export async function updateProjectStage(projectId: string, newStage: string) {
    const user = await prisma.user.findFirst()
    if (!user) throw new Error('User not found')

    // We use the central brain logic to ensure all automation (percent updates, history) runs
    await updateProjectBrain(projectId, { stage: newStage }, user.id, user.name)

    revalidatePath('/kanban')
    revalidatePath('/dashboard')
    revalidatePath(`/projects/${projectId}`)
}
