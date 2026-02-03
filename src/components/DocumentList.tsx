'use client'

import { uploadDocument, deleteDocument } from '@/app/actions/document'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { FileText, Trash2, Download, Eye, Image as ImageIcon } from 'lucide-react'

type Document = {
    id: string
    name: string
    url: string
    type: string
    uploadedAt: Date
}

export function DocumentList({ projectId, documents }: { projectId: string, documents: Document[] }) {
    const [uploading, setUploading] = useState(false)

    async function handleUpload(formData: FormData) {
        setUploading(true)
        try {
            await uploadDocument(formData)
        } catch (error: any) {
            console.error('Upload failed:', error)
            alert('Failed to upload document. ' + (error.message || ''))
        } finally {
            setUploading(false)
        }
    }

    const isImage = (filename: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    }

    return (
        <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="font-medium mb-4">Upload New Document</h3>
                <form action={handleUpload} className="flex gap-4 items-end flex-wrap">
                    <input type="hidden" name="projectId" value={projectId} />
                    <div className="flex-1 min-w-[200px] space-y-2">
                        {/* Ensure input is clearly clickable and not hidden */}
                        <Input
                            type="file"
                            name="file"
                            required
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            className="cursor-pointer file:cursor-pointer"
                        />
                    </div>
                    <div className="w-[150px] space-y-2">
                        <Select name="type" defaultValue="BLUEPRINT">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BLUEPRINT">Blueprint</SelectItem>
                                <SelectItem value="PERMIT">Permit</SelectItem>
                                <SelectItem value="CONTRACT">Contract</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </form>
            </div>

            <div className="grid gap-4">
                {documents.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No documents uploaded yet.</p>
                )}
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-2 bg-primary/10 rounded flex-shrink-0 relative group">
                                {isImage(doc.name) ? (
                                    <div className="relative">
                                        <ImageIcon className="h-6 w-6 text-primary" />
                                        {/* Hover Preview could go here, but let's keep it simple with consistent UI */}
                                    </div>
                                ) : (
                                    <FileText className="h-6 w-6 text-primary" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline truncate block">
                                    {doc.name}
                                </a>
                                <p className="text-xs text-muted-foreground">
                                    {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isImage(doc.name) && (
                                <Button variant="ghost" size="icon" asChild title="Preview">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Eye className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" asChild title="Download">
                                <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                            <form action={async () => {
                                if (confirm('Delete this file?')) {
                                    await deleteDocument(doc.id, projectId)
                                }
                            }}>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" type="submit">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
