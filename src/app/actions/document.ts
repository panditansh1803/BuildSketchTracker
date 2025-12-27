'use server'

import prisma from '@/lib/prisma'
import { saveFile, deleteFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const type = formData.get('type') as string

    if (!file || !projectId) throw new Error('Missing file or project ID')

    const url = await saveFile(file, 'documents')

    await prisma.document.create({
        data: {
            name: file.name,
            url,
            type,
            projectId,
        },
    })

    revalidatePath(`/projects/${projectId}`)
}

export async function deleteDocument(id: string, projectId: string) {
    const document = await prisma.document.findUnique({ where: { id } })
    if (document) {
        await deleteFile(document.url)
        await prisma.document.delete({ where: { id } })
    }
    revalidatePath(`/projects/${projectId}`)
}
