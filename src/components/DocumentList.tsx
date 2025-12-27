'use client'

import { uploadDocument, deleteDocument } from '@/app/actions/document'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { FileText, Trash2, Download } from 'lucide-react'

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
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="font-medium mb-4">Upload New Document</h3>
                <form action={handleUpload} className="flex gap-4 items-end">
                    <input type="hidden" name="projectId" value={projectId} />
                    <div className="flex-1 space-y-2">
                        <Input type="file" name="file" required />
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
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                            <form action={async () => await deleteDocument(doc.id, projectId)}>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
