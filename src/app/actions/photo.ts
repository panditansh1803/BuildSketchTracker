'use server'

import prisma from '@/lib/prisma'
import { saveFile, deleteFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

export async function uploadPhoto(formData: FormData) {
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const stage = formData.get('stage') as string
    const caption = formData.get('caption') as string

    if (!file || !projectId || !stage) throw new Error('Missing file, project ID, or stage')

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
}

export async function deletePhoto(id: string, projectId: string) {
    const photo = await prisma.sitePhoto.findUnique({ where: { id } })
    if (photo) {
        await deleteFile(photo.url)
        await prisma.sitePhoto.delete({ where: { id } })
    }
    revalidatePath(`/projects/${projectId}`)
}
