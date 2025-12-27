'use client'

import { deleteProject } from '@/app/actions/projectActions'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { useRouter } from 'next/navigation'

export function DeleteProjectButton({ projectId, projectName }: { projectId: string, projectName: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (window.confirm(`Are you sure you want to delete project "${projectName}"?\n\nThis action cannot be undone.`)) {
            setIsDeleting(true)
            try {
                await deleteProject(projectId)
                window.location.href = '/projects'
            } catch (error) {
                console.error('Failed to delete project', error)
                alert('Failed to delete project. Please try again.')
                setIsDeleting(false)
            }
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
        >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Project'}
        </Button>
    )
}
