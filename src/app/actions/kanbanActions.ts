'use server'

import 'server-only'

import { updateProjectBrain } from '@/lib/brain'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

export async function updateProjectStage(projectId: string, newStage: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // We use the central brain logic to ensure all automation (percent updates, history) runs
    await updateProjectBrain(projectId, { stage: newStage }, user.id, user.name)

    revalidatePath('/kanban')
    revalidatePath('/dashboard')
    revalidatePath(`/projects/${projectId}`)
}
