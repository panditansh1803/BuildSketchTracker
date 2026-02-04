'use client'

import { uploadPhoto, deletePhoto } from '@/app/actions/photo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { Trash2, Image as ImageIcon } from 'lucide-react'

type Photo = {
    id: string
    url: string
    stage: string
    caption: string | null
    takenAt: Date
}

import { STAGE_LISTS } from '@/lib/brain'

// ... existing imports

export function PhotoGallery({ projectId, photos, houseType }: { projectId: string, photos: Photo[], houseType: string }) {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Dynamic from Brain
    const stages = STAGE_LISTS[houseType as keyof typeof STAGE_LISTS] || STAGE_LISTS.Single

    async function handleUpload(formData: FormData) {
        setUploading(true)
        setStatus(null)
        try {
            const result = await uploadPhoto(formData)
            if (result?.error) {
                setStatus({ type: 'error', message: result.error })
            } else {
                setStatus({ type: 'success', message: 'Photo uploaded successfully!' })
                // Optional: Reload page or reset form if simple
                // window.location.reload() // Or rely on revalidatePath
            }
        } catch (e) {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="font-medium mb-4">Upload Site Photo</h3>
                <form action={handleUpload} className="flex gap-4 items-end flex-wrap">
                    <input type="hidden" name="projectId" value={projectId} />
                    {/* ... (inputs) ... */}

                    <div className="flex-1 min-w-[200px] space-y-2">
                        <Input type="file" name="file" accept="image/*" />
                    </div>
                    <div className="w-[200px] space-y-2">
                        <Select name="stage">
                            <SelectTrigger>
                                <SelectValue placeholder="Select Stage" />
                            </SelectTrigger>
                            <SelectContent>
                                {stages.map((stage) => (
                                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                        <Input name="caption" placeholder="Caption (optional)" />
                    </div>
                    <Button type="submit" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </form>
                {status && (
                    <div className={`mt-4 p-3 rounded text-sm ${status.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                        {status.message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.length === 0 && (
                    <p className="col-span-full text-muted-foreground text-center py-8">No photos uploaded yet.</p>
                )}
                {photos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photo.url}
                            alt={photo.caption || 'Site Photo'}
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <p className="text-white text-xs font-medium truncate">{photo.stage}</p>
                            {photo.caption && <p className="text-white/80 text-xs truncate">{photo.caption}</p>}
                            <form action={async () => await deletePhoto(photo.id, projectId)} className="absolute top-2 right-2">
                                <Button variant="destructive" size="icon" className="h-6 w-6">
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
