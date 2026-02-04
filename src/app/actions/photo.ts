'use server'

import prisma from '@/lib/prisma'
import { saveFile, deleteFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

export async function uploadPhoto(formData: FormData) {
    try {
        const file = formData.get('file') as File
        const projectId = formData.get('projectId') as string
        const stage = formData.get('stage') as string
        const caption = formData.get('caption') as string

        if (!file || !projectId || !stage) {
            return { error: 'Missing file, project ID, or stage' }
        }

        // Validate Project Exists
        const projectExists = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true }
        })

        if (!projectExists) {
            return { error: 'Project not found. Cannot upload photo.' }
        }

        const url = await saveFile(file, 'photos')

        await prisma.sitePhoto.create({
            data: {
                url,
                stage,
                caption,
                projectId,
            },
        })

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Upload Photo Error:', error)
        return { error: error.message || 'Failed to upload photo' }
    }
}

export async function deletePhoto(id: string, projectId: string) {
    const photo = await prisma.sitePhoto.findUnique({ where: { id } })
    if (photo) {
        await deleteFile(photo.url)
        await prisma.sitePhoto.delete({ where: { id } })
    }
    revalidatePath(`/projects/${projectId}`)
}
