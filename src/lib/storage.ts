
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

const BUCKET_NAME = 'project-assets'

export async function saveFile(file: File, folder: 'documents' | 'photos'): Promise<string> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Server Error: Missing Supabase Environment Variables.')
    }

    if (file.size === 0) {
        throw new Error('Upload Error: File is empty (0 bytes).')
    }

    console.log(`[Storage] Uploading ${file.name} (${file.type}) - ${file.size} bytes`)

    const supabase = await createClient()
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const path = `${folder}/${filename}`

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
        })

    if (error) {
        console.error('Supabase Storage Upload Error:', error)
        throw new Error(`Storage Upload Failed: ${error.message}`)
    }

    // Get public URL
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path)

    return data.publicUrl
}

export async function deleteFile(url: string): Promise<void> {
    if (!url.includes(BUCKET_NAME)) return // Ignore if not from our bucket (or legacy local file)

    // Extract path from URL
    // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[folder]/[filename]
    const parts = url.split(`${BUCKET_NAME}/`)
    if (parts.length < 2) return

    const path = parts[1]

    const supabase = await createClient()
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path])

    if (error) {
        console.error('Supabase Storage Delete Error:', error)
        // Don't throw, let DB cleanup proceed
    }
}
