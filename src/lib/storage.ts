import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function saveFile(file: File, folder: 'documents' | 'photos'): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}-${file.name}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)

    try {
        await fs.access(uploadDir)
    } catch {
        await fs.mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    return `/uploads/${folder}/${filename}`
}

export async function deleteFile(url: string): Promise<void> {
    if (!url.startsWith('/uploads/')) return

    const filePath = path.join(process.cwd(), 'public', url)
    try {
        await fs.unlink(filePath)
    } catch (error) {
        console.error(`Failed to delete file at ${filePath}:`, error)
        // We don't throw here to avoid blocking DB deletion if file is missing
    }
}
